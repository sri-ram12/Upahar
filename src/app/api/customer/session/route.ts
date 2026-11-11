import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  clearCustomerAuthCookie,
  getAuthenticatedCustomer,
  isGoogleOAuthConfigured,
  sanitizeCustomerForClient,
  setCustomerAuthCookie,
  signCustomerToken,
} from "@/lib/customer-auth";
import { isSmtpConfigured } from "@/lib/mailer";

export async function GET() {
  const customer = await getAuthenticatedCustomer();
  const smsConfigured = Boolean(process.env.FAST2SMS_API_KEY || process.env.MSG91_AUTH_KEY);

  return NextResponse.json({
    authenticated: Boolean(customer),
    customer,
    providers: {
      google: isGoogleOAuthConfigured(),
      smtp: isSmtpConfigured(),
      sms: smsConfigured,
    },
  });
}

export async function PATCH(req: NextRequest) {
  const sessionCustomer = await getAuthenticatedCustomer();
  if (!sessionCustomer) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, phone, email, password, address, landmark, locality } = body;

    const cleanPhone = phone !== undefined ? String(phone).replace(/\D/g, "") : undefined;
    if (cleanPhone !== undefined && cleanPhone !== "" && cleanPhone.length < 10) {
      return NextResponse.json({ error: "Valid 10-digit mobile number is required." }, { status: 400 });
    }

    const cleanEmail = email !== undefined ? String(email).trim().toLowerCase() : undefined;
    if (cleanEmail !== undefined && cleanEmail !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    if (cleanPhone) {
      const conflict = await prisma.customerUser.findFirst({
        where: { phone: cleanPhone, id: { not: sessionCustomer.id } },
      });
      if (conflict) {
        return NextResponse.json({ error: "This mobile number is already linked to another account." }, { status: 400 });
      }
    }

    if (cleanEmail) {
      const conflict = await prisma.customerUser.findFirst({
        where: { email: cleanEmail, id: { not: sessionCustomer.id } },
      });
      if (conflict) {
        return NextResponse.json({ error: "This email is already linked to another account." }, { status: 400 });
      }
    }

    const updateData: Record<string, unknown> = {};
    if (name && String(name).trim()) updateData.name = String(name).trim();
    if (cleanPhone !== undefined) updateData.phone = cleanPhone || null;
    if (cleanEmail !== undefined && cleanEmail !== (sessionCustomer.email || "")) {
      updateData.email = cleanEmail || null;
      updateData.emailVerified = false;
    }
    if (address !== undefined) updateData.address = address ? String(address).trim() : null;
    if (landmark !== undefined) updateData.landmark = landmark ? String(landmark).trim() : null;
    if (locality !== undefined) updateData.locality = locality || null;
    if (password && String(password).length >= 4) {
      updateData.passwordHash = await bcrypt.hash(String(password), 10);
      if (sessionCustomer.authProvider === "GOOGLE") {
        updateData.authProvider = "HYBRID";
      }
    }

    const updated = await prisma.customerUser.update({
      where: { id: sessionCustomer.id },
      data: updateData,
      include: { addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] } },
    });

    const token = signCustomerToken(updated);
    const response = NextResponse.json({
      success: true,
      customer: sanitizeCustomerForClient(updated),
    });
    setCustomerAuthCookie(response, token);
    return response;
  } catch (err: unknown) {
    console.error("Update customer session error:", err);
    return NextResponse.json(
      { error: "Failed to update profile." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  clearCustomerAuthCookie(response);
  return response;
}

