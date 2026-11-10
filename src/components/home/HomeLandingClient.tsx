"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  MapPin,
  Sparkles,
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
  storeStatus: {
    isOpen: boolean;
    statusText: string;
    subText: string;
  };
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
  storeStatus: initialStoreStatus,
  isEmergencyWebsiteStopped: initialEmergencyStop = false,
  emergencyStopMessage: initialEmergencyMsg = null,
}: HomeLandingClientProps) {
  const { customer, setIsAuthModalOpen } = useCustomerAuth();
  const [liveSubsites, setLiveSubsites] = useState<HubSubsiteCard[] | null>(null);
  const [liveStoreStatus, setLiveStoreStatus] = useState<HomeLandingClientProps["storeStatus"] | null>(null);
  const [emergencyStopped, setEmergencyStopped] = useState(initialEmergencyStop);
  const [emergencyMsg, setEmergencyMsg] = useState(initialEmergencyMsg);

  const subsites = liveSubsites ?? initialSubsites;
  const storeStatus = liveStoreStatus ?? initialStoreStatus;

  useRealtimeEvents({
    onSubsiteUpdated: () => {
      fetch("/api/websites")
        .then((r) => r.json())
        .then((d) => {
          if (Array.isArray(d?.subsites)) setLiveSubsites(d.subsites);
          if (d?.storeStatus) setLiveStoreStatus(d.storeStatus);
        })
        .catch(() => {});
    },
    onEmergencyStopChanged: (payload) => {
      setEmergencyStopped(Boolean(payload.isEmergencyWebsiteStopped));
      setEmergencyMsg(payload.emergencyStopMessage || null);
    },
  });

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-[#FAF8F4] to-white text-[#1C1917] pb-16">
      {/* ================================================================= */}
      {/* 1. LIGHT MAIN HUB HERO WITH OFFICIAL UPAHAR LOGO                  */}
      {/* ================================================================= */}
      <section className="pt-8 sm:pt-12 pb-8 px-4 sm:px-6 lg:px-8 border-b border-[#E7E0D3]/70 bg-white">
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
          {/* Status & Location Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-bold bg-[#FAF8F4] border border-[#E7E0D3] text-[#1C1917] shadow-2xs">
              <span
                className={`w-2 h-2 rounded-full ${
                  storeStatus.isOpen ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                }`}
              />
              <span>{storeStatus.statusText}</span>
            </span>

            <a
              href="https://maps.app.goo.gl/6611R6FD1JZagSJt9"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold bg-[#FAF8F4] hover:bg-[#F2EDE2] border border-[#E7E0D3] text-[#57534E] transition"
            >
              <MapPin className="w-3.5 h-3.5 text-[#9A6E24]" />
              <span>1-1, Sangivalasa, ANITS Road, Beside SBI</span>
            </a>
          </div>

          {/* Official Centered UPAHAR Logo */}
          <div className="relative mb-5">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-[#D4AF37] shadow-xl bg-[#580D1A] ring-8 ring-[#D4AF37]/12">
              <Image
                src="/images/upahar_logo.jpg"
                alt="UPAHAR Official Logo"
                fill
                priority
                sizes="(max-width: 640px) 140px, 170px"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-[#580D1A] text-[#DFC17B] border border-[#D4AF37]/70 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md flex items-center space-x-1 whitespace-nowrap">
              <Sparkles className="w-2.5 h-2.5 text-[#DFC17B]" />
              <span>Sunrise To Sunset</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-[#1C1917]">
            UPAHAR
          </h1>
          <p className="text-base sm:text-xl font-script font-bold text-[#9A6E24] mt-0.5">
            Good Food • Good Mood • Four Dedicated Kitchens
          </p>
          <p className="mt-2.5 text-xs sm:text-sm text-[#57534E] max-w-2xl leading-relaxed">
            Choose any Upahar kitchen below to enter its dedicated menu &amp; ordering website based on live timings.
            No login required inside sub-websites — order anytime!
          </p>

          {emergencyStopped && (
            <div className="mt-5 w-full max-w-2xl p-4 rounded-2xl bg-red-50 border border-red-300 text-red-800 text-xs font-bold">
              🚨 {emergencyMsg || "Online ordering is temporarily paused by restaurant administration."}
            </div>
          )}
        </div>
      </section>

      {/* ================================================================= */}
      {/* 2. 4 CLICKABLE SUB-WEBSITE OPTIONS (TIFFINS, BIRYANIS, FAST FOODS, PICKLES) */}
      {/* ================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
          <div>
            <span className="text-[11px] uppercase font-extrabold tracking-[0.2em] text-[#9A6E24] block">
              Select A Kitchen Website
            </span>
            <h2 className="text-2xl sm:text-3xl font-black font-display text-[#1C1917]">
              Enter One of Our 4 Upahar Websites
            </h2>
          </div>
          <span className="text-xs font-semibold text-[#57534E]">
            Live IST Timings Active • Direct Guest Ordering
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {subsites.map((site) => {
            const accent = CARD_ACCENTS[site.key];
            const isOpen = site.status.isOpen && !emergencyStopped;

            return (
              <Link
                key={site.key}
                href={site.route}
                className={`group bg-white rounded-3xl border-2 ${accent.border} shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 overflow-hidden flex flex-col justify-between`}
              >
                {/* Theme Top Accent Strip */}
                <div className={`h-2 w-full ${accent.topStrip}`} />

                <div className="p-5 sm:p-6 flex-1 flex flex-col items-center text-center">
                  {/* Top Row: Number + Status Badge */}
                  <div className="w-full flex items-center justify-between gap-2 mb-4">
                    <span className="text-xs font-black text-stone-400 font-mono">
                      {site.number}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border ${
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

                  {/* Circular Food Photography Emblem (Easy Recognition) */}
                  <div
                    className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 ${accent.ring} shadow-lg mb-4 group-hover:scale-105 transition-transform duration-300 bg-stone-100`}
                  >
                    <Image
                      src={site.heroImage}
                      alt={site.title}
                      fill
                      sizes="140px"
                      className="object-cover"
                    />
                  </div>

                  {/* Website Title & Theme Pill */}
                  <h3 className="text-lg sm:text-xl font-black font-display text-[#1C1917] tracking-tight">
                    {site.title}
                  </h3>
                  <span className="text-[11px] font-bold text-[#9A6E24] mt-0.5">
                    {site.tagline}
                  </span>

                  {/* Timing Pill */}
                  <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FAF8F4] border border-[#E7E0D3] text-[11px] font-bold text-[#44403C]">
                    <Clock className="w-3 h-3 text-[#9A6E24] flex-shrink-0" />
                    <span>{site.timingText}</span>
                  </div>

                  <p className="mt-3 text-xs text-[#57534E] leading-relaxed line-clamp-3">
                    {site.description}
                  </p>
                </div>

                {/* Enter CTA */}
                <div className="px-5 pb-5">
                  <div
                    className={`w-full py-3 px-4 rounded-2xl text-xs font-black flex items-center justify-between shadow-sm transition ${accent.button}`}
                  >
                    <span>
                      Enter {site.shortTitle} ({site.itemCount} items)
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
