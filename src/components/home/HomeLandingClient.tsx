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
    scrim: "bg-gradient-to-t from-[#051404] via-[#0B2608]/80 to-black/20",
    eyebrow: "text-[#BBF7D0]",
    badge: "bg-emerald-500/90 text-white border-emerald-300/60",
    closedBadge: "bg-black/60 text-stone-200 border-white/25",
    button: "bg-[#16A34A] group-hover:bg-[#22C55E] text-white",
  },
  biryanis: {
    border: "border-[#8B1E26]/65 hover:border-[#DFC17B] hover:shadow-[0_18px_38px_-10px_rgba(88,13,26,0.55)]",
    topStrip: "bg-gradient-to-r from-[#DFC17B] via-[#8B1E26] to-[#DFC17B]",
    scrim: "bg-gradient-to-t from-[#1A0307] via-[#4A0E17]/80 to-black/20",
    eyebrow: "text-[#F3DEAB]",
    badge: "bg-[#8B1E26]/95 text-[#F3DEAB] border-[#DFC17B]/60",
    closedBadge: "bg-black/60 text-stone-200 border-white/25",
    button: "bg-gradient-to-r from-[#DFC17B] to-[#C5A059] group-hover:from-[#F3DEAB] group-hover:to-[#DFC17B] text-[#2B070E]",
  },
  "fast-food": {
    border: "border-[#EAB308]/75 hover:border-[#FDE047] hover:shadow-[0_18px_38px_-10px_rgba(234,179,8,0.5)]",
    topStrip: "bg-gradient-to-r from-[#FDE047] via-[#F59E0B] to-[#EAB308]",
    scrim: "bg-gradient-to-t from-[#261200] via-[#5C2D00]/75 to-black/20",
    eyebrow: "text-[#FEF08A]",
    badge: "bg-[#FACC15] text-[#2B1400] border-[#FEF08A]",
    closedBadge: "bg-black/60 text-stone-200 border-white/25",
    button: "bg-gradient-to-r from-[#FACC15] to-[#F59E0B] group-hover:from-[#FEF08A] group-hover:to-[#FACC15] text-[#2B1400]",
  },
  pickles: {
    border: "border-[#EF4444]/65 hover:border-[#FF5555] hover:shadow-[0_18px_38px_-10px_rgba(220,38,38,0.55)]",
    topStrip: "bg-gradient-to-r from-[#FF4444] via-[#DC2626] to-[#FCA5A5]",
    scrim: "bg-gradient-to-t from-[#380000] via-[#7F0000]/78 to-black/20",
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
    <main className="min-h-screen overflow-x-clip bg-gradient-to-b from-white via-[#FAF8F4] to-white text-[#1C1917] pb-6 sm:pb-14">
      {/* ================================================================= */}
      {/* 1. LIGHT MAIN HUB HERO WITH BIG OFFICIAL UPAHAR LOGO              */}
      {/* ================================================================= */}
      <section className="pt-3 pb-2.5 sm:pt-5 sm:pb-4 px-3 sm:px-6 lg:px-8 border-b border-[#E7E0D3]/70 bg-white">
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
          {/* Big Prominent Official Centered UPAHAR Logo */}
          <div className="relative w-24 h-24 min-[375px]:w-28 min-[375px]:h-28 sm:w-28 sm:h-28 rounded-full overflow-hidden border-[3px] sm:border-4 border-[#D4AF37] shadow-xl bg-[#580D1A] ring-4 sm:ring-8 ring-[#D4AF37]/15">
            <Image
              src="/images/upahar_logo.jpg"
              alt="UPAHAR Official Logo"
              fill
              priority
              sizes="(max-width: 640px) 112px, 128px"
              className="object-cover"
            />
          </div>

          <h1 className="text-xl sm:text-3xl font-black font-display tracking-tight text-[#1C1917] mt-1.5 sm:mt-2.5 leading-tight">
            UPAHAR
          </h1>
          <p className="text-xs sm:text-base font-script font-bold text-[#9A6E24] leading-tight">
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
      {/* 2. 4 ATTRACTIVE FULL-BLEED PHOTO CARDS (ALL 4 FIT IN ONE SCREEN)  */}
      {/* ================================================================= */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2.5 sm:pt-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
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
                className={`group relative rounded-2xl border-2 ${accent.border} shadow-md transition-all duration-300 sm:hover:-translate-y-1.5 overflow-hidden flex flex-col justify-between h-[146px] min-[375px]:h-[164px] sm:h-[250px] lg:h-[340px] bg-stone-900`}
              >
                {/* Full-Bleed Food Photography Background */}
                <Image
                  src={site.heroImage}
                  alt={site.title}
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                />

                {/* Theme-Colored Gradient Scrim for Rich Contrast */}
                <div className={`absolute inset-0 ${accent.scrim}`} />

                {/* Top Theme Accent Line */}
                <div className={`relative z-10 h-1 w-full flex-shrink-0 ${accent.topStrip}`} />

                {/* Top Status Strip (Number + Live Status Pill) */}
                <div className="relative z-10 p-2 sm:p-3.5 flex items-center justify-between gap-1">
                  <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-md text-[9px] sm:text-[10px] font-black text-white/90 font-mono border border-white/15">
                    {site.number}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-black border backdrop-blur-md shadow-sm ${
                      isOpen ? accent.badge : accent.closedBadge
                    }`}
                  >
                    {isOpen ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse flex-shrink-0" />
                    ) : (
                      <Lock className="w-2.5 h-2.5 flex-shrink-0" />
                    )}
                    <span className="sm:hidden">{mobileStatusText}</span>
                    <span className="hidden sm:inline">
                      {emergencyStopped ? "PAUSED" : site.status.statusLabel}
                    </span>
                  </span>
                </div>

                {/* Bottom Glass-Tinted Kitchen Title, Timing & Enter CTA */}
                <div className="relative z-10 p-2.5 sm:p-4 mt-auto flex flex-col gap-1 sm:gap-2">
                  <div>
                    <h3 className="font-display font-black tracking-tight leading-none text-white drop-shadow-sm">
                      <span className={`block text-[8px] min-[375px]:text-[9px] sm:text-[10px] font-sans font-extrabold uppercase tracking-[0.2em] mb-0.5 ${accent.eyebrow}`}>
                        UPAHAR{" "}
                      </span>
                      <span className="block text-[15px] min-[375px]:text-[17px] sm:text-xl lg:text-2xl truncate">
                        {site.shortTitle}
                      </span>
                    </h3>
                    <span className="hidden sm:block text-[11px] font-semibold text-white/80 mt-1 truncate">
                      {site.tagline}
                    </span>
                  </div>

                  {/* Concise Schedule Line */}
                  <div className="flex items-center gap-1 text-[9.5px] min-[375px]:text-[10px] sm:text-[11px] font-bold text-white/90 min-w-0">
                    <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0 opacity-90" />
                    <span className="truncate">{site.timingText}</span>
                  </div>

                  {/* Bottom Action Row */}
                  <div className="pt-1 sm:pt-1.5 flex items-center justify-between gap-1.5 border-t border-white/15">
                    <span className="text-[9.5px] sm:text-[11px] font-bold text-white/80 truncate">
                      {site.itemCount} items
                    </span>
                    <span
                      className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-black inline-flex items-center gap-1 shadow-md transition ${accent.button}`}
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
      {/* 3. CUSTOMER ACCOUNT CREATION HUB ON MAIN WEBSITE (Tablet/Desktop) */}
      {/* ================================================================= */}
      <section className="hidden sm:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
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
