import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import {
  formatTimeWindowsLabel,
  isValidDivisionKey,
  parseTimeWindows,
  UPAHAR_DIVISIONS,
} from "@/lib/store-hours";
import { getSubsitesAndSettings, clearSubsitesCache } from "@/lib/subsite-data";
import { broadcastRealtimeEvent } from "@/lib/realtime-bus";

export async function GET() {
  try {
    const { subsites, settings, storeStatus } = await getSubsitesAndSettings();
    const response = NextResponse.json({ subsites, settings, storeStatus });
    response.headers.set("Cache-Control", "public, s-maxage=15, stale-while-revalidate=59");
    return response;
  } catch (error) {
    console.error("Error fetching subsites:", error);
    return NextResponse.json({ error: "Failed to fetch sub-websites" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const id = body?.id;

    if (!isValidDivisionKey(id)) {
      return NextResponse.json({ error: "Invalid sub-website key" }, { status: 400 });
    }

    const defaults = UPAHAR_DIVISIONS[id];
    const existing = await prisma.subsiteConfig.findUnique({ where: { id } });

    const nextAlwaysOpen =
      body.alwaysOpen !== undefined ? Boolean(body.alwaysOpen) : existing?.alwaysOpen ?? Boolean(defaults.alwaysOpen);

    let nextWindowsJson = existing?.timeWindowsJson || JSON.stringify(defaults.timeWindows);
    if (body.timeWindowsJson !== undefined) {
      const parsed = parseTimeWindows(body.timeWindowsJson, defaults.timeWindows);
      nextWindowsJson = JSON.stringify(parsed);
    } else if (Array.isArray(body.timeWindows)) {
      const parsed = parseTimeWindows(body.timeWindows, defaults.timeWindows);
      nextWindowsJson = JSON.stringify(parsed);
    }

    const parsedWindows = parseTimeWindows(nextWindowsJson, defaults.timeWindows);
    const computedScheduleLabel =
      body.scheduleLabel !== undefined && String(body.scheduleLabel).trim()
        ? String(body.scheduleLabel).trim()
        : formatTimeWindowsLabel(parsedWindows, nextAlwaysOpen);

    let nextOverride: boolean | null | undefined = undefined;
    if (body.isOpenOverride !== undefined) {
      if (body.isOpenOverride === true || body.isOpenOverride === "true") nextOverride = true;
      else if (body.isOpenOverride === false || body.isOpenOverride === "false") nextOverride = false;
      else nextOverride = null;
    }

    const updated = await prisma.subsiteConfig.upsert({
      where: { id },
      update: {
        ...(body.title !== undefined && { title: String(body.title).trim() || defaults.title }),
        ...(body.shortTitle !== undefined && { shortTitle: String(body.shortTitle).trim() || defaults.shortTitle }),
        ...(body.tagline !== undefined && { tagline: String(body.tagline).trim() }),
        ...(body.quote !== undefined && { quote: String(body.quote).trim() }),
        ...(body.description !== undefined && { description: String(body.description).trim() }),
        ...(body.heroImage !== undefined && { heroImage: String(body.heroImage).trim() || defaults.heroImage }),
        ...(body.isActive !== undefined && { isActive: Boolean(body.isActive) }),
        ...(body.pausedMessage !== undefined && { pausedMessage: body.pausedMessage ? String(body.pausedMessage) : null }),
        ...(nextOverride !== undefined && { isOpenOverride: nextOverride }),
        alwaysOpen: nextAlwaysOpen,
        timeWindowsJson: nextWindowsJson,
        scheduleLabel: computedScheduleLabel,
      },
      create: {
        id,
        title: String(body.title || defaults.title),
        shortTitle: String(body.shortTitle || defaults.shortTitle),
        tagline: String(body.tagline || defaults.tagline),
        quote: String(body.quote || defaults.quote),
        description: String(body.description || defaults.description),
        heroImage: String(body.heroImage || defaults.heroImage),
        theme: defaults.theme,
        scheduleLabel: computedScheduleLabel,
        timeWindowsJson: nextWindowsJson,
        alwaysOpen: nextAlwaysOpen,
        isOpenOverride: nextOverride ?? null,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
        pausedMessage: body.pausedMessage || null,
        displayOrder: Number(defaults.number) || 1,
      },
    });

    broadcastRealtimeEvent("SUBSITE_UPDATED", { id: updated.id, subsite: updated });
    clearSubsitesCache();
    const { subsites } = await getSubsitesAndSettings();
    return NextResponse.json({ success: true, subsite: updated, subsites });
  } catch (error) {
    console.error("Error updating subsite config:", error);
    return NextResponse.json({ error: "Failed to update sub-website" }, { status: 500 });
  }
}

