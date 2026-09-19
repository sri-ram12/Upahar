import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { calculateStoreStatus, getDiningSessions } from "@/lib/store-hours";

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
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

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

    return NextResponse.json({ settings, storeStatus });
  } catch (error) {
    console.error("Error updating restaurant settings:", error);
    return NextResponse.json(
      { error: "Failed to update restaurant settings" },
      { status: 500 }
    );
  }
}
