import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Developer Console | UPAHAR TIFFINS",
  description: "Master control board, end-to-end order simulator, and panel switchboard for Upahar developers.",
  manifest: "/manifest-dev.json",
  icons: {
    icon: "/icons/dev-192.png",
    apple: "/icons/apple-touch-dev.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "UPAHAR Dev",
  },
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full max-w-full overflow-x-clip bg-slate-950 text-slate-100">
      {children}
    </div>
  );
}
