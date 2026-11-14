import React from "react";
import type { Metadata } from "next";
import { PwaPanelBanner } from "@/components/pwa/PwaRegister";

export const metadata: Metadata = {
  title: "Kitchen Display System (KDS) | UPAHAR TIFFINS",
  description: "Live cooking tickets, kitchen timer, order alerts, and 1-click food ready dispatch for Upahar chefs.",
  manifest: "/manifest-kitchen.json",
  icons: {
    icon: "/icons/kitchen-192.png",
    apple: "/icons/apple-touch-kitchen.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "UPAHAR Kitchen",
  },
};

export default function KitchenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full max-w-full overflow-x-clip bg-zinc-950 text-zinc-100">
      {children}
      <PwaPanelBanner />
    </div>
  );
}
