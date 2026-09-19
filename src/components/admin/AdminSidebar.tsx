"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  UtensilsCrossed,
  FolderTree,
  Image as ImageIcon,
  Settings,
  MessageSquare,
  LogOut,
  ExternalLink,
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Menu Dishes", href: "/admin/menu", icon: UtensilsCrossed },
    { name: "Categories", href: "/admin/categories", icon: FolderTree },
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
    <aside className="w-64 bg-[#141210] text-stone-300 min-h-screen flex flex-col justify-between border-r border-[#2B070E] flex-shrink-0">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-stone-800 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#580D1A] to-[#2B070E] border border-[#D4AF37]/50 flex items-center justify-center text-[#DFC17B] font-black shadow-md">
            U
          </div>
          <div>
            <h2 className="font-black text-white text-base tracking-tight font-display">
              UPAHAR
            </h2>
            <span className="text-[10px] text-[#DFC17B] font-bold uppercase tracking-widest block -mt-1">
              Owner Portal
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
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? "bg-[#580D1A] text-[#DFC17B] border border-[#D4AF37]/40 shadow-md"
                    : "text-stone-400 hover:text-white hover:bg-stone-800/60"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-stone-800 space-y-2">
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
          className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
