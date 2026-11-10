import React from "react";
import type { Metadata } from "next";
import { getSubsitePageData } from "@/lib/subsite-data";
import DivisionSubsiteClient from "@/components/subsites/DivisionSubsiteClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "UPAHAR BIRYANIS | Saffron Copper Handi Dum Biryanis",
  description:
    "Signature Hyderabadi Chicken Dum Biryani, Andhra Fry Piece Biryani & Egg Dum Biryani served fresh 12:00 PM – 10:30 PM at Upahar Biryanis, Sangivalasa.",
};

export default async function BiryanisSubsitePage() {
  const data = await getSubsitePageData("biryanis");
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

