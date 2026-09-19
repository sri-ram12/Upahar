"use client";

import React from "react";
import Image from "next/image";
import { Sparkles, Flame, Clock, Info } from "lucide-react";
import { FoodItem } from "@/types";
import TiltCard from "@/components/effects/TiltCard";
import FoggySteamRings from "@/components/effects/FoggySteamRings";

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
        {/* Top Image Container with Visible Foggy Nature & Ring Effects */}
        <div className="relative h-48 sm:h-52 w-full bg-[#F4EFE6] overflow-hidden">
          <FoggySteamRings variant="card" />
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141210]/70 via-transparent to-transparent" />

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
        </div>

        {/* Pure Veg Dietary Badge */}
        <div className="absolute top-3 right-3 bg-white/95 p-1 rounded-md shadow-md z-10">
          <div className="w-3.5 h-3.5 border-2 border-[#2D5A27] rounded-xs flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-[#2D5A27]" />
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
