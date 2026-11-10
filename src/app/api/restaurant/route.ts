import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { calculateStoreStatus, getDiningSessions } from "@/lib/store-hours";
import { broadcastRealtimeEvent } from "@/lib/realtime-bus";

export async function GET() {
  try {
    let settings = await prisma.restaurantSetting.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      settings = await prisma.restaurantSetting.create({
        data: { id: "default" },
      });
    }

    const storeStatus = calculateStoreStatus(
      settings.openingTime,
      settings.closingTime,
      settings.isEmergencyClosed
    );

    const diningSessions = getDiningSessions();

    return NextResponse.json({
      settings,
      storeStatus,
      diningSessions,
    });
  } catch (error) {
    console.error("Error fetching restaurant settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch restaurant settings" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const session = await getAdminSession();

    // If modifying core profile/hours, verify admin session.
    // Allow instant Emergency Stop toggle from Admin & Master Command Hub.
    const isOnlyEmergencyToggle = Object.keys(body).every(
      (k) => k === "isEmergencyWebsiteStopped" || k === "emergencyStopMessage"
    );

    if (!session && !isOnlyEmergencyToggle) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await prisma.restaurantSetting.upsert({
      where: { id: "default" },
      update: {
        ...(body.restaurantName && { restaurantName: body.restaurantName }),
        ...(body.tagline && { tagline: body.tagline }),
        ...(body.heroHeadline && { heroHeadline: body.heroHeadline }),
        ...(body.heroSubheadline && { heroSubheadline: body.heroSubheadline }),
        ...(body.storyTitle && { storyTitle: body.storyTitle }),
        ...(body.storyText && { storyText: body.storyText }),
        ...(body.phone && { phone: body.phone }),
        ...(body.email && { email: body.email }),
        ...(body.whatsappNumber && { whatsappNumber: body.whatsappNumber }),
        ...(body.address && { address: body.address }),
        ...(body.landmark && { landmark: body.landmark }),
        ...(body.googleMapsUrl && { googleMapsUrl: body.googleMapsUrl }),
        ...(body.openingTime && { openingTime: body.openingTime }),
        ...(body.closingTime && { closingTime: body.closingTime }),
        ...(body.breakfastHours && { breakfastHours: body.breakfastHours }),
        ...(body.lunchHours && { lunchHours: body.lunchHours }),
        ...(body.eveningHours && { eveningHours: body.eveningHours }),
        ...(body.dinnerHours && { dinnerHours: body.dinnerHours }),
        ...(body.isEmergencyClosed !== undefined && {
          isEmergencyClosed: Boolean(body.isEmergencyClosed),
        }),
        ...(body.isEmergencyWebsiteStopped !== undefined && {
          isEmergencyWebsiteStopped: Boolean(body.isEmergencyWebsiteStopped),
        }),
        ...(body.emergencyStopMessage && {
          emergencyStopMessage: String(body.emergencyStopMessage),
        }),
        ...(body.isOnlineOrderingEnabled !== undefined && {
          isOnlineOrderingEnabled: Boolean(body.isOnlineOrderingEnabled),
        }),
        ...(body.enforceStoreHours !== undefined && {
          enforceStoreHours: Boolean(body.enforceStoreHours),
        }),
        ...(body.deliveryRadiusKm !== undefined && {
          deliveryRadiusKm: Number(body.deliveryRadiusKm),
        }),
        ...(body.deliveryBaseFee !== undefined && {
          deliveryBaseFee: Number(body.deliveryBaseFee),
        }),
        ...(body.minOrderFreeDelivery !== undefined && {
          minOrderFreeDelivery: Number(body.minOrderFreeDelivery),
        }),
        ...(body.minDeliveryOrderAmount !== undefined && {
          minDeliveryOrderAmount: Number(body.minDeliveryOrderAmount),
        }),
        ...(body.packagingFee !== undefined && {
          packagingFee: Number(body.packagingFee),
        }),
        ...(body.upiId && { upiId: body.upiId }),
        ...(body.upiMerchantName && { upiMerchantName: body.upiMerchantName }),
        ...(body.paymentQrUrl && { paymentQrUrl: body.paymentQrUrl }),
        ...(body.fssaiNumber !== undefined && { fssaiNumber: body.fssaiNumber || null }),
        ...(body.instagramUrl && { instagramUrl: body.instagramUrl }),
        ...(body.pureVegPledge && { pureVegPledge: body.pureVegPledge }),
      },
      create: {
        id: "default",
        ...body,
      },
    });

    const storeStatus = calculateStoreStatus(
      settings.openingTime,
      settings.closingTime,
      settings.isEmergencyClosed
    );

    // Broadcast instant real-time event so all connected users/panels get emergency changes immediately
    broadcastRealtimeEvent("EMERGENCY_STOP_CHANGED", {
      isEmergencyWebsiteStopped: settings.isEmergencyWebsiteStopped,
      emergencyStopMessage: settings.emergencyStopMessage,
      isEmergencyClosed: settings.isEmergencyClosed,
      isOnlineOrderingEnabled: settings.isOnlineOrderingEnabled,
    });

    return NextResponse.json({ settings, storeStatus });
  } catch (error) {
    console.error("Error updating restaurant settings:", error);
    return NextResponse.json(
      { error: "Failed to update restaurant settings" },
      { status: 500 }
    );
  }
}
