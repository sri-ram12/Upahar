"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { FoodItem, Category } from "@/types";
import MenuDishCard from "@/components/menu/MenuDishCard";
import DishDetailModal from "@/components/menu/DishDetailModal";
import { FALLBACK_CATEGORIES, FALLBACK_MENU_ITEMS } from "@/lib/fallback-menu";
import {
  Search,
  Flame,
  Sparkles,
  X,
  UtensilsCrossed,
  Filter,
  Compass,
  Phone,
} from "lucide-react";

function MenuContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";

  const [categories, setCategories] = useState<Category[]>(FALLBACK_CATEGORIES);
  const [items, setItems] = useState<FoodItem[]>(FALLBACK_MENU_ITEMS);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "signature" | "bestseller" | "spicy">("all");
  const [sortBy, setSortBy] = useState("popular");
  const [loading, setLoading] = useState(false);
  const [activeModalDish, setActiveModalDish] = useState<FoodItem | null>(null);

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories && data.categories.length > 0) setCategories(data.categories);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory && selectedCategory !== "all") {
      params.append("category", selectedCategory);
    }
    if (searchQuery.trim()) {
      params.append("search", searchQuery.trim());
    }
    if (filterType === "signature") {
      params.append("signatureOnly", "true");
    } else if (filterType === "bestseller") {
      params.append("bestsellerOnly", "true");
    }
    if (sortBy) {
      params.append("sort", sortBy);
    }

    fetch(`/api/menu?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        let fetched: FoodItem[] = (data.items && data.items.length > 0) ? data.items : [];
        if (filterType === "spicy") {
          fetched = fetched.filter((i) => i.isSpicy);
        }

        // If API returned 0 items (e.g. offline/unseeded DB), filter locally from fallback menu
        if (fetched.length === 0) {
          let local = [...FALLBACK_MENU_ITEMS];
          if (selectedCategory && selectedCategory !== "all") {
            local = local.filter((i) => i.category?.slug === selectedCategory || i.categoryId === selectedCategory);
          }
          if (searchQuery.trim()) {
            const q = searchQuery.trim().toLowerCase();
            local = local.filter(
              (i) =>
                i.name.toLowerCase().includes(q) ||
                i.description.toLowerCase().includes(q) ||
                (i.ingredients && i.ingredients.toLowerCase().includes(q))
            );
          }
          if (filterType === "signature") local = local.filter((i) => i.isSignature);
          if (filterType === "bestseller") local = local.filter((i) => i.isBestseller);
          if (filterType === "spicy") local = local.filter((i) => i.isSpicy);

          if (sortBy === "price-asc") local.sort((a, b) => a.price - b.price);
          else if (sortBy === "price-desc") local.sort((a, b) => b.price - a.price);
          else if (sortBy === "name") local.sort((a, b) => a.name.localeCompare(b.name));
          else local.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

          setItems(local);
        } else {
          setItems(fetched);
        }
      })
      .catch((err) => {
        console.error("API error, using local fallback:", err);
        setItems(FALLBACK_MENU_ITEMS);
      })
      .finally(() => setLoading(false));
  }, [selectedCategory, searchQuery, filterType, sortBy]);

  const clearFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setFilterType("all");
    setSortBy("popular");
  };

  const hasActiveFilters =
    selectedCategory !== "all" ||
    searchQuery !== "" ||
    filterType !== "all" ||
    sortBy !== "popular";

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#380A11] via-[#580D1A] to-[#2B070E] text-[#FAF7F2] py-16 px-4 text-center relative overflow-hidden border-b border-[#D4AF37]/30">
        <div className="max-w-3xl mx-auto relative z-10 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-black/40 border border-[#D4AF37]/40 text-[#DFC17B]">
            <UtensilsCrossed className="w-3.5 h-3.5 text-[#DFC17B]" />
            <span>Daily Fresh Selection</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white">
            The Digital Dining Menu
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Crafted fresh per order with stone-ground batter, pure fragrant desi ghee, and time-honored South Indian spices.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        {/* Search & Filter Bar */}
        <div className="bg-white rounded-3xl shadow-xl p-5 sm:p-6 border border-[#EADBCE] space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search dosas, idlis, pav bhaji, noodles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-xs font-semibold text-[#2B070E] focus:outline-none focus:ring-2 focus:ring-[#580D1A] transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Pills & Sorting */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
              <button
                onClick={() => setFilterType(filterType === "signature" ? "all" : "signature")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border ${
                  filterType === "signature"
                    ? "bg-[#580D1A] text-[#DFC17B] border-[#D4AF37]"
                    : "bg-[#FAF7F2] text-stone-700 border-[#EADBCE] hover:bg-[#EADBCE]"
                }`}
              >
                <Sparkles className="w-3 h-3 text-[#C5A059]" />
                <span>Signatures</span>
              </button>

              <button
                onClick={() => setFilterType(filterType === "bestseller" ? "all" : "bestseller")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border ${
                  filterType === "bestseller"
                    ? "bg-[#580D1A] text-[#FAF7F2] border-[#580D1A]"
                    : "bg-[#FAF7F2] text-stone-700 border-[#EADBCE] hover:bg-[#EADBCE]"
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>Bestsellers</span>
              </button>

              <button
                onClick={() => setFilterType(filterType === "spicy" ? "all" : "spicy")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border ${
                  filterType === "spicy"
                    ? "bg-[#8B1E26] text-white border-[#8B1E26]"
                    : "bg-[#FAF7F2] text-stone-700 border-[#EADBCE] hover:bg-[#EADBCE]"
                }`}
              >
                <Flame className="w-3 h-3 text-red-500" />
                <span>Spicy</span>
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#FAF7F2] border border-[#EADBCE] text-[#2B070E] focus:outline-none focus:ring-2 focus:ring-[#580D1A]"
              >
                <option value="popular">Sort: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs font-bold text-[#74171E] hover:underline px-2 py-1"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pt-2 border-t border-[#F4EFE6] pb-1">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider whitespace-nowrap transition-all ${
                selectedCategory === "all"
                  ? "bg-[#2B070E] text-[#DFC17B] border border-[#D4AF37]/50 shadow-md"
                  : "bg-[#FAF7F2] text-stone-600 hover:text-[#580D1A] border border-[#EADBCE]"
              }`}
            >
              All Categories
            </button>

            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider whitespace-nowrap transition-all ${
                    isSelected
                      ? "bg-[#2B070E] text-[#DFC17B] border border-[#D4AF37]/50 shadow-md"
                      : "bg-[#FAF7F2] text-stone-600 hover:text-[#580D1A] border border-[#EADBCE]"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dish Count Header */}
        <div className="flex justify-between items-center my-6 px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Showing {items.length} {items.length === 1 ? "Dish" : "Dishes"}
          </span>

          <div className="flex items-center space-x-3 text-xs text-stone-600">
            <a
              href="https://maps.app.goo.gl/6611R6FD1JZagSJt9"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#580D1A] font-semibold flex items-center space-x-1"
            >
              <Compass className="w-3.5 h-3.5 text-[#580D1A]" />
              <span>Visit Restaurant</span>
            </a>
            <span>•</span>
            <a
              href="tel:+919885455342"
              className="hover:text-[#580D1A] font-semibold flex items-center space-x-1"
            >
              <Phone className="w-3.5 h-3.5 text-[#580D1A]" />
              <span>Takeaway Inquiries (9885455342)</span>
            </a>
          </div>
        </div>

        {/* Dishes Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="bg-white rounded-3xl border border-[#EADBCE] p-4 h-80 shimmer-gold flex flex-col justify-between"
              >
                <div className="h-44 bg-stone-200/60 rounded-2xl" />
                <div className="space-y-2 mt-4">
                  <div className="h-4 bg-stone-200/60 rounded w-3/4" />
                  <div className="h-3 bg-stone-200/40 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <MenuDishCard
                key={item.id}
                item={item}
                onSelectDish={(dish) => setActiveModalDish(dish)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#EADBCE] p-8 space-y-4">
            <Filter className="w-10 h-10 text-[#C5A059] mx-auto opacity-70" />
            <h3 className="text-xl font-bold text-[#2B070E]">
              No dishes match your selection
            </h3>
            <p className="text-stone-500 text-xs max-w-md mx-auto">
              Please try adjusting your search terms or clearing your filters to explore our full selection of dosas, idlis, tiffins, and fast food.
            </p>
            <button
              onClick={clearFilters}
              className="btn-maroon-gold px-6 py-2.5 rounded-xl text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Dish Inspection Modal */}
      <DishDetailModal
        item={activeModalDish}
        onClose={() => setActiveModalDish(null)}
      />
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-3 border-[#580D1A] border-t-transparent rounded-full animate-spin mx-auto" />
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#580D1A] block">
              Loading Menu...
            </span>
          </div>
        </div>
      }
    >
      <MenuContent />
    </Suspense>
  );
}
