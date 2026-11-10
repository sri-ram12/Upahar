"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FoodItem, Category } from "@/types";
import MenuDishCard from "@/components/menu/MenuDishCard";
import DishDetailModal from "@/components/menu/DishDetailModal";
import { FALLBACK_CATEGORIES, FALLBACK_MENU_ITEMS } from "@/lib/fallback-menu";
import { useRealtimeEvents } from "@/hooks/useRealtimeEvents";
import { useCart } from "@/context/CartContext";
import {
  UPAHAR_DIVISION_LIST,
  getDivisionForCategory,
  type DivisionKey,
} from "@/lib/store-hours";
import {
  Search,
  Flame,
  Sparkles,
  X,
  UtensilsCrossed,
  Filter,
  Compass,
  Phone,
  Lock,
  Plus,
  Minus,
} from "lucide-react";

const FALLBACK_CAT_IMAGES: Record<string, string> = {
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

function MenuContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const initialDivision = (searchParams.get("division") as DivisionKey | "all") || "all";

  const { addToCart, updateQuantity, getItemQuantity } = useCart();

  const [categories, setCategories] = useState<Category[]>(FALLBACK_CATEGORIES);
  const [items, setItems] = useState<FoodItem[]>(FALLBACK_MENU_ITEMS);
  const [selectedDivision, setSelectedDivision] = useState<DivisionKey | "all">(initialDivision);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "signature" | "bestseller" | "spicy">("all");
  const [sortBy, setSortBy] = useState("popular");
  const [loading, setLoading] = useState(false);
  const [activeModalDish, setActiveModalDish] = useState<FoodItem | null>(null);
  const [emergencyNotice, setEmergencyNotice] = useState<string | null>(null);
  const [subsiteStatuses, setSubsiteStatuses] = useState<Record<string, any>>({});

  useEffect(() => {
    fetch("/api/restaurant")
      .then((r) => r.json())
      .then((d) => {
        if (d?.settings?.isEmergencyWebsiteStopped) {
          setEmergencyNotice(
            d.settings.emergencyStopMessage ||
              "Online ordering is temporarily paused by restaurant administration."
          );
        }
        if (Array.isArray(d?.subsites)) {
          const map: Record<string, any> = {};
          for (const s of d.subsites) {
            map[s.id] = s;
          }
          setSubsiteStatuses(map);
        }
      })
      .catch(() => {});
  }, []);

  useRealtimeEvents({
    onMenuItemUpdated: (payload) => {
      setItems((prev) =>
        prev.map((it) =>
          it.id === payload.itemId
            ? { ...it, isAvailable: payload.isAvailable, price: payload.price ?? it.price }
            : it
        )
      );
    },
    onEmergencyStopChanged: (payload) => {
      if (payload.isEmergencyWebsiteStopped) {
        setEmergencyNotice(
          payload.emergencyStopMessage ||
            "Online ordering is temporarily paused by restaurant administration."
        );
      } else {
        setEmergencyNotice(null);
      }
    },
  });

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories && data.categories.length > 0) setCategories(data.categories);
      })
      .catch((err) => console.error(err));
  }, []);

  const visibleCategories = useMemo(() => {
    if (selectedDivision === "all") return categories;
    return categories.filter((c) => getDivisionForCategory(c) === selectedDivision);
  }, [categories, selectedDivision]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory && selectedCategory !== "all") {
      params.append("category", selectedCategory);
    } else if (selectedDivision !== "all") {
      params.append("division", selectedDivision);
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
    params.append("respectSession", "true");
    params.append("includeLocked", "true");

    fetch(`/api/menu?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        let fetched: FoodItem[] = data.items && data.items.length > 0 ? data.items : [];
        if (filterType === "spicy") {
          fetched = fetched.filter((i) => i.isSpicy);
        }
        setItems(fetched);
      })
      .catch((err) => {
        console.error("API error, using local fallback:", err);
        setItems(FALLBACK_MENU_ITEMS);
      })
      .finally(() => setLoading(false));
  }, [selectedCategory, selectedDivision, searchQuery, filterType, sortBy]);

  const clearFilters = () => {
    setSelectedDivision("all");
    setSelectedCategory("all");
    setSearchQuery("");
    setFilterType("all");
    setSortBy("popular");
  };

  const hasActiveFilters =
    selectedDivision !== "all" ||
    selectedCategory !== "all" ||
    searchQuery !== "" ||
    filterType !== "all" ||
    sortBy !== "popular";

  return (
    <div className="min-h-screen bg-brand-cream pb-24">
      {/* Light Hub Header Banner */}
      <div className="bg-gradient-to-b from-white to-[#FAF8F4] text-[#1C1917] py-12 px-4 text-center border-b border-[#E7E0D3]">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-[#FAF8F4] border border-[#E7E0D3] text-[#580D1A]">
            <UtensilsCrossed className="w-3.5 h-3.5 text-[#9A6E24]" />
            <span>Complete Upahar Directory</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-[#1C1917]">
            Explore All 4 Upahar Menus
          </h1>
          <p className="text-[#57534E] text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            Browse Tiffins, Biryanis, Fast Foods, and 24×7 Pickles here — or jump directly into any dedicated themed sub-website below.
          </p>

          {/* 4 Sub-Website Filter / Launch Strip */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedDivision("all");
                setSelectedCategory("all");
              }}
              className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-bold border transition cursor-pointer ${
                selectedDivision === "all"
                  ? "bg-[#1C1917] text-white border-[#1C1917]"
                  : "bg-white text-stone-700 border-[#E7E0D3] hover:bg-[#FAF8F4]"
              }`}
            >
              All 4 Kitchens
            </button>

            {UPAHAR_DIVISION_LIST.map((div) => {
              const live = subsiteStatuses[div.key]?.status;
              const isSelected = selectedDivision === div.key;
              return (
                <div key={div.key} className="inline-flex items-center rounded-full border border-[#E7E0D3] bg-white overflow-hidden shadow-2xs max-w-full">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDivision(div.key);
                      setSelectedCategory("all");
                    }}
                    className={`px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      isSelected ? "bg-[#580D1A] text-white" : "text-stone-800 hover:bg-[#FAF8F4]"
                    }`}
                  >
                    <span className="truncate">{div.title}</span>
                    {live && (
                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          live.isOpen ? "bg-emerald-500" : "bg-amber-400"
                        }`}
                      />
                    )}
                  </button>
                  <Link
                    href={div.route}
                    className="px-2 sm:px-2.5 py-1.5 sm:py-2 text-[10px] font-black uppercase tracking-wider bg-[#FAF8F4] hover:bg-[#EFE9DC] text-[#580D1A] border-l border-[#E7E0D3] whitespace-nowrap"
                    title={`Open ${div.title} Sub-Website`}
                  >
                    Open →
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 relative z-20 space-y-6">
        {emergencyNotice && (
          <div className="p-4 rounded-2xl bg-red-600 text-white text-xs font-bold shadow-lg">
            🚨 {emergencyNotice}
          </div>
        )}

        {/* Search, Circular Categories & Circular Quick-Pick Strip */}
        <div className="bg-white rounded-3xl shadow-sm p-4 sm:p-6 border border-[#E7E0D3] space-y-5">
          {/* Circular Categories Strip (Matching Reference Image 2) */}
          <div className="flex items-start gap-5 sm:gap-7 overflow-x-auto pb-2 no-scrollbar border-b border-stone-100">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className="flex-shrink-0 flex flex-col items-center gap-2 pb-2 relative cursor-pointer min-w-[72px]"
            >
              <div
                className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 transition shadow-sm ${
                  selectedCategory === "all"
                    ? "border-[#580D1A] ring-2 ring-[#580D1A]/30 scale-105"
                    : "border-stone-200"
                }`}
              >
                <Image src="/images/upahar_logo.jpg" alt="All Categories" fill sizes="80px" className="object-cover" />
              </div>
              <span className={`text-xs font-extrabold ${selectedCategory === "all" ? "text-[#580D1A]" : "text-stone-600"}`}>
                All
              </span>
              {selectedCategory === "all" && (
                <span className="absolute bottom-0 left-2 right-2 h-[3px] rounded-full bg-[#580D1A]" />
              )}
            </button>

            {visibleCategories.map((cat) => {
              const isSelected = selectedCategory === cat.slug;
              const divKey = getDivisionForCategory(cat);
              const divStatus = subsiteStatuses[divKey]?.status;
              const isLockedCat = divStatus ? divStatus.isLocked : false;
              const catImg = cat.image || FALLBACK_CAT_IMAGES[cat.slug] || "/ghee-karam-dosa.jpg";

              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className="flex-shrink-0 flex flex-col items-center gap-2 pb-2 relative cursor-pointer min-w-[78px] max-w-[98px] group"
                >
                  <div
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 transition shadow-sm ${
                      isSelected
                        ? "border-[#580D1A] ring-2 ring-[#580D1A]/30 scale-105"
                        : "border-stone-200 group-hover:border-[#D4AF37]"
                    }`}
                  >
                    <Image
                      src={catImg}
                      alt={cat.name}
                      fill
                      sizes="80px"
                      className={`object-cover ${isLockedCat ? "grayscale-[20%] brightness-90" : ""}`}
                    />
                    {isLockedCat && (
                      <span className="absolute inset-0 bg-black/25 flex items-center justify-center">
                        <Lock className="w-4 h-4 text-[#DFC17B]" />
                      </span>
                    )}
                  </div>
                  <span className={`text-[11px] sm:text-xs font-bold text-center leading-tight line-clamp-2 ${isSelected ? "text-[#580D1A]" : "text-stone-700"}`}>
                    {cat.name}
                  </span>
                  {isSelected && (
                    <span className="absolute bottom-0 left-2 right-2 h-[3px] rounded-full bg-[#580D1A]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Circular Catalog Quick-Pick Items */}
          {items.length > 0 && (
            <div className="space-y-2 border-b border-stone-100 pb-4">
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-stone-400 block">
                Catalog Circular Quick-Picks (Tap Dish to View or Add)
              </span>
              <div className="flex items-start gap-4 overflow-x-auto pb-1 no-scrollbar">
                {items.slice(0, 18).map((dish) => {
                  const qty = getItemQuantity(dish.id);
                  const canAdd = !dish.isSessionLocked && dish.isAvailable !== false;
                  return (
                    <div key={`quick-${dish.id}`} className="flex-shrink-0 w-[86px] flex flex-col items-center text-center group">
                      <button
                        type="button"
                        onClick={() => setActiveModalDish(dish)}
                        className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-[#D4AF37]/60 shadow-xs group-hover:scale-105 transition cursor-pointer"
                      >
                        <Image src={dish.image || "/ghee-karam-dosa.jpg"} alt={dish.name} fill sizes="64px" className="object-cover" />
                      </button>
                      <span className="mt-1 text-[11px] font-bold text-stone-800 line-clamp-1">
                        {dish.name}
                      </span>
                      <div className="mt-0.5 flex items-center gap-1">
                        <span className="text-[11px] font-black text-[#580D1A]">₹{dish.price}</span>
                        {canAdd && qty === 0 && (
                          <button
                            type="button"
                            onClick={() => addToCart(dish, 1)}
                            className="w-4 h-4 rounded-full bg-[#580D1A] text-white flex items-center justify-center cursor-pointer"
                            title={`Add ${dish.name}`}
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        )}
                        {canAdd && qty > 0 && (
                          <div className="inline-flex items-center rounded-full bg-[#580D1A] text-white px-1 gap-0.5 text-[9px] font-black">
                            <button type="button" onClick={() => updateQuantity(dish.id, -1)} className="cursor-pointer">
                              <Minus className="w-2 h-2" />
                            </button>
                            <span>{qty}</span>
                            <button type="button" onClick={() => updateQuantity(dish.id, 1)} className="cursor-pointer">
                              <Plus className="w-2 h-2" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Search & Filter Controls */}
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search dosas, biryanis, noodles, pickles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 bg-[#FAF8F4] border border-[#E7E0D3] rounded-xl text-xs font-semibold text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#580D1A] transition"
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

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
              <button
                onClick={() => setFilterType(filterType === "signature" ? "all" : "signature")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border cursor-pointer ${
                  filterType === "signature"
                    ? "bg-[#580D1A] text-[#DFC17B] border-[#580D1A]"
                    : "bg-[#FAF8F4] text-stone-700 border-[#E7E0D3]"
                }`}
              >
                <Sparkles className="w-3 h-3 text-[#C5A059]" />
                <span>Signatures</span>
              </button>

              <button
                onClick={() => setFilterType(filterType === "bestseller" ? "all" : "bestseller")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border cursor-pointer ${
                  filterType === "bestseller"
                    ? "bg-[#580D1A] text-white border-[#580D1A]"
                    : "bg-[#FAF8F4] text-stone-700 border-[#E7E0D3]"
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>Bestsellers</span>
              </button>

              <button
                onClick={() => setFilterType(filterType === "spicy" ? "all" : "spicy")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border cursor-pointer ${
                  filterType === "spicy"
                    ? "bg-[#DB0000] text-white border-[#DB0000]"
                    : "bg-[#FAF8F4] text-stone-700 border-[#E7E0D3]"
                }`}
              >
                <Flame className="w-3 h-3 text-red-500" />
                <span>Spicy</span>
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#FAF8F4] border border-[#E7E0D3] text-[#1C1917] focus:outline-none"
              >
                <option value="popular">Sort: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs font-bold text-[#580D1A] hover:underline px-2 py-1 cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Dish Count Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Showing {items.length} {items.length === 1 ? "Dish" : "Dishes"}
          </span>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-600">
            <a
              href="https://maps.app.goo.gl/6611R6FD1JZagSJt9"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#580D1A] font-semibold flex items-center space-x-1"
            >
              <Compass className="w-3.5 h-3.5 text-[#580D1A]" />
              <span>Visit Restaurant</span>
            </a>
            <span className="hidden sm:inline">•</span>
            <a
              href="tel:+919885455342"
              className="hover:text-[#580D1A] font-semibold flex items-center space-x-1"
            >
              <Phone className="w-3.5 h-3.5 text-[#580D1A]" />
              <span>Takeaway: 9885455342</span>
            </a>
          </div>
        </div>

        {/* Dishes Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="bg-white rounded-3xl border border-[#E7E0D3] p-4 h-80 shimmer-gold flex flex-col justify-between"
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
          <div className="text-center py-20 bg-white rounded-3xl border border-[#E7E0D3] p-8 space-y-4">
            <Filter className="w-10 h-10 text-[#C5A059] mx-auto opacity-70" />
            <h3 className="text-xl font-bold text-[#1C1917]">
              No dishes match your selection
            </h3>
            <p className="text-stone-500 text-xs max-w-md mx-auto">
              Please try adjusting your search terms or clearing your filters to explore all Upahar dishes.
            </p>
            <button
              onClick={clearFilters}
              className="btn-maroon-gold px-6 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

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
        <div className="min-h-screen bg-brand-cream flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-3 border-brand-700 border-t-transparent rounded-full animate-spin mx-auto" />
            <span className="text-xs uppercase font-extrabold tracking-widest text-brand-700 block">
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
