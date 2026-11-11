"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import type { DivisionKey } from "@/lib/store-hours";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { useRealtimeEvents } from "@/hooks/useRealtimeEvents";

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
    badge: string;
    button: string;
    ring: string;
    themeLabel: string;
  }
> = {
  tiffins: {
    border: "border-[#153B10]/20 hover:border-[#153B10]",
    topStrip: "bg-[#153B10]",
    badge: "bg-[#EBF3E8] text-[#153B10] border-[#153B10]/25",
    button: "bg-[#153B10] hover:bg-[#0E2F0A] text-white",
    ring: "border-[#153B10]/30",
    themeLabel: "Green Kitchen",
  },
  biryanis: {
    border: "border-[#580D1A]/20 hover:border-[#580D1A]",
    topStrip: "bg-[#580D1A]",
    badge: "bg-[#FAF0F1] text-[#580D1A] border-[#580D1A]/25",
    button: "bg-[#580D1A] hover:bg-[#380A11] text-white",
    ring: "border-[#580D1A]/30",
    themeLabel: "Maroon Kitchen",
  },
  "fast-food": {
    border: "border-[#EAB308]/45 hover:border-[#CA8A04]",
    topStrip: "bg-gradient-to-r from-[#FACC15] via-[#F59E0B] to-[#EAB308]",
    badge: "bg-[#FEF9C3] text-[#713F12] border-[#EAB308]/50",
    button: "bg-gradient-to-r from-[#FACC15] to-[#EAB308] hover:from-[#FDE047] hover:to-[#FACC15] text-[#2B1400]",
    ring: "border-[#EAB308]/60",
    themeLabel: "Golden Yellow",
  },
  pickles: {
    border: "border-[#E10000]/25 hover:border-[#E10000]",
    topStrip: "bg-[#E10000]",
    badge: "bg-[#FFE5E5] text-[#B30000] border-[#FF0000]/30",
    button: "bg-[#DB0000] hover:bg-[#FF0000] text-white",
    ring: "border-[#E10000]/35",
    themeLabel: "Andhra Red • 24×7",
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
    <main className="min-h-screen overflow-x-clip bg-gradient-to-b from-white via-[#FAF8F4] to-white text-[#1C1917] pb-14">
      {/* ================================================================= */}
      {/* 1. COMPACT LIGHT MAIN HUB HERO WITH OFFICIAL UPAHAR LOGO          */}
      {/* ================================================================= */}
      <section className="pt-2 pb-2 sm:pt-5 sm:pb-4 px-3 sm:px-6 lg:px-8 border-b border-[#E7E0D3]/70 bg-white">
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
          {/* Clean Official Centered UPAHAR Logo */}
          <div className="relative w-12 h-12 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 sm:border-4 border-[#D4AF37] shadow-lg bg-[#580D1A] ring-4 sm:ring-8 ring-[#D4AF37]/12">
            <Image
              src="/images/upahar_logo.jpg"
              alt="UPAHAR Official Logo"
              fill
              priority
              sizes="(max-width: 640px) 56px, 108px"
              className="object-cover"
            />
          </div>

          <h1 className="text-lg sm:text-3xl font-black font-display tracking-tight text-[#1C1917] mt-1 sm:mt-2.5 leading-tight">
            UPAHAR
          </h1>
          <p className="text-[11px] sm:text-base font-script font-bold text-[#9A6E24] leading-tight">
            Good Food • Good Mood
          </p>

          {emergencyStopped && (
            <div className="mt-2 sm:mt-3 w-full max-w-2xl p-2.5 sm:p-4 rounded-xl bg-red-50 border border-red-300 text-red-800 text-[11px] sm:text-xs font-bold">
              🚨 {emergencyMsg || "Online ordering is temporarily paused by restaurant administration."}
            </div>
          )}
        </div>
      </section>

      {/* ================================================================= */}
      {/* 2. 4 RECTANGULAR SUB-WEBSITE OPTIONS (ALL 4 FIT IN ONE PHONE VIEW) */}
      {/* ================================================================= */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2.5 sm:pt-6">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-5">
          {subsites.map((site) => {
            const accent = CARD_ACCENTS[site.key];
            const isOpen = site.status.isOpen && !emergencyStopped;

            return (
              <Link
                key={site.key}
                href={site.route}
                className={`group bg-white rounded-xl border-2 ${accent.border} shadow-xs hover:shadow-xl transition-all duration-300 sm:hover:-translate-y-1 overflow-hidden flex flex-row sm:flex-col items-stretch h-[70px] sm:h-auto`}
              >
                {/* Theme Accent Strip (Left bar on mobile rectangle, Top bar on desktop rectangle) */}
                <div className={`w-1.5 sm:hidden flex-shrink-0 ${accent.topStrip}`} />
                <div className={`hidden sm:block h-1.5 w-full flex-shrink-0 ${accent.topStrip}`} />

                {/* Rectangular Photo Thumbnail */}
                <div className="relative w-20 sm:w-full h-full sm:h-28 lg:h-32 flex-shrink-0 bg-stone-100 overflow-hidden">
                  <Image
                    src={site.heroImage}
                    alt={site.title}
                    fill
                    sizes="(max-width: 640px) 84px, 320px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Desktop Overlays on Photo */}
                  <div className="hidden sm:flex absolute top-2.5 left-2.5 right-2.5 items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-black/65 backdrop-blur-xs text-[10px] font-black text-white font-mono">
                      {site.number}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black border shadow-xs ${
                        isOpen
                          ? accent.badge
                          : "bg-stone-100 text-stone-700 border-stone-200"
                      }`}
                    >
                      {isOpen ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      ) : (
                        <Lock className="w-2.5 h-2.5 text-stone-500" />
                      )}
                      <span>{emergencyStopped ? "PAUSED" : site.status.statusLabel}</span>
                    </span>
                  </div>
                </div>

                {/* Card Details & Rectangular Enter CTA */}
                <div className="flex-1 min-w-0 px-2.5 py-1.5 sm:p-4 flex flex-row sm:flex-col items-center sm:items-stretch justify-between gap-2">
                  <div className="min-w-0 flex-1 text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="sm:hidden text-[10px] font-black text-stone-400 font-mono flex-shrink-0">
                        {site.number}
                      </span>
                      <h3 className="text-[13px] sm:text-base font-black font-display text-[#1C1917] tracking-tight truncate">
                        {site.title}
                      </h3>
                    </div>

                    {/* Desktop Tagline */}
                    <span className="hidden sm:block text-[11px] font-bold text-[#9A6E24] mt-0.5 truncate">
                      {site.tagline}
                    </span>

                    {/* Timing Row */}
                    <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-[#44403C] mt-0.5 sm:mt-2 sm:px-2.5 sm:py-1 sm:rounded-lg sm:bg-[#FAF8F4] sm:border sm:border-[#E7E0D3] min-w-0">
                      <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#9A6E24] flex-shrink-0" />
                      <span className="truncate">{site.timingText}</span>
                    </div>

                    {/* Mobile Compact Live Status + Items Count */}
                    <div className="sm:hidden flex items-center gap-1.5 mt-1">
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black border leading-none ${
                          isOpen
                            ? accent.badge
                            : "bg-stone-100 text-stone-700 border-stone-200"
                        }`}
                      >
                        {isOpen ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        ) : (
                          <Lock className="w-2 h-2 text-stone-500" />
                        )}
                        <span>{emergencyStopped ? "PAUSED" : site.status.statusLabel}</span>
                      </span>
                      <span className="text-[10px] font-semibold text-stone-500 truncate">
                        {site.itemCount} items
                      </span>
                    </div>

                    {/* Desktop Short Description */}
                    <p className="hidden sm:line-clamp-2 mt-2 text-xs text-[#57534E] leading-relaxed">
                      {site.description}
                    </p>
                  </div>

                  {/* Rectangular Enter CTA Button */}
                  <div
                    className={`flex-shrink-0 sm:w-full px-2.5 py-2 sm:py-2.5 sm:px-3.5 sm:mt-3 rounded-lg text-[11px] sm:text-xs font-black flex items-center justify-center sm:justify-between gap-1 shadow-xs transition ${accent.button}`}
                  >
                    <span className="sm:hidden">Enter</span>
                    <span className="hidden sm:inline truncate">
                      Enter {site.shortTitle} ({site.itemCount})
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ================================================================= */}
      {/* 3. CUSTOMER ACCOUNT CREATION HUB ON MAIN WEBSITE                  */}
      {/* ================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="bg-white rounded-3xl border border-[#E7E0D3] shadow-sm p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF8F4] border border-[#D4AF37]/40 flex items-center justify-center text-[#580D1A] flex-shrink-0">
              {customer ? <CheckCircle2 className="w-6 h-6 text-emerald-600" /> : <UserPlus className="w-6 h-6" />}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#9A6E24]">
                  Main Website Customer Account
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" />
                  Optional for Sub-Websites
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black font-display text-[#1C1917]">
                {customer
                  ? `Welcome back, ${customer.name}!`
                  : "Create or Sign In to Your Upahar Customer Account"}
              </h3>
              <p className="text-xs sm:text-sm text-[#57534E] max-w-2xl">
                {customer
                  ? `Signed in with ${customer.phone}${
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
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#580D1A] hover:bg-[#380A11] text-white text-xs font-bold inline-flex items-center justify-center space-x-2 shadow-sm transition"
                >
                  <ShoppingBag className="w-4 h-4 text-[#DFC17B]" />
                  <span>My Orders &amp; Tracker</span>
                </Link>
                <Link
                  href="/menu"
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#FAF8F4] hover:bg-[#F2EDE2] border border-[#E7E0D3] text-[#1C1917] text-xs font-bold inline-flex items-center justify-center transition"
                >
                  Browse All Menu
                </Link>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#580D1A] hover:bg-[#380A11] text-white text-xs font-black inline-flex items-center justify-center space-x-2 shadow-md transition cursor-pointer"
                >
                  <User className="w-4 h-4 text-[#DFC17B]" />
                  <span>Create Account / Sign In</span>
                </button>
                <Link
                  href="/orders"
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#FAF8F4] hover:bg-[#F2EDE2] border border-[#E7E0D3] text-[#1C1917] text-xs font-bold inline-flex items-center justify-center transition"
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
