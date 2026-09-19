import React from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata = {
  title: "Admin Dashboard | UPAHAR TIFFINS",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row">
      <AdminSidebar />
      <div className="flex-1 min-w-0 overflow-y-auto">{children}</div>
    </div>
  );
}
