"use client";

import React from "react";

interface FoggySteamRingsProps {
  variant?: "hero" | "card" | "spotlight";
  className?: string;
}

export default function FoggySteamRings({
  variant = "hero",
  className = "",
}: FoggySteamRingsProps) {
  if (variant === "card") {
    return (
      <div className={`absolute inset-0 overflow-hidden pointer-events-none z-0 ${className}`}>
        {/* Visible Foggy Steam Mist Orb */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-gradient-to-tr from-amber-400/20 via-orange-500/15 to-transparent blur-2xl animate-float-blob" />
        
        {/* Ring-like Pulsating Radar Waves */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border border-amber-400/40 animate-water-ripple" />
      </div>
    );
  }

  if (variant === "spotlight") {
    return (
      <div className={`absolute inset-0 overflow-hidden pointer-events-none z-0 ${className}`}>
        {/* Double Concentric Pulsing Rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-96 sm:h-96 rounded-full border border-[#D4AF37]/35 animate-ring-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-72 sm:h-72 rounded-full border border-amber-500/25 animate-water-ripple" />

        {/* Swirling Foggy Vapor Steam Layers */}
        <div className="absolute -top-10 left-1/4 w-72 h-72 rounded-full bg-gradient-to-br from-amber-200/25 via-red-500/10 to-transparent blur-3xl animate-float-blob" />
        <div className="absolute -bottom-10 right-1/4 w-72 h-72 rounded-full bg-gradient-to-tl from-orange-400/20 via-yellow-300/10 to-transparent blur-3xl animate-float-blob-reverse" />
      </div>
    );
  }

  // Default: Hero Variant (Full Atmospheric Sensory Scene)
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none select-none z-10 ${className}`}>
      {/* 1. Visible Concentric Radar Rings Pulsing from Center Platter */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[540px] h-[340px] sm:h-[540px] rounded-full border-2 border-[#D4AF37]/30 ring-glow-gold animate-ring-pulse pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] sm:w-[380px] h-[220px] sm:h-[380px] rounded-full border border-amber-400/40 animate-water-ripple pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120px] sm:w-[220px] h-[120px] sm:h-[220px] rounded-full border border-white/30 animate-water-ripple pointer-events-none" />

      {/* 2. Floating Foggy Steam Clouds Rising from Tawa & Coffee */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 sm:w-96 h-36 foggy-steam-cloud animate-steam-1" />
      <div className="absolute top-1/4 left-[45%] -translate-x-1/2 w-48 sm:w-80 h-28 foggy-steam-cloud animate-steam-2" />
      <div className="absolute top-[38%] left-[55%] -translate-x-1/2 w-52 sm:w-88 h-32 foggy-steam-cloud animate-steam-3" />

      {/* 3. Ambient Foggy Vapor Aura (Warm Golden Saffron & Maroon) */}
      <div className="absolute top-1/4 left-1/3 w-80 sm:w-[500px] h-80 sm:h-[500px] rounded-full bg-gradient-to-r from-amber-500/20 via-orange-600/15 to-transparent blur-3xl animate-float-blob" />
      <div className="absolute bottom-1/4 right-1/4 w-72 sm:w-[450px] h-72 sm:h-[450px] rounded-full bg-gradient-to-l from-[#74171E]/30 via-amber-400/15 to-transparent blur-3xl animate-float-blob-reverse" />
    </div>
  );
}
