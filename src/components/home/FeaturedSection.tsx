"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Compass } from "lucide-react";
import { FoodItem } from "@/types";
import MenuDishCard from "@/components/menu/MenuDishCard";
import DishDetailModal from "@/components/menu/DishDetailModal";

interface FeaturedSectionProps {
  items: FoodItem[];
}

export default function FeaturedSection({ items }: FeaturedSectionProps) {
  const [selectedDish, setSelectedDish] = useState<FoodItem | null>(null);

  // Take top 6 popular/bestseller dishes
  const popularDishes = items.slice(0, 6);

  return (
    <section className="py-16 sm:py-24 bg-[#FAF7F2] text-[#141210] relative overflow-hidden">
      {/* Background ambient warm maroon gradient glow */}
      <div className="absolute -top-24 right-0 w-96 h-96 bg-[#580D1A]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 left-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#580D1A]/10 text-[#580D1A] text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#580D1A]" />
              <span>Daily Diner Favorites</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display text-[#2B070E]">
              Popular & Bestseller Dishes
            </h2>
            <p className="text-stone-600 text-sm sm:text-base mt-2 max-w-xl">
              Freshly crafted per order using traditional granite stone-ground batter, pure village desi ghee, and time-honored recipes.
            </p>
          </div>

          <Link
            href="/menu"
            className="btn-maroon-gold px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide uppercase flex items-center space-x-2 shadow-md hover:scale-105 transition"
          >
            <span>Explore Full Menu</span>
            <ArrowRight className="w-4 h-4 text-[#DFC17B]" />
          </Link>
        </div>

        {/* Food Cards Grid with 3D Tilt & Visible Foggy Steam */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {popularDishes.map((dish) => (
            <MenuDishCard
              key={dish.id}
              item={dish}
              onSelectDish={(item) => setSelectedDish(item)}
            />
          ))}
        </div>
      </div>

      {/* Dish Detail Modal Inspector with WhatsApp Owner Action */}
      {selectedDish && (
        <DishDetailModal
          item={selectedDish}
          onClose={() => setSelectedDish(null)}
        />
      )}
    </section>
  );
}
