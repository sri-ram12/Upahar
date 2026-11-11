import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  sanitizeCustomerForClient,
  setCustomerAuthCookie,
  signCustomerToken,
} from "@/lib/customer-auth";
import {
  generateAndSendCustomerOtp,
  normalizeEmail,
  normalizePhone,
  verifyStoredCustomerOtp,
} from "@/lib/customer-otp";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      action,
      channel: rawChannel,
      email,
      phone,
      code,
      purpose,
      name,
      password,
      newPassword,
      address,
      landmark,
      locality,
    } = body;

    const cleanEmail = normalizeEmail(email);
    const cleanPhone = normalizePhone(phone);
    const channel: "EMAIL" | "SMS" =
      rawChannel === "EMAIL" || (!rawChannel && cleanEmail.includes("@")) ? "EMAIL" : "SMS";

    if (action === "send") {
      const existingCustomer =
        channel === "EMAIL"
          ? await prisma.customerUser.findUnique({
              where: { email: cleanEmail },
              select: { id: true, name: true },
            })
          : await prisma.customerUser.findUnique({
              where: { phone: cleanPhone },
              select: { id: true, name: true },
            });

      const resolvedPurpose =
        purpose === "RESET_PASSWORD"
          ? "RESET_PASSWORD"
          : purpose === "VERIFY_EMAIL"
          ? "VERIFY_EMAIL"
          : existingCustomer
          ? "LOGIN"
          : "SIGNUP";

      if (resolvedPurpose === "RESET_PASSWORD" && !existingCustomer) {
        return NextResponse.json(
          { error: `No account found for ${channel === "EMAIL" ? cleanEmail : cleanPhone}.` },
          { status: 404 }
        );
      }

      const sendResult = await generateAndSendCustomerOtp({
        channel,
        email: cleanEmail,
        phone: cleanPhone,
        purpose: resolvedPurpose,
        customerName: existingCustomer?.name || name || null,
      });

      if (!sendResult.ok) {
        return NextResponse.json(
          {
            error: sendResult.error,
            retryAfterSeconds: sendResult.retryAfterSeconds,
          },
          { status: sendResult.status }
        );
      }

      return NextResponse.json({
        success: true,
        channel,
        delivered: sendResult.delivered,
        provider: sendResult.provider,
        isExistingUser: Boolean(existingCustomer),
        existingName: existingCustomer?.name || null,
        message:
          channel === "EMAIL"
            ? sendResult.delivered
              ? `6-digit verification OTP sent to ${cleanEmail}`
              : `Email OTP generated for ${cleanEmail} (configure SMTP_USER & SMTP_PASS in .env for live inbox delivery)`
            : sendResult.delivered
            ? `4-digit OTP sent via SMS to +91 ${cleanPhone}`
            : `SMS OTP generated for +91 ${cleanPhone}`,
        ...(sendResult.sandboxOtp ? { sandboxOtp: sendResult.sandboxOtp } : {}),
      });
    }

    if (action === "verify") {
      const check = await verifyStoredCustomerOtp({
        channel,
        email: cleanEmail,
        phone: cleanPhone,
        code,
      });

      if (!check.ok) {
        return NextResponse.json({ error: check.error }, { status: check.status });
      }

      // Handle Password Reset via verified OTP
      if (purpose === "RESET_PASSWORD" || check.otpRecord.purpose === "RESET_PASSWORD") {
        if (!newPassword || String(newPassword).length < 4) {
          return NextResponse.json(
            { error: "New password must be at least 4 characters." },
            { status: 400 }
          );
        }

        const existingUser =
          channel === "EMAIL"
            ? await prisma.customerUser.findUnique({ where: { email: cleanEmail } })
            : await prisma.customerUser.findUnique({ where: { phone: cleanPhone } });

        if (!existingUser) {
          return NextResponse.json({ error: "Account not found." }, { status: 404 });
        }

        const passwordHash = await bcrypt.hash(String(newPassword), 10);
        const updatedUser = await prisma.customerUser.update({
          where: { id: existingUser.id },
          data: {
            passwordHash,
            ...(channel === "EMAIL" ? { emailVerified: true } : {}),
          },
          include: { addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] } },
        });

        const token = signCustomerToken(updatedUser);
        const response = NextResponse.json({
          success: true,
          message: "Password reset successful! You are now signed in.",
          customer: sanitizeCustomerForClient(updatedUser),
        });
        setCustomerAuthCookie(response, token);
        return response;
      }

      let customer =
        channel === "EMAIL"
          ? await prisma.customerUser.findUnique({
              where: { email: cleanEmail },
              include: { addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] } },
            })
          : await prisma.customerUser.findUnique({
              where: { phone: cleanPhone },
              include: { addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] } },
            });

      if (customer) {
        if (channel === "EMAIL" && !customer.emailVerified) {
          customer = await prisma.customerUser.update({
            where: { id: customer.id },
            data: { emailVerified: true },
            include: { addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] } },
          });
        }
      } else {
        if (!name || !String(name).trim()) {
          return NextResponse.json(
            {
              error: "Full name is required to complete new account registration.",
              requiresName: true,
            },
            { status: 400 }
          );
        }

        if (cleanPhone && cleanPhone.length < 10) {
          return NextResponse.json(
            { error: "Optional mobile number must be at least 10 digits." },
            { status: 400 }
          );
        }

        if (cleanPhone) {
          const phoneConflict = await prisma.customerUser.findUnique({
            where: { phone: cleanPhone },
          });
          if (phoneConflict) {
            return NextResponse.json(
              { error: "An account with this mobile number already exists. Sign in with Mobile instead." },
              { status: 400 }
            );
          }
        }

        const passwordHash =
          password && String(password).length >= 4
            ? await bcrypt.hash(String(password), 10)
            : null;

        customer = await prisma.customerUser.create({
          data: {
            name: String(name).trim(),
            email: channel === "EMAIL" ? cleanEmail : cleanEmail || null,
            emailVerified: channel === "EMAIL",
            phone: cleanPhone || null,
            passwordHash,
            authProvider: "LOCAL",
            address: address ? String(address).trim() : null,
            landmark: landmark ? String(landmark).trim() : null,
            locality: locality || "ANITS Campus & Hostels",
            ...(address && String(address).trim() && {
              addresses: {
                create: {
                  label: "Primary",
                  address: String(address).trim(),
                  landmark: landmark ? String(landmark).trim() : null,
                  locality: locality || "ANITS Campus & Hostels",
                  isDefault: true,
                },
              },
            }),
          },
          include: { addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] } },
        });
      }

      const token = signCustomerToken(customer);
      const response = NextResponse.json({
        success: true,
        message:
          channel === "EMAIL"
            ? "Email OTP verified! Signed in successfully."
            : "Mobile OTP verified! Signed in successfully.",
        customer: sanitizeCustomerForClient(customer),
      });
      setCustomerAuthCookie(response, token);
      return response;
    }

    return NextResponse.json({ error: "Invalid OTP action." }, { status: 400 });
  } catch (error: unknown) {
    console.error("Customer OTP error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "OTP verification failed: " + msg }, { status: 500 });
  }
}
