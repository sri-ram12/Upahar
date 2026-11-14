"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  UtensilsCrossed,
  FolderTree,
  Image as ImageIcon,
  Settings,
  MessageSquare,
  QrCode,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShoppingBag,
  Bike,
  Globe,
  Download,
} from "lucide-react";
import { usePwa } from "@/components/pwa/PwaRegister";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { installApp } = usePwa();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "4 Sub-Websites", href: "/admin/websites", icon: Globe, badge: "4 Sites" },
    { name: "Live Orders", href: "/admin/orders", icon: ShoppingBag, badge: "Live" },
    { name: "Delivery Agents", href: "/admin/delivery-agents", icon: Bike },
    { name: "Menu Dishes", href: "/admin/menu", icon: UtensilsCrossed },
    { name: "Categories", href: "/admin/categories", icon: FolderTree },
    { name: "QR Standees", href: "/admin/qr", icon: QrCode },
    { name: "Photo Gallery", href: "/admin/gallery", icon: ImageIcon },
    { name: "Store Settings", href: "/admin/settings", icon: Settings },
    { name: "Customer Inquiries", href: "/admin/inquiries", icon: MessageSquare },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden bg-[#141210] border-b border-[#2B070E] px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-2.5">
          <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-[#D4AF37]/50 shadow-md bg-stone-900 shrink-0">
            <Image src="/icons/admin-192.png" alt="Admin Icon" fill className="object-cover" sizes="32px" />
          </div>
          <div>
            <span className="font-black text-white text-sm tracking-tight font-display block leading-none">
              UPAHAR
            </span>
            <span className="text-[9px] text-[#DFC17B] font-bold uppercase tracking-widest block">
              Admin Web App
            </span>
          </div>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-stone-900 border border-stone-800 text-stone-300 hover:text-white"
          aria-label="Toggle admin navigation"
        >
          {mobileOpen ? <X className="w-5 h-5 text-[#DFC17B]" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-[#141210] border-b border-stone-800 px-4 py-3 space-y-3 z-30 shadow-xl">
          <nav className="space-y-1">
            {links.map((link) => {
              const isActive =
                link.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(link.href);
              const Icon = link.icon;

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? "bg-[#580D1A] text-[#DFC17B] border border-[#D4AF37]/40 shadow-md"
                      : "text-stone-400 hover:text-white hover:bg-stone-800/60"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4" />
                    <span>{link.name}</span>
                  </div>
                  {link.badge && (
                    <span className="bg-red-500 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full animate-pulse">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="pt-2 border-t border-stone-800 space-y-1">
            <Link
              href="/"
              target="_blank"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition"
            >
              <span>View Public Site</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#DFC17B]" />
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 bg-[#141210] text-stone-300 min-h-screen flex-col justify-between border-r border-[#2B070E] flex-shrink-0">
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-stone-800 flex items-center space-x-3">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-[#D4AF37]/50 shadow-md bg-stone-900 shrink-0">
              <Image src="/icons/admin-192.png" alt="Admin Icon" fill className="object-cover" sizes="40px" />
            </div>
            <div>
              <h2 className="font-black text-white text-base tracking-tight font-display">
                UPAHAR
              </h2>
              <span className="text-[10px] text-[#DFC17B] font-bold uppercase tracking-widest block -mt-0.5">
                Admin Panel PWA
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="p-4 space-y-1">
            {links.map((link) => {
              const isActive =
                link.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(link.href);
              const Icon = link.icon;

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? "bg-[#580D1A] text-[#DFC17B] border border-[#D4AF37]/40 shadow-md"
                      : "text-stone-400 hover:text-white hover:bg-stone-800/60"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4" />
                    <span>{link.name}</span>
                  </div>
                  {link.badge && (
                    <span className="bg-red-500 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full animate-pulse">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer / Install & Logout */}
        <div className="p-4 border-t border-stone-800 space-y-2">
          <button
            type="button"
            onClick={installApp}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 rounded-lg transition border border-emerald-500/20 cursor-pointer"
            title="Install Admin Web App to Desktop / Phone"
          >
            <div className="flex items-center gap-2">
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Install Admin App</span>
            </div>
            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-black">
              PWA
            </span>
          </button>

          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition"
          >
            <span>View Public Site</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#DFC17B]" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
