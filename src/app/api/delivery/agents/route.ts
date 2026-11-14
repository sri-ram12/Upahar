import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { broadcastRealtimeEvent } from "@/lib/realtime-bus";
import { revalidatePath } from "next/cache";

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

    const response = NextResponse.json({ agents });
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    return response;
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

    try {
      revalidatePath("/", "layout");
    } catch {}

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

// PUT: Approve/reject applicant, toggle active status, duty status, settle cash, or reset PIN
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      name,
      phone,
      vehicleNumber,
      pin,
      isActive,
      status,
      approvalStatus,
      cashInHandReset,
      resetCashInHand,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Agent ID is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (name && String(name).trim()) updateData.name = String(name).trim();
    if (phone) {
      const cleanPhone = String(phone).replace(/\D/g, "");
      if (cleanPhone.length >= 10) updateData.phone = cleanPhone;
    }
    if (vehicleNumber && String(vehicleNumber).trim()) {
      updateData.vehicleNumber = String(vehicleNumber).trim().toUpperCase();
    }
    if (pin && String(pin).trim()) {
      updateData.passwordHash = await bcrypt.hash(String(pin).trim(), 10);
    }
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

    try {
      revalidatePath("/", "layout");
    } catch {}

    return NextResponse.json({ success: true, agent });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update agent: " + (error?.message || "Unknown error") }, { status: 500 });
  }
}

// DELETE: Remove delivery agent from roster permanently
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Agent ID is required" }, { status: 400 });
    }

    // Unassign agent from any active orders first so foreign keys don't block deletion
    await prisma.order.updateMany({
      where: {
        deliveryAgentId: id,
        status: { not: "DELIVERED" },
      },
      data: { deliveryAgentId: null },
    });

    await prisma.deliveryAgent.delete({
      where: { id },
    });

    broadcastRealtimeEvent("RIDER_STATUS_CHANGED", {
      deliveryAgentId: id,
      isDeleted: true,
    });

    try {
      revalidatePath("/", "layout");
    } catch {}

    return NextResponse.json({ success: true, message: "Delivery agent removed successfully" });
  } catch (error: any) {
    console.error("Error deleting delivery agent:", error);
    return NextResponse.json(
      { error: "Failed to delete delivery agent: " + (error?.message || "Unknown error") },
      { status: 500 }
    );
  }
}
