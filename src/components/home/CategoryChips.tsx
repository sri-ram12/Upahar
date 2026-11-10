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
  Lock,
} from "lucide-react";
import { Category } from "@/types";
import { isCategoryAvailableInSession, type SessionType } from "@/lib/store-hours";

interface CategoryChipsProps {
  categories: Category[];
  effectiveSession?: SessionType;
  themeParam?: string | null;
}

const iconMap: Record<string, React.ReactNode> = {
  biryanis: <Flame className="w-4 h-4 text-[#D4AF37]" />,
  "fried-rice": <Flame className="w-4 h-4 text-[#D4AF37]" />,
  noodles: <Soup className="w-4 h-4 text-[#D4AF37]" />,
  starters: <Sparkles className="w-4 h-4 text-[#D4AF37]" />,
  "evening-specials": <UtensilsCrossed className="w-4 h-4 text-[#D4AF37]" />,
  dosa: <Flame className="w-4 h-4 text-[#D4AF37]" />,
  tiffins: <Coffee className="w-4 h-4 text-[#D4AF37]" />,
  "crispy-dosas": <Flame className="w-4 h-4 text-[#D4AF37]" />,
  "idli-and-vada": <Sparkles className="w-4 h-4 text-[#D4AF37]" />,
  "poori-and-tiffins": <UtensilsCrossed className="w-4 h-4 text-[#D4AF37]" />,
  "fast-food-chinese": <Soup className="w-4 h-4 text-[#D4AF37]" />,
  "evening-snacks": <Coffee className="w-4 h-4 text-[#D4AF37]" />,
  beverages: <CupSoda className="w-4 h-4 text-[#D4AF37]" />,
};

export default function CategoryChips({
  categories,
  effectiveSession = "EVENING",
  themeParam = null,
}: CategoryChipsProps) {
  const withTheme = (href: string) => {
    if (!themeParam) return href;
    const sep = href.includes("?") ? "&" : "?";
    return `${href}${sep}theme=${encodeURIComponent(themeParam)}`;
  };

  return (
    <section className="py-8 bg-brand-cream border-b border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs uppercase font-extrabold tracking-widest text-brand-700">
            Explore By Culinary Category
          </span>
          <Link
            href={withTheme("/menu")}
            className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center space-x-1"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Scrollable Category Chips Container */}
        <div className="flex items-center space-x-3 overflow-x-auto pb-2 no-scrollbar">
          <Link
            href={withTheme("/menu")}
            className="flex-shrink-0 px-4 py-2.5 rounded-2xl bg-brand-700 text-[#DFC17B] font-bold text-xs tracking-wide shadow-md hover:bg-brand-600 transition flex items-center space-x-2 border border-[#D4AF37]/50"
          >
            <UtensilsCrossed className="w-3.5 h-3.5 text-[#DFC17B]" />
            <span>Complete Menu</span>
          </Link>

          {categories.map((cat) => {
            const isLocked =
              effectiveSession === "MORNING" && !isCategoryAvailableInSession(cat.slug, "MORNING");
            return (
              <Link
                key={cat.id}
                href={withTheme(`/menu?category=${cat.slug}`)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-2xl font-bold text-xs tracking-wide border transition shadow-xs hover:shadow-md flex items-center space-x-2 group ${
                  isLocked
                    ? "bg-amber-50/75 hover:bg-amber-100 text-amber-950 border-amber-300/70"
                    : "bg-white hover:bg-brand-surface text-brand-950 border-brand-border hover:border-[#D4AF37]"
                }`}
                title={isLocked ? "Opens 12:00 PM – 10:30 PM IST" : cat.name}
              >
                <span>{iconMap[cat.slug] || <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />}</span>
                <span className="group-hover:text-brand-700">{cat.name}</span>
                {isLocked ? (
                  <span className="text-[10px] bg-amber-200/80 text-amber-950 px-1.5 py-0.5 rounded-md font-bold flex items-center gap-0.5">
                    <Lock className="w-2.5 h-2.5" />
                    <span>12 PM</span>
                  </span>
                ) : (
                  cat._count?.items !== undefined && (
                    <span className="text-[10px] bg-brand-cream group-hover:bg-brand-700 group-hover:text-white px-1.5 py-0.5 rounded-md text-stone-500 font-bold border border-brand-border">
                      {cat._count.items}
                    </span>
                  )
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
