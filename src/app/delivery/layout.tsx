import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Delivery Rider Panel | UPAHAR TIFFINS",
  description: "Live order dispatch, customer delivery navigation, and OTP verification for Upahar delivery riders.",
  manifest: "/manifest-rider.json",
  icons: {
    icon: "/icons/rider-192.png",
    apple: "/icons/apple-touch-rider.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "UPAHAR Rider",
  },
};

export default function DeliveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full max-w-full overflow-x-clip bg-stone-900 text-stone-100">
      {children}
    </div>
  );
}
