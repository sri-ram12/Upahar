import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { broadcastRealtimeEvent } from "@/lib/realtime-bus";

// GET: List all delivery agents (for Admin panel and Rider dispatch)
export async function GET() {
  try {
    const agents = await prisma.deliveryAgent.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        phone: true,
        vehicleNumber: true,
        status: true,
        approvalStatus: true,
        isActive: true,
        totalDeliveries: true,
        cashInHand: true,
        totalEarnings: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ agents });
  } catch (error: any) {
    console.error("Error fetching delivery agents:", error);
    return NextResponse.json(
      { error: "Failed to fetch delivery agents" },
      { status: 500 }
    );
  }
}

// POST: Admin adds a new Delivery Boy OR Delivery Boy applies for registration (Pending Approval)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, name, phone, vehicleNumber, pin } = body;
    const isSelfSignup = action === "apply";

    if (!name || !phone || !vehicleNumber || !pin) {
      return NextResponse.json(
        { error: "Name, phone number, vehicle number, and 4-digit PIN are required" },
        { status: 400 }
      );
    }

    const cleanPhone = String(phone).replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit mobile number" },
        { status: 400 }
      );
    }

    const existing = await prisma.deliveryAgent.findUnique({
      where: { phone: cleanPhone },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A delivery agent with this mobile number already exists." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(String(pin), 10);

    const agent = await prisma.deliveryAgent.create({
      data: {
        name: name.trim(),
        phone: cleanPhone,
        vehicleNumber: vehicleNumber.trim().toUpperCase(),
        passwordHash,
        status: isSelfSignup ? "INACTIVE" : "ACTIVE",
        approvalStatus: isSelfSignup ? "PENDING_APPROVAL" : "APPROVED",
        isActive: !isSelfSignup,
      },
    });

    broadcastRealtimeEvent("RIDER_STATUS_CHANGED", {
      deliveryAgentId: agent.id,
      agent,
      isNewSignup: isSelfSignup,
    });

    return NextResponse.json({
      success: true,
      message: isSelfSignup
        ? `Application submitted for ${agent.name}! Admin must approve your details in Owner Portal before you can log in.`
        : `Delivery agent ${agent.name} added successfully!`,
      agent: {
        id: agent.id,
        name: agent.name,
        phone: agent.phone,
        vehicleNumber: agent.vehicleNumber,
        status: agent.status,
        approvalStatus: agent.approvalStatus,
        isActive: agent.isActive,
      },
    });
  } catch (error: any) {
    console.error("Error creating delivery agent:", error);
    return NextResponse.json(
      { error: "Failed to add delivery agent: " + (error?.message || "Unknown error") },
      { status: 500 }
    );
  }
}

// PUT: Approve/reject applicant, toggle active status, duty status, or settle cash
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, isActive, status, approvalStatus, cashInHandReset, resetCashInHand } = body;

    if (!id) {
      return NextResponse.json({ error: "Agent ID is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (status !== undefined) updateData.status = status;
    if (approvalStatus !== undefined) {
      updateData.approvalStatus = approvalStatus;
      if (approvalStatus === "APPROVED") {
        updateData.isActive = true;
        updateData.status = "ACTIVE";
      } else if (approvalStatus === "REJECTED") {
        updateData.isActive = false;
        updateData.status = "INACTIVE";
      }
    }
    if (cashInHandReset || resetCashInHand) updateData.cashInHand = 0;

    const agent = await prisma.deliveryAgent.update({
      where: { id },
      data: updateData,
    });

    broadcastRealtimeEvent("RIDER_STATUS_CHANGED", {
      deliveryAgentId: agent.id,
      agent,
      cashInHand: agent.cashInHand,
      totalDeliveries: agent.totalDeliveries,
      totalEarnings: agent.totalEarnings,
    });

    return NextResponse.json({ success: true, agent });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update agent" }, { status: 500 });
  }
}
