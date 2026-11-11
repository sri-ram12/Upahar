"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  Clock,
  MapPin,
  ChefHat,
  Leaf,
  UtensilsCrossed,
  Flame,
  Sparkles,
  Search,
  X,
  Lock,
  ShieldCheck,
  ShoppingBag,
  Plus,
  Minus,
} from "lucide-react";
import type { Category, FoodItem } from "@/types";
import type { DivisionKey } from "@/lib/store-hours";
import MenuDishCard from "@/components/menu/MenuDishCard";
import DishDetailModal from "@/components/menu/DishDetailModal";
import { useCart } from "@/context/CartContext";
import { useRealtimeEvents } from "@/hooks/useRealtimeEvents";

interface DivisionInfo {
  key: DivisionKey;
  route: string;
  number: string;
  title: string;
  shortTitle: string;
  tagline: string;
  timingText: string;
  shortTiming: string;
  quote: string;
  description: string;
  heroImage: string;
  theme: string;
  alwaysOpen?: boolean;
  status: {
    isOpen: boolean;
    isLocked: boolean;
    statusLabel: string;
    timingText: string;
    lockBanner: string | null;
  };
}

interface SiblingSubsite {
  key: DivisionKey;
  route: string;
  title: string;
  shortTitle: string;
  heroImage: string;
  timingText: string;
  status: {
    isOpen: boolean;
    statusLabel: string;
  };
}

interface DivisionSubsiteClientProps {
  division: DivisionInfo;
  categories: Category[];
  initialItems: FoodItem[];
  allSubsites: SiblingSubsite[];
  isEmergencyWebsiteStopped?: boolean;
  emergencyStopMessage?: string | null;
}

function BotanicalLeafFlourish({
  className = "",
  strokeColor = "currentColor",
  fillColor = "none",
}: {
  className?: string;
  strokeColor?: string;
  fillColor?: string;
}) {
  return (
    <svg
      viewBox="0 0 120 90"
      fill={fillColor}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M8 72C26 52 54 34 94 20M34 54C26 38 30 22 46 14C56 26 52 44 34 54ZM62 39C62 22 72 10 88 8C94 22 84 36 62 39ZM46 47C64 52 80 46 92 34C76 28 60 34 46 47Z"
        stroke={strokeColor}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const THEME_PALETTES: Record<
  DivisionKey,
  {
    pageBg: string;
    creamHex: string;
    heroWash: string;
    darkSectionBg: string;
    headingPrimary: string;
    bodyMuted: string;
    accentScript: string;
    goldStroke: string;
    leafStroke: string;
    quoteBorder: string;
    ctaPill: string;
    featureCardBorder: string;
    featureIconColor: string;
    featureTextColor: string;
    cardSurface: string;
    badgeBg: string;
    activeRing: string;
    activeUnderline: string;
    bannerBg: string;
    scriptWord: string;
    features: { titleTop: string; titleBottom: string }[];
    searchPlaceholder: string;
  }
> = {
  tiffins: {
    pageBg: "bg-[#FAF6EC]",
    creamHex: "#FAF6EC",
    heroWash: "from-[#FAF6EC] via-[#F4F8EE] to-[#FAF6EC]",
    darkSectionBg: "bg-[#092607]",
    headingPrimary: "text-[#0B250A]",
    bodyMuted: "text-[#3D4634]",
    accentScript: "text-[#B87A28]",
    goldStroke: "#C58F36",
    leafStroke: "rgba(223, 193, 123, 0.35)",
    quoteBorder: "border-[#32491B]/45",
    ctaPill:
      "bg-[#153B10] hover:bg-[#32491B] text-[#FAF6EC] shadow-[0_12px_28px_-6px_rgba(9,38,7,0.45)]",
    featureCardBorder: "border-[#DFD7C2]",
    featureIconColor: "text-[#153B10]",
    featureTextColor: "text-[#0B250A]",
    cardSurface: "bg-[#071D06]/75 border-[#F3DEAB]/25 hover:border-[#DFC17B]",
    badgeBg: "bg-[#153B10]/10 text-[#153B10] border-[#32491B]/30",
    activeRing: "ring-[#153B10] border-[#153B10]",
    activeUnderline: "bg-[#153B10]",
    bannerBg: "bg-[#153B10] text-[#FAF6EC]",
    scriptWord: "Always Fresh!",
    features: [
      { titleTop: "Stone-Ground", titleBottom: "Daily Batter" },
      { titleTop: "100% Pure", titleBottom: "Desi Ghee" },
      { titleTop: "Hot Chutneys", titleBottom: "& Sambar" },
      { titleTop: "6–10:30 AM &", titleBottom: "5–10:30 PM" },
    ],
    searchPlaceholder: "Search idly, ghee karam dosa, pesarattu, wada, poori...",
  },
  biryanis: {
    pageBg: "bg-[#FAF7F2]",
    creamHex: "#FAF7F2",
    heroWash: "from-[#FAF7F2] via-[#F7EFE6] to-[#FAF7F2]",
    darkSectionBg: "bg-[#380A11]",
    headingPrimary: "text-[#380A11]",
    bodyMuted: "text-[#4A3B38]",
    accentScript: "text-[#A66A20]",
    goldStroke: "#C5A059",
    leafStroke: "rgba(223, 193, 123, 0.32)",
    quoteBorder: "border-[#580D1A]/35",
    ctaPill:
      "bg-[#580D1A] hover:bg-[#74171E] text-[#FAF7F2] shadow-[0_12px_28px_-6px_rgba(88,13,26,0.45)]",
    featureCardBorder: "border-[#EADBCE]",
    featureIconColor: "text-[#580D1A]",
    featureTextColor: "text-[#2B070E]",
    cardSurface: "bg-[#24050B]/75 border-[#D4AF37]/30 hover:border-[#DFC17B]",
    badgeBg: "bg-[#580D1A]/10 text-[#580D1A] border-[#580D1A]/25",
    activeRing: "ring-[#580D1A] border-[#580D1A]",
    activeUnderline: "bg-[#580D1A]",
    bannerBg: "bg-[#580D1A] text-[#FAF7F2]",
    scriptWord: "Royal Dum!",
    features: [
      { titleTop: "Aged Saffron", titleBottom: "Basmati" },
      { titleTop: "Copper Handi", titleBottom: "Slow Dum" },
      { titleTop: "Salan & Fresh", titleBottom: "Onion Raita" },
      { titleTop: "12:00 PM to", titleBottom: "10:30 PM IST" },
    ],
    searchPlaceholder: "Search chicken dum biryani, fry piece biryani, egg biryani...",
  },
  "fast-food": {
    pageBg: "bg-[#FFFDF0]",
    creamHex: "#FFFDF0",
    heroWash: "from-[#FEF08A]/55 via-[#FFFBEB] to-[#FEF3C7]/60",
    darkSectionBg: "bg-gradient-to-br from-[#A16207] via-[#854D0E] to-[#713F12]",
    headingPrimary: "text-[#422006]",
    bodyMuted: "text-[#5C3404]",
    accentScript: "text-[#B45309]",
    goldStroke: "#EAB308",
    leafStroke: "rgba(254, 240, 138, 0.45)",
    quoteBorder: "border-[#CA8A04]/60",
    ctaPill:
      "bg-gradient-to-r from-[#EAB308] to-[#CA8A04] hover:from-[#FACC15] hover:to-[#EAB308] text-[#2B1400] font-black border border-[#854D0E]/30 shadow-[0_12px_28px_-6px_rgba(202,138,4,0.45)]",
    featureCardBorder: "border-[#FDE047]",
    featureIconColor: "text-[#B45309]",
    featureTextColor: "text-[#422006]",
    cardSurface: "bg-[#422006]/70 border-[#FDE047]/40 hover:border-[#FEF08A]",
    badgeBg: "bg-[#FEF08A] text-[#422006] border-[#CA8A04]/40",
    activeRing: "ring-[#CA8A04] border-[#CA8A04]",
    activeUnderline: "bg-[#CA8A04]",
    bannerBg: "bg-gradient-to-r from-[#FACC15] via-[#F59E0B] to-[#EAB308] text-[#2B1400]",
    scriptWord: "Wok Sizzle!",
    features: [
      { titleTop: "Roaring High", titleBottom: "Flame Wok" },
      { titleTop: "Crispy Hot", titleBottom: "Manchurian" },
      { titleTop: "Fresh Parotta", titleBottom: "& Chapati" },
      { titleTop: "5:00 PM to", titleBottom: "10:30 PM IST" },
    ],
    searchPlaceholder: "Search noodles, chicken fried rice, manchurian, parotta...",
  },
  pickles: {
    pageBg: "bg-[#FFF7F7]",
    creamHex: "#FFF7F7",
    heroWash: "from-[#FFE4E4]/75 via-[#FFF7F7] to-[#FFD6D6]/60",
    darkSectionBg: "bg-gradient-to-br from-[#CC0000] via-[#A80000] to-[#7A0000]",
    headingPrimary: "text-[#5C0000]",
    bodyMuted: "text-[#5C1A1A]",
    accentScript: "text-[#E10000]",
    goldStroke: "#FF0000",
    leafStroke: "rgba(255, 220, 220, 0.35)",
    quoteBorder: "border-[#FF0000]/55",
    ctaPill:
      "bg-[#E10000] hover:bg-[#FF0000] text-white shadow-[0_12px_28px_-6px_rgba(225,0,0,0.48)]",
    featureCardBorder: "border-[#FFBDBD]",
    featureIconColor: "text-[#DB0000]",
    featureTextColor: "text-[#450000]",
    cardSurface: "bg-[#450000]/75 border-[#FF9999]/35 hover:border-white",
    badgeBg: "bg-[#FF0000]/10 text-[#B30000] border-[#FF0000]/30",
    activeRing: "ring-[#E10000] border-[#E10000]",
    activeUnderline: "bg-[#E10000]",
    bannerBg: "bg-[#DB0000] text-white",
    scriptWord: "Authentic Spice!",
    features: [
      { titleTop: "Sun-Matured", titleBottom: "Guntur Chilli" },
      { titleTop: "Cold-Pressed", titleBottom: "Gingelly Oil" },
      { titleTop: "Airtight", titleBottom: "Fresh Jars" },
      { titleTop: "Order Open", titleBottom: "24×7 Anytime" },
    ],
    searchPlaceholder: "Search avakaya mango, gongura pickle, garlic, chicken pickle...",
  },
};

const FEATURE_ICONS = [ChefHat, Leaf, UtensilsCrossed, Clock];

export default function DivisionSubsiteClient({
  division: initialDivision,
  categories,
  initialItems,
  allSubsites,
  isEmergencyWebsiteStopped: initialEmergencyStop = false,
  emergencyStopMessage: initialEmergencyMsg = null,
}: DivisionSubsiteClientProps) {
  const { addToCart, updateQuantity, getItemQuantity, totalCount, toggleCart } = useCart();

  const [liveDivision, setLiveDivision] = useState<DivisionInfo | null>(null);
  const [liveItems, setLiveItems] = useState<FoodItem[] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dietFilter, setDietFilter] = useState<"all" | "veg" | "spicy" | "bestseller">("all");
  const [sortBy, setSortBy] = useState("popular");
  const [activeModalDish, setActiveModalDish] = useState<FoodItem | null>(null);
  const [emergencyStopped, setEmergencyStopped] = useState(initialEmergencyStop);
  const [emergencyMsg, setEmergencyMsg] = useState(initialEmergencyMsg);

  const division = liveDivision ?? initialDivision;
  const items = liveItems ?? initialItems;

  // Real-time admin updates for prices, item availability, photos, and subsite open/close
  useRealtimeEvents({
    onMenuItemUpdated: (payload) => {
      if (payload.action === "CREATED") {
        fetch(`/api/menu?division=${encodeURIComponent(division.key)}&respectSession=true&includeLocked=true`)
          .then((r) => r.json())
          .then((d) => {
            if (Array.isArray(d?.items)) setLiveItems(d.items);
          })
          .catch(() => {});
        return;
      }
      if (payload.action === "DELETED") {
        setLiveItems((prev) => (prev ?? initialItems).filter((it) => it.id !== payload.itemId));
        return;
      }
      setLiveItems((prev) =>
        (prev ?? initialItems).map((it) =>
          it.id === payload.itemId
            ? {
                ...it,
                ...(payload.name ? { name: payload.name } : {}),
                isAvailable: payload.isAvailable ?? it.isAvailable,
                price: payload.price ?? it.price,
              }
            : it
        )
      );
    },
    onEmergencyStopChanged: (payload) => {
      setEmergencyStopped(Boolean(payload.isEmergencyWebsiteStopped));
      setEmergencyMsg(payload.emergencyStopMessage || null);
    },
    onSubsiteUpdated: () => {
      fetch(`/api/websites`)
        .then((r) => r.json())
        .then((d) => {
          const found = d?.subsites?.find((s: DivisionInfo & { id?: string }) => s.id === division.key);
          if (found) {
            setLiveDivision((prev) => ({ ...(prev ?? initialDivision), ...found }));
          }
        })
        .catch(() => {});
    },
  });

  const palette = THEME_PALETTES[division.key];
  const isLocked = division.status.isLocked || emergencyStopped;

  const filteredItems = useMemo(() => {
    let list = items.filter((item) => {
      if (selectedCategory !== "all" && item.category?.slug !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const hit =
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          (item.ingredients && item.ingredients.toLowerCase().includes(q));
        if (!hit) return false;
      }
      if (dietFilter === "veg" && !item.isVeg) return false;
      if (dietFilter === "spicy" && !item.isSpicy) return false;
      if (dietFilter === "bestseller" && !item.isBestseller) return false;
      return true;
    });

    if (sortBy === "price-asc") {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      list = [...list].sort((a, b) => b.price - a.price);
    }
    return list;
  }, [items, selectedCategory, searchQuery, dietFilter, sortBy]);

  // Pick up to 4 visual showcase cards for the signature curved band
  const showcaseCards = useMemo(() => {
    const picks = items.filter((i) => i.isAvailable !== false).slice(0, 4);
    return picks;
  }, [items]);

  const siblingDivisions = allSubsites.filter((s) => s.key !== division.key);

  const showcaseRightClearMask: React.CSSProperties = {
    WebkitMaskImage:
      "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 14%, rgba(0,0,0,0.86) 28%, rgba(0,0,0,1) 40%, rgba(0,0,0,1) 100%), linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 8%, rgba(0,0,0,1) 90%, rgba(0,0,0,0) 100%)",
    WebkitMaskComposite: "source-in",
    maskImage:
      "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 14%, rgba(0,0,0,0.86) 28%, rgba(0,0,0,1) 40%, rgba(0,0,0,1) 100%), linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 8%, rgba(0,0,0,1) 90%, rgba(0,0,0,0) 100%)",
    maskComposite: "intersect",
  };

  const showcaseLeftBlurMask: React.CSSProperties = {
    WebkitMaskImage:
      "linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.75) 14%, rgba(0,0,0,0.2) 26%, rgba(0,0,0,0) 36%)",
    maskImage:
      "linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.75) 14%, rgba(0,0,0,0.2) 26%, rgba(0,0,0,0) 36%)",
  };

  return (
    <main className={`min-h-screen overflow-x-clip ${palette.pageBg} text-[#141210] transition-colors duration-300 pb-20`}>
      {/* ================================================================= */}
      {/* 1. SUB-WEBSITE HERITAGE HERO (Split Emblem + Quote + Dish Photo) */}
      {/* ================================================================= */}
      <section className={`relative w-full bg-gradient-to-br ${palette.heroWash} overflow-hidden pt-8 sm:pt-12 pb-16 sm:pb-20`}>
        {/* Subtle Corner Foliage Accent */}
        <div className="pointer-events-none absolute -top-2 -left-4 w-28 sm:w-40 opacity-35 z-10">
          <BotanicalLeafFlourish strokeColor={palette.goldStroke} />
        </div>
        <div className="pointer-events-none absolute -bottom-2 -right-4 w-28 sm:w-40 opacity-30 -scale-x-100 z-10">
          <BotanicalLeafFlourish strokeColor={palette.goldStroke} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          {/* Quick Breadcrumb Back to Main Hub + No-Login Direct Order Note */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <Link
              href="/"
              className="inline-flex items-center space-x-2 text-xs font-extrabold uppercase tracking-wider px-3.5 py-2 rounded-full bg-white/90 hover:bg-white border border-stone-300/80 text-stone-800 shadow-xs transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Homepage</span>
            </Link>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-black border shadow-xs ${palette.badgeBg}`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    !isLocked ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                  }`}
                />
                <span>{emergencyStopped ? "ONLINE ORDERS PAUSED" : division.status.statusLabel}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-white/90 border border-stone-300/80 text-stone-700 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Direct Guest Order • No Login Required</span>
              </span>
            </div>
          </div>

          {/* Emergency / Closed Hours Banner */}
          {emergencyStopped && (
            <div className="mb-6 p-4 rounded-2xl bg-red-600 text-white text-xs font-bold shadow-lg flex items-center justify-between gap-3">
              <span>🚨 {emergencyMsg || "Online ordering is temporarily paused by restaurant administration."}</span>
            </div>
          )}

          {!emergencyStopped && division.status.isLocked && division.status.lockBanner && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-950 text-[#FEF3C7] border border-[#F59E0B]/50 text-xs font-semibold shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-[#FACC15] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-black text-sm block text-[#FDE047]">
                    {division.title} • Currently Closed ({division.timingText})
                  </span>
                  <span className="text-amber-100/90">{division.status.lockBanner}</span>
                </div>
              </div>
              <Link
                href="/pickles"
                className="px-4 py-2 rounded-xl bg-[#DB0000] hover:bg-[#FF0000] text-white font-black text-xs whitespace-nowrap shadow-md transition"
              >
                Order Pickles 24×7 →
              </Link>
            </div>
          )}

          {/* Split Hero Content */}
          <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-6 md:gap-4 lg:gap-8">
            {/* LEFT SIDE */}
            <div className="md:col-span-6 lg:col-span-5 py-2 text-center md:text-left flex flex-col items-center md:items-start">
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
                <div className="relative w-16 h-16 sm:w-[4.5rem] sm:h-[4.5rem] rounded-full overflow-hidden border-[3px] border-[#D4AF37] shadow-lg bg-[#580D1A] flex-shrink-0 ring-4 ring-[#D4AF37]/20">
                  <Image
                    src="/images/upahar_logo.jpg"
                    alt="UPAHAR Official Emblem Logo"
                    fill
                    priority
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
                <div className="space-y-1 flex flex-col items-center sm:items-start">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black border ${palette.badgeBg}`}>
                    <Clock className="w-3 h-3 flex-shrink-0" />
                    <span>{division.timingText}</span>
                  </span>
                  <p className="text-[11px] font-semibold text-stone-600">
                    {division.tagline}
                  </p>
                </div>
              </div>

              <h1 className={`text-3xl sm:text-5xl lg:text-[3.1rem] xl:text-[3.4rem] font-black font-display leading-[1.06] tracking-tight ${palette.headingPrimary}`}>
                {division.title}
              </h1>

              <div className="relative inline-block mt-1 mb-3">
                <span className={`font-script text-4xl sm:text-5xl font-bold leading-none block ${palette.accentScript}`}>
                  {palette.scriptWord}
                </span>
                <svg viewBox="0 0 180 14" className="w-32 sm:w-40 h-3 -mt-0.5 mx-auto md:mx-0" fill="none" aria-hidden="true">
                  <path d="M3 9C48 3 122 2 176 7" stroke={palette.goldStroke} strokeWidth="2.4" strokeLinecap="round" />
                </svg>
              </div>

              <blockquote className={`text-sm sm:text-base max-w-md leading-relaxed ${palette.bodyMuted} font-medium italic md:border-l-[3px] ${palette.quoteBorder} md:pl-3.5`}>
                &ldquo;{division.quote}&rdquo;
              </blockquote>

              <div className="mt-5 sm:mt-6 flex flex-wrap items-center justify-center md:justify-start gap-3">
                <a
                  href="#catalog"
                  className={`${palette.ctaPill} px-7 py-3.5 rounded-full font-bold text-sm inline-flex items-center space-x-2.5 transition-all duration-300 hover:-translate-y-0.5`}
                >
                  <span>Explore &amp; Order</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <a
                  href="https://maps.app.goo.gl/6611R6FD1JZagSJt9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-full bg-white/90 hover:bg-white border border-stone-300/80 text-stone-800 shadow-sm transition"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#B87A28]" />
                  <span>Sangivalasa • ANITS Rd</span>
                </a>
              </div>
            </div>

            {/* RIGHT SIDE: DISSOLVED HERO FOOD SHOWCASE */}
            <div className="md:col-span-6 lg:col-span-7 relative flex items-center justify-center md:justify-end md:-mr-6 lg:-mr-12 xl:-mr-16">
              <div className="relative w-full max-w-[540px] md:max-w-none aspect-[16/10] sm:aspect-[16/11] md:aspect-[5/4] lg:aspect-[16/11] xl:h-[440px] xl:aspect-auto select-none mx-auto md:mx-0 rounded-3xl md:rounded-none overflow-hidden md:overflow-visible shadow-lg md:shadow-none">
                <div className="absolute inset-0 blur-xl opacity-55 pointer-events-none hidden md:block" style={showcaseLeftBlurMask} aria-hidden="true">
                  <Image src={division.heroImage} alt="" fill sizes="(max-width: 768px) 95vw, 680px" className="object-cover object-center" />
                </div>

                <div className="relative w-full h-full" style={showcaseRightClearMask}>
                  <Image
                    src={division.heroImage}
                    alt={`${division.title} Specialty Platter`}
                    fill
                    priority
                    sizes="(max-width: 768px) 95vw, (max-width: 1280px) 58vw, 760px"
                    className="object-cover object-center brightness-[1.03] contrast-[1.04] saturate-[1.06]"
                  />
                </div>

                <div className="absolute inset-0 backdrop-blur-[9px] pointer-events-none hidden md:block" style={showcaseLeftBlurMask} aria-hidden="true" />
                <div
                  className="absolute inset-0 pointer-events-none hidden md:block"
                  style={{
                    background: `linear-gradient(90deg, ${palette.creamHex} 0%, ${palette.creamHex}C8 10%, ${palette.creamHex}40 24%, transparent 40%)`,
                  }}
                  aria-hidden="true"
                />
                <div
                  className="absolute inset-0 pointer-events-none md:hidden"
                  style={{
                    background: `linear-gradient(180deg, ${palette.creamHex}33 0%, transparent 25%, transparent 78%, ${palette.creamHex}AA 100%)`,
                  }}
                  aria-hidden="true"
                />

                {!division.alwaysOpen && (
                  <div className="absolute inset-0 pointer-events-none z-10" style={showcaseRightClearMask} aria-hidden="true">
                    <div className="hero-steam-plume animate-steam-1 absolute bottom-[26%] left-[34%] w-24 sm:w-32 h-36 sm:h-48" />
                    <div className="hero-steam-plume animate-steam-2 absolute bottom-[30%] left-[52%] -translate-x-1/2 w-28 sm:w-40 h-40 sm:h-52" />
                    <div className="hero-fog-veil animate-fog-drift absolute top-[22%] left-[22%] w-[56%] h-24 sm:h-32 opacity-60" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 2. ELEVATED 4-ITEM FEATURE BAR                                    */}
      {/* ================================================================= */}
      <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 -mt-8">
        <div className={`bg-[#FFFDF9] rounded-2xl sm:rounded-3xl border ${palette.featureCardBorder} shadow-[0_20px_45px_-12px_rgba(20,18,16,0.14)] overflow-hidden`}>
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-stone-200/80">
            {palette.features.map((feat, idx) => {
              const IconComp = FEATURE_ICONS[idx % FEATURE_ICONS.length];
              return (
                <div key={feat.titleTop} className="px-3 sm:px-4 py-4 sm:py-6 flex flex-col items-center justify-center text-center group transition hover:bg-stone-50/70">
                  <IconComp className={`w-6 h-6 sm:w-8 sm:h-8 mb-2 stroke-[1.5] ${palette.featureIconColor} transition-transform duration-300 group-hover:scale-110`} />
                  <span className={`text-xs sm:text-sm font-semibold leading-snug ${palette.featureTextColor}`}>
                    {feat.titleTop}
                    <span className="block">{feat.titleBottom}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 3. CURVED THEME BAND ("Explore Our Menu" - 4 Photo Cards)         */}
      {/* ================================================================= */}
      {showcaseCards.length > 0 && (
        <section className={`relative z-10 ${palette.darkSectionBg} text-[#FAF6EE] -mt-10 pt-20 sm:pt-24 pb-20 sm:pb-24 overflow-hidden transition-colors duration-300`}>
          <BotanicalLeafFlourish className="hidden md:block absolute top-14 -left-4 w-36 pointer-events-none opacity-80" strokeColor={palette.leafStroke} />
          <BotanicalLeafFlourish className="hidden md:block absolute top-12 -right-4 w-36 pointer-events-none opacity-80 -scale-x-100" strokeColor={palette.leafStroke} />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex items-center justify-center gap-3 sm:gap-6 mb-8 sm:mb-10">
              <span className="h-px w-10 sm:w-28 bg-white/40" />
              <h2 className="text-xl sm:text-3xl lg:text-4xl font-display font-semibold italic tracking-wide text-white text-center">
                {division.shortTitle} Specials
              </h2>
              <span className="h-px w-10 sm:w-28 bg-white/40" />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {showcaseCards.map((dish) => (
                <button
                  type="button"
                  key={dish.id}
                  onClick={() => setActiveModalDish(dish)}
                  className={`group text-left rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-1.5 shadow-xl flex flex-col cursor-pointer ${palette.cardSurface}`}
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/30">
                    <Image
                      src={dish.image || division.heroImage}
                      alt={dish.name}
                      fill
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                    <span className="absolute bottom-2 right-2 px-2.5 py-0.5 rounded-full bg-black/70 text-[#FEF08A] text-xs font-black">
                      ₹{dish.price}
                    </span>
                  </div>
                  <div className="px-3 py-3 text-center flex-1 flex flex-col justify-center">
                    <span className="text-xs sm:text-base font-bold font-display text-white group-hover:text-[#FEF08A] transition-colors line-clamp-1">
                      {dish.name}
                    </span>
                    {dish.portionSize && (
                      <span className="text-[10px] text-white/75 line-clamp-1 mt-0.5">
                        {dish.portionSize}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 w-full leading-none pointer-events-none -mb-px">
            <svg viewBox="0 0 1440 110" preserveAspectRatio="none" className="w-full h-10 sm:h-20 lg:h-24 block" aria-hidden="true">
              <path d="M0,18 C340,108 980,96 1440,12 L1440,110 L0,110 Z" fill={palette.creamHex} />
            </svg>
          </div>
        </section>
      )}

      {/* ================================================================= */}
      {/* 4. CIRCULAR CATEGORIES & CIRCULAR CATALOG QUICK-PICK (Reference)  */}
      {/* ================================================================= */}
      <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 space-y-8">
        {/* Category Circular Selector Row */}
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm p-4 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-stone-400 block">
                Easy Visual Recognition
              </span>
              <h2 className={`text-xl sm:text-2xl font-black font-display ${palette.headingPrimary}`}>
                Browse {division.shortTitle} Categories &amp; Catalog
              </h2>
            </div>
            {totalCount > 0 && (
              <button
                type="button"
                onClick={toggleCart}
                className={`${palette.ctaPill} px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center space-x-2 cursor-pointer`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>View Bag ({totalCount})</span>
              </button>
            )}
          </div>

          {/* Circular Category Icons + Name Below (Matches Zomato Reference) */}
          <div className="flex items-start gap-5 sm:gap-7 overflow-x-auto pb-2 no-scrollbar border-b border-stone-100">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className="flex-shrink-0 flex flex-col items-center gap-2 group pb-2 relative cursor-pointer min-w-[74px]"
            >
              <div
                className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 transition shadow-md ${
                  selectedCategory === "all"
                    ? `ring-2 ring-offset-2 ${palette.activeRing} scale-105`
                    : "border-stone-200 group-hover:border-stone-400"
                }`}
              >
                <Image src={division.heroImage} alt="All Items" fill sizes="80px" className="object-cover" />
              </div>
              <span className={`text-xs font-extrabold text-center ${selectedCategory === "all" ? palette.headingPrimary : "text-stone-600"}`}>
                All ({items.length})
              </span>
              {selectedCategory === "all" && (
                <span className={`absolute bottom-0 left-2 right-2 h-[3px] rounded-full ${palette.activeUnderline}`} />
              )}
            </button>

            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.slug;
              const catImg = cat.image || items.find((i) => i.categoryId === cat.id)?.image || division.heroImage;
              const count = items.filter((i) => i.categoryId === cat.id || i.category?.slug === cat.slug).length;
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className="flex-shrink-0 flex flex-col items-center gap-2 group pb-2 relative cursor-pointer min-w-[78px] max-w-[96px]"
                >
                  <div
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 transition shadow-md ${
                      isSelected
                        ? `ring-2 ring-offset-2 ${palette.activeRing} scale-105`
                        : "border-stone-200 group-hover:border-stone-400"
                    }`}
                  >
                    <Image src={catImg} alt={cat.name} fill sizes="80px" className="object-cover" />
                  </div>
                  <span className={`text-[11px] sm:text-xs font-bold text-center leading-tight line-clamp-2 ${isSelected ? palette.headingPrimary : "text-stone-600"}`}>
                    {cat.name} ({count})
                  </span>
                  {isSelected && (
                    <span className={`absolute bottom-0 left-2 right-2 h-[3px] rounded-full ${palette.activeUnderline}`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Circular Catalog Items Quick-Pick Strip (Circular Image + Name & Price Below) */}
          {filteredItems.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-extrabold tracking-wider text-stone-500">
                  Quick Visual Dish Picker (Tap image to inspect or +Add)
                </span>
                <span className="text-[11px] font-bold text-stone-500">
                  {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}
                </span>
              </div>

              <div className="flex items-start gap-4 sm:gap-5 overflow-x-auto pb-2 no-scrollbar">
                {filteredItems.map((dish) => {
                  const qty = getItemQuantity(dish.id);
                  const canAdd = !isLocked && dish.isAvailable !== false;
                  return (
                    <div
                      key={`circle-${dish.id}`}
                      className="flex-shrink-0 w-[90px] sm:w-[100px] flex flex-col items-center text-center group"
                    >
                      <button
                        type="button"
                        onClick={() => setActiveModalDish(dish)}
                        className="relative w-16 h-16 sm:w-[74px] sm:h-[74px] rounded-full overflow-hidden border-2 border-[#D4AF37]/60 shadow-md group-hover:scale-105 transition cursor-pointer bg-stone-100"
                      >
                        <Image
                          src={dish.image || division.heroImage}
                          alt={dish.name}
                          fill
                          sizes="80px"
                          className={`object-cover ${!canAdd ? "grayscale-[35%] opacity-75" : ""}`}
                        />
                        {qty > 0 && (
                          <span className={`absolute bottom-0 inset-x-0 text-[10px] font-black py-0.5 ${palette.bannerBg}`}>
                            {qty} in bag
                          </span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveModalDish(dish)}
                        className="mt-1.5 text-[11px] font-bold text-stone-800 group-hover:text-black line-clamp-2 leading-tight cursor-pointer"
                      >
                        {dish.name}
                      </button>

                      <div className="mt-1 flex items-center justify-center gap-1.5">
                        <span className="text-[11px] font-black text-stone-900">₹{dish.price}</span>
                        {canAdd && qty === 0 && (
                          <button
                            type="button"
                            onClick={() => addToCart(dish, 1)}
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shadow-xs cursor-pointer ${palette.bannerBg}`}
                            title={`Add ${dish.name}`}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        )}
                        {canAdd && qty > 0 && (
                          <div className={`inline-flex items-center rounded-full px-1 py-0.5 gap-1 ${palette.bannerBg}`}>
                            <button
                              type="button"
                              onClick={() => updateQuantity(dish.id, -1)}
                              className="cursor-pointer"
                              aria-label="Decrease"
                            >
                              <Minus className="w-2.5 h-2.5" />
                            </button>
                            <span className="text-[10px] font-black">{qty}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(dish.id, 1)}
                              className="cursor-pointer"
                              aria-label="Increase"
                            >
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Search & Filter Row */}
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between pt-3 border-t border-stone-100">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder={palette.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
              <button
                type="button"
                onClick={() => setDietFilter(dietFilter === "veg" ? "all" : "veg")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  dietFilter === "veg"
                    ? "bg-emerald-700 text-white border-emerald-700"
                    : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                }`}
              >
                Pure Veg
              </button>
              <button
                type="button"
                onClick={() => setDietFilter(dietFilter === "bestseller" ? "all" : "bestseller")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1 cursor-pointer ${
                  dietFilter === "bestseller"
                    ? palette.bannerBg + " border-transparent"
                    : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>Bestsellers</span>
              </button>
              <button
                type="button"
                onClick={() => setDietFilter(dietFilter === "spicy" ? "all" : "spicy")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1 cursor-pointer ${
                  dietFilter === "spicy"
                    ? "bg-red-700 text-white border-red-700"
                    : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                }`}
              >
                <Flame className="w-3 h-3" />
                <span>Spicy</span>
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-stone-50 border border-stone-200 text-stone-800 focus:outline-none"
              >
                <option value="popular">Sort: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Full Orderable Dish Cards Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((dish) => (
              <MenuDishCard
                key={dish.id}
                item={{
                  ...dish,
                  isSessionLocked: isLocked,
                  lockReason: division.status.lockBanner,
                  availableAtText: division.timingText,
                }}
                onSelectDish={(selected) => setActiveModalDish(selected)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-3 shadow-sm">
            <UtensilsCrossed className="w-10 h-10 text-stone-300 mx-auto" />
            <h3 className="text-lg font-bold text-stone-800">No items match your filter</h3>
            <p className="text-xs text-stone-500">
              Try clearing your search or selecting &ldquo;All&rdquo; categories above.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
                setDietFilter("all");
              }}
              className={`${palette.ctaPill} px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer`}
            >
              Show All {division.shortTitle} Items
            </button>
          </div>
        )}
      </section>

      {/* ================================================================= */}
      {/* 5. OTHER UPAHAR SUB-WEBSITES SWITCHER                             */}
      {/* ================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14">
        <div className="flex items-center justify-between mb-5">
          <div>
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-stone-500 block">
              Switch Sub-Website
            </span>
            <h3 className={`text-xl sm:text-2xl font-black font-display ${palette.headingPrimary}`}>
              Explore Other Upahar Kitchens
            </h3>
          </div>
          <Link href="/" className="text-xs font-bold text-stone-700 hover:underline">
            Back to Homepage →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {siblingDivisions.map((sib) => (
            <Link
              key={sib.key}
              href={sib.route}
              className="group bg-white rounded-2xl border border-stone-200/90 hover:border-amber-400 p-4 flex items-center gap-4 shadow-xs hover:shadow-md transition"
            >
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#D4AF37]/60 flex-shrink-0">
                <Image src={sib.heroImage} alt={sib.title} fill sizes="64px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-black text-stone-900 block truncate group-hover:text-amber-700">
                  {sib.title}
                </span>
                <span className="text-[11px] text-stone-500 block truncate">{sib.timingText}</span>
                <span
                  className={`inline-block mt-1 text-[10px] font-black px-2 py-0.5 rounded-full ${
                    sib.status.isOpen
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-900"
                  }`}
                >
                  {sib.status.statusLabel}
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition flex-shrink-0" />
            </Link>
          ))}
        </div>
      </section>

      <DishDetailModal
        item={activeModalDish}
        onClose={() => setActiveModalDish(null)}
      />
    </main>
  );
}

