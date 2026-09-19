"use client";

import React from "react";
import Link from "next/link";
import {
  Flame,
  Sparkles,
  UtensilsCrossed,
  Soup,
  Coffee,
  CupSoda,
  ChevronRight,
} from "lucide-react";
import { Category } from "@/types";

interface CategoryChipsProps {
  categories: Category[];
}

const iconMap: Record<string, React.ReactNode> = {
  "crispy-dosas": <Flame className="w-4 h-4 text-[#D4AF37]" />,
  "idli-and-vada": <Sparkles className="w-4 h-4 text-[#D4AF37]" />,
  "poori-and-tiffins": <UtensilsCrossed className="w-4 h-4 text-[#D4AF37]" />,
  "fast-food-chinese": <Soup className="w-4 h-4 text-[#D4AF37]" />,
  "evening-snacks": <Coffee className="w-4 h-4 text-[#D4AF37]" />,
  beverages: <CupSoda className="w-4 h-4 text-[#D4AF37]" />,
};

export default function CategoryChips({ categories }: CategoryChipsProps) {
  return (
    <section className="py-8 bg-[#FAF7F2] border-b border-[#EADBCE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#580D1A]">
            Explore By Culinary Category
          </span>
          <Link
            href="/menu"
            className="text-xs font-bold text-[#74171E] hover:text-[#4A0E17] flex items-center space-x-1"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Scrollable Category Chips Container */}
        <div className="flex items-center space-x-3 overflow-x-auto pb-2 no-scrollbar">
          <Link
            href="/menu"
            className="flex-shrink-0 px-4 py-2.5 rounded-2xl bg-[#580D1A] text-[#DFC17B] font-bold text-xs tracking-wide shadow-md hover:bg-[#74171E] transition flex items-center space-x-2 border border-[#D4AF37]/50"
          >
            <UtensilsCrossed className="w-3.5 h-3.5 text-[#DFC17B]" />
            <span>Complete Menu</span>
          </Link>

          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/menu?category=${cat.slug}`}
              className="flex-shrink-0 px-4 py-2.5 rounded-2xl bg-white hover:bg-[#F4EFE6] text-[#2B070E] font-bold text-xs tracking-wide border border-[#EADBCE] hover:border-[#D4AF37] transition shadow-xs hover:shadow-md flex items-center space-x-2.5 group"
            >
              <span>{iconMap[cat.slug] || <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />}</span>
              <span className="group-hover:text-[#580D1A]">{cat.name}</span>
              {cat._count?.items !== undefined && (
                <span className="text-[10px] bg-[#FAF7F2] group-hover:bg-[#580D1A] group-hover:text-white px-1.5 py-0.5 rounded-md text-stone-500 font-bold border border-[#EADBCE]">
                  {cat._count.items}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
