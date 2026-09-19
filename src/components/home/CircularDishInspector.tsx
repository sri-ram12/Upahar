"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Flame,
  Sparkles,
  Clock,
  ArrowRight,
  ShieldCheck,
  MessageSquare,
  ZoomIn,
} from "lucide-react";
import { FoodItem } from "@/types";
import DishDetailModal from "@/components/menu/DishDetailModal";

interface CircularDishInspectorProps {
  items: FoodItem[];
}

export default function CircularDishInspector({ items }: CircularDishInspectorProps) {
  // Select hot signature items for the circular inspector
  const hotItems = items.length > 0
    ? items.slice(0, 8)
    : [
        {
          id: "ghee-karam-dosa",
          name: "Ghee Karam Dosa",
          slug: "ghee-karam-dosa",
          description: "Thin crispy crepe smeared with fiery red garlic allam karam and roasted on high flame with pure fragrant desi ghee.",
          price: 45,
          image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80",
          categoryId: "dosa",
          isVeg: true,
          isSpicy: true,
          isBestseller: true,
          isSignature: true,
          isAvailable: true,
          prepTime: "5-7 mins",
          portionSize: "1 Signature Dosa + 2 Chutneys + Sambar",
          ingredients: "Stone-ground batter, Pure Desi Ghee, Red garlic karam",
          displayOrder: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

  const [activeItem, setActiveItem] = useState<FoodItem>(hotItems[0]);
  const [modalItem, setModalItem] = useState<FoodItem | null>(null);

  return (
    <section className="py-20 sm:py-28 bg-[#141210] text-[#FAF7F2] relative overflow-hidden">
      {/* Background ambient atmospheric lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[#580D1A]/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#580D1A]/90 border border-[#D4AF37]/40 text-[#DFC17B] text-xs font-bold uppercase tracking-widest mb-3 shadow-lg">
            <Flame className="w-3.5 h-3.5 text-[#DFC17B] animate-pulse" />
            <span>Sizzling Hot From Cast-Iron Tava & Wok</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display text-white tracking-tight">
            Circular Dish Inspector
            <span className="block text-gradient-gold text-2xl sm:text-3xl lg:text-4xl mt-1 font-normal italic">
              Steaming Hot Culinary Craft
            </span>
          </h2>
          <p className="text-stone-300 text-xs sm:text-sm mt-3 leading-relaxed">
            Click any circular plate below to inspect our piping hot specials. Notice the realistic rising steam mist straight from our roaring morning tawa and evening Indo-Chinese wok.
          </p>
        </div>

        {/* Circular Interactive Showcase Centerpiece */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center bg-gradient-to-br from-[#1F1918] via-[#181413] to-[#120F0E] rounded-3xl p-6 sm:p-10 border border-[#D4AF37]/30 shadow-2xl">
          {/* Left Column: Sizzling Circular Plate with Rising Foggy Steam Mist */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center relative">
            {/* Concentric Pulsing Heat Waves & Foggy Vapor Aura */}
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 flex items-center justify-center">
              {/* Outer Golden Heat Wave */}
              <div className="absolute inset-0 rounded-full border-2 border-[#D4AF37]/35 ring-glow-gold animate-ring-pulse pointer-events-none" />
              
              {/* Middle Heat Ripple */}
              <div className="absolute inset-4 rounded-full border border-amber-400/30 animate-water-ripple pointer-events-none" />

              {/* Multi-Layer Foggy Steam Clouds Rising Continuously */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 sm:w-64 h-32 foggy-steam-cloud animate-steam-1 z-30 pointer-events-none" />
              <div className="absolute -top-6 left-[40%] -translate-x-1/2 w-40 sm:w-56 h-28 foggy-steam-cloud animate-steam-2 z-30 pointer-events-none" />
              <div className="absolute -top-12 left-[55%] -translate-x-1/2 w-44 sm:w-60 h-32 foggy-steam-cloud animate-steam-3 z-30 pointer-events-none" />

              {/* Main Circular Plate Container */}
              <div className="relative w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-[#D4AF37] shadow-2xl shadow-[#580D1A]/80 z-20 group cursor-pointer"
                onClick={() => setModalItem(activeItem)}
                title="Click to inspect this dish"
              >
                <Image
                  src={activeItem.image}
                  alt={activeItem.name}
                  fill
                  sizes="(max-width: 768px) 300px, 400px"
                  className="object-cover group-hover:scale-108 transition duration-700"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Center Hover Magnifier Prompt */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <div className="bg-[#141210]/90 border border-[#D4AF37] px-3 py-1.5 rounded-full text-xs font-bold text-[#DFC17B] flex items-center space-x-1.5 shadow-xl">
                    <ZoomIn className="w-3.5 h-3.5" />
                    <span>Click to Inspect</span>
                  </div>
                </div>

                {/* Sizzling Hot Pill */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-[#8B1E26]/90 border border-[#D4AF37]/50 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center space-x-1 shadow-md z-30">
                  <Flame className="w-2.5 h-2.5 text-amber-300 animate-pulse" />
                  <span>Sizzling Hot</span>
                </div>

                {/* Bottom Dish Name Overlay */}
                <div className="absolute bottom-3 left-2 right-2 text-center z-30">
                  <span className="text-white font-black text-sm sm:text-base font-display line-clamp-1 drop-shadow-md">
                    {activeItem.name}
                  </span>
                  <span className="text-[#DFC17B] font-extrabold text-xs">
                    ₹{activeItem.price}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-stone-400 mt-4 tracking-wider flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-[#DFC17B]" />
              <span>Click plate to view full ingredients & culinary specs</span>
            </p>
          </div>

          {/* Right Column: Detailed Plate Breakdown & WhatsApp Direct Action */}
          <div className="lg:col-span-6 space-y-5">
            <div className="flex justify-between items-start border-b border-stone-800 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`w-3.5 h-3.5 border-2 rounded-xs flex items-center justify-center ${
                    activeItem.isVeg ? "border-[#2D5A27]" : "border-red-600"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      activeItem.isVeg ? "bg-[#2D5A27]" : "bg-red-600"
                    }`} />
                  </span>
                  <span className="text-xs uppercase font-extrabold tracking-widest text-[#DFC17B]">
                    {activeItem.isVeg ? "Pure Veg" : "Non-Veg Specialty"}
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black font-display text-white mt-1">
                  {activeItem.name}
                </h3>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">
                  Price
                </span>
                <span className="text-3xl font-black text-[#DFC17B] font-display">
                  ₹{activeItem.price}
                </span>
              </div>
            </div>

            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
              {activeItem.description}
            </p>

            {/* Prep Details Grid */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-[#141210] border border-stone-800">
                <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold block">
                  Prep Style
                </span>
                <span className="text-xs font-semibold text-white flex items-center space-x-1 mt-0.5">
                  <Flame className="w-3 h-3 text-[#D4AF37]" />
                  <span>{activeItem.prepTime || "Fresh Live Cooking"}</span>
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#141210] border border-stone-800">
                <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold block">
                  Portion Served
                </span>
                <span className="text-xs font-semibold text-[#DFC17B] truncate block mt-0.5">
                  {activeItem.portionSize || "Standard Restaurant Serving"}
                </span>
              </div>
            </div>

            {activeItem.ingredients && (
              <div className="p-3 rounded-xl bg-[#141210] border border-stone-800">
                <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold block">
                  Key Ingredients & Spices
                </span>
                <span className="text-xs text-stone-300 mt-0.5 block line-clamp-2">
                  {activeItem.ingredients}
                </span>
              </div>
            )}

            {/* Action Row */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setModalItem(activeItem)}
                className="btn-maroon-gold px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide flex items-center space-x-2"
              >
                <ZoomIn className="w-3.5 h-3.5 text-[#DFC17B]" />
                <span>Inspect Dish</span>
              </button>

              <a
                href={`https://wa.me/919885455342?text=${encodeURIComponent(
                  `Namaste Sri Venkat Rao ji! I am checking the ${activeItem.name} (₹${activeItem.price}) on your Upahar website. Could you tell me today's availability and batch timing?`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition shadow-lg"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Inquire on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Circular Selector Wheel: Row of Clickable Circular Plate Thumbnails */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#DFC17B]">
              Select A Hot Circular Plate To Check:
            </span>
            <span className="text-xs text-stone-400">
              {hotItems.length} Sizzling Items
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
            {hotItems.map((item) => {
              const isSelected = activeItem.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveItem(item)}
                  className={`relative p-2 rounded-2xl transition-all duration-300 flex flex-col items-center text-center group border ${
                    isSelected
                      ? "bg-[#2B070E] border-[#D4AF37] shadow-xl shadow-[#580D1A]/50 scale-105"
                      : "bg-[#181413]/70 border-stone-800 hover:border-stone-700 hover:bg-[#181413]"
                  }`}
                >
                  {/* Miniature Circular Plate */}
                  <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 transition ${
                    isSelected ? "border-[#D4AF37] shadow-lg shadow-[#D4AF37]/30" : "border-stone-700 group-hover:border-stone-500"
                  }`}>
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-cover group-hover:scale-110 transition duration-500"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-[#580D1A]/30 border-2 border-[#D4AF37] rounded-full" />
                    )}
                  </div>

                  <span className="text-xs font-bold text-white mt-2 line-clamp-1 group-hover:text-[#DFC17B]">
                    {item.name}
                  </span>
                  <span className="text-[11px] font-black text-[#DFC17B]">
                    ₹{item.price}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dish Detail Modal */}
      {modalItem && (
        <DishDetailModal
          item={modalItem}
          onClose={() => setModalItem(null)}
        />
      )}
    </section>
  );
}
