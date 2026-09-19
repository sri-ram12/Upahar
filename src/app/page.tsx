import React from "react";
import { prisma } from "@/lib/prisma";
import { calculateStoreStatus } from "@/lib/store-hours";
import HeroSection from "@/components/home/HeroSection";
import SectionWaveDivider from "@/components/effects/SectionWaveDivider";
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
  const [categories, foodItems, settings] = await Promise.all([
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

  const storeStatus = calculateStoreStatus(
    settings?.openingTime || "06:00",
    settings?.closingTime || "22:30",
    settings?.isEmergencyClosed || false
  );

  return (
    <main className="min-h-screen overflow-hidden bg-[#FAF7F2] text-[#141210]">
      {/* 1. Hero Section with Signature Realistic Water-Throw Stream Engine */}
      <HeroSection storeStatus={storeStatus} />

      {/* Fluid Liquid Wave Transition */}
      <SectionWaveDivider
        fillColor="#FAF7F2"
        crestColor="rgba(212, 175, 55, 0.25)"
        bgColor="#141210"
      />

      {/* 2. Menu Category Navigator */}
      <CategoryChips categories={categories} />

      {/* 3. Dynamic Motion Flyer Showcase replacing circular inspector */}
      <MotionFlyerShowcase items={foodItems} />

      {/* Fluid Liquid Wave Transition into Popular Dishes */}
      <SectionWaveDivider
        fillColor="#FAF7F2"
        crestColor="rgba(88, 13, 26, 0.35)"
        bgColor="#141210"
      />

      {/* 4. Popular Food / Bestseller Dishes (Editorial Food Cards) */}
      <FeaturedSection items={foodItems} />

      {/* Fluid Liquid Wave Transition into Dark Showcase */}
      <SectionWaveDivider
        fillColor="#141210"
        crestColor="rgba(88, 13, 26, 0.35)"
        bgColor="#FAF7F2"
      />

      {/* 4. Chef's Signature Tava Craft Showcase with Plate Selector */}
      <SignatureShowcase />

      {/* Fluid Liquid Wave Transition into Daily Specials */}
      <SectionWaveDivider
        fillColor="#380A11"
        crestColor="rgba(212, 175, 55, 0.3)"
        bgColor="#141210"
      />

      {/* 5. Special Daily Combos & Culinary Highlights Banner */}
      <OffersBanner />

      {/* Fluid Liquid Wave Transition into Quality Pillars */}
      <SectionWaveDivider
        fillColor="#FAF7F2"
        crestColor="rgba(88, 13, 26, 0.25)"
        bgColor="#2B070E"
      />

      {/* 6. About Upahar: 4 Pillars of Freshness */}
      <WhyChooseUs />

      {/* 7. Owner Profile, Hotel Pics & Physical Menu Pic Showcase */}
      <OwnerHotelShowcase />

      {/* 8. Diner Reviews & Ratings */}
      <CustomerReviews />

      {/* Fluid Liquid Wave Transition into Location */}
      <SectionWaveDivider
        fillColor="#141210"
        crestColor="rgba(88, 13, 26, 0.35)"
        bgColor="#FAF7F2"
      />

      {/* 9. Location, Timings & Google Maps Embed */}
      <LocationSection settings={settings} storeStatus={storeStatus} />

      {/* 10. Final Sensory Call-to-Action with Liquid Ripple */}
      <SensoryCTASection />
    </main>
  );
}
