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
} from "@/lib/customer-otp";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      action,
      identifier,
      name,
      phone,
      email,
      password,
      address,
      landmark,
      locality,
    } = body;

    if (!password || String(password).length < 4) {
      return NextResponse.json(
        { error: "Password must be at least 4 characters" },
        { status: 400 }
      );
    }

    if (action === "signup") {
      if (!name || !String(name).trim()) {
        return NextResponse.json({ error: "Full name is required" }, { status: 400 });
      }

      const cleanEmail = normalizeEmail(email);
      const cleanPhone = normalizePhone(phone);

      if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return NextResponse.json(
          { error: "A valid email address is required at registration to send your verification OTP." },
          { status: 400 }
        );
      }

      if (cleanPhone && cleanPhone.length < 10) {
        return NextResponse.json(
          { error: "Mobile number must be at least 10 digits" },
          { status: 400 }
        );
      }

      if (cleanEmail) {
        const existingEmail = await prisma.customerUser.findUnique({
          where: { email: cleanEmail },
        });
        if (existingEmail) {
          if (!existingEmail.emailVerified) {
            const otpRes = await generateAndSendCustomerOtp({
              channel: "EMAIL",
              email: cleanEmail,
              purpose: "VERIFY_EMAIL",
              customerName: existingEmail.name,
              skipCooldown: true,
            });
            return NextResponse.json({
              success: true,
              requiresEmailVerification: true,
              email: cleanEmail,
              delivered: otpRes.ok ? otpRes.delivered : false,
              message: otpRes.ok && otpRes.delivered
                ? `Account pending verification. Fresh 6-digit OTP sent to ${cleanEmail}!`
                : `Account pending verification. Verification OTP generated for ${cleanEmail}.`,
              ...(otpRes.ok && otpRes.sandboxOtp ? { sandboxOtp: otpRes.sandboxOtp } : {}),
            });
          }
          return NextResponse.json(
            { error: "Account with this email already exists. Please Sign In." },
            { status: 400 }
          );
        }
      }

      if (cleanPhone) {
        const existingPhone = await prisma.customerUser.findUnique({
          where: { phone: cleanPhone },
        });
        if (existingPhone) {
          return NextResponse.json(
            { error: "Account with this mobile number already exists. Please Sign In." },
            { status: 400 }
          );
        }
      }

      const passwordHash = await bcrypt.hash(String(password), 10);
      const customer = await prisma.customerUser.create({
        data: {
          name: String(name).trim(),
          phone: cleanPhone || null,
          email: cleanEmail || null,
          emailVerified: false,
          authProvider: "LOCAL",
          passwordHash,
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

      // Automatically generate & email verification OTP upon registration when email is provided
      if (cleanEmail) {
        const otpRes = await generateAndSendCustomerOtp({
          channel: "EMAIL",
          email: cleanEmail,
          purpose: "VERIFY_EMAIL",
          customerName: customer.name,
          skipCooldown: true,
        });

        return NextResponse.json({
          success: true,
          requiresEmailVerification: true,
          email: cleanEmail,
          delivered: otpRes.ok ? otpRes.delivered : false,
          message:
            otpRes.ok && otpRes.delivered
              ? `Account registered! Enter the 6-digit verification OTP sent to ${cleanEmail}.`
              : `Account registered! Enter the verification OTP generated for ${cleanEmail}.`,
          ...(otpRes.ok && otpRes.sandboxOtp ? { sandboxOtp: otpRes.sandboxOtp } : {}),
        });
      }

      const token = signCustomerToken(customer);
      const response = NextResponse.json({
        success: true,
        message: "Account created successfully!",
        customer: sanitizeCustomerForClient(customer),
      });
      setCustomerAuthCookie(response, token);
      return response;
    }

    // Login via Email OR 10-digit Mobile Number + Password
    const rawIdentifier = String(identifier || email || phone || "").trim();
    const isEmailLogin = rawIdentifier.includes("@");
    const cleanEmail = isEmailLogin ? normalizeEmail(rawIdentifier) : "";
    const cleanPhone = !isEmailLogin ? normalizePhone(rawIdentifier) : "";

    if (!cleanEmail && cleanPhone.length < 10) {
      return NextResponse.json(
        { error: "Enter a valid email address or 10-digit mobile number" },
        { status: 400 }
      );
    }

    const customer = isEmailLogin
      ? await prisma.customerUser.findUnique({
          where: { email: cleanEmail },
          include: { addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] } },
        })
      : await prisma.customerUser.findUnique({
          where: { phone: cleanPhone },
          include: { addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] } },
        });

    if (!customer) {
      return NextResponse.json(
        { error: "No account found with these details. Please Register first." },
        { status: 401 }
      );
    }

    if (!customer.passwordHash) {
      return NextResponse.json(
        {
          error:
            "This account uses Google Sign-In or OTP login. Click Continue with Google or sign in via OTP.",
        },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(String(password), customer.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Incorrect password. Please try again or reset via Email OTP." },
        { status: 401 }
      );
    }

    if (customer.email && !customer.emailVerified && customer.authProvider === "LOCAL") {
      const otpRes = await generateAndSendCustomerOtp({
        channel: "EMAIL",
        email: customer.email,
        purpose: "VERIFY_EMAIL",
        customerName: customer.name,
        skipCooldown: true,
      });

      return NextResponse.json({
        success: true,
        requiresEmailVerification: true,
        email: customer.email,
        delivered: otpRes.ok ? otpRes.delivered : false,
        message:
          otpRes.ok && otpRes.delivered
            ? `Email not verified yet. Sent fresh 6-digit OTP to ${customer.email}.`
            : `Email verification required. Generated OTP for ${customer.email}.`,
        ...(otpRes.ok && otpRes.sandboxOtp ? { sandboxOtp: otpRes.sandboxOtp } : {}),
      });
    }

    const token = signCustomerToken(customer);
    const response = NextResponse.json({
      success: true,
      message: "Signed in successfully!",
      customer: sanitizeCustomerForClient(customer),
    });
    setCustomerAuthCookie(response, token);
    return response;
  } catch (error: unknown) {
    console.error("Customer auth error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Authentication failed: " + msg },
      { status: 500 }
    );
  }
}
