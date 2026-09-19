"use client";

import React from "react";
import Image from "next/image";
import { Sparkles, Flame, Clock, Info } from "lucide-react";
import { FoodItem } from "@/types";
import TiltCard from "@/components/effects/TiltCard";

interface MenuDishCardProps {
  item: FoodItem;
  onSelectDish: (item: FoodItem) => void;
}

export default function MenuDishCard({ item, onSelectDish }: MenuDishCardProps) {
  return (
    <TiltCard maxTilt={5} className="h-full">
      <div
        onClick={() => onSelectDish(item)}
        className="brand-card group cursor-pointer overflow-hidden flex flex-col justify-between h-full bg-white border border-[#EADBCE]/80 hover:border-[#D4AF37] transition-all duration-300 relative"
      >
        {/* Top Image Container – Cinematic Food-Ad Fog & Steam */}
        <div className="relative h-48 sm:h-52 w-full bg-[#1C1917] overflow-hidden">
          <Image
            src={item.image || "/ghee-karam-dosa.jpg"}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141210]/65 via-transparent to-transparent" />

          {/* ── CINEMATIC FOG SYSTEM (Pinterest food-ad style) ── */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Drifting horizontal fog layers */}
            <div className="fog-layer-base animate-fog-drift   absolute bottom-0 left-0 w-full h-2/3" />
            <div className="fog-layer-mid  animate-fog-drift-2 absolute bottom-0 left-0 w-full h-1/2" />
            <div className="fog-layer-top  animate-fog-drift-3 absolute bottom-2 left-0 w-full h-1/3" />
            {/* Rising wispy steam plumes */}
            <div className="steam-wisp      animate-steam-1      absolute bottom-0 left-[18%]         w-10 h-36" />
            <div className="steam-wisp-wide animate-steam-2      absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-44" />
            <div className="steam-wisp      animate-steam-3      absolute bottom-0 right-[18%]        w-10 h-36" />
            <div className="steam-wisp      animate-steam-wisp-1 absolute bottom-0 left-[7%]          w-7  h-28" />
            <div className="steam-wisp      animate-steam-wisp-2 absolute bottom-0 right-[7%]         w-7  h-28" />
            {/* Golden heat shimmer aura */}
            <div className="golden-heat-aura animate-heat-shimmer absolute bottom-0 inset-x-0 h-16" />
          </div>

          {/* Badges on Visual */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            {item.isSignature && (
              <span className="bg-[#580D1A] text-[#DFC17B] text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border border-[#D4AF37]/50 shadow-md">
                Signature
              </span>
            )}
            {item.isBestseller && !item.isSignature && (
              <span className="bg-[#A37F38] text-[#FAF7F2] text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-md flex items-center space-x-1">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Bestseller</span>
              </span>
            )}
            {item.isSpicy && (
              <span className="bg-[#8B1E26] text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center space-x-1 shadow-md">
                <Flame className="w-2.5 h-2.5" />
                <span>Spicy</span>
              </span>
            )}
            <span className="bg-black/60 text-[#DFC17B] text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md backdrop-blur-xs flex items-center space-x-0.5">
              <span>♨️ Hot</span>
            </span>
          </div>

          {/* Pure Veg Dietary Badge */}
          <div className="absolute top-3 right-3 bg-white/95 p-1 rounded-md shadow-md z-10">
            <div className={`w-3.5 h-3.5 border-2 ${item.isVeg ? "border-[#2D5A27]" : "border-[#8B1E26]"} rounded-xs flex items-center justify-center`}>
              <div className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? "bg-[#2D5A27]" : "bg-[#8B1E26]"}`} />
            </div>
          </div>

          {/* Prep Time & Portion Size */}
          <div className="absolute bottom-2.5 left-3 right-3 flex justify-between items-center text-stone-200 text-[11px] font-medium z-10">
            <span className="flex items-center space-x-1 drop-shadow">
              <Clock className="w-3 h-3 text-[#DFC17B]" />
              <span>{item.prepTime || "10-15 mins"}</span>
            </span>

            {item.portionSize && (
              <span className="bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] text-stone-300 font-semibold">
                {item.portionSize}
              </span>
            )}
          </div>
        </div>

      {/* Body Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start gap-2">
            <h4 className="text-base font-bold text-[#2B070E] group-hover:text-[#74171E] transition font-heading line-clamp-1">
              {item.name}
            </h4>
          </div>

          <p className="text-stone-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Price & Inspect Button */}
        <div className="mt-4 pt-3 border-t border-[#F4EFE6] flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
              Price
            </span>
            <span className="text-lg font-black text-[#2B070E] font-display">
              ₹{item.price}
            </span>
          </div>

          <button
            type="button"
            className="inline-flex items-center space-x-1 text-xs font-bold text-[#580D1A] group-hover:text-[#74171E] bg-[#FAF7F2] hover:bg-[#F4EFE6] px-3 py-1.5 rounded-xl border border-[#EADBCE] transition"
          >
            <Info className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Details</span>
          </button>
        </div>
      </div>
    </div>
  </TiltCard>
);
}
