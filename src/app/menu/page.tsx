"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { FoodItem, Category } from "@/types";
import MenuDishCard from "@/components/menu/MenuDishCard";
import DishDetailModal from "@/components/menu/DishDetailModal";
import { FALLBACK_CATEGORIES, FALLBACK_MENU_ITEMS } from "@/lib/fallback-menu";
import { useRealtimeEvents } from "@/hooks/useRealtimeEvents";
import {
  isCategoryAvailableInSession,
  getCategorySessionPriority,
  getEffectiveSessionType,
  SessionType,
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
} from "lucide-react";

function MenuContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const urlThemeParam = searchParams.get("theme");

  const [categories, setCategories] = useState<Category[]>(FALLBACK_CATEGORIES);
  const [items, setItems] = useState<FoodItem[]>(FALLBACK_MENU_ITEMS);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "signature" | "bestseller" | "spicy">("all");
  const [sortBy, setSortBy] = useState("popular");
  const [loading, setLoading] = useState(false);
  const [activeModalDish, setActiveModalDish] = useState<FoodItem | null>(null);
  const [emergencyNotice, setEmergencyNotice] = useState<string | null>(null);
  const [sessionInfo, setSessionInfo] = useState<{
    isOpen: boolean;
    sessionType: SessionType;
    enforceStoreHours: boolean;
    statusText: string;
    subText: string;
  } | null>(null);

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
        if (d?.storeStatus) {
          setSessionInfo({
            isOpen: d.storeStatus.isOpen,
            sessionType: d.storeStatus.sessionType || "EVENING",
            enforceStoreHours: d.settings?.enforceStoreHours !== false,
            statusText: d.storeStatus.statusText,
            subText: d.storeStatus.subText,
          });
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

  const effectiveSession: SessionType = getEffectiveSessionType(
    sessionInfo?.sessionType || "EVENING",
    urlThemeParam
  );
  const isMorningSession = effectiveSession === "MORNING";
  const selectedCategoryLocked =
    selectedCategory !== "all" &&
    (sessionInfo?.enforceStoreHours ?? true) &&
    isMorningSession &&
    !isCategoryAvailableInSession(selectedCategory, "MORNING");

  const sortedCategories = useMemo(() => {
    return [...categories].sort(
      (a, b) =>
        getCategorySessionPriority(a.slug, effectiveSession) -
        getCategorySessionPriority(b.slug, effectiveSession)
    );
  }, [categories, effectiveSession]);

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
    params.append("respectSession", "true");
    params.append("includeLocked", "true");
    if (urlThemeParam) {
      params.append("previewSession", effectiveSession);
    }

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
  }, [selectedCategory, searchQuery, filterType, sortBy, effectiveSession, urlThemeParam]);

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
    <div className="min-h-screen bg-brand-cream pb-24">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-brand-900 via-brand-700 to-brand-950 text-brand-cream py-16 px-4 text-center relative overflow-hidden border-b border-[#D4AF37]/30">
        <div className="max-w-3xl mx-auto relative z-10 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-black/40 border border-[#D4AF37]/40 text-[#DFC17B]">
            <UtensilsCrossed className="w-3.5 h-3.5 text-[#DFC17B]" />
            <span>
              {isMorningSession
                ? "Upahar Tiffins • Morning 6:00 AM – 10:30 AM"
                : "Upahar Biryanis & Fast Food • 12:00 PM – 10:30 PM"}
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white">
            {isMorningSession
              ? "Fresh Morning Tiffins Menu"
              : "Dum Biryanis, Fast Food & Tiffins"}
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            {isMorningSession
              ? "Steaming idlys, golden ghee karam dosas, wadas & pooris available now. Dum Biryanis & Fast Food unlock at 12:00 PM – 10:30 PM IST."
              : "Authentic Hyderabadi Chicken & Egg Dum Biryanis, Andhra Fry Piece Biryani, sizzling wok noodles, fried rice & crispy starters first on menu!"}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        {emergencyNotice && (
          <div className="mb-4 p-4 rounded-2xl bg-red-600 text-white text-xs font-bold shadow-lg flex items-center justify-between gap-3">
            <span>🚨 {emergencyNotice}</span>
          </div>
        )}

        {sessionInfo?.enforceStoreHours && !sessionInfo.isOpen && (
          <div className="mb-4 p-4 rounded-2xl bg-amber-900 text-amber-50 border border-amber-500/40 text-xs font-bold shadow-md flex flex-wrap items-center justify-between gap-2">
            <span>🕒 {sessionInfo.statusText} — {sessionInfo.subText}</span>
            <span className="text-[10px] uppercase tracking-wider bg-black/30 px-2.5 py-1 rounded-full text-[#DFC17B]">
              Morning: 6–10:30 AM • Session 2: 12–10:30 PM
            </span>
          </div>
        )}

        {(sessionInfo?.enforceStoreHours ?? true) && isMorningSession && (
          <div className="mb-4 p-3.5 rounded-2xl bg-brand-700 text-[#DFC17B] border border-[#D4AF37]/40 text-xs font-bold shadow-md flex flex-wrap items-center justify-between gap-2">
            <span>
              ☀️ Morning Tiffins Active (6:00 AM – 10:30 AM IST) — Tiffins &amp; Dosas open for ordering.
            </span>
            <span className="bg-black/30 px-2.5 py-1 rounded-full text-[11px] flex items-center gap-1">
              <Lock className="w-3 h-3" /> Biryanis &amp; Fast Food unlock at 12:00 PM
            </span>
          </div>
        )}

        {selectedCategoryLocked && (
          <div className="mb-4 p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 text-xs font-semibold shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start space-x-2.5">
              <Lock className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-black text-sm block text-amber-950">
                  Locked Until 12:00 PM IST — Afternoon &amp; Evening Menu
                </span>
                <span className="text-amber-900">
                  Biryani, Fried Rice, Noodles &amp; Starters can only be ordered between <strong>12:00 PM – 10:30 PM IST</strong>. During Morning Session (6:00 AM – 10:30 AM), only fresh Tiffins &amp; Dosas are served.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedCategory("tiffins")}
              className="px-4 py-2 rounded-xl bg-brand-700 text-brand-cream font-bold text-xs whitespace-nowrap shadow-sm hover:opacity-90 transition cursor-pointer"
            >
              Order Morning Tiffins Now
            </button>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-3xl shadow-xl p-4 sm:p-6 border border-brand-border space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search dosas, idlis, pav bhaji, noodles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 bg-brand-cream border border-brand-border rounded-xl text-xs font-semibold text-brand-950 focus:outline-none focus:ring-2 focus:ring-brand-700 transition"
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
                    ? "bg-brand-700 text-[#DFC17B] border-[#D4AF37]"
                    : "bg-brand-cream text-stone-700 border-brand-border hover:bg-brand-border"
                }`}
              >
                <Sparkles className="w-3 h-3 text-[#C5A059]" />
                <span>Signatures</span>
              </button>

              <button
                onClick={() => setFilterType(filterType === "bestseller" ? "all" : "bestseller")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border ${
                  filterType === "bestseller"
                    ? "bg-brand-700 text-brand-cream border-brand-700"
                    : "bg-brand-cream text-stone-700 border-brand-border hover:bg-brand-border"
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
                    : "bg-brand-cream text-stone-700 border-brand-border hover:bg-brand-border"
                }`}
              >
                <Flame className="w-3 h-3 text-red-500" />
                <span>Spicy</span>
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-cream border border-brand-border text-brand-950 focus:outline-none focus:ring-2 focus:ring-brand-700"
              >
                <option value="popular">Sort: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs font-bold text-brand-600 hover:underline px-2 py-1"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pt-2 border-t border-brand-surface pb-1">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider whitespace-nowrap transition-all ${
                selectedCategory === "all"
                  ? "bg-brand-950 text-[#DFC17B] border border-[#D4AF37]/50 shadow-md"
                  : "bg-brand-cream text-stone-600 hover:text-brand-700 border border-brand-border"
              }`}
            >
              All Categories
            </button>

            {sortedCategories.map((cat) => {
              const isSelected = selectedCategory === cat.slug;
              const isLockedCat =
                (sessionInfo?.enforceStoreHours ?? true) &&
                isMorningSession &&
                !isCategoryAvailableInSession(cat.slug, "MORNING");
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                    isSelected
                      ? "bg-brand-950 text-[#DFC17B] border border-[#D4AF37]/50 shadow-md"
                      : isLockedCat
                      ? "bg-amber-50/80 text-amber-900 hover:bg-amber-100 border border-amber-300/70"
                      : "bg-brand-cream text-stone-600 hover:text-brand-700 border border-brand-border"
                  }`}
                >
                  {isLockedCat && <Lock className="w-3 h-3 text-amber-700 flex-shrink-0" />}
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dish Count Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 my-6 px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Showing {items.length} {items.length === 1 ? "Dish" : "Dishes"}
          </span>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-600">
            <a
              href="https://maps.app.goo.gl/6611R6FD1JZagSJt9"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand-700 font-semibold flex items-center space-x-1"
            >
              <Compass className="w-3.5 h-3.5 text-brand-700" />
              <span>Visit Restaurant</span>
            </a>
            <span className="hidden sm:inline">•</span>
            <a
              href="tel:+919885455342"
              className="hover:text-brand-700 font-semibold flex items-center space-x-1"
            >
              <Phone className="w-3.5 h-3.5 text-brand-700" />
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
                className="bg-white rounded-3xl border border-brand-border p-4 h-80 shimmer-gold flex flex-col justify-between"
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
          <div className="text-center py-20 bg-white rounded-3xl border border-brand-border p-8 space-y-4">
            <Filter className="w-10 h-10 text-[#C5A059] mx-auto opacity-70" />
            <h3 className="text-xl font-bold text-brand-950">
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
