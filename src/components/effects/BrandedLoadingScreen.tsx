"use client";

import React, { useState, useEffect } from "react";
import { UtensilsCrossed, Sparkles } from "lucide-react";

export default function BrandedLoadingScreen() {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<"enter" | "shine" | "exit">("enter");

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const hasSeenLoader = sessionStorage.getItem("upahar_brand_intro_seen");
    if (hasSeenLoader) return;

    setVisible(true);

    const shineTimer = setTimeout(() => setPhase("shine"), 220);
    const exitTimer = setTimeout(() => {
      setPhase("exit");
      sessionStorage.setItem("upahar_brand_intro_seen", "true");
    }, 800);
    const hideTimer = setTimeout(() => setVisible(false), 1100);

    return () => {
      clearTimeout(shineTimer);
      clearTimeout(exitTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  const dismiss = () => {
    sessionStorage.setItem("upahar_brand_intro_seen", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      onClick={dismiss}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#141210] text-[#FAF7F2] cursor-pointer transition-opacity duration-300 select-none ${
        phase === "exit" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      aria-hidden="true"
    >
      {/* Background ambient maroon & gold radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(74,14,23,0.35)_0%,transparent_70%)]" />

      {/* Center Brand Crest */}
      <div className="relative flex flex-col items-center">
        {/* Heritage Emblem */}
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#580D1A] via-[#4A0E17] to-[#2B070E] border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] shadow-2xl shadow-[#4A0E17]/60 mb-4 transition-transform duration-500 scale-100">
          <UtensilsCrossed className="w-8 h-8" />
          <Sparkles className="w-3.5 h-3.5 absolute -top-1 -right-1 text-[#DFC17B] animate-pulse" />
        </div>

        {/* Brand Typography */}
        <div className="flex flex-col items-center text-center">
          <h1 className="text-3xl sm:text-4xl font-black tracking-wider text-[#FAF7F2] font-display flex items-center gap-2">
            <span>UPAHAR</span>
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="h-px w-6 bg-[#C5A059]/60" />
            <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-[#DFC17B]">
              Tiffins & Fast Food
            </span>
            <span className="h-px w-6 bg-[#C5A059]/60" />
          </div>
        </div>

        <p className="text-[11px] text-[#A37F38] mt-4 tracking-widest uppercase font-medium">
          Pure Desi Ghee • Stone-Ground Batter • Since Morning Light
        </p>
      </div>

      <div className="absolute bottom-6 text-[10px] text-stone-500 uppercase tracking-widest">
        Click to enter
      </div>
    </div>
  );
}
