import React from "react";
import { prisma } from "@/lib/prisma";
import { calculateStoreStatus } from "@/lib/store-hours";
import { FALLBACK_CATEGORIES, FALLBACK_MENU_ITEMS } from "@/lib/fallback-menu";
import HeroSection from "@/components/home/HeroSection";
import CategoryChips from "@/components/home/CategoryChips";
import FeaturedSection from "@/components/home/FeaturedSection";
import MotionFlyerShowcase from "@/components/home/MotionFlyerShowcase";
import SignatureShowcase from "@/components/home/SignatureShowcase";
import OffersBanner from "@/components/home/OffersBanner";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import OwnerHotelShowcase from "@/components/home/OwnerHotelShowcase";
import CustomerReviews from "@/components/home/CustomerReviews";
import LocationSection from "@/components/home/LocationSection";
import SensoryCTASection from "@/components/home/SensoryCTASection";

export const revalidate = 60;

export default async function HomePage() {
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

  return (
    <main className="min-h-screen overflow-hidden bg-[#FAF7F2] text-[#141210]">
      {/* 1. Hero Section with Authentic Heritage Visuals */}
      <HeroSection storeStatus={storeStatus} />

      {/* 2. Menu Category Navigator */}
      <CategoryChips categories={categories} />

      {/* 3. Pinterest-Style Motion Flyer Showcase (Kinetic Typography, 360 Rotation, Floating Particles) */}
      <MotionFlyerShowcase items={foodItems} />

      {/* 4. Popular Food / Bestseller Dishes (Editorial Food Cards) */}
      <FeaturedSection items={foodItems} />

      {/* 5. Chef's Signature Tava Craft Showcase with Plate Selector */}
      <SignatureShowcase />

      {/* 6. Special Daily Combos & Culinary Highlights Banner */}
      <OffersBanner />

      {/* 7. About Upahar: 4 Pillars of Freshness */}
      <WhyChooseUs />

      {/* 8. Owner Profile, Hotel Pics & Physical Menu Pic Showcase */}
      <OwnerHotelShowcase />

      {/* 9. Diner Reviews & Ratings */}
      <CustomerReviews />

      {/* 10. Location, Timings & Google Maps Embed */}
      <LocationSection settings={settings} storeStatus={storeStatus} />

      {/* 11. Final Sensory Call-to-Action */}
      <SensoryCTASection />
    </main>
  );
}
