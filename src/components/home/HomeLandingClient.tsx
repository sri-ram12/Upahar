"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  MapPin,
  ChefHat,
  Leaf,
  UtensilsCrossed,
  Armchair,
  Bike,
  CalendarCheck,
  Coffee,
  Flower2,
  ChevronDown,
  Sparkles,
  Lock,
} from "lucide-react";
import type { WebsiteThemeMode } from "@/lib/store-hours";

interface HomeLandingClientProps {
  themeMode: WebsiteThemeMode;
  urlThemeParam?: string | null;
  storeStatus: {
    isOpen: boolean;
    sessionType: "MORNING" | "EVENING" | "CLOSED";
    statusText: string;
    subText: string;
    currentSession: string;
  };
  categories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  menuSlot?: React.ReactNode;
  storySlot?: React.ReactNode;
}

/** Delicate botanical leaf SVG decoration matching editorial flourishes. */
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

export default function HomeLandingClient({
  themeMode: initialThemeMode,
  urlThemeParam = null,
  storeStatus,
  menuSlot,
  storySlot,
}: HomeLandingClientProps) {
  const [liveThemeMode, setLiveThemeMode] = useState<WebsiteThemeMode>(initialThemeMode);
  const [activeQueryTheme, setActiveQueryTheme] = useState<string | null>(urlThemeParam);
  // Hero begins centered ("old way" logo in middle), then morphs smoothly on scroll
  // so logo moves left and reveals the culinary quote + steaming borderless dish showcase.
  const [isHeroScrolled, setIsHeroScrolled] = useState(false);

  useEffect(() => {
    setLiveThemeMode(initialThemeMode);
    setActiveQueryTheme(urlThemeParam);
  }, [initialThemeMode, urlThemeParam]);

  useEffect(() => {
    const handleThemeChange = (e: Event) => {
      const detail = (e as CustomEvent<{ theme?: WebsiteThemeMode; urlTheme?: string | null }>).detail;
      if (detail?.theme) setLiveThemeMode(detail.theme);
      if (detail && detail.urlTheme !== undefined) setActiveQueryTheme(detail.urlTheme);
    };
    window.addEventListener("upahar-theme-change", handleThemeChange);
    return () => window.removeEventListener("upahar-theme-change", handleThemeChange);
  }, []);

  useEffect(() => {
    const handleScrollMorph = () => {
      const y = window.scrollY;
      setIsHeroScrolled((prev) => {
        if (!prev && y > 40) return true;
        if (prev && y <= 18) return false;
        return prev;
      });
    };
    handleScrollMorph();
    window.addEventListener("scroll", handleScrollMorph, { passive: true });
    return () => window.removeEventListener("scroll", handleScrollMorph);
  }, []);

  const triggerExploreReveal = () => {
    window.scrollTo({ top: 140, behavior: "smooth" });
  };

  const isMorningGreen = liveThemeMode === "morning-green";

  const withThemeParam = (href: string) => {
    if (!activeQueryTheme) return href;
    const sep = href.includes("?") ? "&" : "?";
    return `${href}${sep}theme=${encodeURIComponent(activeQueryTheme)}`;
  };

  const palette = isMorningGreen
    ? {
        creamBg: "bg-[#FAF6EC]",
        creamHex: "#FAF6EC",
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
        featureIconColor: "text-[#31460D]",
        featureTextColor: "text-[#0B250A]",
        cardSurface: "bg-[#071D06]/75 border-[#F3DEAB]/25 hover:border-[#DFC17B]",
        badgeBg: "bg-[#153B10]/10 text-[#153B10] border-[#32491B]/30",
        crestHalo: "bg-radial from-[#D4AF37]/20 via-[#153B10]/8 to-transparent",
        heroImage: "/ghee-karam-dosa.jpg",
        heroImageAlt: "Steaming Morning Ghee Karam Dosa platter at Upahar Tiffins Sangivalasa",
        centerBrandTitle: "UPAHAR TIFFINS",
        centerScriptSub: "Good Food • Morning Fresh",
        centerHoursLine: "Morning Tiffins 6:00 AM – 10:30 AM • Biryanis & Fast Food open 12:00 PM",
        scrolledHeadlineTop: "Upahar",
        scrolledHeadlineBottom: "Morning Tiffins",
        scrolledScriptWord: "Always Fresh!",
        scrolledQuote:
          "Steaming Chitti Idlis, golden Ghee Karam Dosas & crispy wadas crafted fresh with pure desi ghee from 6:00 AM to 10:30 AM beside SBI, ANITS Road.",
      }
    : {
        creamBg: "bg-[#FAF7F2]",
        creamHex: "#FAF7F2",
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
        crestHalo: "bg-radial from-[#D4AF37]/22 via-[#580D1A]/10 to-transparent",
        heroImage: "/images/biryani-hero.jpg",
        heroImageAlt: "Upahar royal Copper Handi Chicken Dum Biryani & Fast Food Platter",
        centerBrandTitle: "UPAHAR BIRYANIS & FAST FOOD",
        centerScriptSub: "Dum Biryanis • Sizzling Fast Food",
        centerHoursLine: "Afternoon & Evening 12:00 PM – 10:30 PM • Morning Tiffins 6:00 AM – 10:30 AM",
        scrolledHeadlineTop: "Upahar Biryanis",
        scrolledHeadlineBottom: "& Fast Food",
        scrolledScriptWord: "Sizzling Hot!",
        scrolledQuote:
          "Slow-cooked Hyderabadi Chicken Dum Biryani, Andhra Fry Piece Biryani & high-flame wok noodles prepared fresh from 12:00 PM to 10:30 PM beside SBI, ANITS Road.",
      };

  const upperFeatures = [
    { icon: ChefHat, labelTop: "Chef", labelBottom: "Specials" },
    { icon: Leaf, labelTop: "Fresh", labelBottom: "Ingredients" },
    { icon: UtensilsCrossed, labelTop: "Dual Session", labelBottom: "Menu" },
    { icon: Armchair, labelTop: "Cozy", labelBottom: "Ambience" },
  ];

  const menuShowcaseCards = isMorningGreen
    ? [
        {
          titleTop: "Morning",
          titleBottom: "Tiffins",
          href: "/menu?category=tiffins",
          image: "/images/upahar_chitti_idly.jpg",
          alt: "Steaming Chitti Idly and Morning Tiffins",
          lockedBadge: null as string | null,
        },
        {
          titleTop: "Ghee Karam",
          titleBottom: "Dosas",
          href: "/menu?category=dosa",
          image: "/ghee-karam-dosa.jpg",
          alt: "Golden Crispy Ghee Karam Dosa",
          lockedBadge: null as string | null,
        },
        {
          titleTop: "Dum",
          titleBottom: "Biryanis",
          href: "/menu?category=biryanis",
          image: "/images/dishes/chicken-dum-biryani.jpg",
          alt: "Hyderabadi Chicken Dum Biryani opens at 12:00 PM",
          lockedBadge: "12:00 PM",
        },
        {
          titleTop: "Noodles &",
          titleBottom: "Fried Rice",
          href: "/menu?category=fried-rice",
          image: "/chicken-fried-rice.jpg",
          alt: "Wok Fried Rice and Noodles open at 12:00 PM",
          lockedBadge: "12:00 PM",
        },
      ]
    : [
        {
          titleTop: "Dum",
          titleBottom: "Biryanis",
          href: "/menu?category=biryanis",
          image: "/images/dishes/chicken-dum-biryani.jpg",
          alt: "Copper Handi Chicken Dum Biryani & Fry Piece Biryani",
          lockedBadge: null as string | null,
        },
        {
          titleTop: "Wok",
          titleBottom: "Fried Rice",
          href: "/menu?category=fried-rice",
          image: "/chicken-fried-rice.jpg",
          alt: "High-Flame Wok Fried Rice",
          lockedBadge: null as string | null,
        },
        {
          titleTop: "Street",
          titleBottom: "Noodles",
          href: "/menu?category=noodles",
          image: "/veg-manchurian-noodles.jpg",
          alt: "Sizzling Street-Style Noodles",
          lockedBadge: null as string | null,
        },
        {
          titleTop: "Starters &",
          titleBottom: "Dosas",
          href: "/menu?category=starters",
          image: "/images/dishes/chicken-manchurian.jpg",
          alt: "Crispy Manchurian Starters & Evening Dosas",
          lockedBadge: null as string | null,
        },
      ];

  const bottomServices = [
    {
      icon: Coffee,
      titleTop: "Morning Tiffins",
      titleBottom: "6:00 AM – 10:30 AM",
      href: "/menu?category=tiffins",
    },
    {
      icon: CalendarCheck,
      titleTop: "Fast Food & Tiffins",
      titleBottom: "12:00 PM – 10:30 PM",
      href: "/menu",
    },
    {
      icon: Bike,
      titleTop: "Takeaway",
      titleBottom: "& Delivery",
      href: "/orders",
    },
    {
      icon: Flower2,
      titleTop: "Special",
      titleBottom: "Occasions",
      href: "/contact",
    },
  ];

  // Directional left-blur/fade mask: dissolves softly on the left & top/bottom edges,
  // while keeping the right side of the food plate 100% crystal-clear and sharp.
  const showcaseRightClearMask: React.CSSProperties = {
    WebkitMaskImage:
      "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 14%, rgba(0,0,0,0.86) 28%, rgba(0,0,0,1) 40%, rgba(0,0,0,1) 100%), linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 8%, rgba(0,0,0,1) 90%, rgba(0,0,0,0) 100%)",
    WebkitMaskComposite: "source-in",
    maskImage:
      "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 14%, rgba(0,0,0,0.86) 28%, rgba(0,0,0,1) 40%, rgba(0,0,0,1) 100%), linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 8%, rgba(0,0,0,1) 90%, rgba(0,0,0,0) 100%)",
    maskComposite: "intersect",
  };

  // Directional blur strictly on the left transition side — zero blur on the right side
  const showcaseLeftBlurMask: React.CSSProperties = {
    WebkitMaskImage:
      "linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.75) 14%, rgba(0,0,0,0.2) 26%, rgba(0,0,0,0) 36%)",
    maskImage:
      "linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.75) 14%, rgba(0,0,0,0.2) 26%, rgba(0,0,0,0) 36%)",
  };

  return (
    <main className={`min-h-screen overflow-x-clip ${palette.creamBg} text-[#141210] transition-colors duration-300`}>
      {/* ================================================================= */}
      {/* 1. CHOREOGRAPHED OPENING -> SCROLLED HERO STAGE                    */}
      {/*    - On Load (y=0): Centered Official Crest Logo in the middle    */}
      {/*    - On Scroll (y>40): Logo moves Left + Quote & Steaming Food    */}
      {/* ================================================================= */}
      <section
        className={`relative w-full min-h-[calc(100svh+170px)] sm:min-h-[calc(100svh+210px)] ${palette.creamBg} overflow-x-clip transition-colors duration-300`}
      >
        <div className="sticky top-16 sm:top-[72px] min-h-[calc(100svh-4rem)] sm:min-h-[calc(100svh-4.5rem)] w-full flex items-center py-4 sm:py-8 md:py-10 pb-12 md:pb-20 overflow-hidden">
          {/* Subtle Corner Foliage Accent */}
          <div className="pointer-events-none absolute -top-2 -left-4 w-28 sm:w-40 opacity-45 z-10">
            <BotanicalLeafFlourish
              strokeColor={isMorningGreen ? "#32491B" : "#7A202D"}
              fillColor={isMorningGreen ? "rgba(50,73,27,0.10)" : "rgba(122,32,45,0.06)"}
            />
          </div>
          <div className="pointer-events-none absolute -bottom-2 -right-4 w-28 sm:w-40 opacity-35 -scale-x-100 z-10">
            <BotanicalLeafFlourish
              strokeColor={isMorningGreen ? "#32491B" : "#7A202D"}
              fillColor={isMorningGreen ? "rgba(50,73,27,0.08)" : "rgba(122,32,45,0.05)"}
            />
          </div>

          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 relative">
            {/* ------------------------------------------------------------- */}
            {/* STATE A: INITIAL OPENING VIEW (LOGO IN THE MIDDLE — OLD WAY)  */}
            {/* ------------------------------------------------------------- */}
            <div
              className={`absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-30 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isHeroScrolled
                  ? "opacity-0 -translate-x-16 sm:-translate-x-28 -translate-y-4 scale-75 pointer-events-none"
                  : "opacity-100 translate-x-0 translate-y-0 scale-100"
              }`}
              aria-hidden={isHeroScrolled}
            >
              {/* Soft radial crest aura in the center */}
              <div
                className="w-72 h-72 sm:w-96 sm:h-96 rounded-full blur-3xl opacity-70 pointer-events-none absolute"
                style={{
                  background: isMorningGreen
                    ? "radial-gradient(circle, rgba(212,175,55,0.22) 0%, rgba(49,70,13,0.10) 55%, transparent 80%)"
                    : "radial-gradient(circle, rgba(212,175,55,0.24) 0%, rgba(88,13,26,0.10) 55%, transparent 80%)",
                }}
              />

              {/* Status & Location Pills */}
              <div className="relative flex flex-wrap items-center justify-center gap-2 mb-5 sm:mb-6">
                <span
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-bold border ${palette.badgeBg} backdrop-blur-sm shadow-sm`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      storeStatus.isOpen ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                    }`}
                  />
                  <span>{storeStatus.statusText}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold bg-white/80 border border-stone-300/70 text-stone-700 shadow-sm">
                  <MapPin className="w-3.5 h-3.5 text-[#B87A28]" />
                  <span>Sangivalasa • Beside SBI, ANITS Rd</span>
                </span>
              </div>

              {/* CENTERED ICONIC UPAHAR LOGO EMBLEM (Old Heritage Presentation) */}
              <div className="relative mb-5 sm:mb-6 group">
                <div className="relative w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-[#D4AF37] shadow-2xl bg-[#580D1A] ring-8 ring-[#D4AF37]/15 flex items-center justify-center">
                  <Image
                    src="/images/upahar_logo.jpg"
                    alt="UPAHAR - Sunrise to Sunset Official Emblem"
                    fill
                    priority
                    sizes="(max-width: 640px) 150px, 200px"
                    className="object-cover"
                  />
                </div>
                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-[#580D1A] text-[#DFC17B] border border-[#D4AF37]/70 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center space-x-1 whitespace-nowrap">
                  <Sparkles className="w-2.5 h-2.5 text-[#DFC17B]" />
                  <span>Sunrise To Sunset</span>
                </div>
              </div>

              {/* Brand Opening Title */}
              <h2 className={`relative text-2xl sm:text-4xl lg:text-[2.65rem] font-black font-display tracking-tight leading-tight ${palette.headingPrimary}`}>
                {palette.centerBrandTitle}
                <span className={`block text-base sm:text-xl font-script font-bold mt-0.5 ${palette.accentScript}`}>
                  {palette.centerScriptSub}
                </span>
              </h2>

              <p className={`relative mt-2.5 text-xs sm:text-sm max-w-lg font-semibold ${palette.bodyMuted}`}>
                {palette.centerHoursLine}
              </p>

              {/* Quick Actions & Scroll Reveal Trigger */}
              <div className="relative mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={triggerExploreReveal}
                  className={`${palette.ctaPill} px-6 py-3 rounded-full font-bold text-xs sm:text-sm inline-flex items-center space-x-2 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer`}
                >
                  <span>Scroll to Explore</span>
                  <ChevronDown className="w-4 h-4 text-[#DFC17B] animate-bounce" />
                </button>
                <Link
                  href={withThemeParam("/menu")}
                  className="px-5 py-3 rounded-full font-bold text-xs sm:text-sm bg-white/90 hover:bg-white border border-stone-300 text-stone-800 shadow-sm inline-flex items-center space-x-1.5 transition"
                >
                  <span>View Menu</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#B87A28]" />
                </Link>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* STATE B: SCROLLED VIEW (LOGO ON LEFT + QUOTE + STEAMING DISH) */}
            {/* ------------------------------------------------------------- */}
            <div
              className={`relative z-20 grid grid-cols-1 md:grid-cols-12 items-center gap-6 md:gap-4 lg:gap-8 transition-all duration-700 delay-75 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isHeroScrolled
                  ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                  : "opacity-0 translate-y-6 scale-[0.98] pointer-events-none"
              }`}
            >
              {/* LEFT SIDE: MOVED-LEFT OFFICIAL LOGO + EDITORIAL QUOTE + CTA */}
              <div className="md:col-span-6 lg:col-span-5 py-2 sm:py-3 text-center md:text-left flex flex-col items-center md:items-start">
                {/* Official Logo moved cleanly to Left Side */}
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
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${palette.badgeBg} backdrop-blur-sm`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          storeStatus.isOpen ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                        }`}
                      />
                      <span>{storeStatus.statusText}</span>
                    </span>
                    <p className="text-[11px] sm:text-xs font-semibold text-stone-600 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#B87A28] flex-shrink-0" />
                      <span>6:00–10:30 AM • 12:00–10:30 PM</span>
                    </p>
                  </div>
                </div>

                {/* Editorial Display Headline */}
                <h1
                  className={`text-3xl sm:text-5xl lg:text-[3.2rem] xl:text-[3.55rem] font-bold font-display leading-[1.06] tracking-tight ${palette.headingPrimary}`}
                >
                  {palette.scrolledHeadlineTop}
                  <span className="block">{palette.scrolledHeadlineBottom}</span>
                </h1>
                <div className="relative inline-block mt-0.5 mb-3">
                  <span
                    className={`font-script text-4xl sm:text-5xl lg:text-[3.25rem] font-bold leading-none block ${palette.accentScript}`}
                  >
                    {palette.scrolledScriptWord}
                  </span>
                  <svg
                    viewBox="0 0 180 14"
                    className="w-32 sm:w-40 h-3 -mt-0.5 mx-auto md:mx-0"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 9C48 3 122 2 176 7"
                      stroke={palette.goldStroke}
                      strokeWidth="2.4"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                {/* Highlighted Quote Block */}
                <blockquote
                  className={`text-sm sm:text-base max-w-md leading-relaxed ${palette.bodyMuted} font-medium italic md:border-l-[3px] ${palette.quoteBorder} md:pl-3.5`}
                >
                  &ldquo;{palette.scrolledQuote}&rdquo;
                </blockquote>

                {/* Primary Pill CTA & Quick Location */}
                <div className="mt-5 sm:mt-6 flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <Link
                    href={withThemeParam("/menu")}
                    className={`${palette.ctaPill} px-7 py-3.5 rounded-full font-bold text-sm inline-flex items-center space-x-2.5 transition-all duration-300 hover:-translate-y-0.5`}
                  >
                    <span>View Menu</span>
                    <ArrowRight className="w-4 h-4 text-[#DFC17B]" />
                  </Link>

                  <a
                    href="https://maps.app.goo.gl/6611R6FD1JZagSJt9"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-full bg-white/85 hover:bg-white border border-stone-300/70 text-stone-800 shadow-sm backdrop-blur-sm transition"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#B87A28]" />
                    <span>Sangivalasa • ANITS Rd</span>
                  </a>
                </div>
              </div>

              {/* RIGHT SIDE: CLEARLY VISIBLE ON RIGHT + BLURRED LEFT MELT + FOGGY STEAM ANIMATION */}
              <div className="md:col-span-6 lg:col-span-7 relative flex items-center justify-end md:-mr-6 lg:-mr-12 xl:-mr-16">
                <div className="relative w-full max-w-[540px] md:max-w-none aspect-[16/10] sm:aspect-[16/11] md:aspect-[5/4] lg:aspect-[16/11] xl:h-[480px] xl:aspect-auto select-none mx-auto md:mx-0">
                  {/* Soft blurred left-edge bloom halo transitioning smoothly from cream */}
                  <div
                    className="absolute inset-0 blur-xl opacity-55 pointer-events-none"
                    style={showcaseLeftBlurMask}
                    aria-hidden="true"
                  >
                    <Image
                      src={palette.heroImage}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 95vw, 680px"
                      className="object-cover object-center"
                    />
                  </div>

                  {/* Unbordered showcase dish: sharp & vivid on right, smoothly dissolved on left */}
                  <div
                    className="relative w-full h-full"
                    style={showcaseRightClearMask}
                  >
                    <Image
                      src={palette.heroImage}
                      alt={palette.heroImageAlt}
                      fill
                      priority
                      sizes="(max-width: 768px) 95vw, (max-width: 1280px) 58vw, 760px"
                      className="object-cover object-right brightness-[1.03] contrast-[1.04] saturate-[1.06]"
                    />
                  </div>

                  {/* Directional optical blur strictly along the left transition margin */}
                  <div
                    className="absolute inset-0 backdrop-blur-[9px] pointer-events-none"
                    style={showcaseLeftBlurMask}
                    aria-hidden="true"
                  />

                  {/* Soft left-side & mobile top cream gradient melt */}
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
                      background: `linear-gradient(180deg, ${palette.creamHex} 0%, ${palette.creamHex}44 18%, transparent 36%, transparent 86%, ${palette.creamHex} 100%)`,
                    }}
                    aria-hidden="true"
                  />

                  {/* Multi-layered Realistic Rising Fog & Steam Wisps over plate */}
                  <div
                    className="absolute inset-0 pointer-events-none z-10"
                    style={showcaseRightClearMask}
                    aria-hidden="true"
                  >
                    <div className="hero-steam-plume animate-steam-1 absolute bottom-[26%] left-[34%] w-24 sm:w-32 h-36 sm:h-48" />
                    <div className="hero-steam-plume animate-steam-2 absolute bottom-[30%] left-[52%] -translate-x-1/2 w-28 sm:w-40 h-40 sm:h-52" />
                    <div className="hero-steam-plume animate-steam-3 absolute bottom-[24%] right-[24%] w-24 sm:w-32 h-32 sm:h-44" />

                    <div className="steam-wisp animate-steam-wisp-1 absolute bottom-[32%] left-[44%] w-16 sm:w-24 h-28 sm:h-36 opacity-80" />
                    <div className="steam-wisp animate-steam-wisp-2 absolute bottom-[28%] left-[58%] w-20 sm:w-28 h-28 sm:h-40 opacity-75" />

                    <div className="hero-fog-veil animate-fog-drift absolute top-[22%] left-[22%] w-[56%] h-24 sm:h-32 opacity-65" />
                    <div className="hero-fog-veil animate-fog-drift-2 absolute top-[35%] left-[18%] w-[64%] h-20 sm:h-28 opacity-55" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 2. ELEVATED 4-ITEM FEATURE BAR (Straddling Hero & Dark Curve Band)*/}
      {/* ================================================================= */}
      <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 -mt-6 sm:-mt-8 md:-mt-12">
        <div
          className={`bg-[#FFFDF9] rounded-2xl sm:rounded-3xl border ${palette.featureCardBorder} shadow-[0_20px_45px_-12px_rgba(20,18,16,0.16)] overflow-hidden`}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-stone-200/80">
            {upperFeatures.map((item) => {
              const IconComp = item.icon;
              return (
                <div
                  key={item.labelTop + item.labelBottom}
                  className="px-3 sm:px-4 py-4 sm:py-6 flex flex-col items-center justify-center text-center group transition hover:bg-stone-50/70"
                >
                  <IconComp
                    className={`w-6 h-6 sm:w-8 sm:h-8 mb-2 stroke-[1.5] ${palette.featureIconColor} transition-transform duration-300 group-hover:scale-110`}
                  />
                  <span
                    className={`text-xs sm:text-sm font-semibold leading-snug ${palette.featureTextColor}`}
                  >
                    {item.labelTop}
                    <span className="block">{item.labelBottom}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 3. DARK CURVED BAND: "— Explore Our Menu —" (4 Square Photo Cards)*/}
      {/* ================================================================= */}
      <section className={`relative z-10 ${palette.darkSectionBg} text-[#FAF6EE] -mt-10 sm:-mt-12 pt-20 sm:pt-26 pb-20 sm:pb-24 overflow-hidden transition-colors duration-300`}>
        {/* Delicate Side Leaf Line-Art Accents matching the reference dark band */}
        <BotanicalLeafFlourish
          className="hidden md:block absolute top-14 -left-4 w-36 pointer-events-none opacity-80"
          strokeColor={palette.leafStroke}
        />
        <BotanicalLeafFlourish
          className="hidden md:block absolute top-12 -right-4 w-36 pointer-events-none opacity-80 -scale-x-100"
          strokeColor={palette.leafStroke}
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Flanked Editorial Header */}
          <div className="flex items-center justify-center gap-3 sm:gap-6 mb-8 sm:mb-12">
            <span className="h-px w-10 sm:w-28 bg-[#DFC17B]/55" />
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-display font-semibold italic tracking-wide text-[#FAF6EE] text-center">
              Explore Our Menu
            </h2>
            <span className="h-px w-10 sm:w-28 bg-[#DFC17B]/55" />
          </div>

          {/* 4 Balanced Category Showcase Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {menuShowcaseCards.map((card) => (
              <Link
                key={card.titleTop + card.titleBottom}
                href={withThemeParam(card.href)}
                className={`group rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-1.5 shadow-xl flex flex-col ${palette.cardSurface}`}
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/30">
                  <Image
                    src={card.image}
                    alt={card.alt}
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className={`object-cover object-center group-hover:scale-105 transition-transform duration-500 ${
                      card.lockedBadge ? "grayscale-[25%] brightness-85" : ""
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                  {card.lockedBadge && (
                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-amber-950/90 border border-[#D4AF37]/60 text-[#DFC17B] text-[10px] font-black flex items-center gap-1 shadow-md">
                      <Lock className="w-2.5 h-2.5" />
                      <span>{card.lockedBadge}</span>
                    </span>
                  )}
                </div>
                <div className="px-2.5 sm:px-3 py-3 sm:py-4 text-center flex-1 flex flex-col justify-center">
                  <span className="text-xs sm:text-base font-medium font-display text-[#FAF6EE] group-hover:text-[#DFC17B] transition-colors leading-snug">
                    {card.titleTop}
                    <span className="block">{card.titleBottom}</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Seamless Curved Cream Wave Bottom Transition into About Us */}
        <div className="absolute bottom-0 left-0 right-0 w-full leading-none pointer-events-none -mb-px">
          <svg
            viewBox="0 0 1440 110"
            preserveAspectRatio="none"
            className="w-full h-10 sm:h-20 lg:h-24 block"
            aria-hidden="true"
          >
            <path
              d="M0,18 C340,108 980,96 1440,12 L1440,110 L0,110 Z"
              fill={palette.creamHex}
            />
          </svg>
        </div>
      </section>

      {/* RESTORED INTERACTIVE CULINARY & LIVE COOKING VIDEO SECTIONS */}
      {menuSlot}

      {/* ================================================================= */}
      {/* 4. CURVED SPLIT SECTION: "ABOUT US — A Culinary Destination"      */}
      {/* ================================================================= */}
      <section className={`relative ${palette.creamBg} py-12 sm:py-16 lg:py-20 overflow-hidden transition-colors duration-300`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Organic Curved Restaurant Photo */}
            <div className="lg:col-span-6">
              <div className="relative aspect-[4/3] sm:aspect-[16/11] w-full rounded-tl-3xl rounded-tr-[52px] sm:rounded-tr-[96px] rounded-bl-[44px] sm:rounded-bl-[84px] rounded-br-3xl overflow-hidden shadow-2xl border-2 border-[#DFC17B]/40">
                <Image
                  src="/images/upahar_hotel_dining.jpg"
                  alt="UPAHAR Sangivalasa Dining & Covered Hospitality"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs">
                  <span className="font-semibold bg-black/55 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                    1-1, ANITS College Rd, Beside SBI
                  </span>
                </div>
              </div>
            </div>

            {/* Right Story Column matching Reference Density */}
            <div className="lg:col-span-6 text-center lg:text-left space-y-4 sm:space-y-5">
              <div className="inline-flex items-center justify-center lg:justify-start gap-3">
                <span className="h-px w-8 sm:w-10 bg-[#C5A059]" />
                <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-[0.22em] text-[#7A6340]">
                  About Us
                </span>
                <span className="h-px w-8 sm:w-10 bg-[#C5A059]" />
              </div>

              <h2
                className={`text-3xl sm:text-4xl lg:text-5xl font-bold font-display leading-[1.1] ${palette.headingPrimary}`}
              >
                A Culinary
                <span className="block">Destination</span>
              </h2>

              <p
                className={`text-sm sm:text-base max-w-lg mx-auto lg:mx-0 leading-relaxed ${palette.bodyMuted}`}
              >
                Blending authentic South Indian morning tiffins, sizzling wok-tossed fast food, and warm Sangivalasa hospitality — freshly made for ANITS students, families &amp; every occasion.
              </p>

              {/* Session Timing Pills */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1 text-xs font-semibold">
                <span className={`px-3 py-1.5 rounded-full border ${palette.badgeBg}`}>
                  Morning Tiffins: 6:00 AM – 10:30 AM
                </span>
                <span className={`px-3 py-1.5 rounded-full border ${palette.badgeBg}`}>
                  Fast Food &amp; Tiffins: 12:00 PM – 10:30 PM
                </span>
              </div>

              <div className="pt-2">
                <Link
                  href={withThemeParam("/about")}
                  className={`${palette.ctaPill} px-7 py-3.5 rounded-full font-bold text-sm inline-flex items-center space-x-2.5 transition-all duration-300 hover:-translate-y-0.5`}
                >
                  <span>Know More</span>
                  <ArrowRight className="w-4 h-4 text-[#DFC17B]" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RESTORED HERITAGE, OWNER/HOTEL SHOWCASE, LOCATION MAP & REVIEWS */}
      {storySlot}

      {/* ================================================================= */}
      {/* 5. BOTTOM DARK CURVED 4-SERVICE STRIP (Flows into Footer)         */}
      {/* ================================================================= */}
      <section className={`relative ${palette.darkSectionBg} text-[#FAF6EE] pt-14 sm:pt-16 pb-10 sm:pb-12 overflow-hidden transition-colors duration-300`}>
        {/* Curved top wave transitioning cleanly from Cream into Dark Green / Maroon */}
        <div className="absolute top-0 left-0 right-0 w-full leading-none pointer-events-none -mt-px">
          <svg
            viewBox="0 0 1440 70"
            preserveAspectRatio="none"
            className="w-full h-8 sm:h-12 block"
            aria-hidden="true"
          >
            <path
              d="M0,0 L1440,0 L1440,18 C1080,68 420,66 0,14 Z"
              fill={palette.creamHex}
            />
          </svg>
        </div>

        {/* Bottom-Right Botanical Accent */}
        <BotanicalLeafFlourish
          className="hidden sm:block absolute top-4 -right-4 w-32 pointer-events-none opacity-80 -scale-x-100"
          strokeColor={palette.leafStroke}
        />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/15">
            {bottomServices.map((svc) => {
              const IconComp = svc.icon;
              return (
                <Link
                  key={svc.titleTop}
                  href={withThemeParam(svc.href)}
                  className="px-3 sm:px-4 py-4 sm:py-5 flex flex-col items-center justify-center text-center group transition hover:bg-white/5"
                >
                  <IconComp className="w-6 h-6 sm:w-8 sm:h-8 mb-2 stroke-[1.5] text-[#FAF6EE] group-hover:text-[#DFC17B] transition-colors" />
                  <span className="text-xs sm:text-sm font-medium leading-snug text-[#FAF6EE] group-hover:text-[#DFC17B] transition-colors">
                    {svc.titleTop}
                    <span className="block text-[11px] opacity-85">{svc.titleBottom}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
