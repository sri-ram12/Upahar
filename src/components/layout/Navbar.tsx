"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu as MenuIcon,
  X,
  Clock,
  Phone,
  MapPin,
  ArrowRight,
  MessageSquare,
  QrCode,
  ShoppingBag,
  User,
  LogOut,
} from "lucide-react";
import QRModal from "@/components/qr/QRModal";
import { useCart } from "@/context/CartContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { getWebsiteTheme, type WebsiteThemeMode } from "@/lib/store-hours";

export default function Navbar() {
  const pathname = usePathname();
  const { totalCount, toggleCart } = useCart();
  const { customer, setIsAuthModalOpen, logout } = useCustomerAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [themeOverride, setThemeOverride] = useState<string | null>(null);
  const [storeStatus, setStoreStatus] = useState<{
    isOpen: boolean;
    sessionType?: "MORNING" | "EVENING" | "CLOSED";
    statusText: string;
    subText: string;
    currentSession?: string;
  } | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const syncFromUrlAndApi = () => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        setThemeOverride(params.get("theme"));
      }
      fetch("/api/restaurant")
        .then((res) => res.json())
        .then((data) => {
          if (data.storeStatus) {
            setStoreStatus(data.storeStatus);
          }
        })
        .catch((err) => console.error("Error fetching restaurant status:", err));
    };

    const handleThemeEvent = (e: Event) => {
      const detail = (e as CustomEvent<{ theme?: WebsiteThemeMode; urlTheme?: string | null }>).detail;
      if (detail && detail.urlTheme !== undefined) {
        setThemeOverride(detail.urlTheme);
      }
    };

    syncFromUrlAndApi();
    window.addEventListener("upahar-theme-change", handleThemeEvent);
    return () => window.removeEventListener("upahar-theme-change", handleThemeEvent);
  }, [pathname]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isStaffPanel =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/kitchen") ||
    pathname?.startsWith("/delivery") ||
    pathname?.startsWith("/portal") ||
    pathname?.startsWith("/dev");

  const activeTheme: WebsiteThemeMode = isStaffPanel
    ? "original-maroon"
    : getWebsiteTheme(storeStatus?.sessionType, themeOverride);

  const isMorningGreen = activeTheme === "morning-green";

  const withThemeParam = (href: string) => {
    if (!themeOverride) return href;
    const sep = href.includes("?") ? "&" : "?";
    return `${href}${sep}theme=${encodeURIComponent(themeOverride)}`;
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Menu", href: "/menu" },
    { name: "About Us", href: "/about" },
    { name: "Gallery", href: "/gallery" },
    { name: "Contact", href: "/contact" },
  ];

  const mobileLinks = [
    ...navLinks,
    { name: "Scan Table QR", href: "/qr" },
    { name: "The Experience", href: "/experience" },
  ];

  // Theme-calibrated surface classes matching Upahar Logo Leaf Green (Morning 6-10:30 AM) & Upahar Maroon (12-10:30 PM)
  const topStripBg = isMorningGreen
    ? "bg-[#071D06] text-[#F5EFE0] border-[#D4AF37]/20"
    : "bg-[#2B070E] text-[#F3DEAB] border-[#D4AF37]/20";

  const headerBg = isMorningGreen
    ? isScrolled
      ? "bg-[#092607]/95 backdrop-blur-md shadow-[0_8px_28px_-6px_rgba(7,29,6,0.58)] border-b border-[#D4AF37]/30"
      : "bg-[#0E2F0A] border-b border-[#D4AF37]/25"
    : isScrolled
    ? "bg-[#3E0B14]/95 backdrop-blur-md shadow-[0_8px_28px_-6px_rgba(43,7,14,0.55)] border-b border-[#D4AF37]/30"
    : "bg-[#4A0E17] border-b border-[#D4AF37]/20";

  const drawerAccentBg = isMorningGreen ? "bg-[#0E2F0A] text-[#FAF6EC]" : "bg-[#580D1A] text-[#FAF7F2]";
  const drawerIconColor = isMorningGreen ? "text-[#153B10]" : "text-[#580D1A]";

  return (
    <>
      {/* Top Heritage & Live Session Info Strip (Non-sticky so header pins smoothly at top=0 on scroll) */}
      <div className={`${topStripBg} text-[11px] sm:text-xs py-1.5 px-4 border-b hidden md:block transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center font-medium">
          <div className="flex items-center space-x-5">
            <span className="flex items-center space-x-2">
              <Clock className="w-3.5 h-3.5 text-[#DFC17B] flex-shrink-0" />
              <span>
                {storeStatus ? (
                  <>
                    <strong className={storeStatus.isOpen ? "text-[#DFC17B] font-bold" : "text-amber-200"}>
                      {storeStatus.statusText}
                    </strong>{" "}
                    <span className="opacity-85">• {storeStatus.subText}</span>
                  </>
                ) : (
                  "Morning 6:00 AM – 10:30 AM • Afternoon & Evening 12:00 PM – 10:30 PM"
                )}
              </span>
            </span>
            <a
              href="https://maps.app.goo.gl/6611R6FD1JZagSJt9"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xl:flex items-center space-x-1.5 text-white/80 hover:text-[#DFC17B] transition"
            >
              <MapPin className="w-3.5 h-3.5 text-[#DFC17B]" />
              <span>1-1, Sangivalasa, ANITS Road, Beside SBI</span>
            </a>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setQrModalOpen(true)}
              className="flex items-center space-x-1.5 text-[#DFC17B] hover:text-white transition font-semibold cursor-pointer"
              title="Scan QR Code to open website on mobile"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Scan QR</span>
            </button>
            <span className="text-[#D4AF37]/40">|</span>
            <a
              href="https://wa.me/919885455342?text=Namaste!%20I%20am%20visiting%20your%20website%20and%20would%20like%20further%20details%20about%20Upahar%20Tiffins."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 text-emerald-300 hover:text-white transition font-semibold"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-300" />
              <span>WhatsApp</span>
            </a>
            <span className="text-[#D4AF37]/40">|</span>
            <a
              href="tel:+919885455342"
              className="flex items-center space-x-1.5 text-[#FAF7F2] hover:text-[#DFC17B] transition font-semibold"
            >
              <Phone className="w-3.5 h-3.5 text-[#DFC17B]" />
              <span>+91 9885455342</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Sticky Header — Fixed height prevents scroll bounce or header jump */}
      <header
        className={`sticky top-0 z-40 w-full h-16 sm:h-[72px] transition-colors duration-300 ${headerBg}`}
      >
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
          {/* Official Upahar Emblem Logo + Title (Consistent across BOTH themes) */}
          <Link href={withThemeParam("/")} className="flex items-center space-x-2.5 sm:space-x-3 group min-w-0 flex-shrink-0">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-[#D4AF37] shadow-md group-hover:scale-105 transition duration-300 flex-shrink-0 bg-[#580D1A]">
              <img
                src="/images/upahar_logo.jpg"
                alt="UPAHAR Official Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden sm:block h-7 w-px bg-white/20 flex-shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-lg sm:text-xl font-black tracking-tight text-[#FAF7F2] font-display flex items-center gap-1.5 truncate leading-none">
                UPAHAR
                <span className="w-1.5 h-1.5 rounded-full bg-[#DFC17B] flex-shrink-0" />
              </span>
              <span className="text-[8px] sm:text-[9px] tracking-[0.2em] uppercase font-bold text-[#DFC17B] mt-1 truncate leading-none">
                {isMorningGreen ? "Tiffins & Breakfast" : "Biryanis & Fast Food"}
              </span>
            </div>
          </Link>

          {/* Clean Single-Row Desktop Navigation (Matches Reference Bar Proportions) */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2 font-medium text-sm">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/" ? pathname === "/" : pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.name}
                  href={withThemeParam(link.href)}
                  className={`relative px-3.5 py-2 text-sm whitespace-nowrap transition-colors duration-200 ${
                    isActive
                      ? "text-[#DFC17B] font-bold"
                      : "text-[#FAF7F2]/90 hover:text-[#DFC17B]"
                  }`}
                >
                  <span>{link.name}</span>
                  {isActive && (
                    <span className="absolute left-3.5 right-3.5 bottom-0.5 h-[2px] rounded-full bg-[#DFC17B]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Compact Desktop Right Action Group */}
          <div className="hidden lg:flex items-center space-x-2 flex-shrink-0">
            {customer ? (
              <div className="flex items-center space-x-1.5 bg-white/10 border border-[#D4AF37]/40 rounded-full px-3 py-1.5 text-xs text-white">
                <User className="w-3.5 h-3.5 text-[#DFC17B]" />
                <span className="font-bold truncate max-w-[85px]">
                  {customer.name.split(" ")[0]}
                </span>
                <button
                  onClick={logout}
                  className="text-white/70 hover:text-amber-300 transition pl-1 cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-3.5 py-2 rounded-full text-xs font-bold border border-white/25 bg-white/10 hover:bg-white/20 text-white flex items-center space-x-1.5 transition whitespace-nowrap cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-[#DFC17B]" />
                <span>Sign In</span>
              </button>
            )}

            <Link
              href={withThemeParam("/orders")}
              className="px-3.5 py-2 rounded-full text-xs font-bold border border-white/25 bg-white/10 hover:bg-white/20 text-white flex items-center space-x-1.5 transition whitespace-nowrap"
              title="Track Active & Past Orders"
            >
              <Clock className="w-3.5 h-3.5 text-[#DFC17B]" />
              <span>My Orders</span>
            </Link>

            <button
              onClick={() => toggleCart()}
              className="relative px-3.5 py-2 rounded-full text-xs font-bold bg-[#FAF6EE] hover:bg-white text-[#141210] border border-[#DFC17B] flex items-center space-x-1.5 shadow-sm transition hover:scale-[1.03] whitespace-nowrap cursor-pointer"
              title="View Cart"
            >
              <ShoppingBag className={`w-3.5 h-3.5 ${drawerIconColor}`} />
              <span>Bag</span>
              {totalCount > 0 && (
                <span className={`${drawerAccentBg} text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center`}>
                  {totalCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setQrModalOpen(true)}
              className="p-2 rounded-full border border-[#D4AF37]/45 bg-white/10 hover:bg-white/20 text-[#DFC17B] transition cursor-pointer"
              title="Scan QR Code to open on Mobile"
              aria-label="Scan QR Code"
            >
              <QrCode className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Header Actions */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 lg:hidden flex-shrink-0">
            <button
              onClick={() => (customer ? setMobileMenuOpen(true) : setIsAuthModalOpen(true))}
              className="p-2 rounded-full bg-white/10 text-white border border-white/20"
              aria-label={customer ? "Customer Profile" : "Sign In"}
            >
              <User className="w-4 h-4 text-[#DFC17B]" />
            </button>

            <button
              onClick={() => toggleCart()}
              className="relative p-2 rounded-full bg-[#FAF6EE] text-[#141210] border border-[#D4AF37]"
              aria-label="View Cart"
            >
              <ShoppingBag className={`w-4 h-4 ${drawerIconColor}`} />
              {totalCount > 0 && (
                <span className={`absolute -top-1 -right-1 ${drawerAccentBg} text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center`}>
                  {totalCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setQrModalOpen(true)}
              className="p-2 rounded-full bg-white/10 text-[#DFC17B] border border-[#D4AF37]/40"
              aria-label="Scan QR Code"
            >
              <QrCode className="w-4 h-4" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full bg-white/10 text-white border border-white/25"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#FAF7F2] border-b border-[#EADBCE] shadow-2xl px-5 py-6 space-y-4 animate-in slide-in-from-top-2 duration-200 max-h-[calc(100vh-4rem)] overflow-y-auto">
            {/* Store hours pill on mobile */}
            <div className="p-3 rounded-xl bg-[#F4EFE6] border border-[#D4AF37]/30 flex items-center space-x-2.5 text-xs text-[#2B070E]">
              <Clock className={`w-4 h-4 ${drawerIconColor} flex-shrink-0`} />
              <div>
                <span className="font-bold block">
                  {storeStatus ? storeStatus.statusText : "Open Daily: 6:00 AM – 10:30 AM | 12:00 PM – 10:30 PM"}
                </span>
                <span className="text-[11px] text-stone-600 block">
                  {storeStatus?.subText || "Morning Tiffins (6:00–10:30 AM) • Fast Food & Tiffins (12:00–10:30 PM)"}
                </span>
              </div>
            </div>

            {/* Mobile Customer Account & My Orders Quick Bar */}
            <div className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-white border border-[#EADBCE]">
              {customer ? (
                <div className="flex items-center space-x-2 min-w-0">
                  <User className={`w-4 h-4 ${drawerIconColor} flex-shrink-0`} />
                  <div className="min-w-0">
                    <span className="text-xs font-black text-[#141210] block truncate">
                      {customer.name}
                    </span>
                    <span className="text-[10px] text-stone-500 block">{customer.phone}</span>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsAuthModalOpen(true);
                  }}
                  className={`text-xs font-black ${drawerIconColor} flex items-center space-x-1.5`}
                >
                  <User className="w-4 h-4" />
                  <span>Sign In / Mobile OTP</span>
                </button>
              )}

              <div className="flex items-center space-x-2 flex-shrink-0">
                <Link
                  href={withThemeParam("/orders")}
                  className={`px-3 py-1.5 rounded-xl ${drawerAccentBg} text-xs font-bold`}
                >
                  My Orders
                </Link>
                {customer && (
                  <button
                    onClick={logout}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-red-600"
                    aria-label="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Nav Links */}
            <nav className="flex flex-col space-y-1">
              {mobileLinks.map((link) => {
                const isActive =
                  link.href === "/" ? pathname === "/" : pathname?.startsWith(link.href);
                return (
                  <Link
                    key={link.name}
                    href={withThemeParam(link.href)}
                    className={`px-3.5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-between ${
                      isActive ? drawerAccentBg : "text-[#141210] hover:bg-[#F4EFE6]"
                    }`}
                  >
                    <span>{link.name}</span>
                    <ArrowRight className="w-4 h-4 opacity-70" />
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Action CTAs */}
            <div className="pt-3 border-t border-[#EADBCE] flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setQrModalOpen(true);
                }}
                className={`w-full py-2.5 rounded-xl text-xs font-bold text-center flex items-center justify-center space-x-2 ${drawerAccentBg} border border-[#D4AF37]/40 shadow-sm transition`}
              >
                <QrCode className="w-4 h-4 text-[#DFC17B]" />
                <span>Scan QR Code (Mobile Menu)</span>
              </button>

              <a
                href="https://wa.me/919885455342?text=Namaste!%20I%20am%20visiting%20your%20website%20and%20would%20like%20further%20details%20about%20Upahar%20Tiffins."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl text-xs font-bold text-center flex items-center justify-center space-x-2 bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm"
              >
                <MessageSquare className="w-4 h-4 text-white" />
                <span>WhatsApp Owner (9885455342)</span>
              </a>

              <a
                href="https://maps.app.goo.gl/6611R6FD1JZagSJt9"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold-outline w-full py-2.5 rounded-xl text-xs font-bold text-center flex items-center justify-center space-x-2"
              >
                <MapPin className={`w-4 h-4 ${drawerIconColor}`} />
                <span>Directions to Sangivalasa</span>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Interactive QR Scan Modal */}
      <QRModal isOpen={qrModalOpen} onClose={() => setQrModalOpen(false)} />
    </>
  );
}
