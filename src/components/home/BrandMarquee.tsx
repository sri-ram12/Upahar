"use client";

import React from "react";
import { Sparkles } from "lucide-react";

export default function BrandMarquee() {
  const brandPillars = [
    "UPAHAR",
    "STONE-GROUND BATTER",
    "PURE DESI GHEE",
    "GHEE KARAM DOSA",
    "BUTTON SAMBAR IDLI",
    "CRISPY MEDU VADA",
    "DEGREE FILTER COFFEE",
    "AMUL BUTTER PAV BHAJI",
    "WOK HAKKA NOODLES",
    "SINCE MORNING LIGHT",
  ];

  return (
    <div className="bg-[#2B070E] py-4 sm:py-5 border-y border-[#D4AF37]/30 overflow-hidden relative select-none">
      {/* Subtle gold gradient edges for smooth fade */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-[#2B070E] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-[#2B070E] to-transparent z-10 pointer-events-none" />

      <div className="animate-marquee flex items-center space-x-8 whitespace-nowrap">
        {brandPillars.concat(brandPillars).map((pillar, idx) => (
          <div key={idx} className="flex items-center space-x-8">
            <span
              className={`text-sm sm:text-lg tracking-[0.22em] uppercase font-display font-bold ${
                pillar === "UPAHAR"
                  ? "text-[#DFC17B] font-black scale-110 drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]"
                  : "text-[#FAF7F2]/80 font-medium"
              }`}
            >
              {pillar}
            </span>
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]/60 flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
