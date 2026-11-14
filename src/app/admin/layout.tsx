import React from "react";
import type { Metadata } from "next";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { PwaPanelBanner } from "@/components/pwa/PwaRegister";

export const metadata: Metadata = {
  title: "Admin Dashboard | UPAHAR TIFFINS",
  manifest: "/manifest-admin.json",
  icons: {
    icon: "/icons/admin-192.png",
    apple: "/icons/apple-touch-admin.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "UPAHAR Admin",
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full max-w-full overflow-x-clip bg-stone-100 flex flex-col md:flex-row">
      <AdminSidebar />
      <div className="flex-1 min-w-0 overflow-x-clip overflow-y-auto">{children}</div>
      <PwaPanelBanner />
    </div>
  );
}
