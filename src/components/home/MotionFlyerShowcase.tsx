"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  Sparkles,
  Clock,
  Phone,
  MapPin,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Zap,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";

interface DishFlyer {
  id: string;
  name: string;
  subtitle: string;
  tagline: string;
  badge: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: "Tiffins" | "Fast Food";
  spicyLevel: number; // 1 to 3
  ingredients: string[];
  accentColor: string;
  bgWord: string;
  highlights: string;
}

const MOTION_DISHES: DishFlyer[] = [
  {
    id: "ghee-karam-dosa",
    name: "Ghee Karam Dosa",
    subtitle: "Tava-Roasted with Pure Desi Ghee",
    tagline: "CRISPY • SPICY • GOLDEN",
    badge: "🔥 CHEF'S TOP SIGNATURE",
    price: 45,
    originalPrice: 50,
    image: "/ghee-karam-dosa.jpg",
    category: "Tiffins",
    spicyLevel: 3,
    ingredients: ["Roasted Red Garlic Karam", "Pure Village Ghee", "Fresh Curry Leaves", "Crispy Fermented Batter"],
    accentColor: "#D4AF37",
    bgWord: "CRISPY DOSA",
    highlights: "House-roasted allam-karam chutney smeared over cast-iron golden crepe.",
  },
  {
    id: "sambar-idli",
    name: "Sambar Idly (3)",
    subtitle: "Submerged in Steaming Drumstick Sambar",
    tagline: "CLOUD SOFT • STEAMING • AROMATIC",
    badge: "✨ MORNING SPECIAL",
    price: 30,
    originalPrice: 35,
    image: "/sambar-idli.jpg",
    category: "Tiffins",
    spicyLevel: 1,
    ingredients: ["Stone-Ground Rice Batter", "Ghee Drizzle", "Drumstick Sambar", "Fresh Coriander"],
    accentColor: "#F59E0B",
    bgWord: "HOT SAMBAR",
    highlights: "Soft steamed rice cakes completely dipped in rich spiced lentil broth.",
  },
  {
    id: "chees-dosa",
    name: "Chees Dosa",
    subtitle: "Golden Crepe Loaded with Gooey Melted Cheese",
    tagline: "RICH CHEESE • SAVORY • FLAVORFUL",
    badge: "👑 ALL-TIME FAVORITE",
    price: 60,
    originalPrice: 70,
    image: "/butter-masala-dosa.jpg",
    category: "Tiffins",
    spicyLevel: 1,
    ingredients: ["Melted Cheese Blend", "Pure Desi Ghee", "Crisp Golden Crepe", "Coconut Chutney"],
    accentColor: "#EAB308",
    bgWord: "CHEES DOSA",
    highlights: "Decadent crisp golden crepe overflowing with savory melting cheese.",
  },
  {
    id: "chicken-fried-rice",
    name: "Chicken Fried Rice",
    subtitle: "Wok-Tossed on Roaring High Flame",
    tagline: "SMOKY • FLAVORFUL • TENDER CHICKEN",
    badge: "⚡ EVENING BESTSELLER",
    price: 120,
    originalPrice: 140,
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80",
    category: "Fast Food",
    spicyLevel: 2,
    ingredients: ["Aromatic Basmati Rice", "Tender Marinated Chicken", "Scrambled Egg", "Crunchy Spring Onions"],
    accentColor: "#EF4444",
    bgWord: "CHICKEN RICE",
    highlights: "High flame wok craft with signature house spice blend & tender chicken pieces.",
  },
  {
    id: "veg-manchurian-noodles",
    name: "Veg Manchurian Noodles",
    subtitle: "Street-Style Spicy Hakka Noodles with Manchurian",
    tagline: "SIZZLING • TASTY • CRISP VEGGIES",
    badge: "🍜 STUDENT'S FAVORITE",
    price: 90,
    originalPrice: 100,
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80",
    category: "Fast Food",
    spicyLevel: 2,
    ingredients: ["Handmade Noodles", "Crispy Manchurian Balls", "Cabbage & Capsicum", "Dark Soya Chilli Glaze"],
    accentColor: "#F97316",
    bgWord: "SPICY NOODLES",
    highlights: "Tossed live on cast-iron wok with shredded bell peppers, cabbage & crispy manchurian.",
  },
];

interface FloatingParticle {
  id: number;
  emoji: string;
  size: string;
  initialX: number;
  initialY: number;
  targetX: number;
  targetY: number;
  duration: number;
  delay: number;
}

const PARTICLES: FloatingParticle[] = [
  { id: 1, emoji: "🌶️", size: "text-2xl sm:text-4xl", initialX: -180, initialY: -120, targetX: -90, targetY: -70, duration: 4.5, delay: 0 },
  { id: 2, emoji: "🌿", size: "text-xl sm:text-3xl", initialX: 190, initialY: -140, targetX: 110, targetY: -80, duration: 5.2, delay: 0.3 },
  { id: 3, emoji: "🧄", size: "text-lg sm:text-2xl", initialX: -200, initialY: 130, targetX: -120, targetY: 70, duration: 4.8, delay: 0.6 },
  { id: 4, emoji: "✨", size: "text-xl sm:text-3xl", initialX: 210, initialY: 120, targetX: 130, targetY: 80, duration: 3.8, delay: 0.2 },
  { id: 5, emoji: "🧅", size: "text-base sm:text-2xl", initialX: -140, initialY: -180, targetX: -70, targetY: -100, duration: 5.5, delay: 0.5 },
  { id: 6, emoji: "🍅", size: "text-lg sm:text-2xl", initialX: 160, initialY: -190, targetX: 90, targetY: -110, duration: 4.2, delay: 0.4 },
];

export default function MotionFlyerShowcase({ items }: { items?: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  const activeDish = MOTION_DISHES[currentIndex];

  // Auto-slide cycling every 4.5 seconds with visual progress bar
  useEffect(() => {
    if (!isAutoPlaying) return;

    const DURATION = 4500;
    const INTERVAL = 50;
    let elapsed = 0;

    const ticker = setInterval(() => {
      elapsed += INTERVAL;
      setProgress(Math.min((elapsed / DURATION) * 100, 100));

      if (elapsed >= DURATION) {
        elapsed = 0;
        setProgress(0);
        setCurrentIndex((prev) => (prev + 1) % MOTION_DISHES.length);
      }
    }, INTERVAL);

    return () => clearInterval(ticker);
  }, [currentIndex, isAutoPlaying]);

  const handleSelectDish = (index: number) => {
    setCurrentIndex(index);
    setProgress(0);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % MOTION_DISHES.length);
    setProgress(0);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + MOTION_DISHES.length) % MOTION_DISHES.length);
    setProgress(0);
  };

  return (
    <section
      className="relative w-full min-h-[92vh] lg:min-h-screen bg-[#0E0909] text-[#FAF7F2] overflow-hidden flex flex-col justify-between py-8 sm:py-12 select-none"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
      aria-label="Pinterest Motion Ad Food Flyer Showcase"
    >
      {/* ========================================================================= */}
      {/* 1. BACKGROUND KINETIC WATERMARK TYPOGRAPHY (Pinterest Video Ad Style)     */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeDish.id}
            initial={{ scale: 0.6, opacity: 0, rotate: -6 }}
            animate={{ scale: 1, opacity: 0.07, rotate: 0 }}
            exit={{ scale: 1.4, opacity: 0, rotate: 6 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center select-none"
          >
            <span className="block text-[18vw] sm:text-[16vw] font-black text-[#D4AF37] uppercase tracking-tighter leading-none whitespace-nowrap">
              {activeDish.bgWord}
            </span>
            <span className="block text-[10vw] sm:text-[8vw] font-black text-white/50 uppercase tracking-widest -mt-4 sm:-mt-8">
              UPAHAR SPECIAL
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Radiant Golden/Maroon Radial Spotlight */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.18)_0%,rgba(88,13,26,0.25)_40%,rgba(14,9,9,0.98)_80%)] pointer-events-none z-0" />

      {/* Kinetic Hazard / Speed Lines Diagonal Ribbon Accent */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#D4AF37] via-[#580D1A] to-[#D4AF37] opacity-80 z-20" />

      {/* ========================================================================= */}
      {/* 2. TOP HEADER BAR: "WE ARE OPEN" NEON MARQUEE & LIVE STATUS (Pin 2 Style) */}
      {/* ========================================================================= */}
      <div className="relative z-20 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 sm:pb-6 border-b border-white/10">
          {/* Neon "WE ARE OPEN" Glowing Pill */}
          <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-[#1C1213] border border-[#D4AF37]/50 shadow-[0_0_20px_rgba(212,175,55,0.3)]">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
            <span className="text-xs sm:text-sm font-black tracking-widest uppercase text-[#DFC17B]">
              WE ARE OPEN NOW
            </span>
            <span className="text-white/40 text-xs hidden sm:inline">•</span>
            <span className="text-stone-300 text-xs hidden sm:inline font-medium">
              Morning 6–10 AM | Evening 6–10:30 PM
            </span>
          </div>

          {/* Quick Direct Actions: Sangivalasa, ANITS Road beside SBI */}
          <div className="flex items-center space-x-2 sm:space-x-3 text-xs">
            <a
              href="https://maps.app.goo.gl/6611R6FD1JZagSJt9"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-stone-200 border border-white/15 flex items-center space-x-1.5 transition"
            >
              <MapPin className="w-3.5 h-3.5 text-[#DFC17B]" />
              <span className="hidden md:inline">Beside SBI, ANITS Road</span>
              <span className="md:hidden">Directions</span>
            </a>

            <a
              href="tel:+919885455342"
              className="px-3 py-1.5 rounded-lg bg-[#580D1A] hover:bg-[#74171E] text-[#DFC17B] border border-[#D4AF37]/40 font-bold flex items-center space-x-1.5 shadow-md transition"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>9885455342</span>
            </a>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN FLYER STAGE: 3D ROTATING DISH + FLOATING INGREDIENTS (Pins 1 & 3) */}
      {/* ========================================================================= */}
      <div className="relative z-20 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 my-auto py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
          {/* ------------------------------------------------------------- */}
          {/* LEFT: KINETIC TYPOGRAPHY BANNER & BADGES                      */}
          {/* ------------------------------------------------------------- */}
          <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4 sm:space-y-5 order-2 lg:order-1">
            {/* Top Promo Badge */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`badge-${activeDish.id}`}
                initial={{ opacity: 0, y: -20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{ duration: 0.35, type: "spring", stiffness: 200 }}
                className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#580D1A] border-2 border-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,0.4)]"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#DFC17B]" />
                <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#DFC17B]">
                  {activeDish.badge}
                </span>
              </motion.div>
            </AnimatePresence>

            {/* Giant Punchy Dish Title */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`title-${activeDish.id}`}
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="space-y-1"
              >
                <span className="text-xs sm:text-sm font-black tracking-[0.25em] text-[#DFC17B] uppercase block">
                  {activeDish.tagline}
                </span>
                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display uppercase tracking-tight text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] leading-[1.05]">
                  {activeDish.name}
                </h2>
                <p className="text-stone-300 text-xs sm:text-sm md:text-base max-w-lg mt-2 font-medium leading-relaxed">
                  {activeDish.highlights}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Key Ingredients Pill Tags (Pin 1 Flying Ingredients Theme) */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1">
              {activeDish.ingredients.map((ing, idx) => (
                <motion.span
                  key={`${activeDish.id}-ing-${idx}`}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 + idx * 0.06 }}
                  className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#1C1917] border border-white/15 text-stone-300 flex items-center space-x-1 shadow-sm"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                  <span>{ing}</span>
                </motion.span>
              ))}
            </div>

            {/* Action Row: Price Blast + WhatsApp Order + Full Menu CTA */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2 sm:pt-4">
              {/* Starburst Price Tag on Left for Mobile and Desktop */}
              <div className="flex items-baseline space-x-2 bg-[#1C1213] px-4 py-2 rounded-2xl border border-[#D4AF37]/50 shadow-lg">
                <span className="text-3xl sm:text-4xl font-black text-[#D4AF37] font-display">
                  ₹{activeDish.price}
                </span>
                {activeDish.originalPrice && (
                  <span className="text-sm text-stone-500 line-through font-bold">
                    ₹{activeDish.originalPrice}
                  </span>
                )}
                <span className="text-[10px] text-emerald-400 font-extrabold uppercase ml-1">
                  Fresh Hot
                </span>
              </div>

              {/* WhatsApp Quick Parcel Order */}
              <a
                href={`https://wa.me/919885455342?text=${encodeURIComponent(
                  `Namaste Upahar! I want to order ${activeDish.name} (₹${activeDish.price}) from the live website special.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm tracking-wider uppercase flex items-center space-x-2 shadow-[0_0_25px_rgba(16,185,129,0.35)] hover:scale-105 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Order on WhatsApp</span>
              </a>

              {/* View Dish Details */}
              <Link
                href="/menu"
                className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-[#DFC17B] border border-[#D4AF37]/40 font-bold text-xs sm:text-sm uppercase flex items-center space-x-1.5 transition"
              >
                <span>Full Menu</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* RIGHT: 360-DEGREE CONTINUOUS ROTATING DISH + PARTICLES        */}
          {/* ------------------------------------------------------------- */}
          <div className="lg:col-span-6 relative flex items-center justify-center order-1 lg:order-2 py-4 sm:py-8">
            {/* Floating 3D Ingredients Orbiting the Plate (Pin 1 Motion Reference) */}
            {PARTICLES.map((particle) => (
              <motion.div
                key={`${activeDish.id}-p-${particle.id}`}
                className={`absolute z-30 pointer-events-none select-none ${particle.size}`}
                initial={{
                  x: particle.initialX,
                  y: particle.initialY,
                  opacity: 0,
                  scale: 0.3,
                  rotate: 0,
                }}
                animate={{
                  x: [particle.initialX, particle.targetX, particle.initialX],
                  y: [particle.initialY, particle.targetY, particle.initialY],
                  opacity: [0.3, 0.9, 0.3],
                  scale: [0.8, 1.2, 0.8],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: particle.duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: particle.delay,
                }}
              >
                {particle.emoji}
              </motion.div>
            ))}

            {/* Radiant Sunburst Aura behind Plate */}
            <div className="absolute w-64 h-64 sm:w-80 sm:h-80 md:w-[420px] md:h-[420px] rounded-full bg-gradient-to-tr from-[#D4AF37]/30 via-[#580D1A]/40 to-transparent blur-2xl animate-pulse pointer-events-none" />

            {/* Main Interactive Spinning Plate Container */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeDish.id}
                initial={{ opacity: 0, scale: 0.3, rotate: -60 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 1.4, rotate: 60 }}
                transition={{
                  type: "spring",
                  stiffness: 75,
                  damping: 14,
                  mass: 0.9,
                }}
                className="relative w-56 h-56 sm:w-72 sm:h-72 md:w-96 md:h-96 lg:w-[430px] lg:h-[430px] rounded-full border-4 sm:border-8 border-[#D4AF37]/40 shadow-[0_30px_70px_rgba(0,0,0,0.95)] overflow-hidden group bg-[#141210]"
              >
                {/* Continuous 360-Degree Fluid Rotation */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 24, ease: "linear" }}
                  className="w-full h-full relative"
                >
                  <Image
                    src={activeDish.image}
                    alt={activeDish.name}
                    fill
                    priority
                    sizes="(max-width: 640px) 240px, (max-width: 1024px) 380px, 450px"
                    className="object-cover scale-110"
                  />
                </motion.div>

                {/* Jagged / Starburst Explosive Price Blast Badge on Plate (Pin 1 & 3 Reference) */}
                <motion.div
                  initial={{ scale: 0, rotate: -25 }}
                  animate={{ scale: 1, rotate: -12 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 15 }}
                  className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 z-40 bg-gradient-to-br from-[#FFD700] via-[#D4AF37] to-[#B8860B] text-[#110A0A] font-black px-3.5 py-2 sm:px-5 sm:py-3 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] border-2 sm:border-4 border-[#110A0A] flex flex-col items-center"
                >
                  <span className="text-[9px] sm:text-[11px] uppercase tracking-widest font-black leading-none">
                    HOT TARIFF
                  </span>
                  <span className="text-xl sm:text-3xl font-black font-display leading-none mt-0.5">
                    ₹{activeDish.price}
                  </span>
                </motion.div>

                {/* Pure Veg Stamp on Plate */}
                <div className="absolute top-3 left-3 sm:top-5 sm:left-5 z-40 bg-[#141210]/90 backdrop-blur-md p-1.5 sm:p-2 rounded-xl border border-emerald-500/50 shadow-md">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-emerald-400 rounded-sm flex items-center justify-center">
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-400" />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Left/Right Arrow Navigation Buttons on Flyer */}
            <button
              onClick={handlePrev}
              className="absolute left-0 sm:-left-4 z-40 p-2.5 sm:p-3 rounded-full bg-[#1C1213]/90 hover:bg-[#580D1A] text-[#DFC17B] border border-[#D4AF37]/50 shadow-xl transition-all hover:scale-110 active:scale-95"
              aria-label="Previous Dish"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-0 sm:-right-4 z-40 p-2.5 sm:p-3 rounded-full bg-[#1C1213]/90 hover:bg-[#580D1A] text-[#DFC17B] border border-[#D4AF37]/50 shadow-xl transition-all hover:scale-110 active:scale-95"
              aria-label="Next Dish"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. BOTTOM DISH SWITCHER BAR & PROGRESS TIMER (Pins 2 & 3 Interactive Bar) */}
      {/* ========================================================================= */}
      <div className="relative z-20 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4">
        {/* Progress Bar for Auto-play */}
        <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden mb-3">
          <div
            className="bg-gradient-to-r from-[#D4AF37] to-[#EF4444] h-full transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Horizontal Scrollable Dish Selector Strip */}
        <div className="flex items-center justify-start sm:justify-center gap-2.5 overflow-x-auto no-scrollbar pb-2">
          {MOTION_DISHES.map((dish, idx) => {
            const isSelected = idx === currentIndex;
            return (
              <button
                key={dish.id}
                onClick={() => handleSelectDish(idx)}
                className={`flex-shrink-0 flex items-center space-x-2.5 px-3.5 py-2 rounded-xl transition-all duration-300 border text-left ${
                  isSelected
                    ? "bg-[#580D1A] border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.35)] scale-105"
                    : "bg-[#1C1917]/80 hover:bg-[#1C1917] border-white/10 opacity-70 hover:opacity-100"
                }`}
              >
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#D4AF37]/40 flex-shrink-0">
                  <Image
                    src={dish.image}
                    alt={dish.name}
                    fill
                    sizes="32px"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-white whitespace-nowrap leading-tight">
                    {dish.name}
                  </span>
                  <span className="text-[10px] font-bold text-[#DFC17B]">
                    ₹{dish.price}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
