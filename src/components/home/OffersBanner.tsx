"use client";

import React, { useState, useRef, useEffect } from "react";
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
  CheckCircle2,
  Clock,
  Utensils,
  Video,
} from "lucide-react";

export default function OffersBanner() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

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

  // 3 Animated Video Ads Showcase data (with custom animated videos)
  const videoAds = {
    starters: {
      id: "starters",
      title: "Crispy Sizzling Chicken & Veg Bites",
      tagline: "Golden Crisp • High-Flame Wok Tossed • Signature Spices",
      image: "/images/dishes/chicken-manchurian.jpg",
      videoUrl: "/videos/video1.mp4", // Downloaded from Pinterest pin https://pin.it/1jsvNhmkB
      duration: "0:12",
      badge: "🔥 Live Sizzle Action",
      price: "₹100 / ₹70",
      dishHighlight: "Crispy Chicken Manchurian & Chilli Paneer tossed fresh on order",
    },
    noodles: {
      id: "noodles",
      title: "High-Flame Wok Tossed Schezwan Noodles",
      tagline: "Smoky Wok Char • Crunchy Garden Veggies • Spicy Glaze",
      image: "/veg-manchurian-noodles.jpg",
      videoUrl: "/videos/video2.mp4", // Awaiting your 2nd video
      duration: "0:15",
      badge: "🥢 Wok Flame Sizzle",
      price: "₹60 / ₹90",
      dishHighlight: "High-heat stir fried noodles with fresh veggies & garlic sauce",
    },
    dosa: {
      id: "dosa",
      title: "Cast-Iron Sizzling Ghee Karam Dosa",
      tagline: "Golden Crepe • Melting Desi Ghee • Fiery Garlic Podi",
      image: "/ghee-karam-dosa.jpg",
      videoUrl: "/videos/video3.mp4", // Awaiting your 3rd video
      duration: "0:15",
      badge: "✨ Hot Tava Special",
      price: "₹45 Only",
      dishHighlight: "Roasted crisp on cast-iron tava with pure ghee & garlic karam",
    },
  };

  const [activeVideoTab, setActiveVideoTab] = useState<"starters" | "noodles" | "dosa">("starters");

  const currentVideo = videoAds[activeVideoTab];

  // Handle Play/Pause toggle on active video
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
    }
    setIsPlaying(!isPlaying);
  };

  // Sync mute state with video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

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
        {/* ANIMATED VIDEO ADS SHOWCASE                              */}
        {/* ======================================================== */}
        <div className="mb-16 bg-gradient-to-r from-[#1E0409]/95 via-[#2E0710]/95 to-[#1A0307]/95 rounded-3xl border border-[#D4AF37]/40 p-5 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          
          {/* Header Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-white/10 mb-6">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-[#580D1A] border border-[#D4AF37]/40 text-[#DFC17B] shadow-md">
                <Video className="w-5 h-5 text-[#DFC17B]" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#DFC17B] flex items-center gap-2">
                  <span>Live Kitchen Sizzle & Tava Action</span>
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                </span>
                <p className="text-stone-300 text-xs font-medium">
                  Watch our chefs prepare signature dishes fresh on cast-iron and high-flame wok
                </p>
              </div>
            </div>

            {/* Video Selector Tabs */}
            <div className="flex items-center bg-black/40 p-1 rounded-2xl border border-white/10 text-xs font-semibold">
              {(["starters", "noodles", "dosa"] as const).map((tabKey) => (
                <button
                  key={tabKey}
                  onClick={() => setActiveVideoTab(tabKey)}
                  className={`px-3.5 py-1.5 rounded-xl transition font-display uppercase tracking-wider text-[11px] ${
                    activeVideoTab === tabKey
                      ? "bg-[#D4AF37] text-black font-black shadow-md"
                      : "text-stone-300 hover:text-white"
                  }`}
                >
                  {tabKey === "starters"
                    ? "🔥 Crispy Sizzle (Video 1)"
                    : tabKey === "noodles"
                    ? "🥢 Wok Noodles (Video 2)"
                    : "✨ Ghee Dosa (Video 3)"}
                </button>
              ))}
            </div>
          </div>

          {/* Animated Video Ad Body */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left/Main: 9:16 Vertical Video Ad Showcase */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="relative w-full max-w-[360px] aspect-[9/14] rounded-3xl overflow-hidden shadow-2xl border-2 border-[#D4AF37]/50 group bg-black">
                
                {/* Visual Video Element or Image Fallback */}
                <div className="relative w-full h-full">
                  <Image
                    src={currentVideo.image}
                    alt={currentVideo.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 360px"
                    className={`object-cover object-center transition-all duration-700 ease-out ${
                      isPlaying ? "scale-105 filter brightness-95" : "scale-100 filter brightness-75"
                    }`}
                  />

                  {/* HTML5 Video Layer */}
                  <video
                    ref={videoRef}
                    key={currentVideo.videoUrl}
                    src={currentVideo.videoUrl}
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover z-10"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                </div>

                {/* Layered Vignette Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent pointer-events-none z-20" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none z-20" />

                {/* Top Overlay: Live Cooking Badges */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-30">
                  <span className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-[11px] font-black text-amber-300 border border-amber-400/40 flex items-center gap-1.5 shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    {currentVideo.badge}
                  </span>

                  <span className="px-3 py-1 rounded-full bg-[#580D1A]/90 border border-[#D4AF37]/40 text-[#DFC17B] text-[11px] font-bold shadow-lg">
                    {currentVideo.duration}
                  </span>
                </div>

                {/* Center Pulse Play / Pause Icon Button */}
                <div className="absolute inset-0 flex items-center justify-center z-30">
                  <button
                    onClick={togglePlayPause}
                    className="w-16 h-16 rounded-full bg-black/60 hover:bg-[#580D1A] text-white border-2 border-[#D4AF37] flex items-center justify-center backdrop-blur-md transition-all duration-300 transform group-hover:scale-110 shadow-2xl"
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
                  <div className="absolute bottom-28 left-6 z-30 flex items-center space-x-1.5 bg-black/70 px-3 py-1 rounded-full border border-amber-400/30 backdrop-blur-sm">
                    <Flame className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                      Sizzling Fresh Daily
                    </span>
                  </div>
                )}

                {/* Bottom Overlay: Video Ad Details */}
                <div className="absolute bottom-0 left-0 right-0 p-5 z-30 bg-gradient-to-t from-black via-black/85 to-transparent">
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

                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition flex items-center space-x-1"
                      aria-label={isMuted ? "Unmute audio" : "Mute audio"}
                    >
                      {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      <span className="text-[10px]">{isMuted ? "Muted" : "Sound"}</span>
                    </button>
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

            {/* Right: Video Ad Copy, Dish Highlights & Direct Action */}
            <div className="lg:col-span-6 flex flex-col justify-center space-y-4 sm:space-y-5">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg bg-[#580D1A]/80 border border-[#D4AF37]/30 text-[#DFC17B] text-xs font-bold w-fit">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Featured Animated Cooking Reel</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black font-display text-white leading-tight">
                Experience Culinary Perfection in Dynamic Motion
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

              {/* Action Buttons: WhatsApp Order + Explore Menu */}
              <div className="pt-3 flex flex-wrap items-center gap-3">
                <a
                  href={`https://wa.me/919885455342?text=${encodeURIComponent(
                    `Hello Upahar Tiffins, I saw your video showcase for ${currentVideo.title} and would like to order!`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm flex items-center space-x-2 transition shadow-lg hover:shadow-emerald-600/30"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Order on WhatsApp Directly</span>
                </a>

                <Link
                  href="/menu"
                  className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-[#FAF7F2] font-bold text-xs sm:text-sm flex items-center space-x-2 transition"
                >
                  <Utensils className="w-4 h-4 text-[#DFC17B]" />
                  <span>View Complete Menu</span>
                </Link>
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
