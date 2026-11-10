import React from "react";
import { prisma } from "@/lib/prisma";
import {
  calculateStoreStatus,
  getCategorySessionPriority,
  getEffectiveSessionType,
  getItemSessionAvailability,
  getWebsiteTheme,
} from "@/lib/store-hours";
import { FALLBACK_CATEGORIES, FALLBACK_MENU_ITEMS } from "@/lib/fallback-menu";
import HomeLandingClient from "@/components/home/HomeLandingClient";
import CategoryChips from "@/components/home/CategoryChips";
import MotionFlyerShowcase from "@/components/home/MotionFlyerShowcase";
import FeaturedSection from "@/components/home/FeaturedSection";
import SignatureShowcase from "@/components/home/SignatureShowcase";
import OffersBanner from "@/components/home/OffersBanner";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import OwnerHotelShowcase from "@/components/home/OwnerHotelShowcase";
import CustomerReviews from "@/components/home/CustomerReviews";
import LocationSection from "@/components/home/LocationSection";
import SensoryCTASection from "@/components/home/SensoryCTASection";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const rawThemeParam = resolvedSearchParams?.theme;
  const themeParam = Array.isArray(rawThemeParam) ? rawThemeParam[0] : rawThemeParam;

  let categories: any[] = [];
  let foodItems: any[] = [];
  let settings: any = null;

  try {
    const [dbCategories, dbFoodItems, dbSettings] = await Promise.all([
      prisma.category.findMany({
        where: { isActive: true },
        include: {
          _count: {
            select: { items: true },
          },
        },
        orderBy: { displayOrder: "asc" },
      }),
      prisma.foodItem.findMany({
        where: { isAvailable: true },
        include: {
          category: true,
        },
        orderBy: [
          { isSignature: "desc" },
          { isBestseller: "desc" },
          { displayOrder: "asc" },
        ],
      }),
      prisma.restaurantSetting.findUnique({
        where: { id: "default" },
      }),
    ]);

    categories = dbCategories && dbCategories.length > 0 ? dbCategories : FALLBACK_CATEGORIES;
    foodItems = dbFoodItems && dbFoodItems.length > 0 ? dbFoodItems : FALLBACK_MENU_ITEMS;
    settings = dbSettings;
  } catch (err) {
    console.error("Database query failed on homepage, using fallbacks:", err);
    categories = FALLBACK_CATEGORIES;
    foodItems = FALLBACK_MENU_ITEMS;
  }

  const storeStatus = calculateStoreStatus(
    settings?.openingTime || "06:00",
    settings?.closingTime || "22:30",
    settings?.isEmergencyClosed || false
  );

  const effectiveSession = getEffectiveSessionType(storeStatus.sessionType, themeParam);
  const themeMode = getWebsiteTheme(storeStatus.sessionType, themeParam);
  const enforceHours = settings?.enforceStoreHours !== false;

  // Sort categories so Biryanis & Fast Food come UPWARD in afternoon/evening,
  // while Morning Tiffins & Dosas lead cleanly in the morning session.
  const sessionSortedCategories = [...categories].sort(
    (a, b) =>
      getCategorySessionPriority(a.slug, effectiveSession) -
      getCategorySessionPriority(b.slug, effectiveSession)
  );

  // Enrich & prioritize food items by active session
  const sessionSortedItems = foodItems
    .map((item) => {
      const avail = getItemSessionAvailability(item.category?.slug, effectiveSession, enforceHours);
      return {
        ...item,
        isSessionLocked: avail.isLocked,
        lockReason: avail.lockMessage,
        availableAtText: avail.availableAtText,
      };
    })
    .sort((a, b) => {
      if (Boolean(a.isSessionLocked) !== Boolean(b.isSessionLocked)) {
        return a.isSessionLocked ? 1 : -1;
      }
      const pa = getCategorySessionPriority(a.category?.slug, effectiveSession);
      const pb = getCategorySessionPriority(b.category?.slug, effectiveSession);
      if (pa !== pb) return pa - pb;
      if (Boolean(b.isSignature) !== Boolean(a.isSignature)) {
        return b.isSignature ? 1 : -1;
      }
      if (Boolean(b.isBestseller) !== Boolean(a.isBestseller)) {
        return b.isBestseller ? 1 : -1;
      }
      return (a.displayOrder || 0) - (b.displayOrder || 0);
    });

  return (
    <HomeLandingClient
      themeMode={themeMode}
      urlThemeParam={themeParam ?? null}
      storeStatus={storeStatus}
      categories={sessionSortedCategories}
      menuSlot={
        <>
          <CategoryChips
            categories={sessionSortedCategories}
            effectiveSession={effectiveSession}
            themeParam={themeParam ?? null}
          />
          <MotionFlyerShowcase
            items={sessionSortedItems}
            isMorningSession={effectiveSession === "MORNING"}
          />
          <FeaturedSection
            items={sessionSortedItems}
            isMorningSession={effectiveSession === "MORNING"}
          />
          <SignatureShowcase />
          <OffersBanner />
        </>
      }
      storySlot={
        <>
          <WhyChooseUs />
          <OwnerHotelShowcase />
          <LocationSection settings={settings} storeStatus={storeStatus} />
          <SensoryCTASection />
          <CustomerReviews />
        </>
      }
    />
  );
}
