"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  User,
  UserPlus,
  CheckCircle2,
  ShieldCheck,
  Lock,
  ShoppingBag,
  Sun,
  Moon,
} from "lucide-react";
import {
  readStoredHubTheme,
  setHubThemePreference,
  type DivisionKey,
  type HubThemePreference,
} from "@/lib/store-hours";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { useRealtimeEvents } from "@/hooks/useRealtimeEvents";
import DeliveryRiderBanner from "@/components/home/DeliveryRiderBanner";

export interface HubSubsiteCard {
  key: DivisionKey;
  route: string;
  number: string;
  title: string;
  shortTitle: string;
  tagline: string;
  timingText: string;
  description: string;
  heroImage: string;
  itemCount: number;
  status: {
    isOpen: boolean;
    isLocked: boolean;
    statusLabel: string;
    timingText: string;
  };
}

interface HomeLandingClientProps {
  subsites: HubSubsiteCard[];
  isEmergencyWebsiteStopped?: boolean;
  emergencyStopMessage?: string | null;
}

const CARD_ACCENTS: Record<
  DivisionKey,
  {
    border: string;
    topStrip: string;
    scrim: string;
    eyebrow: string;
    badge: string;
    closedBadge: string;
    button: string;
  }
> = {
  tiffins: {
    border: "border-[#2D5A27]/55 hover:border-[#4ADE80] hover:shadow-[0_18px_38px_-10px_rgba(21,59,16,0.5)]",
    topStrip: "bg-gradient-to-r from-[#22C55E] via-[#15803D] to-[#D4AF37]",
    scrim: "bg-gradient-to-r from-[#051404]/95 via-[#0B2608]/75 to-black/25 sm:bg-gradient-to-t sm:from-[#051404] sm:via-[#0B2608]/80 sm:to-black/20",
    eyebrow: "text-[#BBF7D0]",
    badge: "bg-emerald-500/90 text-white border-emerald-300/60",
    closedBadge: "bg-black/60 text-stone-200 border-white/25",
    button: "bg-[#16A34A] group-hover:bg-[#22C55E] text-white",
  },
  biryanis: {
    border: "border-[#8B1E26]/65 hover:border-[#DFC17B] hover:shadow-[0_18px_38px_-10px_rgba(88,13,26,0.55)]",
    topStrip: "bg-gradient-to-r from-[#DFC17B] via-[#8B1E26] to-[#DFC17B]",
    scrim: "bg-gradient-to-r from-[#1A0307]/95 via-[#4A0E17]/75 to-black/25 sm:bg-gradient-to-t sm:from-[#1A0307] sm:via-[#4A0E17]/80 sm:to-black/20",
    eyebrow: "text-[#F3DEAB]",
    badge: "bg-[#8B1E26]/95 text-[#F3DEAB] border-[#DFC17B]/60",
    closedBadge: "bg-black/60 text-stone-200 border-white/25",
    button: "bg-gradient-to-r from-[#DFC17B] to-[#C5A059] group-hover:from-[#F3DEAB] group-hover:to-[#DFC17B] text-[#2B070E]",
  },
  "fast-food": {
    border: "border-[#EAB308]/75 hover:border-[#FDE047] hover:shadow-[0_18px_38px_-10px_rgba(234,179,8,0.5)]",
    topStrip: "bg-gradient-to-r from-[#FDE047] via-[#F59E0B] to-[#EAB308]",
    scrim: "bg-gradient-to-r from-[#261200]/95 via-[#5C2D00]/75 to-black/25 sm:bg-gradient-to-t sm:from-[#261200] sm:via-[#5C2D00]/75 sm:to-black/20",
    eyebrow: "text-[#FEF08A]",
    badge: "bg-[#FACC15] text-[#2B1400] border-[#FEF08A]",
    closedBadge: "bg-black/60 text-stone-200 border-white/25",
    button: "bg-gradient-to-r from-[#FACC15] to-[#F59E0B] group-hover:from-[#FEF08A] group-hover:to-[#FACC15] text-[#2B1400]",
  },
  pickles: {
    border: "border-[#EF4444]/65 hover:border-[#FF5555] hover:shadow-[0_18px_38px_-10px_rgba(220,38,38,0.55)]",
    topStrip: "bg-gradient-to-r from-[#FF4444] via-[#DC2626] to-[#FCA5A5]",
    scrim: "bg-gradient-to-r from-[#380000]/95 via-[#7F0000]/75 to-black/25 sm:bg-gradient-to-t sm:from-[#380000] sm:via-[#7F0000]/78 sm:to-black/20",
    eyebrow: "text-[#FECACA]",
    badge: "bg-[#EF4444] text-white border-[#FCA5A5]/70",
    closedBadge: "bg-black/60 text-stone-200 border-white/25",
    button: "bg-[#EF4444] group-hover:bg-[#FF3333] text-white",
  },
};

export default function HomeLandingClient({
  subsites: initialSubsites,
  isEmergencyWebsiteStopped: initialEmergencyStop = false,
  emergencyStopMessage: initialEmergencyMsg = null,
}: HomeLandingClientProps) {
  const { customer, setIsAuthModalOpen } = useCustomerAuth();
  const [liveSubsites, setLiveSubsites] = useState<HubSubsiteCard[] | null>(null);
  const [emergencyStopped, setEmergencyStopped] = useState(initialEmergencyStop);
  const [emergencyMsg, setEmergencyMsg] = useState(initialEmergencyMsg);
  const [hubTheme, setHubTheme] = useState<HubThemePreference>("light");

  useEffect(() => {
    const syncHubTheme = () => {
      const attr = document.documentElement.getAttribute("data-upahar-theme");
      if (attr === "dark-hub") {
        setHubTheme("dark");
      } else if (attr === "light-hub") {
        setHubTheme("light");
      } else {
        setHubTheme(readStoredHubTheme());
      }
    };

    syncHubTheme();
    window.addEventListener("upahar-theme-change", syncHubTheme);
    return () => window.removeEventListener("upahar-theme-change", syncHubTheme);
  }, []);

  const isDarkHub = hubTheme === "dark";
  const subsites = liveSubsites ?? initialSubsites;

  useRealtimeEvents({
    onSubsiteUpdated: () => {
      fetch("/api/websites")
        .then((r) => r.json())
        .then((d) => {
          if (Array.isArray(d?.subsites)) setLiveSubsites(d.subsites);
        })
        .catch(() => {});
    },
    onEmergencyStopChanged: (payload) => {
      setEmergencyStopped(Boolean(payload.isEmergencyWebsiteStopped));
      setEmergencyMsg(payload.emergencyStopMessage || null);
    },
  });

  return (
    <main className="min-h-[calc(100dvh-3.5rem)] overflow-x-clip bg-gradient-to-b from-[var(--hub-page-from)] via-[var(--hub-page-via)] to-[var(--hub-page-to)] text-[var(--hub-heading)] pb-3 sm:pb-14 transition-colors duration-300">
      {/* ================================================================= */}
      {/* 1. LIGHT / DARK MAIN HUB HERO WITH FOOD BANNER & OFFICIAL LOGO    */}
      {/* ================================================================= */}
      <section className="relative overflow-hidden pt-2 pb-2 sm:pt-5 sm:pb-4 px-3 sm:px-6 lg:px-8 border-b border-[var(--hub-hero-border)] bg-[var(--hub-hero-bg)] transition-colors duration-300">
        {/* Panoramic Culinary Banner Behind Official Logo */}
        <Image
          src="/images/upahar-food-banner.jpg"
          alt="UPAHAR culinary spread featuring golden masala dosa, steamed idlis, dum biryani, wok noodles, and Andhra pickles"
          fill
          priority
          sizes="100vw"
          className={`object-cover object-center pointer-events-none select-none transition-all duration-500 ${
            isDarkHub ? "opacity-85 scale-[1.01]" : "opacity-90 scale-[1.01]"
          }`}
        />

        {/* Theme-Adaptive Scrim for Rich Food Sides + Crisp Center Logo Contrast */}
        <div
          className={`pointer-events-none absolute inset-0 transition-all duration-300 ${
            isDarkHub
              ? "bg-[radial-gradient(ellipse_at_center,rgba(12,10,9,0.58)_0%,rgba(12,10,9,0.34)_55%,rgba(12,10,9,0.78)_100%)]"
              : "bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.88)_0%,rgba(250,247,242,0.58)_44%,rgba(255,255,255,0.28)_100%)]"
          }`}
        />
        <div
          className={`pointer-events-none absolute inset-x-0 bottom-0 h-6 sm:h-10 transition-colors duration-300 ${
            isDarkHub
              ? "bg-gradient-to-t from-[#0C0A09]/85 to-transparent"
              : "bg-gradient-to-t from-[#FAF8F4]/85 to-transparent"
          }`}
        />
        {isDarkHub && (
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.16),transparent_65%)]" />
        )}

        <div className="max-w-5xl mx-auto relative z-10 flex flex-col items-center text-center">
          {/* Light / Dark Home Theme Toggle Pill */}
          <div
            role="group"
            aria-label="Main home page theme"
            className="absolute top-0 right-0 z-20 inline-flex items-center p-0.5 sm:p-1 rounded-full border border-[var(--hub-card-border)] bg-[var(--hub-card-sub-bg)]/90 backdrop-blur-md shadow-sm transition-colors duration-300"
          >
            <button
              type="button"
              onClick={() => setHubThemePreference("light")}
              aria-pressed={!isDarkHub}
              title="Light Theme"
              className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                !isDarkHub
                  ? "bg-white text-[#580D1A] shadow-xs"
                  : "text-[#C7BEB5] hover:text-white"
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Light</span>
            </button>
            <button
              type="button"
              onClick={() => setHubThemePreference("dark")}
              aria-pressed={isDarkHub}
              title="Dark Theme"
              className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                isDarkHub
                  ? "bg-[#580D1A] text-[#F3DEAB] shadow-xs border border-[#DFC17B]/40"
                  : "text-[#57534E] hover:text-[#1C1917]"
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dark</span>
            </button>
          </div>

          {/* Big Prominent Official Centered UPAHAR Logo */}
          <div
            className={`relative w-20 h-20 min-[375px]:w-[88px] min-[375px]:h-[88px] sm:w-28 sm:h-28 rounded-full overflow-hidden border-[3px] sm:border-4 bg-[#580D1A] ring-4 sm:ring-8 transition-all duration-300 ${
              isDarkHub
                ? "border-[#DFC17B] ring-[#D4AF37]/25 shadow-[0_0_32px_rgba(212,175,55,0.28)]"
                : "border-[#D4AF37] ring-[#D4AF37]/15 shadow-xl"
            }`}
          >
            <Image
              src="/images/upahar_logo.jpg"
              alt="UPAHAR Official Logo"
              fill
              priority
              sizes="(max-width: 640px) 96px, 128px"
              className="object-cover"
            />
          </div>

          <h1
            className={`text-lg min-[375px]:text-xl sm:text-3xl font-black font-display tracking-tight mt-1 sm:mt-2.5 leading-tight transition-colors duration-300 ${
              isDarkHub
                ? "text-[#FAF7F2] drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]"
                : "text-[#1C1917] drop-shadow-[0_1px_6px_rgba(255,255,255,0.9)]"
            }`}
          >
            UPAHAR
          </h1>
          <p
            className={`text-[11px] min-[375px]:text-xs sm:text-base font-script font-bold leading-tight transition-colors duration-300 ${
              isDarkHub
                ? "text-[#F3DEAB] drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)]"
                : "text-[#7A5312] drop-shadow-[0_1px_4px_rgba(255,255,255,0.95)]"
            }`}
          >
            Good Food • Good Mood
          </p>

          {emergencyStopped && (
            <div
              className={`mt-2 sm:mt-3 w-full max-w-2xl p-2.5 sm:p-4 rounded-xl border text-[11px] sm:text-xs font-bold ${
                isDarkHub
                  ? "bg-red-950/70 border-red-500/45 text-red-200"
                  : "bg-red-50 border-red-300 text-red-800"
              }`}
            >
              🚨 {emergencyMsg || "Online ordering is temporarily paused by restaurant administration."}
            </div>
          )}
        </div>
      </section>

      {/* ================================================================= */}
      {/* 2. 4 RECTANGLE BANNERS ON MOBILE / 2×2 & 4×1 CARDS ON DESKTOP     */}
      {/* ================================================================= */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2 sm:pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 min-[390px]:gap-2.5 sm:gap-4 lg:gap-5">
          {subsites.map((site) => {
            const accent = CARD_ACCENTS[site.key];
            const isOpen = site.status.isOpen && !emergencyStopped;
            const mobileStatusText = emergencyStopped
              ? "PAUSED"
              : isOpen
              ? site.key === "pickles"
                ? "24×7"
                : "OPEN"
              : "CLOSED";

            return (
              <Link
                key={site.key}
                href={site.route}
                prefetch={true}
                className={`group relative rounded-2xl border-2 ${accent.border} shadow-md transition-all duration-300 sm:hover:-translate-y-1.5 overflow-hidden flex flex-col justify-between h-[88px] min-[375px]:h-[96px] min-[400px]:h-[106px] sm:h-[250px] lg:h-[340px] bg-stone-900`}
              >
                {/* Full-Bleed Food Photography Background */}
                <Image
                  src={site.heroImage}
                  alt={site.title}
                  fill
                  priority={true}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                />

                {/* Theme-Colored Gradient Scrim for Rich Contrast */}
                <div className={`absolute inset-0 ${accent.scrim}`} />

                {/* Top Theme Accent Line */}
                <div className={`relative z-10 h-1 w-full flex-shrink-0 ${accent.topStrip}`} />

                {/* Mobile Horizontal Wide-Rectangle Content (< 640px) */}
                <div className="relative z-10 flex-1 px-3.5 py-2 flex items-center justify-between gap-2.5 sm:hidden min-w-0">
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-black/45 text-[9px] font-black text-white/90 font-mono border border-white/15 flex-shrink-0">
                        {site.number}
                      </span>
                      <span className={`text-[9px] font-sans font-extrabold uppercase tracking-[0.18em] truncate ${accent.eyebrow}`}>
                        UPAHAR
                      </span>
                    </div>

                    <h3 className="font-display font-black text-[18px] min-[390px]:text-[20px] tracking-tight leading-tight text-white drop-shadow-sm truncate">
                      {site.shortTitle}
                    </h3>

                    <div className="flex items-center gap-2 text-[10px] font-bold text-white/90 min-w-0">
                      <span className="inline-flex items-center gap-1 truncate">
                        <Clock className="w-2.5 h-2.5 flex-shrink-0 opacity-90" />
                        <span className="truncate">{site.timingText}</span>
                      </span>
                      <span className="text-white/60 flex-shrink-0">• {site.itemCount} items</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between self-stretch py-0.5 flex-shrink-0">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black border backdrop-blur-md shadow-sm ${
                        isOpen ? accent.badge : accent.closedBadge
                      }`}
                    >
                      {isOpen ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse flex-shrink-0" />
                      ) : (
                        <Lock className="w-2.5 h-2.5 flex-shrink-0" />
                      )}
                      <span>{mobileStatusText}</span>
                    </span>

                    <span
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-black inline-flex items-center gap-1 shadow-md transition ${accent.button}`}
                    >
                      <span>Enter</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>

                {/* Desktop & Tablet Vertical Card Top Status Strip (>= 640px) */}
                <div className="relative z-10 p-3.5 hidden sm:flex items-center justify-between gap-1">
                  <span className="px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-md text-[10px] font-black text-white/90 font-mono border border-white/15">
                    {site.number}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border backdrop-blur-md shadow-sm ${
                      isOpen ? accent.badge : accent.closedBadge
                    }`}
                  >
                    {isOpen ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse flex-shrink-0" />
                    ) : (
                      <Lock className="w-2.5 h-2.5 flex-shrink-0" />
                    )}
                    <span>{emergencyStopped ? "PAUSED" : site.status.statusLabel}</span>
                  </span>
                </div>

                {/* Desktop & Tablet Vertical Card Bottom Content (>= 640px) */}
                <div className="relative z-10 p-4 mt-auto hidden sm:flex flex-col gap-2">
                  <div>
                    <h3 className="font-display font-black tracking-tight leading-none text-white drop-shadow-sm">
                      <span className={`block text-[10px] font-sans font-extrabold uppercase tracking-[0.2em] mb-0.5 ${accent.eyebrow}`}>
                        UPAHAR{" "}
                      </span>
                      <span className="block text-xl lg:text-2xl truncate">
                        {site.shortTitle}
                      </span>
                    </h3>
                    <span className="block text-[11px] font-semibold text-white/80 mt-1 truncate">
                      {site.tagline}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-bold text-white/90 min-w-0">
                    <Clock className="w-3 h-3 flex-shrink-0 opacity-90" />
                    <span className="truncate">{site.timingText}</span>
                  </div>

                  <div className="pt-1.5 flex items-center justify-between gap-1.5 border-t border-white/15">
                    <span className="text-[11px] font-bold text-white/80 truncate">
                      {site.itemCount} items
                    </span>
                    <span
                      className={`px-3 py-1.5 rounded-lg text-xs font-black inline-flex items-center gap-1 shadow-md transition ${accent.button}`}
                    >
                      <span>Enter</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ================================================================= */}
      {/* 2B. ONLINE DELIVERY AVAILABLE ANIMATED RIDER RECTANGLE BANNER     */}
      {/* ================================================================= */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2 min-[390px]:pt-2.5 sm:pt-5">
        <DeliveryRiderBanner
          isDarkHub={isDarkHub}
          isEmergencyStopped={emergencyStopped}
        />
      </section>

      {/* ================================================================= */}
      {/* 3. CUSTOMER ACCOUNT CREATION HUB ON MAIN WEBSITE (Tablet/Desktop) */}
      {/* ================================================================= */}
      <section className="hidden sm:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="bg-[var(--hub-card-bg)] rounded-3xl border border-[var(--hub-card-border)] shadow-sm p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 transition-colors duration-300">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-2xl bg-[var(--hub-card-sub-bg)] border border-[#D4AF37]/40 flex items-center justify-center flex-shrink-0 ${
                isDarkHub ? "text-[#DFC17B]" : "text-[#580D1A]"
              }`}
            >
              {customer ? <CheckCircle2 className="w-6 h-6 text-emerald-600" /> : <UserPlus className="w-6 h-6" />}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-[var(--hub-tagline)]">
                  Main Website Customer Account
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isDarkHub
                      ? "text-emerald-300 bg-emerald-950/60 border-emerald-700/50"
                      : "text-emerald-700 bg-emerald-50 border-emerald-200"
                  }`}
                >
                  <ShieldCheck className="w-3 h-3" />
                  Optional for Sub-Websites
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black font-display text-[var(--hub-heading)]">
                {customer
                  ? `Welcome back, ${customer.name}!`
                  : "Create or Sign In to Your Upahar Customer Account"}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--hub-muted)] max-w-2xl">
                {customer
                  ? `Signed in with ${customer.phone || customer.email || "Upahar Account"}${
                      customer.addresses?.length
                        ? ` • ${customer.addresses.length} saved delivery address${customer.addresses.length > 1 ? "es" : ""}`
                        : ""
                    }. Your saved details auto-fill across all 4 sub-websites!`
                  : "Create your customer account right here on the main Upahar website to save ANITS hostel or home addresses and track all orders in one place. Or enter any sub-website directly without logging in!"}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
            {customer ? (
              <>
                <Link
                  href="/orders"
                  prefetch={true}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#580D1A] hover:bg-[#74171E] border border-[#D4AF37]/35 text-white text-xs font-bold inline-flex items-center justify-center space-x-2 shadow-sm transition"
                >
                  <ShoppingBag className="w-4 h-4 text-[#DFC17B]" />
                  <span>My Orders &amp; Tracker</span>
                </Link>
                <Link
                  href="/menu"
                  prefetch={true}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[var(--hub-card-sub-bg)] hover:bg-[var(--hub-card-sub-hover)] border border-[var(--hub-card-border)] text-[var(--hub-heading)] text-xs font-bold inline-flex items-center justify-center transition"
                >
                  Browse All Menu
                </Link>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#580D1A] hover:bg-[#74171E] border border-[#D4AF37]/35 text-white text-xs font-black inline-flex items-center justify-center space-x-2 shadow-md transition cursor-pointer"
                >
                  <User className="w-4 h-4 text-[#DFC17B]" />
                  <span>Create Account / Sign In</span>
                </button>
                <Link
                  href="/orders"
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[var(--hub-card-sub-bg)] hover:bg-[var(--hub-card-sub-hover)] border border-[var(--hub-card-border)] text-[var(--hub-heading)] text-xs font-bold inline-flex items-center justify-center transition"
                >
                  Track Guest Order
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
