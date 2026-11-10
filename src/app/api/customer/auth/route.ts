import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "upahar-customer-secret-key-2026";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, name, phone, password, email, address, landmark, locality } = body;

    const cleanPhone = phone ? phone.replace(/\D/g, "") : "";
    if (!cleanPhone || cleanPhone.length < 10) {
      return NextResponse.json(
        { error: "Valid 10-digit phone number is required" },
        { status: 400 }
      );
    }

    if (!password || password.length < 4) {
      return NextResponse.json(
        { error: "Password must be at least 4 characters" },
        { status: 400 }
      );
    }

    if (action === "signup") {
      if (!name) {
        return NextResponse.json({ error: "Name is required" }, { status: 400 });
      }

      const existing = await prisma.customerUser.findUnique({
        where: { phone: cleanPhone },
      });

      if (existing) {
        return NextResponse.json(
          { error: "Account with this mobile number already exists. Please Sign In." },
          { status: 400 }
        );
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const customer = await prisma.customerUser.create({
        data: {
          name: name.trim(),
          phone: cleanPhone,
          email: email ? email.trim() : null,
          passwordHash,
          address: address ? address.trim() : null,
          landmark: landmark ? landmark.trim() : null,
          locality: locality || "ANITS Campus & Hostels",
          ...(address && address.trim() && {
            addresses: {
              create: {
                label: "Primary",
                address: address.trim(),
                landmark: landmark ? landmark.trim() : null,
                locality: locality || "ANITS Campus & Hostels",
                isDefault: true,
              },
            },
          }),
        },
        include: { addresses: { orderBy: { isDefault: "desc" } } },
      });

      const token = jwt.sign(
        { id: customer.id, name: customer.name, phone: customer.phone },
        JWT_SECRET,
        { expiresIn: "30d" }
      );

      const response = NextResponse.json({
        success: true,
        message: "Account created successfully!",
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
    } else {
      // Login
      const customer = await prisma.customerUser.findUnique({
        where: { phone: cleanPhone },
        include: { addresses: { orderBy: { isDefault: "desc" } } },
      });

      if (!customer) {
        return NextResponse.json(
          { error: "No account found with this phone number. Please Sign Up first." },
          { status: 401 }
        );
      }

      const isValid = await bcrypt.compare(password, customer.passwordHash);
      if (!isValid) {
        return NextResponse.json(
          { error: "Incorrect password. Please try again." },
          { status: 401 }
        );
      }

      const token = jwt.sign(
        { id: customer.id, name: customer.name, phone: customer.phone },
        JWT_SECRET,
        { expiresIn: "30d" }
      );

      const response = NextResponse.json({
        success: true,
        message: "Signed in successfully!",
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
  } catch (error: any) {
    console.error("Customer auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed: " + (error?.message || "Unknown error") },
      { status: 500 }
    );
  }
}
