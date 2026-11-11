import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendEmailOtp } from "@/lib/mailer";

const OTP_COOLDOWN_MS = 25 * 1000;
const OTP_EXPIRY_MS = 5 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

export function normalizeEmail(raw?: string | null): string {
  return (raw || "").trim().toLowerCase();
}

export function normalizePhone(raw?: string | null): string {
  const digits = (raw || "").replace(/\D/g, "");
  // Handle optional +91 prefix when 12 digits starting with 91
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }
  return digits;
}

export async function generateAndSendCustomerOtp(params: {
  channel: "EMAIL" | "SMS";
  email?: string;
  phone?: string;
  purpose: "LOGIN" | "SIGNUP" | "VERIFY_EMAIL" | "RESET_PASSWORD";
  customerName?: string | null;
  skipCooldown?: boolean;
}) {
  const cleanEmail = normalizeEmail(params.email);
  const cleanPhone = normalizePhone(params.phone);

  if (params.channel === "EMAIL" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { ok: false as const, status: 400, error: "Please enter a valid email address." };
  }
  if (params.channel === "SMS" && cleanPhone.length < 10) {
    return { ok: false as const, status: 400, error: "Valid 10-digit mobile number is required." };
  }

  const targetWhere =
    params.channel === "EMAIL"
      ? { email: cleanEmail, channel: "EMAIL" }
      : { phone: cleanPhone, channel: "SMS" };

  if (!params.skipCooldown) {
    const latest = await prisma.customerOtp.findFirst({
      where: {
        ...targetWhere,
        createdAt: { gt: new Date(Date.now() - OTP_COOLDOWN_MS) },
      },
      orderBy: { createdAt: "desc" },
    });

    if (latest) {
      const waitSec = Math.max(
        1,
        Math.ceil((OTP_COOLDOWN_MS - (Date.now() - latest.createdAt.getTime())) / 1000)
      );
      return {
        ok: false as const,
        status: 429,
        retryAfterSeconds: waitSec,
        error: `Please wait ${waitSec}s before requesting another OTP.`,
      };
    }
  }

  const code =
    params.channel === "EMAIL"
      ? crypto.randomInt(100000, 1000000).toString()
      : crypto.randomInt(1000, 10000).toString();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

  // Mark previous active OTPs as consumed/invalidated
  await prisma.customerOtp.updateMany({
    where: { ...targetWhere, verified: false },
    data: { verified: true },
  });

  await prisma.customerOtp.create({
    data: {
      channel: params.channel,
      email: params.channel === "EMAIL" ? cleanEmail : null,
      phone: params.channel === "SMS" ? cleanPhone : null,
      code,
      purpose: params.purpose,
      expiresAt,
    },
  });

  if (params.channel === "EMAIL") {
    const mailResult = await sendEmailOtp({
      to: cleanEmail,
      code,
      purpose: params.purpose,
      customerName: params.customerName,
    });

    return {
      ok: true as const,
      channel: "EMAIL" as const,
      delivered: mailResult.delivered,
      provider: mailResult.provider,
      mailError: mailResult.error,
      sandboxOtp: mailResult.delivered ? undefined : code,
    };
  }

  // Live Fast2SMS API call when configured
  const fast2SmsKey = (process.env.FAST2SMS_API_KEY || "").trim();
  if (fast2SmsKey) {
    try {
      const smsRes = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          authorization: fast2SmsKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          route: "otp",
          variables_values: code,
          numbers: cleanPhone,
        }),
      });
      if (smsRes.ok) {
        return {
          ok: true as const,
          channel: "SMS" as const,
          delivered: true,
          provider: "FAST2SMS" as const,
          sandboxOtp: undefined,
        };
      }
    } catch (err) {
      console.error("Fast2SMS OTP send warning:", err);
    }
  }

  return {
    ok: true as const,
    channel: "SMS" as const,
    delivered: false,
    provider: "DEV_PREVIEW" as const,
    sandboxOtp: code,
  };
}

export async function verifyStoredCustomerOtp(params: {
  channel: "EMAIL" | "SMS";
  email?: string;
  phone?: string;
  code: string;
}) {
  const cleanEmail = normalizeEmail(params.email);
  const cleanPhone = normalizePhone(params.phone);
  const cleanCode = String(params.code || "").trim();

  if (cleanCode.length < 4 || cleanCode.length > 6) {
    return { ok: false as const, status: 400, error: "Please enter the valid verification OTP code." };
  }

  const targetWhere =
    params.channel === "EMAIL"
      ? { email: cleanEmail, channel: "EMAIL" }
      : { phone: cleanPhone, channel: "SMS" };

  const activeOtp = await prisma.customerOtp.findFirst({
    where: {
      ...targetWhere,
      verified: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!activeOtp) {
    return {
      ok: false as const,
      status: 401,
      error: "OTP has expired or was not found. Please request a fresh OTP.",
    };
  }

  if (activeOtp.attempts >= MAX_OTP_ATTEMPTS) {
    await prisma.customerOtp.update({
      where: { id: activeOtp.id },
      data: { verified: true },
    });
    return {
      ok: false as const,
      status: 429,
      error: "Too many wrong OTP attempts. Please request a new OTP.",
    };
  }

  if (activeOtp.code !== cleanCode) {
    const nextAttempts = activeOtp.attempts + 1;
    await prisma.customerOtp.update({
      where: { id: activeOtp.id },
      data: {
        attempts: nextAttempts,
        ...(nextAttempts >= MAX_OTP_ATTEMPTS ? { verified: true } : {}),
      },
    });
    const remaining = Math.max(0, MAX_OTP_ATTEMPTS - nextAttempts);
    return {
      ok: false as const,
      status: 401,
      error:
        remaining > 0
          ? `Incorrect OTP code. ${remaining} attempt(s) remaining.`
          : "Too many wrong attempts. Please request a fresh OTP.",
    };
  }

  await prisma.customerOtp.update({
    where: { id: activeOtp.id },
    data: { verified: true },
  });

  return { ok: true as const, otpRecord: activeOtp };
}

