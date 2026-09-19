"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  MessageSquare,
  ArrowRight,
  Flame,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ExternalLink,
  CheckCircle2,
  Clock,
  Pin,
  Utensils,
  Share2,
} from "lucide-react";

export default function OffersBanner() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [activeVideoTab, setActiveVideoTab] = useState<"dosa" | "noodles" | "idly">("dosa");

  // Authentic Upahar Menu Combos matching exact tariff & categories
  const specials = [
    {
      title: "Upahar Grand Morning Combo",
      timing: "6:30 AM – 11:30 AM",
      desc: "Signature Ghee Karam Dosa + Chitti Idly with Ghee Podi + Crispy Medu Wada (1 Pc) served with drumstick sambar & 3 freshly ground chutneys.",
      tag: "Breakfast Bestseller",
      price: "₹99 Only",
      originalPrice: "₹115 Value",
      image: "/ghee-karam-dosa.jpg",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      whatsappText: "Hello Upahar Tiffins, I would like to order the Upahar Grand Morning Combo (Ghee Karam Dosa + Chitti Idly + Wada) for ₹99.",
    },
    {
      title: "Evening Street Wok Sizzle",
      timing: "4:00 PM – 10:30 PM",
      desc: "High-Flame Wok Veg Fried Rice (or Noodles) + Sizzling Veg Manchurian + Layered Flaky Paratha. (Chicken Fried Rice + Chilli Chicken Combo: ₹190)",
      tag: "Evening Special",
      price: "₹130 Only",
      originalPrice: "₹155 Value",
      image: "/veg-manchurian-noodles.jpg",
      badgeColor: "bg-red-500/20 text-red-300 border-red-500/40",
      whatsappText: "Hello Upahar Fast Food, I want to order the Evening Street Wok Sizzle Combo (Fried Rice + Manchurian) for ₹130.",
    },
    {
      title: "College & Event Catering Packs",
      timing: "Pre-order on WhatsApp",
      desc: "Live cast-iron dosa counters, bulk mini idli trays & fast food party boxes delivered fresh for ANITS students, hostel feasts & family gatherings.",
      tag: "Special Orders",
      price: "Best Group Rates",
      originalPrice: "Custom Boxes",
      image: "/images/upahar_hotel_dining.jpg",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      whatsappText: "Hello Upahar Tiffins & Fast Food, I am looking for catering/bulk order packs for a college gathering / family event.",
    },
  ];

  // Pinterest video ads showcase data
  const videoAds = {
    dosa: {
      title: "Cast-Iron Sizzling Ghee Karam Dosa",
      pinUrl: "https://www.pinterest.com/pin/147211481558048276/",
      tagline: "Golden Crepe • Melting Village Ghee • Garlic Podi",
      image: "/ghee-karam-dosa.jpg",
      duration: "0:15",
      views: "24.8K Saves on Pinterest",
      badge: "🔥 Trending Tava Reel",
      price: "₹45 Only",
    },
    noodles: {
      title: "High-Flame Wok Tossed Schezwan Noodles",
      pinUrl: "https://www.pinterest.com/search/pins/?q=indian%20street%20food%20noodles%20video",
      tagline: "Smoky Wok Char • Crunchy Veggies • Fiery Schezwan",
      image: "/veg-manchurian-noodles.jpg",
      duration: "0:20",
      views: "18.2K Saves on Pinterest",
      badge: "🥢 Street Food Action",
      price: "₹60 / ₹90",
    },
    idly: {
      title: "Button Chitti Idly with Podi & Desi Ghee",
      pinUrl: "https://www.pinterest.com/search/pins/?q=button%20idli%20ghee%20podi%20video",
      tagline: "Steaming Soft • Roasted Podi Ghee Bath • Coconut Dip",
      image: "/images/upahar_chitti_idly.jpg",
      duration: "0:12",
      views: "31.5K Saves on Pinterest",
      badge: "✨ Upahar Exclusive",
      price: "₹40 Only",
    },
  };

  const currentVideo = videoAds[activeVideoTab];

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-br from-[#2B070E] via-[#3D0A13] to-[#1A0307] text-[#FAF7F2] relative overflow-hidden border-y border-[#D4AF37]/30">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-black/60 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ======================================================== */}
        {/* SECTION HEADER                                           */}
        {/* ======================================================== */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#141210]/80 border border-[#D4AF37]/40 text-[#DFC17B] text-xs font-bold uppercase tracking-widest mb-3 shadow-lg">
            <Sparkles className="w-4 h-4 text-[#DFC17B] animate-pulse" />
            <span>Authentic Menu Highlights & Daily Specials</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black font-display text-white tracking-tight leading-tight">
            Curated Taste Experiences & Combos
          </h2>
          <p className="text-stone-300 text-sm sm:text-base mt-3 font-normal max-w-2xl mx-auto leading-relaxed">
            Crafted strictly in pure desi ghee and fresh stone-ground batters. Exact pricing from our live kitchen board.
          </p>
        </div>

        {/* ======================================================== */}
        {/* PINTEREST ANIMATED VIDEO AD SHOWCASE                     */}
        {/* ======================================================== */}
        <div className="mb-16 bg-gradient-to-r from-[#1E0409]/90 via-[#2E0710]/95 to-[#1A0307]/90 rounded-3xl border border-[#D4AF37]/40 p-5 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          
          {/* Pinterest Watermark Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-white/10 mb-6">
            <div className="flex items-center space-x-2.5">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#E60023] text-white font-black text-sm shadow-md">
                P
              </span>
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#DFC17B] flex items-center gap-1.5">
                  <span>Trending on Pinterest Video Ads</span>
                  <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-ping" />
                </span>
                <p className="text-stone-300 text-xs font-medium">
                  Watch sizzling cast-iron tawa & high-flame wok action in dynamic motion
                </p>
              </div>
            </div>

            {/* Video Selector Tabs */}
            <div className="flex items-center bg-black/40 p-1 rounded-2xl border border-white/10 text-xs font-semibold">
              {(["dosa", "noodles", "idly"] as const).map((tabKey) => (
                <button
                  key={tabKey}
                  onClick={() => setActiveVideoTab(tabKey)}
                  className={`px-3.5 py-1.5 rounded-xl transition font-display uppercase tracking-wider text-[11px] ${
                    activeVideoTab === tabKey
                      ? "bg-[#D4AF37] text-black font-black shadow-md"
                      : "text-stone-300 hover:text-white"
                  }`}
                >
                  {tabKey === "dosa" ? "🔥 Ghee Dosa" : tabKey === "noodles" ? "🥢 Wok Noodles" : "✨ Chitti Idly"}
                </button>
              ))}
            </div>
          </div>

          {/* Animated Video Ad Body */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left/Main: 9:16 Pinterest Style Video Ad Mockup / Player */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="relative w-full max-w-[360px] aspect-[9/14] rounded-3xl overflow-hidden shadow-2xl border-2 border-[#D4AF37]/50 group bg-black">
                
                {/* Visual Background (Dynamic Animated Food Reel) */}
                <Image
                  src={currentVideo.image}
                  alt={currentVideo.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 360px"
                  className={`object-cover object-center transition-all duration-700 ease-out ${
                    isPlaying ? "scale-105 filter brightness-95" : "scale-100 filter brightness-75"
                  }`}
                />

                {/* Animated Steam & Vignette Shimmer */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />

                {/* Top Overlay: Pinterest Pin Badges */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
                  <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-[11px] font-black text-amber-300 border border-amber-400/40 flex items-center gap-1.5 shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    {currentVideo.badge}
                  </span>

                  <a
                    href={currentVideo.pinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 rounded-full bg-[#E60023] hover:bg-red-700 text-white text-[11px] font-bold flex items-center gap-1.5 transition shadow-lg"
                  >
                    <span>Save</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Center Pulse Play / Pause Icon Button */}
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-16 h-16 rounded-full bg-black/60 hover:bg-[#E60023] text-white border-2 border-white/80 flex items-center justify-center backdrop-blur-md transition-all duration-300 transform group-hover:scale-110 shadow-2xl"
                    aria-label={isPlaying ? "Pause video" : "Play video"}
                  >
                    {isPlaying ? (
                      <Pause className="w-7 h-7 text-white fill-current" />
                    ) : (
                      <Play className="w-7 h-7 text-white fill-current ml-1" />
                    )}
                  </button>
                </div>

                {/* Sizzle Steam Graphic Indicator */}
                {isPlaying && (
                  <div className="absolute bottom-28 left-6 z-20 flex items-center space-x-1.5 bg-black/60 px-3 py-1 rounded-full border border-white/20 backdrop-blur-sm">
                    <Flame className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                      Sizzling Now On Cast-Iron
                    </span>
                  </div>
                )}

                {/* Bottom Overlay: Video Ad Captions & Pinterest Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-5 z-20 bg-gradient-to-t from-black via-black/80 to-transparent">
                  <span className="text-[11px] font-black uppercase tracking-widest text-[#DFC17B] block mb-1">
                    {currentVideo.tagline}
                  </span>
                  <h3 className="text-lg font-black text-white leading-snug drop-shadow-md">
                    {currentVideo.title}
                  </h3>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/20 text-xs">
                    <span className="font-extrabold text-[#DFC17B] text-base font-display">
                      {currentVideo.price}
                    </span>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition"
                        aria-label={isMuted ? "Unmute audio" : "Mute audio"}
                      >
                        {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>

                      <span className="text-[10px] text-stone-300 font-medium">
                        {currentVideo.views}
                      </span>
                    </div>
                  </div>

                  {/* Animated Progress Bar */}
                  <div className="w-full bg-white/20 h-1 rounded-full mt-3 overflow-hidden">
                    <div
                      className={`h-full bg-[#DFC17B] rounded-full transition-all duration-1000 ${
                        isPlaying ? "w-4/5 animate-pulse" : "w-1/3"
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Video Ad Copy, Dish Pitch & Direct Pinterest Action */}
            <div className="lg:col-span-6 flex flex-col justify-center space-y-4 sm:space-y-5">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg bg-red-900/40 border border-red-500/30 text-red-200 text-xs font-bold w-fit">
                <Pin className="w-3.5 h-3.5 text-red-400" />
                <span>Featured Video Ad • Pinterest Inspiration</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black font-display text-white leading-tight">
                Experience Food Sizzle Right Off the Tava & Wok
              </h3>

              <p className="text-stone-300 text-sm leading-relaxed">
                Watch our authentic South Indian culinary craft: thin golden dosas layered with spicy allam-karam, cloud-like mini idlis bathed in molten ghee podi, and wok-tossed street noodles flame-cooked on high heat.
              </p>

              {/* Highlights List */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-stone-200">
                  <CheckCircle2 className="w-4 h-4 text-[#DFC17B] shrink-0" />
                  <span>100% Stone-ground batter with pure desi village ghee</span>
                </div>
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-stone-200">
                  <CheckCircle2 className="w-4 h-4 text-[#DFC17B] shrink-0" />
                  <span>Piping hot drumstick sambar & 3 freshly stone-ground chutneys</span>
                </div>
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-stone-200">
                  <CheckCircle2 className="w-4 h-4 text-[#DFC17B] shrink-0" />
                  <span>Exact menu board tariff: Ghee Karam Dosa ₹45, Noodles ₹60</span>
                </div>
              </div>

              {/* Action Buttons: WhatsApp Order + Open on Pinterest */}
              <div className="pt-3 flex flex-wrap items-center gap-3">
                <a
                  href={`https://wa.me/919885455342?text=${encodeURIComponent(
                    `Hello Upahar Tiffins, I saw your video ad for ${currentVideo.title} and would like to order!`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm flex items-center space-x-2 transition shadow-lg hover:shadow-emerald-600/30"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Order on WhatsApp Directly</span>
                </a>

                <a
                  href={currentVideo.pinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-[#FAF7F2] font-bold text-xs sm:text-sm flex items-center space-x-2 transition"
                >
                  <Pin className="w-4 h-4 text-[#E60023]" />
                  <span>View Pin on Pinterest</span>
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* ======================================================== */}
        {/* 3 AUTHENTIC MENU COMBO CARDS                             */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {specials.map((sp) => (
            <div
              key={sp.title}
              className="rounded-3xl bg-[#141210]/90 border border-[#D4AF37]/30 shadow-2xl flex flex-col justify-between hover:border-[#D4AF37] transition-all duration-300 group overflow-hidden hover:translate-y-[-4px]"
            >
              {/* Dish Visual Header */}
              <div className="relative h-44 w-full overflow-hidden bg-black/40">
                <Image
                  src={sp.image}
                  alt={sp.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141210] via-transparent to-black/50" />
                
                {/* Tag & Timing Badges */}
                <div className="absolute top-3 left-3 right-3 flex justify-between items-center">
                  <span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-lg border backdrop-blur-md ${sp.badgeColor}`}>
                    {sp.tag}
                  </span>
                  <span className="text-[11px] font-bold text-stone-200 bg-black/70 px-2.5 py-1 rounded-lg border border-white/10 backdrop-blur-md flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#DFC17B]" />
                    <span>{sp.timing}</span>
                  </span>
                </div>
              </div>

              {/* Dish Information */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold font-display text-white group-hover:text-[#DFC17B] transition">
                    {sp.title}
                  </h3>
                  <p className="text-xs text-stone-300 mt-2.5 leading-relaxed">
                    {sp.desc}
                  </p>
                </div>

                {/* Price & WhatsApp Action */}
                <div className="mt-6 pt-4 border-t border-stone-800 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-lg font-black text-[#DFC17B] font-display">
                      {sp.price}
                    </span>
                    <span className="text-[10px] text-stone-400 line-through">
                      {sp.originalPrice}
                    </span>
                  </div>

                  <a
                    href={`https://wa.me/919885455342?text=${encodeURIComponent(sp.whatsappText)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 transition shadow-md hover:shadow-emerald-600/30"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp Inquire</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Link to Full Menu */}
        <div className="mt-12 text-center">
          <Link
            href="/menu"
            className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-[#DFC17B] hover:text-white transition py-2 px-4 rounded-full border border-[#D4AF37]/30 hover:border-[#D4AF37] bg-[#141210]/60"
          >
            <span>Explore All 42+ Authentic Menu Items</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </section>
  );
}
