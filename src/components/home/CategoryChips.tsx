"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Lock } from "lucide-react";
import { Category } from "@/types";
import { isCategoryAvailableInSession, type SessionType } from "@/lib/store-hours";

interface CategoryChipsProps {
  categories: Category[];
  effectiveSession?: SessionType;
  themeParam?: string | null;
}

const FALLBACK_CATEGORY_IMAGES: Record<string, string> = {
  tiffins: "/images/upahar_chitti_idly.jpg",
  dosa: "/ghee-karam-dosa.jpg",
  biryanis: "/images/dishes/chicken-dum-biryani.jpg",
  "evening-specials": "/images/dishes/parotta.jpg",
  noodles: "/veg-manchurian-noodles.jpg",
  "veg-noodles": "/veg-manchurian-noodles.jpg",
  "nonveg-noodles": "/images/dishes/chicken-noodles.jpg",
  "fried-rice": "/chicken-fried-rice.jpg",
  "veg-rice": "/images/dishes/veg-fried-rice.jpg",
  "nonveg-rice": "/chicken-fried-rice.jpg",
  starters: "/images/dishes/chicken-manchurian.jpg",
  "veg-starters": "/images/dishes/paneer-manchurian.jpg",
  "nonveg-starters": "/images/dishes/chicken-manchurian.jpg",
  pickles: "/images/dishes/mango-avakaya.jpg",
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
        <div className="flex items-center justify-between mb-5">
          <span className="text-xs uppercase font-extrabold tracking-widest text-brand-700">
            Explore By Category
          </span>
          <Link
            href={withTheme("/menu")}
            className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center space-x-1"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Circular Image + Down Name Selector Strip (Matches Visual Reference) */}
        <div className="flex items-start space-x-5 sm:space-x-7 overflow-x-auto pb-3 no-scrollbar">
          <Link
            href={withTheme("/menu")}
            className="flex-shrink-0 flex flex-col items-center gap-2 group min-w-[72px]"
          >
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-brand-700 shadow-md group-hover:scale-105 transition">
              <Image
                src="/images/upahar_logo.jpg"
                alt="All Menu"
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
            <span className="text-xs font-extrabold text-brand-950 text-center leading-tight group-hover:text-brand-700">
              All
            </span>
          </Link>

          {categories.map((cat) => {
            const isLocked = !isCategoryAvailableInSession(cat.slug, effectiveSession, cat.division);
            const imgSrc =
              cat.image || FALLBACK_CATEGORY_IMAGES[cat.slug] || "/ghee-karam-dosa.jpg";
            return (
              <Link
                key={cat.id}
                href={withTheme(`/menu?category=${cat.slug}`)}
                className="flex-shrink-0 flex flex-col items-center gap-2 group min-w-[78px] max-w-[96px]"
              >
                <div
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 shadow-md group-hover:scale-105 transition ${
                    isLocked ? "border-amber-400/80" : "border-[#D4AF37]/70 group-hover:border-brand-700"
                  }`}
                >
                  <Image
                    src={imgSrc}
                    alt={cat.name}
                    fill
                    sizes="80px"
                    className={`object-cover ${isLocked ? "grayscale-[20%] brightness-90" : ""}`}
                  />
                  {isLocked && (
                    <span className="absolute inset-0 bg-black/25 flex items-center justify-center">
                      <Lock className="w-4 h-4 text-[#DFC17B]" />
                    </span>
                  )}
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-stone-800 group-hover:text-brand-700 text-center leading-tight line-clamp-2">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
