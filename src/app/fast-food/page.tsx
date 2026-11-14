import React from "react";
import type { Metadata } from "next";
import { getSubsitePageData } from "@/lib/subsite-data";
import DivisionSubsiteClient from "@/components/subsites/DivisionSubsiteClient";

export const revalidate = 30;

export const metadata: Metadata = {
  title: "UPAHAR FAST FOODS | High-Flame Wok Noodles, Fried Rice & Starters",
  description:
    "Sizzling Street-Style Schezwan Noodles, Chicken & Paneer Fried Rice, Manchurian Starters & Parottas served fresh 5:00 PM – 10:30 PM at Upahar Fast Foods.",
};

export default async function FastFoodSubsitePage() {
  const data = await getSubsitePageData("fast-food");
  return (
    <DivisionSubsiteClient
      division={data.division}
      categories={data.categories}
      initialItems={data.items}
      allSubsites={data.allSubsites}
      isEmergencyWebsiteStopped={data.isEmergencyWebsiteStopped}
      emergencyStopMessage={data.emergencyStopMessage}
    />
  );
}

