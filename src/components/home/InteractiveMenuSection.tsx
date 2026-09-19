"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  UtensilsCrossed,
  Search,
  Flame,
  Sparkles,
  ArrowRight,
  X,
  Filter,
} from "lucide-react";
import { Category, FoodItem } from "@/types";
import MenuDishCard from "@/components/menu/MenuDishCard";
import DishDetailModal from "@/components/menu/DishDetailModal";

interface InteractiveMenuSectionProps {
  categories: Category[];
  initialItems: FoodItem[];
}

export default function InteractiveMenuSection({
  categories,
  initialItems,
}: InteractiveMenuSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "signature" | "bestseller" | "spicy">("all");
  const [activeModalDish, setActiveModalDish] = useState<FoodItem | null>(null);

  // Filtered Items logic
  const filteredItems = useMemo(() => {
    return initialItems.filter((item) => {
      // Category filter
      if (selectedCategory !== "all" && item.category?.slug !== selectedCategory) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesIng = item.ingredients?.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesIng) return false;
      }

      // Filter types
      if (filterType === "signature" && !item.isSignature) return false;
      if (filterType === "bestseller" && !item.isBestseller) return false;
      if (filterType === "spicy" && !item.isSpicy) return false;

      return true;
    });
  }, [initialItems, selectedCategory, searchQuery, filterType]);

  return (
    <section id="menu-showcase" className="py-20 lg:py-28 bg-[#FAF7F2] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-[#EADBCE] text-[#580D1A]">
            <UtensilsCrossed className="w-3.5 h-3.5 text-[#580D1A]" />
            <span>Curated Culinary Collection</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#2B070E] font-display tracking-tight">
            Explore Our Signature Menu
          </h2>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            Every dish is cooked fresh to order with pure desi ghee, stone-ground batter, and time-honored South Indian kitchen traditions.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 border border-[#EADBCE] shadow-lg mb-10 space-y-4">
          {/* Top row: Search and Tag toggles */}
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Live Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search dosas, idlis, pav bhaji..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-xs font-semibold text-[#2B070E] focus:outline-none focus:ring-2 focus:ring-[#580D1A] transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <button
                onClick={() => setFilterType("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  filterType === "all"
                    ? "bg-[#580D1A] text-white shadow-sm"
                    : "bg-[#F4EFE6] text-stone-700 hover:bg-[#EADBCE]"
                }`}
              >
                All Items
              </button>

              <button
                onClick={() => setFilterType(filterType === "signature" ? "all" : "signature")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                  filterType === "signature"
                    ? "bg-[#580D1A] text-[#DFC17B] border border-[#D4AF37]"
                    : "bg-[#F4EFE6] text-stone-700 hover:bg-[#EADBCE]"
                }`}
              >
                <Sparkles className="w-3 h-3 text-[#C5A059]" />
                <span>Signatures</span>
              </button>

              <button
                onClick={() => setFilterType(filterType === "spicy" ? "all" : "spicy")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                  filterType === "spicy"
                    ? "bg-[#8B1E26] text-white shadow-sm"
                    : "bg-[#F4EFE6] text-stone-700 hover:bg-[#EADBCE]"
                }`}
              >
                <Flame className="w-3 h-3 text-red-500" />
                <span>Spicy</span>
              </button>
            </div>
          </div>

          {/* Category Navigation Tabs (Tactile Page Feel) */}
          <div className="pt-3 border-t border-[#F4EFE6] flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider whitespace-nowrap transition-all ${
                selectedCategory === "all"
                  ? "bg-[#2B070E] text-[#DFC17B] border border-[#D4AF37]/50 shadow-md"
                  : "text-stone-600 hover:bg-[#F4EFE6] hover:text-[#580D1A]"
              }`}
            >
              All Categories ({initialItems.length})
            </button>

            {categories.map((cat) => {
              const count = initialItems.filter((i) => i.category?.slug === cat.slug).length;
              const isSelected = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                    isSelected
                      ? "bg-[#2B070E] text-[#DFC17B] border border-[#D4AF37]/50 shadow-md"
                      : "text-stone-600 hover:bg-[#F4EFE6] hover:text-[#580D1A]"
                  }`}
                >
                  <span>{cat.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? "bg-[#580D1A] text-[#DFC17B]" : "bg-stone-200 text-stone-600"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dish Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <MenuDishCard
                key={item.id}
                item={item}
                onSelectDish={(selected) => setActiveModalDish(selected)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#EADBCE] p-8 space-y-3">
            <Filter className="w-8 h-8 text-[#C5A059] mx-auto opacity-70" />
            <h3 className="text-lg font-bold text-[#2B070E]">No dishes found</h3>
            <p className="text-stone-500 text-xs max-w-sm mx-auto">
              Try modifying your search or clearing the active category filters to view all menu items.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
                setFilterType("all");
              }}
              className="btn-maroon-gold px-4 py-2 rounded-xl text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* View Complete Menu Link */}
        <div className="mt-14 text-center">
          <Link
            href="/menu"
            className="inline-flex items-center space-x-2 btn-maroon-gold px-8 py-3.5 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider shadow-lg"
          >
            <span>Open Dedicated Digital Menu Page</span>
            <ArrowRight className="w-4 h-4 text-[#DFC17B]" />
          </Link>
        </div>
      </div>

      {/* Dish Detail Inspection Modal */}
      <DishDetailModal
        item={activeModalDish}
        onClose={() => setActiveModalDish(null)}
      />
    </section>
  );
}
