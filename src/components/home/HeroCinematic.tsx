"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Compass,
  ArrowRight,
  Clock,
  Sparkles,
  MapPin,
  ChevronDown,
  MessageSquare,
} from "lucide-react";

interface HeroCinematicProps {
  storeStatus?: {
    isOpen: boolean;
    statusText: string;
    subText: string;
    currentSession?: string;
  } | null;
}

export default function HeroCinematic({ storeStatus }: HeroCinematicProps) {
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-[#141210]">
      {/* Background Cinematic Food Visual */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=1920&q=85"
          alt="UPAHAR Special Ghee Karam Dosa Served Fresh on Banana Leaf"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center scale-105 animate-in fade-in zoom-in-95 duration-1000 ease-out"
        />
        {/* Layered Gradient Overlays: Deep Maroon & Cast Iron */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141210] via-[#2B070E]/75 to-[#141210]/60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(74,14,23,0.4)_0%,rgba(20,18,16,0.85)_100%)]" />
      </div>

      {/* Content Container */}
      <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex flex-col items-center">
        {/* Top Badges: Session & Location */}
        <div className="inline-flex flex-wrap items-center justify-center gap-2 mb-6">
          <div className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#2B070E]/90 border border-[#D4AF37]/40 text-[#DFC17B] backdrop-blur-md shadow-lg">
            <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>
              {storeStatus?.isOpen
                ? `${storeStatus.statusText} • ${storeStatus.currentSession || "Breakfast Session"}`
                : "Open Daily 6:30 AM – 11:00 PM"}
            </span>
          </div>

          <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-black/40 border border-white/10 text-stone-300 backdrop-blur-md">
            <MapPin className="w-3.5 h-3.5 text-[#DFC17B]" />
            <span>1-1, Sangivalasa, ANITS College Road</span>
          </div>
        </div>

        {/* Restaurant Name Tagline */}
        <span className="text-xs sm:text-sm font-black uppercase tracking-[0.3em] text-[#DFC17B] mb-2 drop-shadow-md">
          UPAHAR TIFFINS AND FAST FOOD
        </span>

        {/* Primary Cinematic Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#FAF7F2] font-display max-w-4xl leading-[1.1] drop-shadow-2xl">
          Authentic Flavours.
          <span className="block italic font-normal text-gradient-gold mt-1 sm:mt-2">
            Freshly Served with Warmth.
          </span>
        </h1>

        {/* Refined Brand Substatement */}
        <p className="mt-5 text-sm sm:text-base lg:text-lg text-stone-200 max-w-2xl font-normal leading-relaxed drop-shadow-md">
          From the slow rhythm of dawn stone grinders to sizzling ghee karam dosas and wok-tossed street classics. Experience honest South Indian food culture prepared fresh daily.
        </p>

        {/* Triple Action CTAs (Menu, WhatsApp Owner, Directions) */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
          <Link
            href="/menu"
            className="btn-maroon-gold w-full sm:w-auto px-6 py-3.5 rounded-2xl font-black text-xs sm:text-sm tracking-wide uppercase flex items-center justify-center space-x-2 shadow-lg"
          >
            <span>Explore Complete Menu</span>
            <ArrowRight className="w-4 h-4 text-[#DFC17B]" />
          </Link>

          <a
            href="https://wa.me/919876543210?text=Namaste!%20I%20am%20interested%20in%20visiting%20Upahar%20Tiffins.%20Could%20you%20please%20share%20further%20details%20about%20your%20menu%20and%20table%20seating?"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-xs sm:text-sm tracking-wide text-white bg-emerald-600 hover:bg-emerald-700 border border-emerald-400/40 backdrop-blur-md transition flex items-center justify-center space-x-2 shadow-lg"
          >
            <MessageSquare className="w-4 h-4 text-emerald-100" />
            <span>WhatsApp Owner Directly</span>
          </a>

          <a
            href="https://maps.app.goo.gl/6611R6FD1JZagSJt9"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-xs sm:text-sm tracking-wide text-[#FAF7F2] bg-white/10 hover:bg-white/20 border border-[#D4AF37]/50 backdrop-blur-md transition flex items-center justify-center space-x-2"
          >
            <Compass className="w-4 h-4 text-[#DFC17B]" />
            <span>Visit Restaurant</span>
          </a>
        </div>

        {/* Food Attributes Row */}
        <div className="mt-12 pt-8 border-t border-[#D4AF37]/20 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 text-center text-xs text-stone-300 font-medium">
          <div className="flex flex-col items-center">
            <span className="text-[#DFC17B] font-bold text-sm">Stone-Ground</span>
            <span className="text-[11px] text-stone-400 mt-0.5">Traditional Granite Batter</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[#DFC17B] font-bold text-sm">Pure Desi Ghee</span>
            <span className="text-[11px] text-stone-400 mt-0.5">Rich & Aromatic Roasting</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[#DFC17B] font-bold text-sm">Hourly Sambar</span>
            <span className="text-[11px] text-stone-400 mt-0.5">Simmered with Whole Spices</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[#DFC17B] font-bold text-sm">100% Pure Veg</span>
            <span className="text-[11px] text-stone-400 mt-0.5">Uncompromising Hygiene</span>
          </div>
        </div>

        {/* Scroll Indicator */}
        <a
          href="#story"
          className="mt-10 flex flex-col items-center text-stone-400 hover:text-[#DFC17B] transition text-[11px] uppercase tracking-widest gap-1"
          aria-label="Scroll to Restaurant Story"
        >
          <span>Discover Our Story</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </a>
      </div>
    </section>
  );
}
