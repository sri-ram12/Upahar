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
  Home,
} from "lucide-react";
import QRModal from "@/components/qr/QRModal";
import { useCart } from "@/context/CartContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import {
  getWebsiteTheme,
  type DivisionKey,
  type WebsiteThemeMode,
} from "@/lib/store-hours";

export default function Navbar() {
  const pathname = usePathname();
  const { totalCount, toggleCart } = useCart();
  const { customer, setIsAuthModalOpen, logout } = useCustomerAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [themeOverride, setThemeOverride] = useState<string | null>(null);
  const [subsiteStatuses, setSubsiteStatuses] = useState<
    Record<string, { statusLabel: string; timingText: string; isOpen: boolean }>
  >({});
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
          if (Array.isArray(data.subsites)) {
            const map: Record<string, { statusLabel: string; timingText: string; isOpen: boolean }> = {};
            for (const s of data.subsites) {
              if (s?.id && s?.status) {
                map[s.id] = s.status;
              }
            }
            setSubsiteStatuses(map);
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
    : getWebsiteTheme(storeStatus?.sessionType, themeOverride, pathname);

  const activeDivision: DivisionKey | null = pathname?.startsWith("/tiffins")
    ? "tiffins"
    : pathname?.startsWith("/biryanis")
    ? "biryanis"
    : pathname?.startsWith("/fast-food")
    ? "fast-food"
    : pathname?.startsWith("/pickles")
    ? "pickles"
    : null;

  const isSubWebsite = activeDivision !== null;
  const isLightHub = activeTheme === "light-hub";
  const isTiffinsGreen = activeTheme === "tiffins-green" || activeTheme === "morning-green";
  const isFastFoodGold = activeTheme === "fastfood-gold";
  const isPicklesRed = activeTheme === "pickles-red";

  const activeSubsiteStatus = activeDivision ? subsiteStatuses[activeDivision] : null;

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Tiffins", href: "/tiffins" },
    { name: "Biryanis", href: "/biryanis" },
    { name: "Fast Foods", href: "/fast-food" },
    { name: "Pickles", href: "/pickles" },
    { name: "Menu", href: "/menu" },
  ];

  const mobileLinks = [
    ...navLinks,
    { name: "About Us", href: "/about" },
    { name: "Gallery", href: "/gallery" },
    { name: "Scan Table QR", href: "/qr" },
    { name: "Contact", href: "/contact" },
  ];

  const subtitleLabel =
    activeDivision === "tiffins"
      ? "Upahar Tiffins"
      : activeDivision === "biryanis"
      ? "Upahar Biryanis"
      : activeDivision === "fast-food"
      ? "Upahar Fast Foods"
      : activeDivision === "pickles"
      ? "Upahar Pickles • 24×7"
      : "Tiffins • Biryanis • Fast Foods • Pickles";

  const topStripBg = isLightHub
    ? "bg-[#FAF8F4] text-[#44403C] border-[#E7E0D3]"
    : isTiffinsGreen
    ? "bg-[#071D06] text-[#F5EFE0] border-[#D4AF37]/20"
    : isFastFoodGold
    ? "bg-[#713F12] text-[#FEF9C3] border-[#FACC15]/30"
    : isPicklesRed
    ? "bg-[#6E0000] text-[#FFE5E5] border-white/15"
    : "bg-[#2B070E] text-[#F3DEAB] border-[#D4AF37]/20";

  const headerBg = isLightHub
    ? isScrolled
      ? "bg-white/95 backdrop-blur-md shadow-[0_8px_24px_-6px_rgba(20,18,16,0.08)] border-b border-[#E7E0D3]"
      : "bg-white border-b border-[#E7E0D3]"
    : isTiffinsGreen
    ? isScrolled
      ? "bg-[#092607]/95 backdrop-blur-md shadow-[0_8px_28px_-6px_rgba(7,29,6,0.58)] border-b border-[#D4AF37]/30"
      : "bg-[#0E2F0A] border-b border-[#D4AF37]/25"
    : isFastFoodGold
    ? isScrolled
      ? "bg-gradient-to-r from-[#FACC15]/95 via-[#F59E0B]/95 to-[#EAB308]/95 backdrop-blur-md shadow-[0_8px_24px_-6px_rgba(161,98,7,0.35)] border-b border-[#854D0E]/25"
      : "bg-gradient-to-r from-[#FACC15] via-[#F59E0B] to-[#EAB308] border-b border-[#854D0E]/20"
    : isPicklesRed
    ? isScrolled
      ? "bg-[#CC0000]/95 backdrop-blur-md shadow-[0_8px_28px_-6px_rgba(110,0,0,0.5)] border-b border-[#FFE5E5]/30"
      : "bg-[#DF0000] border-b border-white/25"
    : isScrolled
    ? "bg-[#3E0B14]/95 backdrop-blur-md shadow-[0_8px_28px_-6px_rgba(43,7,14,0.55)] border-b border-[#D4AF37]/30"
    : "bg-[#4A0E17] border-b border-[#D4AF37]/20";

  // High-contrast text styles depending on header surface
  const darkHeaderText = isLightHub || isFastFoodGold;
  const brandTitleClass = isLightHub
    ? "text-[#1C1917]"
    : isFastFoodGold
    ? "text-[#2B1400]"
    : "text-[#FAF7F2]";
  const brandSubClass = isLightHub
    ? "text-[#9A6E24]"
    : isFastFoodGold
    ? "text-[#5C2D00]"
    : isPicklesRed
    ? "text-[#FEF08A]"
    : "text-[#DFC17B]";
  const navInactiveClass = isLightHub
    ? "text-[#44403C] hover:text-[#580D1A]"
    : isFastFoodGold
    ? "text-[#3B1E00] hover:text-black"
    : "text-[#FAF7F2]/90 hover:text-[#DFC17B]";
  const navActiveClass = isLightHub
    ? "text-[#580D1A] font-extrabold"
    : isFastFoodGold
    ? "text-[#1C0E00] font-black"
    : isPicklesRed
    ? "text-[#FEF08A] font-extrabold"
    : "text-[#DFC17B] font-bold";
  const activeBarClass = isLightHub
    ? "bg-[#580D1A]"
    : isFastFoodGold
    ? "bg-[#2B1400]"
    : isPicklesRed
    ? "bg-[#FEF08A]"
    : "bg-[#DFC17B]";

  const drawerAccentBg = isTiffinsGreen
    ? "bg-[#0E2F0A] text-[#FAF6EC]"
    : isFastFoodGold
    ? "bg-[#D97706] text-white"
    : isPicklesRed
    ? "bg-[#DB0000] text-white"
    : "bg-[#580D1A] text-[#FAF7F2]";
  const drawerIconColor = isTiffinsGreen
    ? "text-[#153B10]"
    : isFastFoodGold
    ? "text-[#B45309]"
    : isPicklesRed
    ? "text-[#DB0000]"
    : "text-[#580D1A]";

  const pillActionClass = darkHeaderText
    ? "border-[#1C1917]/15 bg-[#1C1917]/5 hover:bg-[#1C1917]/10 text-[#1C1917]"
    : "border-white/25 bg-white/10 hover:bg-white/20 text-white";

  const bagBtnClass = isFastFoodGold
    ? "bg-[#2B1400] hover:bg-[#422006] text-[#FEF9C3] border-[#422006]"
    : isLightHub
    ? "bg-[#580D1A] hover:bg-[#74171E] text-[#FAF7F2] border-[#580D1A]"
    : "bg-[#FAF6EE] hover:bg-white text-[#141210] border-[#DFC17B]";

  return (
    <>
      {/* Top Heritage & Live Session Info Strip */}
      <div className={`${topStripBg} text-[11px] sm:text-xs py-1.5 px-4 border-b hidden md:block transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center font-medium">
          <div className="flex items-center space-x-5">
            <span className="flex items-center space-x-2">
              <Clock className={`w-3.5 h-3.5 flex-shrink-0 ${isLightHub ? "text-[#9A6E24]" : "text-[#DFC17B]"}`} />
              <span>
                {isSubWebsite && activeSubsiteStatus ? (
                  <>
                    <strong className={activeSubsiteStatus.isOpen ? "font-extrabold" : "text-amber-300 font-extrabold"}>
                      {subtitleLabel.toUpperCase()} • {activeSubsiteStatus.statusLabel}
                    </strong>{" "}
                    <span className="opacity-85">• Hours: {activeSubsiteStatus.timingText}</span>
                  </>
                ) : storeStatus ? (
                  <>
                    <strong className={isLightHub ? "text-[#580D1A] font-extrabold" : storeStatus.isOpen ? "text-[#DFC17B] font-bold" : "text-amber-200"}>
                      {storeStatus.statusText}
                    </strong>{" "}
                    <span className="opacity-85">• {storeStatus.subText}</span>
                  </>
                ) : (
                  "Tiffins 6–10:30 AM & 5–10:30 PM • Biryanis 12–10:30 PM • Fast Foods 5–10:30 PM • Pickles 24×7"
                )}
              </span>
            </span>
            <a
              href="https://maps.app.goo.gl/6611R6FD1JZagSJt9"
              target="_blank"
              rel="noopener noreferrer"
              className={`hidden xl:flex items-center space-x-1.5 transition ${
                isLightHub ? "text-[#57534E] hover:text-[#580D1A]" : "text-white/80 hover:text-[#DFC17B]"
              }`}
            >
              <MapPin className={`w-3.5 h-3.5 ${isLightHub ? "text-[#9A6E24]" : "text-[#DFC17B]"}`} />
              <span>1-1, Sangivalasa, ANITS Road, Beside SBI</span>
            </a>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setQrModalOpen(true)}
              className={`flex items-center space-x-1.5 transition font-semibold cursor-pointer ${
                isLightHub ? "text-[#580D1A] hover:text-black" : "text-[#DFC17B] hover:text-white"
              }`}
              title="Scan QR Code to open website on mobile"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Scan QR</span>
            </button>
            <span className="opacity-30">|</span>
            <a
              href="https://wa.me/919885455342?text=Namaste!%20I%20am%20visiting%20your%20website%20and%20would%20like%20further%20details%20about%20Upahar."
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center space-x-1.5 transition font-semibold ${
                isLightHub ? "text-emerald-700 hover:text-emerald-900" : "text-emerald-300 hover:text-white"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
            <span className="opacity-30">|</span>
            <a
              href="tel:+919885455342"
              className={`flex items-center space-x-1.5 transition font-semibold ${
                isLightHub ? "text-[#1C1917] hover:text-[#580D1A]" : "text-[#FAF7F2] hover:text-[#DFC17B]"
              }`}
            >
              <Phone className={`w-3.5 h-3.5 ${isLightHub ? "text-[#9A6E24]" : "text-[#DFC17B]"}`} />
              <span>+91 9885455342</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className={`sticky top-0 z-40 w-full h-16 sm:h-[72px] transition-colors duration-300 ${headerBg}`}>
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
          {/* Official Upahar Emblem Logo + Sub-Website Title */}
          <Link href="/" className="flex items-center space-x-2.5 sm:space-x-3 group min-w-0 flex-shrink-0">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-[#D4AF37] shadow-md group-hover:scale-105 transition duration-300 flex-shrink-0 bg-[#580D1A]">
              <img
                src="/images/upahar_logo.jpg"
                alt="UPAHAR Official Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className={`hidden sm:block h-7 w-px flex-shrink-0 ${darkHeaderText ? "bg-black/15" : "bg-white/20"}`} />
            <div className="flex flex-col min-w-0">
              <span className={`text-lg sm:text-xl font-black tracking-tight font-display flex items-center gap-1.5 truncate leading-none ${brandTitleClass}`}>
                UPAHAR
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isPicklesRed ? "bg-[#FEF08A]" : "bg-[#D4AF37]"}`} />
              </span>
              <span className={`text-[8px] sm:text-[9px] tracking-[0.18em] uppercase font-bold mt-1 truncate leading-none ${brandSubClass}`}>
                {subtitleLabel}
              </span>
            </div>
          </Link>

          {/* Single-Row Desktop Navigation across Main Hub + 4 Sub-Websites */}
          <nav className="hidden lg:flex items-center space-x-0.5 xl:space-x-1.5 font-medium text-sm">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/" ? pathname === "/" : pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative px-2 xl:px-3 py-2 text-xs xl:text-sm whitespace-nowrap transition-colors duration-200 ${
                    isActive ? navActiveClass : navInactiveClass
                  }`}
                >
                  <span>{link.name}</span>
                  {isActive && (
                    <span className={`absolute left-2 right-2 bottom-0.5 h-[2px] rounded-full ${activeBarClass}`} />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Compact Desktop Right Action Group */}
          <div className="hidden lg:flex items-center space-x-1.5 xl:space-x-2 flex-shrink-0">
            {/* Customer Account on Main Website (or quick switch when signed in; never required on sub-websites) */}
            {customer ? (
              <div className={`flex items-center space-x-1.5 border rounded-full px-2.5 xl:px-3 py-1.5 text-xs ${pillActionClass}`}>
                <User className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="font-bold truncate max-w-[75px]">
                  {customer.name.split(" ")[0]}
                </span>
                <button
                  onClick={logout}
                  className="opacity-70 hover:opacity-100 transition pl-1 cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : !isSubWebsite ? (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className={`px-2.5 xl:px-3.5 py-2 rounded-full text-xs font-bold border flex items-center space-x-1.5 transition whitespace-nowrap cursor-pointer ${pillActionClass}`}
              >
                <User className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="hidden xl:inline">Account / </span>
                <span>Sign In</span>
              </button>
            ) : (
              <Link
                href="/"
                className={`px-2.5 xl:px-3 py-2 rounded-full text-xs font-bold border flex items-center space-x-1.5 transition whitespace-nowrap ${pillActionClass}`}
                title="Return to Main Upahar Hub"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Hub</span>
              </Link>
            )}

            <Link
              href="/orders"
              className={`px-2.5 xl:px-3 py-2 rounded-full text-xs font-bold border flex items-center space-x-1.5 transition whitespace-nowrap ${pillActionClass}`}
              title="Track Active & Past Orders"
            >
              <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden xl:inline">My </span>
              <span>Orders</span>
            </Link>

            <button
              onClick={() => toggleCart()}
              className={`relative px-3.5 py-2 rounded-full text-xs font-bold border flex items-center space-x-1.5 shadow-sm transition hover:scale-[1.03] whitespace-nowrap cursor-pointer ${bagBtnClass}`}
              title="View Cart"
            >
              <ShoppingBag className={`w-3.5 h-3.5 ${isLightHub || isFastFoodGold ? "text-[#DFC17B]" : drawerIconColor}`} />
              <span>Bag</span>
              {totalCount > 0 && (
                <span className={`${isLightHub || isFastFoodGold ? "bg-[#DFC17B] text-[#141210]" : drawerAccentBg} text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center`}>
                  {totalCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setQrModalOpen(true)}
              className={`p-2 rounded-full border transition cursor-pointer ${pillActionClass}`}
              title="Scan QR Code to open on Mobile"
              aria-label="Scan QR Code"
            >
              <QrCode className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Header Actions */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 lg:hidden flex-shrink-0">
            {!isSubWebsite && (
              <button
                onClick={() => (customer ? setMobileMenuOpen(true) : setIsAuthModalOpen(true))}
                className={`p-2 rounded-full border ${pillActionClass}`}
                aria-label={customer ? "Customer Profile" : "Sign In"}
              >
                <User className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => toggleCart()}
              className={`relative p-2 rounded-full border ${bagBtnClass}`}
              aria-label="View Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {totalCount > 0 && (
                <span className={`absolute -top-1 -right-1 ${drawerAccentBg} text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white`}>
                  {totalCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setQrModalOpen(true)}
              className={`p-2 rounded-full border ${pillActionClass}`}
              aria-label="Scan QR Code"
            >
              <QrCode className="w-4 h-4" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-full border ${pillActionClass}`}
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-[#E7E0D3] shadow-2xl px-5 py-6 space-y-4 animate-in slide-in-from-top-2 duration-200 max-h-[calc(100vh-4rem)] overflow-y-auto">
            {/* Store hours pill on mobile */}
            <div className="p-3 rounded-xl bg-[#FAF8F4] border border-[#D4AF37]/30 flex items-center space-x-2.5 text-xs text-[#2B070E]">
              <Clock className={`w-4 h-4 ${drawerIconColor} flex-shrink-0`} />
              <div>
                <span className="font-bold block">
                  {isSubWebsite && activeSubsiteStatus
                    ? `${subtitleLabel} • ${activeSubsiteStatus.statusLabel}`
                    : storeStatus?.statusText || "Upahar Multi-Kitchen Portal"}
                </span>
                <span className="text-[11px] text-stone-600 block">
                  {isSubWebsite && activeSubsiteStatus
                    ? `Hours: ${activeSubsiteStatus.timingText}`
                    : "Tiffins 6–10:30 AM & 5–10:30 PM • Biryanis 12–10:30 PM • Fast Foods 5–10:30 PM • Pickles 24×7"}
                </span>
              </div>
            </div>

            {/* Mobile Customer Account & My Orders Quick Bar */}
            <div className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-[#FAF8F4] border border-[#E7E0D3]">
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
                  <span>Main Site Account / Sign In</span>
                </button>
              )}

              <div className="flex items-center space-x-2 flex-shrink-0">
                <Link
                  href="/orders"
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
                    href={link.href}
                    className={`px-3.5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-between ${
                      isActive ? drawerAccentBg : "text-[#141210] hover:bg-[#FAF8F4]"
                    }`}
                  >
                    <span>{link.name}</span>
                    <ArrowRight className="w-4 h-4 opacity-70" />
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Action CTAs */}
            <div className="pt-3 border-t border-[#E7E0D3] flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setQrModalOpen(true);
                }}
                className={`w-full py-2.5 rounded-xl text-xs font-bold text-center flex items-center justify-center space-x-2 ${drawerAccentBg} border border-[#D4AF37]/40 shadow-sm transition`}
              >
                <QrCode className="w-4 h-4" />
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
