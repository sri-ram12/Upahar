import React from "react";
import type { Metadata } from "next";
import { getSubsitePageData } from "@/lib/subsite-data";
import DivisionSubsiteClient from "@/components/subsites/DivisionSubsiteClient";

export const revalidate = 30;

export const metadata: Metadata = {
  title: "UPAHAR TIFFINS | Morning & Evening Tiffins",
  description:
    "Steaming hot idlys, golden ghee karam dosas, wadas & pooris served fresh 6:00 AM – 10:30 AM & 5:00 PM – 10:30 PM at Upahar Tiffins, Sangivalasa.",
};

export default async function TiffinsSubsitePage() {
  const data = await getSubsitePageData("tiffins");
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

