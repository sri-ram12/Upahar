import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "upahar-delivery-secret-key-2026";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, pin } = body;

    const cleanPhone = phone ? phone.replace(/\D/g, "") : "";
    if (!cleanPhone || cleanPhone.length < 10) {
      return NextResponse.json(
        { error: "Please enter your 10-digit mobile number" },
        { status: 400 }
      );
    }

    if (!pin) {
      return NextResponse.json(
        { error: "Please enter your Rider Secret PIN" },
        { status: 400 }
      );
    }

    const agent = await prisma.deliveryAgent.findUnique({
      where: { phone: cleanPhone },
    });

    if (!agent) {
      return NextResponse.json(
        {
          error:
            "Access Denied: No delivery agent registered with this number. Please ask the Admin to add you in the Owner Portal first.",
        },
        { status: 403 }
      );
    }

    if (agent.approvalStatus === "PENDING_APPROVAL") {
      return NextResponse.json(
        {
          error:
            "Approval Pending: Your delivery boy application has been submitted. Ask Admin to approve your account in Owner Portal.",
        },
        { status: 403 }
      );
    }

    if (agent.approvalStatus === "REJECTED") {
      return NextResponse.json(
        { error: "Access Denied: Your delivery boy application was not approved." },
        { status: 403 }
      );
    }

    if (!agent.isActive) {
      return NextResponse.json(
        {
          error:
            "Your rider account is currently INACTIVE. Please contact the Admin to activate your delivery access.",
        },
        { status: 403 }
      );
    }

    const isValid = await bcrypt.compare(String(pin), agent.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Incorrect Rider PIN. Please check and try again." },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      {
        id: agent.id,
        name: agent.name,
        phone: agent.phone,
        vehicleNumber: agent.vehicleNumber,
        role: "DELIVERY_AGENT",
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({
      success: true,
      message: `Welcome, ${agent.name}! Rider console unlocked.`,
      agent: {
        id: agent.id,
        name: agent.name,
        phone: agent.phone,
        vehicleNumber: agent.vehicleNumber,
        status: agent.status,
        approvalStatus: agent.approvalStatus,
        totalDeliveries: agent.totalDeliveries,
        cashInHand: agent.cashInHand,
        totalEarnings: agent.totalEarnings,
      },
      token,
    });

    response.cookies.set("upahar_delivery_token", token, {
      httpOnly: false,
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error("Delivery auth error:", error);
    return NextResponse.json(
      { error: "Login failed: " + (error?.message || "Unknown error") },
      { status: 500 }
    );
  }
}
