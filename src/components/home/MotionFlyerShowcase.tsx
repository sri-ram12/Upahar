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
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Utensils,
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
  isVeg?: boolean;
  spicyLevel: number;
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
    id: "citti-idly",
    name: "Chitti Idly",
    subtitle: "Soft, Steamed Mini Idlies with Ghee Podi",
    tagline: "GHEE PODI • BUTTON IDLIS • TRADITIONAL",
    badge: "✨ UPAHAR EXCLUSIVE",
    price: 40,
    originalPrice: 45,
    image: "/images/upahar_chitti_idly.jpg",
    category: "Tiffins",
    spicyLevel: 2,
    ingredients: ["Steamed Mini Idlis", "Desi Ghee", "Roasted Karam Podi", "Coconut & Tomato Chutneys"],
    accentColor: "#EAB308",
    bgWord: "CHITTI IDLY",
    highlights: "Tossed fresh in fragrant gun powder and molten ghee, served with 3 signature chutneys.",
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
    id: "masala-dosa",
    name: "Masala Dosa",
    subtitle: "Crispy Golden Crepe with Spiced Potato Mash",
    tagline: "CLASSIC • SATISFYING • AROMATIC",
    badge: "👑 ALL-TIME FAVORITE",
    price: 40,
    originalPrice: 45,
    image: "/butter-masala-dosa.jpg",
    category: "Tiffins",
    spicyLevel: 1,
    ingredients: ["Spiced Potato Palya", "Pure Desi Ghee", "Crisp Golden Crepe", "Coconut Chutney"],
    accentColor: "#D4AF37",
    bgWord: "MASALA DOSA",
    highlights: "Decadent crisp golden crepe filled with fragrant seasoned potato mash.",
  },
  {
    id: "chicken-fried-rice",
    name: "Chicken Fried Rice",
    subtitle: "Wok-Tossed on Roaring High Flame",
    tagline: "SMOKY • FLAVORFUL • TENDER CHICKEN",
    badge: "⚡ FAST FOOD BESTSELLER",
    price: 100,
    originalPrice: 120,
    image: "/chicken-fried-rice.jpg",
    category: "Fast Food",
    isVeg: false,
    spicyLevel: 2,
    ingredients: ["Aromatic Basmati Rice", "Tender Marinated Chicken", "Scrambled Egg", "Crunchy Spring Onions"],
    accentColor: "#EF4444",
    bgWord: "CHICKEN RICE",
    highlights: "High flame wok craft with signature house spice blend & tender chicken pieces.",
  },
  {
    id: "veg-manchurian-noodles",
    name: "Veg Manchurian Noodles",
    subtitle: "Street-Style Spicy Hakka Noodles",
    tagline: "SIZZLING • TASTY • CRISP VEGGIES",
    badge: "🍜 POPULAR CHOICE",
    price: 90,
    originalPrice: 100,
    image: "/veg-manchurian-noodles.jpg",
    category: "Fast Food",
    isVeg: true,
    spicyLevel: 2,
    ingredients: ["Handmade Noodles", "Crispy Manchurian Balls", "Cabbage & Capsicum", "Dark Soya Chilli Glaze"],
    accentColor: "#F97316",
    bgWord: "SPICY NOODLES",
    highlights: "Tossed live on cast-iron wok with shredded bell peppers, cabbage & crispy manchurian.",
  },
];

// Gentle floating garnish particles (drifting linear bob, NO round rotation)
const GARNISHES = [
  { id: 1, emoji: "🌿", initialX: -260, yOffset: -80, duration: 6, delay: 0 },
  { id: 2, emoji: "🌶️", initialX: 280, yOffset: -100, duration: 5.5, delay: 0.4 },
  { id: 3, emoji: "🧄", initialX: -300, yOffset: 120, duration: 7, delay: 0.8 },
  { id: 4, emoji: "✨", initialX: 320, yOffset: 90, duration: 4.8, delay: 0.2 },
];

export default function MotionFlyerShowcase({ items }: { items?: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState<"All" | "Tiffins" | "Fast Food">("All");
  const [highlightProgress, setHighlightProgress] = useState(0);

  const filteredDishes =
    selectedFilter === "All"
      ? MOTION_DISHES
      : MOTION_DISHES.filter((d) => d.category === selectedFilter);

  // Normalize index if filter changes
  const activeIndex = currentIndex % filteredDishes.length;
  const activeDish = filteredDishes[activeIndex] || filteredDishes[0];

  // Automatically move to the next item after highlighting each item for 3 seconds
  useEffect(() => {
    const DURATION = 3000;
    const STEP = 50;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += STEP;
      setHighlightProgress((elapsed / DURATION) * 100);

      if (elapsed >= DURATION) {
        elapsed = 0;
        setHighlightProgress(0);
        setCurrentIndex((prev) => (prev + 1) % filteredDishes.length);
      }
    }, STEP);

    return () => clearInterval(timer);
  }, [currentIndex, filteredDishes.length]);

  const handleSelectDish = (idx: number) => {
    setCurrentIndex(idx);
    setHighlightProgress(0);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredDishes.length) % filteredDishes.length);
    setHighlightProgress(0);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredDishes.length);
    setHighlightProgress(0);
  };

  return (
    <section
      className="relative w-full min-h-[90vh] bg-gradient-to-b from-[#120B0B] via-[#1A0E10] to-[#0E0909] text-[#FAF7F2] overflow-hidden py-14 sm:py-20 select-none flex flex-col justify-between"
      aria-label="What's on our Plate Horizontal Motion Showcase"
    >
      {/* Background Kinetic Watermark Typography */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden opacity-5">
        <span className="text-[20vw] font-black uppercase text-amber-100 whitespace-nowrap tracking-tighter">
          {activeDish.bgWord}
        </span>
      </div>

      {/* Subtle Warm Amber Spotlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.12)_0%,rgba(88,13,26,0.18)_50%,transparent_80%)] pointer-events-none z-0" />

      {/* Floating Ambient Garnish Particles (Gentle floating bob, NO spinning rotation) */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {GARNISHES.map((g) => (
          <motion.div
            key={g.id}
            className="absolute left-1/2 top-1/2 text-2xl select-none"
            initial={{ x: g.initialX, y: g.yOffset, opacity: 0.3 }}
            animate={{
              y: [g.yOffset - 12, g.yOffset + 12, g.yOffset - 12],
              opacity: [0.3, 0.75, 0.3],
            }}
            transition={{
              duration: g.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: g.delay,
            }}
          >
            {g.emoji}
          </motion.div>
        ))}
      </div>

      <div className="relative z-20 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        
        {/* ========================================================================= */}
        {/* 1. "WHAT'S ON OUR PLATE" HEADER & CATEGORY TABS (Wilson Wings Style)      */}
        {/* ========================================================================= */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#1C1213] border border-[#D4AF37]/40 text-[#DFC17B] text-xs font-bold uppercase tracking-widest mb-3 shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-[#DFC17B]" />
            <span>Interactive Culinary Showcase</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black font-display text-white tracking-tight leading-tight">
            What&apos;s on our Plate
          </h2>
          <p className="text-stone-300 text-xs sm:text-sm mt-2 font-normal max-w-xl mx-auto">
            Please serve yourself with our best choices — prepared live on seasoned cast-iron & high-flame wok.
          </p>

          {/* Filter Tabs */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {(["All", "Tiffins", "Fast Food"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedFilter(cat);
                  setCurrentIndex(0);
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                  selectedFilter === cat
                    ? "bg-[#D4AF37] text-black font-black shadow-lg shadow-[#D4AF37]/20 scale-105"
                    : "bg-white/5 hover:bg-white/10 text-stone-300 border border-white/10"
                }`}
              >
                {cat === "All" ? "All Dishes" : cat === "Tiffins" ? "Tiffins & Dosa" : "Fast Food & Wok"}
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. HORIZONTAL LINEAR GLIDE TRACK (No Round Rotation!)                     */}
        {/* ========================================================================= */}
        <div className="relative py-4 sm:py-8 overflow-hidden">
          
          {/* Navigation Glide Buttons */}
          <button
            onClick={handlePrev}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-40 p-3 sm:p-4 rounded-full bg-[#1C1213]/90 hover:bg-[#580D1A] text-[#DFC17B] border border-[#D4AF37]/50 shadow-2xl transition hover:scale-110 active:scale-95 backdrop-blur-md"
            aria-label="Previous Dish"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-40 p-3 sm:p-4 rounded-full bg-[#1C1213]/90 hover:bg-[#580D1A] text-[#DFC17B] border border-[#D4AF37]/50 shadow-2xl transition hover:scale-110 active:scale-95 backdrop-blur-md"
            aria-label="Next Dish"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Linear Gliding Plates Row */}
          <div className="flex items-center justify-center gap-6 sm:gap-10 py-6 min-h-[340px] sm:min-h-[420px]">
            {filteredDishes.map((dish, idx) => {
              const isCenter = idx === activeIndex;
              const offset = idx - activeIndex;

              // Only show items near active window for clean performance
              if (Math.abs(offset) > 2) return null;

              return (
                <motion.div
                  key={dish.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`cursor-pointer transition-all duration-500 flex flex-col items-center ${
                    isCenter ? "z-30 scale-105 sm:scale-110" : "z-10 opacity-40 hover:opacity-75 scale-75 sm:scale-80"
                  }`}
                  initial={{ opacity: 0, x: offset * 120 }}
                  animate={{
                    opacity: isCenter ? 1 : 0.45,
                    x: offset * 30, // Smooth horizontal slide layout
                    y: isCenter ? [-6, 6, -6] : 0, // Gentle floating levitation (NO spinning!)
                  }}
                  transition={{
                    y: isCenter
                      ? { duration: 4.5, repeat: Infinity, ease: "easeInOut" }
                      : { duration: 0.4 },
                    x: { type: "spring", stiffness: 120, damping: 18 },
                    opacity: { duration: 0.35 },
                  }}
                >
                  {/* Plate Container with soft realistic drop shadow (NO 360 rotation!) */}
                  <div
                    className={`relative rounded-full overflow-hidden transition-all duration-500 bg-[#141210] ${
                      isCenter
                        ? "w-52 h-52 sm:w-72 sm:h-72 md:w-80 md:h-80 border-4 sm:border-6 border-[#D4AF37] shadow-[0_25px_60px_rgba(0,0,0,0.95)]"
                        : "w-36 h-36 sm:w-48 sm:h-48 border-2 border-white/20 shadow-xl"
                    }`}
                  >
                    <Image
                      src={dish.image}
                      alt={dish.name}
                      fill
                      priority={isCenter}
                      sizes={isCenter ? "(max-width: 640px) 220px, 320px" : "180px"}
                      className="object-cover transition-transform duration-700 ease-out hover:scale-105"
                    />

                    {/* Sizzle Glow on Center Plate */}
                    {isCenter && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                    )}

                    {/* Hot Tariff Price Stamp on Plate */}
                    {isCenter && (
                      <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-20 bg-gradient-to-br from-[#FFD700] via-[#D4AF37] to-[#B8860B] text-[#110A0A] font-black px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl shadow-xl border-2 border-black/40 flex flex-col items-center">
                        <span className="text-[9px] uppercase tracking-widest font-black leading-none">
                          HOT TARIFF
                        </span>
                        <span className="text-base sm:text-xl font-black font-display leading-none mt-0.5">
                          ₹{dish.price}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Dish Caption below Plate */}
                  <div className="mt-4 text-center max-w-[200px] sm:max-w-[240px]">
                    <h3
                      className={`font-black font-display tracking-tight transition ${
                        isCenter ? "text-lg sm:text-xl text-[#DFC17B]" : "text-sm text-stone-400"
                      }`}
                    >
                      {dish.name}
                    </h3>
                    {isCenter && (
                      <p className="text-[11px] text-stone-300 line-clamp-1 mt-1 font-medium">
                        {dish.subtitle}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. ACTIVE DISH SPOTLIGHT CARD & QUICK WHATSAPP PARCEL ORDER              */}
        {/* ========================================================================= */}
        <div className="max-w-2xl mx-auto mt-4 p-5 sm:p-6 rounded-3xl bg-[#1C1213]/90 border border-[#D4AF37]/35 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <div className="text-center sm:text-left space-y-1.5">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#580D1A] border border-[#D4AF37]/40 text-[#DFC17B] text-[10px] font-bold uppercase tracking-wider">
                <Flame className="w-3 h-3 text-[#DFC17B]" />
                <span>{activeDish.badge}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping ml-1" />
              </div>
              <h4 className="text-xl sm:text-2xl font-black text-white font-display">
                {activeDish.name} • ₹{activeDish.price}
              </h4>
              <p className="text-xs text-stone-300 max-w-md">
                {activeDish.highlights}
              </p>
            </div>

            {/* Direct WhatsApp Parcel CTA */}
            <div className="flex items-center gap-2.5 shrink-0">
              <a
                href={`https://wa.me/919885455342?text=${encodeURIComponent(
                  `Namaste Upahar! I would like to order ${activeDish.name} (₹${activeDish.price}) from the What's on our Plate menu.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm tracking-wide uppercase flex items-center space-x-2 shadow-lg transition hover:scale-105 active:scale-95"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Order Parcel</span>
              </a>

              <Link
                href="/menu"
                className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-[#DFC17B] border border-white/15 text-xs font-bold uppercase flex items-center space-x-1 transition"
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>Menu</span>
              </Link>
            </div>

          </div>

          {/* Automatic Progress Timer Line (Auto-glides after highlight) */}
          <div className="w-full bg-white/10 h-1 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#D4AF37] via-amber-400 to-[#E60023] h-full transition-all duration-75 ease-linear"
              style={{ width: `${highlightProgress}%` }}
            />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. DISH DOT INDICATORS                                                    */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-center space-x-2 mt-6">
          {filteredDishes.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === activeIndex ? "w-8 bg-[#D4AF37]" : "w-2 bg-white/20 hover:bg-white/40"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
