import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "upahar-customer-secret-key-2026";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, phone, code, name, address, landmark, locality } = body;

    const cleanPhone = phone ? String(phone).replace(/\D/g, "") : "";
    if (!cleanPhone || cleanPhone.length < 10) {
      return NextResponse.json(
        { error: "Valid 10-digit mobile number is required" },
        { status: 400 }
      );
    }

    if (action === "send") {
      // Check if customer exists to help UI know whether they are new or returning
      const existingCustomer = await prisma.customerUser.findUnique({
        where: { phone: cleanPhone },
        select: { id: true, name: true },
      });

      const otpCode = crypto.randomInt(1000, 10000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

      // Invalidate older unverified OTPs for this phone
      await prisma.customerOtp.updateMany({
        where: { phone: cleanPhone, verified: false },
        data: { verified: true },
      });

      await prisma.customerOtp.create({
        data: {
          phone: cleanPhone,
          code: otpCode,
          purpose: existingCustomer ? "LOGIN" : "SIGNUP",
          expiresAt,
        },
      });

      // Hook for live SMS provider when configured (e.g. Fast2SMS / MSG91)
      // For local/zero-cost testing until DLT SMS API key is provided, we return sandboxOtp cleanly.
      const smsGatewayConfigured = Boolean(process.env.FAST2SMS_API_KEY || process.env.MSG91_AUTH_KEY);

      return NextResponse.json({
        success: true,
        isExistingUser: Boolean(existingCustomer),
        existingName: existingCustomer?.name || null,
        message: smsGatewayConfigured
          ? `4-digit OTP sent via SMS to +91 ${cleanPhone}`
          : `Verification OTP generated for +91 ${cleanPhone}`,
        ...(smsGatewayConfigured ? {} : { sandboxOtp: otpCode }),
      });
    }

    if (action === "verify") {
      if (!code || String(code).trim().length !== 4) {
        return NextResponse.json(
          { error: "Please enter the 4-digit verification OTP" },
          { status: 400 }
        );
      }

      const otpRecord = await prisma.customerOtp.findFirst({
        where: {
          phone: cleanPhone,
          code: String(code).trim(),
          verified: false,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
      });

      if (!otpRecord) {
        return NextResponse.json(
          { error: "Invalid or expired OTP. Please request a fresh OTP." },
          { status: 401 }
        );
      }

      await prisma.customerOtp.update({
        where: { id: otpRecord.id },
        data: { verified: true },
      });

      let customer = await prisma.customerUser.findUnique({
        where: { phone: cleanPhone },
        include: { addresses: { orderBy: { isDefault: "desc" } } },
      });

      if (!customer) {
        if (!name || !String(name).trim()) {
          return NextResponse.json(
            {
              error: "Full name is required to complete new account signup.",
              requiresName: true,
            },
            { status: 400 }
          );
        }

        const randomPasswordHash = await bcrypt.hash(crypto.randomUUID(), 10);
        customer = await prisma.customerUser.create({
          data: {
            name: String(name).trim(),
            phone: cleanPhone,
            passwordHash: randomPasswordHash,
            address: address ? String(address).trim() : null,
            landmark: landmark ? String(landmark).trim() : null,
            locality: locality || "ANITS Campus & Hostels",
            ...(address && {
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
          include: { addresses: { orderBy: { isDefault: "desc" } } },
        });
      }

      const token = jwt.sign(
        { id: customer.id, name: customer.name, phone: customer.phone },
        JWT_SECRET,
        { expiresIn: "30d" }
      );

      const response = NextResponse.json({
        success: true,
        message: "Mobile OTP verified! Signed in successfully.",
        customer: {
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          address: customer.address,
          landmark: customer.landmark,
          locality: customer.locality,
          addresses: customer.addresses,
        },
        token,
      });

      response.cookies.set("upahar_customer_token", token, {
        httpOnly: false,
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
      });

      return response;
    }

    return NextResponse.json({ error: "Invalid OTP action" }, { status: 400 });
  } catch (error: any) {
    console.error("Customer OTP error:", error);
    return NextResponse.json(
      { error: "OTP verification failed: " + (error?.message || "Unknown error") },
      { status: 500 }
    );
  }
}

