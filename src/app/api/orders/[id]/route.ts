import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { broadcastRealtimeEvent } from "@/lib/realtime-bus";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        items: true,
        deliveryAgent: {
          select: { id: true, name: true, phone: true, vehicleNumber: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order details" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const {
      action,
      status,
      paymentMethod,
      paymentStatus,
      upiTransactionId,
      paymentConfirmedBy,
      estimatedTime,
      rejectionReason,
      enteredOtp,
      deliveryAgentId,
      adminOverride,
      riderLat,
      riderLng,
      rating,
      deliveryRating,
      reviewComment,
    } = body;

    // Fetch existing order
    const existing = await prisma.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id }] },
    });

    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 1. Customer Self-Cancel (only allowed while status === "PENDING")
    if (action === "CUSTOMER_CANCEL") {
      if (existing.status !== "PENDING") {
        return NextResponse.json(
          {
            error:
              "Kitchen has already accepted or started cooking this order. Please call +91 9885455342 to request cancellation.",
          },
          { status: 400 }
        );
      }

      const cancelled = await prisma.order.update({
        where: { id: existing.id },
        data: {
          status: "CANCELLED",
          cancelledBy: "CUSTOMER",
          cancelledAt: new Date(),
          rejectionReason: rejectionReason || "Cancelled by customer before kitchen confirmation",
        },
        include: { items: true, deliveryAgent: true },
      });

      broadcastRealtimeEvent("ORDER_UPDATED", {
        orderId: cancelled.id,
        orderNumber: cancelled.orderNumber,
        status: cancelled.status,
        cancelledBy: "CUSTOMER",
      });

      return NextResponse.json({ success: true, order: cancelled });
    }

    // 2. Customer Submit Paytm/UPI Transaction Ref on Tracking Page
    if (action === "SUBMIT_UPI_PAYMENT") {
      const updatedPayment = await prisma.order.update({
        where: { id: existing.id },
        data: {
          paymentMethod: "UPI",
          paymentStatus: "VERIFICATION_PENDING",
          upiTransactionId: upiTransactionId ? String(upiTransactionId).trim() : "QR_SCANNED",
          paymentConfirmedBy: "CUSTOMER_UTR",
        },
        include: { items: true, deliveryAgent: true },
      });

      broadcastRealtimeEvent("ORDER_UPDATED", {
        orderId: updatedPayment.id,
        orderNumber: updatedPayment.orderNumber,
        paymentMethod: updatedPayment.paymentMethod,
        paymentStatus: updatedPayment.paymentStatus,
        upiTransactionId: updatedPayment.upiTransactionId,
      });

      return NextResponse.json({ success: true, order: updatedPayment });
    }

    // 3. Customer Post-Delivery Rating & Review
    if (action === "SUBMIT_REVIEW") {
      if (existing.status !== "DELIVERED") {
        return NextResponse.json(
          { error: "You can submit a rating once the order is delivered." },
          { status: 400 }
        );
      }
      const foodScore = Math.min(5, Math.max(1, Number(rating || 5)));
      const riderScore = deliveryRating
        ? Math.min(5, Math.max(1, Number(deliveryRating)))
        : foodScore;

      const reviewed = await prisma.order.update({
        where: { id: existing.id },
        data: {
          rating: foodScore,
          deliveryRating: riderScore,
          reviewComment: reviewComment ? String(reviewComment).trim() : null,
          reviewedAt: new Date(),
        },
        include: { items: true, deliveryAgent: true },
      });

      broadcastRealtimeEvent("ORDER_UPDATED", {
        orderId: reviewed.id,
        orderNumber: reviewed.orderNumber,
        rating: reviewed.rating,
      });

      return NextResponse.json({ success: true, order: reviewed });
    }

    // 4. Rider Live GPS Coordinate Ping
    if (action === "UPDATE_RIDER_LOCATION" && riderLat !== undefined && riderLng !== undefined) {
      const locUpdated = await prisma.order.update({
        where: { id: existing.id },
        data: {
          riderLat: Number(riderLat),
          riderLng: Number(riderLng),
          riderLocationUpdatedAt: new Date(),
        },
      });

      broadcastRealtimeEvent("RIDER_LOCATION_UPDATED", {
        orderId: locUpdated.id,
        orderNumber: locUpdated.orderNumber,
        riderLat: locUpdated.riderLat,
        riderLng: locUpdated.riderLng,
      });

      return NextResponse.json({ success: true });
    }

    // 5. Prevent two riders from simultaneously claiming the same delivery run
    if (
      status === "OUT_FOR_DELIVERY" &&
      deliveryAgentId &&
      !adminOverride &&
      existing.deliveryAgentId &&
      existing.deliveryAgentId !== deliveryAgentId
    ) {
      return NextResponse.json(
        { error: "This delivery run was already claimed by another rider." },
        { status: 409 }
      );
    }

    // 6. Standard Pipeline Updates + Delivery OTP validation
    if (status === "DELIVERED" && existing.orderType === "DELIVERY" && !adminOverride) {
      if (!enteredOtp) {
        return NextResponse.json(
          { error: "Delivery OTP is required to complete this order." },
          { status: 400 }
        );
      }

      if (String(enteredOtp).trim() !== existing.deliveryOtp.trim()) {
        return NextResponse.json(
          {
            error:
              "Incorrect Delivery OTP! Please check the 4-digit OTP shown on the customer's phone.",
          },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;
    if (upiTransactionId !== undefined) updateData.upiTransactionId = upiTransactionId;
    if (paymentConfirmedBy !== undefined) updateData.paymentConfirmedBy = paymentConfirmedBy;
    if (estimatedTime !== undefined) updateData.estimatedTime = estimatedTime;
    if (rejectionReason !== undefined) updateData.rejectionReason = rejectionReason;
    if (deliveryAgentId !== undefined) updateData.deliveryAgentId = deliveryAgentId;

    if (status === "DELIVERED") {
      updateData.deliveredAt = new Date();
      updateData.paymentCollectedAt = new Date();
      updateData.paymentStatus = "PAID";
      if (!updateData.paymentConfirmedBy && !existing.paymentConfirmedBy) {
        updateData.paymentConfirmedBy =
          (paymentMethod || existing.paymentMethod) === "COD" ? "COD_CASH" : "RIDER_QR";
      }
    }

    const updated = await prisma.order.update({
      where: { id: existing.id },
      data: updateData,
      include: {
        items: true,
        deliveryAgent: true,
      },
    });

    // Broadcast instant real-time event to all connected panels (<50ms)
    broadcastRealtimeEvent("ORDER_UPDATED", {
      orderId: updated.id,
      orderNumber: updated.orderNumber,
      status: updated.status,
      estimatedTime: updated.estimatedTime,
      deliveryAgentId: updated.deliveryAgentId,
      deliveryAgent: updated.deliveryAgent,
      paymentMethod: updated.paymentMethod,
      paymentStatus: updated.paymentStatus,
      totalAmount: updated.totalAmount,
    });

    if (status === "OUT_FOR_DELIVERY" && updated.deliveryAgentId) {
      const activeAgent = await prisma.deliveryAgent.update({
        where: { id: updated.deliveryAgentId },
        data: { status: "ON_DELIVERY" },
      }).catch(() => null);
      if (activeAgent) {
        broadcastRealtimeEvent("RIDER_STATUS_CHANGED", {
          agent: activeAgent,
          deliveryAgentId: activeAgent.id,
          cashInHand: activeAgent.cashInHand,
          totalDeliveries: activeAgent.totalDeliveries,
          totalEarnings: activeAgent.totalEarnings,
        });
      }
    }

    if (status === "DELIVERED") {
      broadcastRealtimeEvent("ORDER_DELIVERED", {
        orderId: updated.id,
        orderNumber: updated.orderNumber,
        totalAmount: updated.totalAmount,
        paymentMethod: updated.paymentMethod,
        customerName: updated.customerName,
      });
    }

    // If marked delivered, update delivery agent's stats accurately!
    // Important: only increment cashInHand if final paymentMethod === "COD"
    // (if customer scanned Paytm QR at the door, paymentMethod becomes "UPI" and does NOT add COD cash debt!)
    const effectiveAgentId = deliveryAgentId || existing.deliveryAgentId;
    const finalPaymentMethod = updated.paymentMethod;
    if (status === "DELIVERED" && existing.status !== "DELIVERED" && effectiveAgentId) {
      const updatedAgent = await prisma.deliveryAgent.update({
        where: { id: effectiveAgentId },
        data: {
          totalDeliveries: { increment: 1 },
          totalEarnings: { increment: Math.max(20, updated.deliveryFee || 25) },
          ...(finalPaymentMethod === "COD" && {
            cashInHand: { increment: updated.totalAmount },
          }),
          status: "ACTIVE",
        },
      });

      broadcastRealtimeEvent("RIDER_STATUS_CHANGED", {
        agent: updatedAgent,
        deliveryAgentId: effectiveAgentId,
        cashInHand: updatedAgent.cashInHand,
        totalDeliveries: updatedAgent.totalDeliveries,
        totalEarnings: updatedAgent.totalEarnings,
      });
    }

    return NextResponse.json({
      success: true,
      order: updated,
    });
  } catch (error: any) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
