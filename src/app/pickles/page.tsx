import React from "react";
import type { Metadata } from "next";
import { getSubsitePageData } from "@/lib/subsite-data";
import DivisionSubsiteClient from "@/components/subsites/DivisionSubsiteClient";

export const revalidate = 30;

export const metadata: Metadata = {
  title: "UPAHAR PICKLES | Authentic Andhra Homemade Pickles (Open 24×7)",
  description:
    "Order authentic homemade Andhra Mango Avakaya, Gongura Red Chilli, Garlic Karam & Boneless Chicken Pickle jars 24×7 anytime at Upahar Pickles.",
};

export default async function PicklesSubsitePage() {
  const data = await getSubsitePageData("pickles");
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

