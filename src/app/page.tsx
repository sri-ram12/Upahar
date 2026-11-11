import React from "react";
import { getSubsitesAndSettings } from "@/lib/subsite-data";
import HomeLandingClient from "@/components/home/HomeLandingClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { settings, subsites } = await getSubsitesAndSettings();

  return (
    <HomeLandingClient
      subsites={subsites}
      isEmergencyWebsiteStopped={Boolean(settings?.isEmergencyWebsiteStopped)}
      emergencyStopMessage={settings?.emergencyStopMessage || null}
    />
  );
}
