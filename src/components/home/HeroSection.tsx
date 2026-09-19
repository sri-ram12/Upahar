"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Clock,
  MapPin,
  Sparkles,
  ArrowRight,
  Compass,
  MessageSquare,
  ShieldCheck,
  Flame,
  Phone,
} from "lucide-react";
import RealisticWaterEngine from "@/components/effects/RealisticWaterEngine";
import FoggySteamRings from "@/components/effects/FoggySteamRings";

interface HeroSectionProps {
  storeStatus?: {
    isOpen: boolean;
    statusText: string;
    subText: string;
    currentSession?: string;
  } | null;
}

export default function HeroSection({ storeStatus }: HeroSectionProps) {
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-[#141210]">
      {/* Background Visual with Deep Maroon Vignette */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=1920&q=85"
          alt="UPAHAR Special Ghee Karam Dosa on Banana Leaf"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center scale-105"
        />
        {/* Layered Maroon & Cast Iron Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141210] via-[#380A11]/85 to-[#141210]/70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(88,13,26,0.5)_0%,rgba(20,18,16,0.92)_100%)]" />
      </div>

      {/* Signature Realistic Water-Throw Stream Engine */}
      <RealisticWaterEngine
        intensity="high"
        showStream={true}
        className="absolute inset-0 z-[5] pointer-events-none opacity-85"
      />

      {/* Visible Foggy Steam Mist & Concentric Radar Rings */}
      <FoggySteamRings variant="hero" />

      {/* Main Content Area */}
      <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center flex flex-col items-center">
        {/* Live Operating Status & Sangivalasa Location Badges */}
        <div className="inline-flex flex-wrap items-center justify-center gap-2.5 mb-6">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#2B070E]/90 border border-[#D4AF37]/50 text-[#DFC17B] backdrop-blur-md shadow-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <Clock className="w-3.5 h-3.5 text-[#DFC17B]" />
            <span>
              {storeStatus?.isOpen
                ? `${storeStatus.statusText} • ${storeStatus.subText}`
                : "Morning 6:00 AM – 10:00 AM • Evening 6:00 PM – 10:30 PM"}
            </span>
          </div>

          <a
            href="https://maps.app.goo.gl/6611R6FD1JZagSJt9"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-black/40 hover:bg-black/60 border border-white/20 text-stone-200 backdrop-blur-md transition hover:border-[#D4AF37]"
          >
            <MapPin className="w-3.5 h-3.5 text-[#DFC17B]" />
            <span>1-1, Sangivalasa, ANITS Road, Beside SBI</span>
          </a>
        </div>

        {/* ================================================================= */}
        {/* CENTER OF ATTRACTION: OFFICIAL UPAHAR EMBLEM LOGO                 */}
        {/* ================================================================= */}
        <div className="relative mb-6 group select-none">
          {/* Outer Radiant Gold Halo & Concentric Glow */}
          <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-[#D4AF37]/30 via-[#580D1A]/50 to-[#2D5A27]/40 blur-xl animate-pulse pointer-events-none" />
          <div className="absolute -inset-1 rounded-full border-2 border-[#D4AF37]/60 ring-glow-gold animate-ring-pulse pointer-events-none" />

          {/* Logo Crest Circle */}
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-[#D4AF37] shadow-2xl shadow-[#580D1A] bg-[#580D1A] flex items-center justify-center transition-transform duration-700 group-hover:scale-105">
            <Image
              src="/images/upahar_logo.jpg"
              alt="UPAHAR - Sunrise to Sunset Official Emblem"
              fill
              priority
              sizes="(max-width: 640px) 150px, (max-width: 768px) 180px, 200px"
              className="object-cover"
            />
          </div>

          {/* Floating Pure Leaf-Green Badge */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#1E4D2B] text-[#DFC17B] border border-[#D4AF37]/60 px-3.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center space-x-1 whitespace-nowrap">
            <Sparkles className="w-2.5 h-2.5 text-[#DFC17B]" />
            <span>Sunrise To Sunset</span>
          </div>
        </div>

        {/* Primary Editorial Display Heading */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#FAF7F2] font-display max-w-4xl leading-[1.1] drop-shadow-2xl">
          Fresh Tiffins.
          <span className="block italic font-normal text-gradient-gold mt-1 sm:mt-2">
            Delicious Fast Food.
          </span>
        </h1>

        {/* Tagline / Subtitle */}
        <p className="mt-4 text-sm sm:text-base lg:text-lg text-stone-200 max-w-2xl font-normal leading-relaxed drop-shadow-md">
          Good Food • Good Mood. Sizzling golden ghee karam dosas, cloud-soft idlys, and wok-tossed noodles crafted fresh per order beside SBI, ANITS College Road.
        </p>

        {/* Primary Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
          <Link
            href="/menu"
            className="btn-maroon-gold w-full sm:w-auto px-7 py-3.5 rounded-2xl font-black text-xs sm:text-sm tracking-wide uppercase flex items-center justify-center space-x-2 shadow-xl hover:scale-105 transition"
          >
            <span>Explore Complete Menu</span>
            <ArrowRight className="w-4 h-4 text-[#DFC17B]" />
          </Link>

          <a
            href="https://wa.me/919885455342?text=Namaste!%20I%20am%20interested%20in%20visiting%20Upahar%20Tiffins%20and%20Fast%20Food%20at%20Sangivalasa.%20Could%20you%20please%20share%20today's%20menu%20specials%20and%20batch%20timings?"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-xs sm:text-sm tracking-wide text-white bg-emerald-600 hover:bg-emerald-700 border border-emerald-400/40 backdrop-blur-md transition flex items-center justify-center space-x-2 shadow-xl hover:scale-105"
          >
            <MessageSquare className="w-4 h-4 text-emerald-100" />
            <span>WhatsApp Owner (9885455342)</span>
          </a>

          <a
            href="https://maps.app.goo.gl/6611R6FD1JZagSJt9"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-xs sm:text-sm tracking-wide text-[#FAF7F2] bg-white/10 hover:bg-white/20 border border-[#D4AF37]/50 backdrop-blur-md transition flex items-center justify-center space-x-2 shadow-lg hover:scale-105"
          >
            <Compass className="w-4 h-4 text-[#DFC17B]" />
            <span>Get Directions (Google Maps)</span>
          </a>
        </div>

        {/* 4 Pillars Highlight Row */}
        <div className="mt-12 pt-8 border-t border-[#D4AF37]/25 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 text-center text-xs text-stone-300 font-medium">
          <div className="flex flex-col items-center">
            <span className="text-[#DFC17B] font-bold text-sm">Morning Tiffins</span>
            <span className="text-[11px] text-stone-400 mt-0.5">6:00 AM – 10:00 AM</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[#DFC17B] font-bold text-sm">Evening Fast Food</span>
            <span className="text-[11px] text-stone-400 mt-0.5">6:00 PM – 10:30 PM</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[#DFC17B] font-bold text-sm">Pure Desi Ghee</span>
            <span className="text-[11px] text-stone-400 mt-0.5">Rich & Aromatic Roasting</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[#DFC17B] font-bold text-sm">Door Delivery</span>
            <span className="text-[11px] text-stone-400 mt-0.5">Minimum Order Basis</span>
          </div>
        </div>
      </div>
    </section>
  );
}
