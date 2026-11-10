"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Globe,
  Save,
  ExternalLink,
  Plus,
  Edit2,
  Trash2,
  Upload,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  X,
} from "lucide-react";
import type { FoodItem, Category, SubsiteTimeWindow } from "@/types";
import {
  getDivisionForCategory,
  parseTimeWindows,
  type DivisionKey,
} from "@/lib/store-hours";

interface SubsiteAdminRow {
  id: DivisionKey;
  key: DivisionKey;
  route: string;
  number: string;
  title: string;
  shortTitle: string;
  tagline: string;
  quote: string;
  description: string;
  heroImage: string;
  scheduleLabel: string;
  timeWindowsJson: string;
  alwaysOpen: boolean;
  isOpenOverride: boolean | null;
  isActive: boolean;
  pausedMessage: string | null;
  itemCount: number;
  status: {
    isOpen: boolean;
    isLocked: boolean;
    statusLabel: string;
    timingText: string;
  };
}

const TAB_ACCENTS: Record<DivisionKey, string> = {
  tiffins: "border-[#153B10] bg-[#153B10] text-white",
  biryanis: "border-[#580D1A] bg-[#580D1A] text-white",
  "fast-food": "border-[#CA8A04] bg-[#FACC15] text-[#2B1400]",
  pickles: "border-[#DB0000] bg-[#DB0000] text-white",
};

export default function AdminWebsitesControlPage() {
  const [subsites, setSubsites] = useState<SubsiteAdminRow[]>([]);
  const [activeKey, setActiveKey] = useState<DivisionKey>("tiffins");
  const [items, setItems] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSite, setSavingSite] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingDishId, setUploadingDishId] = useState<string | null>(null);
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({});
  const [dishSearch, setDishSearch] = useState("");
  const [notice, setNotice] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Editable form state for active sub-website
  const [siteForm, setSiteForm] = useState<{
    title: string;
    shortTitle: string;
    tagline: string;
    quote: string;
    description: string;
    heroImage: string;
    alwaysOpen: boolean;
    isActive: boolean;
    overrideMode: "auto" | "open" | "closed";
    pausedMessage: string;
    windows: SubsiteTimeWindow[];
  } | null>(null);

  // Add/Edit Dish Modal
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<FoodItem | null>(null);
  const [uploadingModalImg, setUploadingModalImg] = useState(false);
  const [dishForm, setDishForm] = useState({
    name: "",
    price: "",
    description: "",
    categoryId: "",
    image: "",
    isVeg: true,
    isSpicy: false,
    isBestseller: false,
    isSignature: false,
    isAvailable: true,
    prepTime: "10-15 mins",
    portionSize: "",
    ingredients: "",
  });

  const buildSiteForm = (sub: SubsiteAdminRow) => ({
    title: sub.title,
    shortTitle: sub.shortTitle,
    tagline: sub.tagline,
    quote: sub.quote,
    description: sub.description,
    heroImage: sub.heroImage,
    alwaysOpen: Boolean(sub.alwaysOpen),
    isActive: sub.isActive !== false,
    overrideMode:
      sub.isOpenOverride === true
        ? ("open" as const)
        : sub.isOpenOverride === false
        ? ("closed" as const)
        : ("auto" as const),
    pausedMessage: sub.pausedMessage || "",
    windows: parseTimeWindows(sub.timeWindowsJson, [{ start: "06:00", end: "10:30" }]),
  });

  const loadAll = async (selectedId: DivisionKey = activeKey) => {
    try {
      const [webRes, menuRes, catRes] = await Promise.all([
        fetch("/api/websites"),
        fetch("/api/menu?includeInactive=true"),
        fetch("/api/categories"),
      ]);
      const [webData, menuData, catData] = await Promise.all([
        webRes.json(),
        menuRes.json(),
        catRes.json(),
      ]);
      if (Array.isArray(webData?.subsites)) {
        setSubsites(webData.subsites);
        const match = webData.subsites.find((s: SubsiteAdminRow) => s.id === selectedId);
        if (match) setSiteForm(buildSiteForm(match));
      }
      if (Array.isArray(menuData?.items)) {
        setItems(menuData.items);
        const drafts: Record<string, string> = {};
        for (const it of menuData.items) {
          drafts[it.id] = String(it.price);
        }
        setPriceDrafts(drafts);
      }
      if (Array.isArray(catData?.categories)) setCategories(catData.categories);
    } catch (err) {
      console.error("Failed loading websites control center:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    Promise.all([
      fetch("/api/websites").then((r) => r.json()),
      fetch("/api/menu?includeInactive=true").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ])
      .then(([webData, menuData, catData]) => {
        if (!mounted) return;
        if (Array.isArray(webData?.subsites)) {
          setSubsites(webData.subsites);
          const match = webData.subsites.find((s: SubsiteAdminRow) => s.id === "tiffins");
          if (match) setSiteForm(buildSiteForm(match));
        }
        if (Array.isArray(menuData?.items)) {
          setItems(menuData.items);
          const drafts: Record<string, string> = {};
          for (const it of menuData.items) {
            drafts[it.id] = String(it.price);
          }
          setPriceDrafts(drafts);
        }
        if (Array.isArray(catData?.categories)) setCategories(catData.categories);
      })
      .catch((err) => console.error("Failed loading websites control center:", err))
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const activeSubsite = useMemo(
    () => subsites.find((s) => s.id === activeKey) || null,
    [subsites, activeKey]
  );

  const handleSelectWebsite = (site: SubsiteAdminRow) => {
    setActiveKey(site.id);
    setSiteForm(buildSiteForm(site));
  };

  const divisionCategories = useMemo(
    () => categories.filter((c) => getDivisionForCategory(c) === activeKey),
    [categories, activeKey]
  );

  const divisionItems = useMemo(() => {
    const catIds = new Set(divisionCategories.map((c) => c.id));
    return items.filter((it) => {
      const inDivision =
        catIds.has(it.categoryId) ||
        getDivisionForCategory(it.category || it.categoryId) === activeKey;
      if (!inDivision) return false;
      if (!dishSearch.trim()) return true;
      const q = dishSearch.toLowerCase();
      return (
        it.name.toLowerCase().includes(q) ||
        it.description.toLowerCase().includes(q)
      );
    });
  }, [items, divisionCategories, activeKey, dishSearch]);

  const uploadImageFile = async (file: File): Promise<string | null> => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok || !data.url) {
      setNotice({ type: "err", text: data.error || "Image upload failed. Sign in as Admin." });
      return null;
    }
    return data.url as string;
  };

  const handleSaveWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteForm) return;
    setSavingSite(true);
    setNotice(null);

    try {
      const res = await fetch("/api/websites", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeKey,
          title: siteForm.title,
          shortTitle: siteForm.shortTitle,
          tagline: siteForm.tagline,
          quote: siteForm.quote,
          description: siteForm.description,
          heroImage: siteForm.heroImage,
          alwaysOpen: siteForm.alwaysOpen,
          isActive: siteForm.isActive,
          pausedMessage: siteForm.pausedMessage || null,
          isOpenOverride:
            siteForm.overrideMode === "open"
              ? true
              : siteForm.overrideMode === "closed"
              ? false
              : null,
          timeWindows: siteForm.windows,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNotice({ type: "err", text: data.error || "Failed to save website settings" });
      } else {
        setNotice({ type: "ok", text: `${siteForm.title} settings & timings saved live!` });
        if (Array.isArray(data.subsites)) setSubsites(data.subsites);
      }
    } catch {
      setNotice({ type: "err", text: "Network error saving website settings" });
    } finally {
      setSavingSite(false);
    }
  };

  const handleInlinePriceSave = async (dish: FoodItem) => {
    const raw = priceDrafts[dish.id];
    const num = parseFloat(raw);
    if (isNaN(num) || num <= 0) return;

    const res = await fetch(`/api/menu/${dish.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price: num }),
    });
    if (res.ok) {
      setItems((prev) => prev.map((i) => (i.id === dish.id ? { ...i, price: num } : i)));
      setNotice({ type: "ok", text: `Updated price of "${dish.name}" to ₹${num}.` });
    } else {
      const err = await res.json();
      setNotice({ type: "err", text: err.error || "Failed updating price" });
    }
  };

  const handleToggleStock = async (dish: FoodItem) => {
    const next = !dish.isAvailable;
    const res = await fetch(`/api/menu/${dish.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAvailable: next }),
    });
    if (res.ok) {
      setItems((prev) => prev.map((i) => (i.id === dish.id ? { ...i, isAvailable: next } : i)));
    }
  };

  const handleQuickPhotoUpload = async (dish: FoodItem, file: File) => {
    setUploadingDishId(dish.id);
    const url = await uploadImageFile(file);
    if (url) {
      const res = await fetch(`/api/menu/${dish.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: url }),
      });
      if (res.ok) {
        setItems((prev) => prev.map((i) => (i.id === dish.id ? { ...i, image: url } : i)));
        setNotice({ type: "ok", text: `Updated photo for "${dish.name}"!` });
      }
    }
    setUploadingDishId(null);
  };

  const handleOpenAddDish = () => {
    setEditingDish(null);
    setDishForm({
      name: "",
      price: "",
      description: "",
      categoryId: divisionCategories[0]?.id || categories[0]?.id || "",
      image: activeSubsite?.heroImage || "/ghee-karam-dosa.jpg",
      isVeg: true,
      isSpicy: false,
      isBestseller: false,
      isSignature: false,
      isAvailable: true,
      prepTime: activeKey === "pickles" ? "Ready 24×7" : "10-15 mins",
      portionSize: activeKey === "pickles" ? "250g Sealed Jar" : "1 Serving",
      ingredients: "",
    });
    setIsDishModalOpen(true);
  };

  const handleOpenEditDish = (dish: FoodItem) => {
    setEditingDish(dish);
    setDishForm({
      name: dish.name,
      price: String(dish.price),
      description: dish.description,
      categoryId: dish.categoryId,
      image: dish.image,
      isVeg: dish.isVeg,
      isSpicy: dish.isSpicy,
      isBestseller: dish.isBestseller,
      isSignature: dish.isSignature,
      isAvailable: dish.isAvailable,
      prepTime: dish.prepTime,
      portionSize: dish.portionSize || "",
      ingredients: dish.ingredients || "",
    });
    setIsDishModalOpen(true);
  };

  const handleSaveDishModal = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingDish ? `/api/menu/${editingDish.id}` : "/api/menu";
    const method = editingDish ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dishForm),
    });
    if (res.ok) {
      setIsDishModalOpen(false);
      await loadAll();
      setNotice({
        type: "ok",
        text: editingDish ? `Updated "${dishForm.name}"` : `Added "${dishForm.name}" to ${activeSubsite?.shortTitle}`,
      });
    } else {
      const err = await res.json();
      setNotice({ type: "err", text: err.error || "Failed saving dish" });
    }
  };

  const handleDeleteDish = async (dish: FoodItem) => {
    if (!confirm(`Delete "${dish.name}"?`)) return;
    const res = await fetch(`/api/menu/${dish.id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((i) => i.id !== dish.id));
      setNotice({ type: "ok", text: `Removed "${dish.name}".` });
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#580D1A]" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-[#FAF7F2] min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 sm:p-6 rounded-3xl border border-[#EADBCE] shadow-sm">
        <div>
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#74171E] block">
            Unified Multi-Website Controls
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2B070E] font-display flex items-center gap-2">
            <Globe className="w-6 h-6 text-[#580D1A]" />
            <span>4 Sub-Websites Control Center</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Control timings, open/close overrides, text, hero photos, item photos, prices, new items, and Sold Out toggles for all 4 Upahar websites.
          </p>
        </div>

        {activeSubsite && (
          <Link
            href={activeSubsite.route}
            target="_blank"
            className="btn-maroon-gold px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
          >
            <span>Open {activeSubsite.shortTitle}</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#DFC17B]" />
          </Link>
        )}
      </div>

      {/* 4 Sub-Website Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {subsites.map((site) => {
          const isSelected = site.id === activeKey;
          return (
            <button
              key={site.id}
              type="button"
              onClick={() => handleSelectWebsite(site)}
              className={`p-4 rounded-2xl border-2 text-left transition cursor-pointer shadow-xs ${
                isSelected
                  ? TAB_ACCENTS[site.id]
                  : "bg-white border-[#EADBCE] text-[#2B070E] hover:border-[#D4AF37]"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[10px] font-mono font-black opacity-75">{site.number}</span>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    isSelected
                      ? "bg-black/25 text-current"
                      : site.status.isOpen
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-900"
                  }`}
                >
                  {site.status.statusLabel}
                </span>
              </div>
              <div className="font-black text-sm font-display truncate">{site.title}</div>
              <div className="text-[11px] opacity-80 truncate mt-0.5">{site.status.timingText}</div>
            </button>
          );
        })}
      </div>

      {notice && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
            notice.type === "ok"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {notice.type === "ok" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{notice.text}</span>
        </div>
      )}

      {/* Website Config Editor */}
      {siteForm && activeSubsite && (
        <form onSubmit={handleSaveWebsite} className="bg-white p-4 sm:p-6 rounded-3xl border border-[#EADBCE] shadow-sm space-y-5 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F4EFE6] pb-3">
            <div>
              <h2 className="text-lg font-black text-[#2B070E] font-display">
                {activeSubsite.title} — Website Settings &amp; Timings
              </h2>
              <span className="text-[11px] text-stone-500">
                Route: <code>{activeSubsite.route}</code> • Theme: <code>{activeKey}</code>
              </span>
            </div>
            <button
              type="submit"
              disabled={savingSite}
              className="btn-maroon-gold px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4 text-[#DFC17B]" />
              <span>{savingSite ? "Saving..." : "Save Website Settings"}</span>
            </button>
          </div>

          {/* Open/Close & Hours Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE]">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={siteForm.isActive}
                onChange={(e) => setSiteForm({ ...siteForm, isActive: e.target.checked })}
              />
              <div>
                <span className="font-black text-[#2B070E] block">Website Enabled</span>
                <span className="text-[11px] text-stone-500">Uncheck to pause this entire sub-website</span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={siteForm.alwaysOpen}
                onChange={(e) => setSiteForm({ ...siteForm, alwaysOpen: e.target.checked })}
              />
              <div>
                <span className="font-black text-[#2B070E] block">Open 24×7 Anytime</span>
                <span className="text-[11px] text-stone-500">Allows customer ordering at any hour</span>
              </div>
            </label>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Admin Live Status Override</label>
              <select
                value={siteForm.overrideMode}
                onChange={(e) =>
                  setSiteForm({ ...siteForm, overrideMode: e.target.value as "auto" | "open" | "closed" })
                }
                className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded-xl font-bold"
              >
                <option value="auto">Follow Schedule Timings</option>
                <option value="open">Force OPEN Right Now</option>
                <option value="closed">Force CLOSED Right Now</option>
              </select>
            </div>
          </div>

          {/* Time Windows */}
          {!siteForm.alwaysOpen && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-stone-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#580D1A]" />
                  <span>Daily Operating Time Windows (IST)</span>
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setSiteForm({
                      ...siteForm,
                      windows: [...siteForm.windows, { start: "17:00", end: "22:30" }],
                    })
                  }
                  className="text-[11px] font-bold text-[#580D1A] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add Time Window
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                {siteForm.windows.map((win, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EADBCE]"
                  >
                    <input
                      type="time"
                      value={win.start}
                      onChange={(e) => {
                        const next = [...siteForm.windows];
                        next[idx] = { ...next[idx], start: e.target.value };
                        setSiteForm({ ...siteForm, windows: next });
                      }}
                      className="px-2 py-1 bg-white border border-[#EADBCE] rounded-lg font-bold"
                    />
                    <span className="font-bold text-stone-400">to</span>
                    <input
                      type="time"
                      value={win.end}
                      onChange={(e) => {
                        const next = [...siteForm.windows];
                        next[idx] = { ...next[idx], end: e.target.value };
                        setSiteForm({ ...siteForm, windows: next });
                      }}
                      className="px-2 py-1 bg-white border border-[#EADBCE] rounded-lg font-bold"
                    />
                    {siteForm.windows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const next = siteForm.windows.filter((_, i) => i !== idx);
                          setSiteForm({ ...siteForm, windows: next });
                        }}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Titles, Copy & Hero Image Upload */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-stone-700 block">Website Title</label>
              <input
                type="text"
                value={siteForm.title}
                onChange={(e) => setSiteForm({ ...siteForm, title: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl font-semibold"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-stone-700 block">Short Title / Tagline</label>
              <input
                type="text"
                value={siteForm.tagline}
                onChange={(e) => setSiteForm({ ...siteForm, tagline: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-stone-700 block">Hero Editorial Quote</label>
              <textarea
                rows={2}
                value={siteForm.quote}
                onChange={(e) => setSiteForm({ ...siteForm, quote: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl font-semibold"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-stone-700 block">Description (Shown on Main Hub Card)</label>
              <textarea
                rows={2}
                value={siteForm.description}
                onChange={(e) => setSiteForm({ ...siteForm, description: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl font-semibold"
              />
            </div>
          </div>

          {/* Hero Image Upload + Preview */}
          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE] flex flex-col sm:flex-row items-center gap-4">
            <img
              src={siteForm.heroImage || "/ghee-karam-dosa.jpg"}
              alt={siteForm.title}
              className="w-24 h-24 rounded-full object-cover border-2 border-[#D4AF37] bg-white flex-shrink-0"
            />
            <div className="flex-1 space-y-2 w-full">
              <label className="font-bold text-stone-700 block">
                Website Hero &amp; Hub Card Picture (Upload or Enter Path/URL)
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={siteForm.heroImage}
                  onChange={(e) => setSiteForm({ ...siteForm, heroImage: e.target.value })}
                  className="flex-1 px-3 py-2 bg-white border border-[#EADBCE] rounded-xl font-mono text-xs"
                />
                <label className="px-4 py-2 rounded-xl bg-[#580D1A] text-[#DFC17B] font-bold cursor-pointer inline-flex items-center justify-center gap-1.5 whitespace-nowrap">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingHero ? "Uploading..." : "Upload Photo"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      setUploadingHero(true);
                      const url = await uploadImageFile(f);
                      if (url) setSiteForm({ ...siteForm, heroImage: url });
                      setUploadingHero(false);
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Food Items Control for Selected Sub-Website */}
      <div className="bg-white rounded-3xl border border-[#EADBCE] shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-[#EADBCE] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-lg font-black text-[#2B070E] font-display">
              {activeSubsite?.title} — Food Items, Photos, Prices &amp; Stock ({divisionItems.length})
            </h2>
            <p className="text-xs text-stone-500">
              Add new items, change photos directly, edit prices inline, or mark Not Available.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Filter dishes..."
                value={dishSearch}
                onChange={(e) => setDishSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-xs font-semibold"
              />
            </div>

            <button
              type="button"
              onClick={handleOpenAddDish}
              className="btn-maroon-gold px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#DFC17B]" />
              <span>Add Item to {activeSubsite?.shortTitle}</span>
            </button>
          </div>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden divide-y divide-[#F4EFE6]">
          {divisionItems.map((dish) => (
            <div key={dish.id} className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="relative w-14 h-14 rounded-full overflow-hidden border border-[#EADBCE] bg-stone-100 flex-shrink-0">
                  <img src={dish.image} alt={dish.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[#2B070E] text-sm truncate">{dish.name}</div>
                  <div className="text-[11px] text-stone-500">{dish.category?.name || "General"}</div>
                  <label className="inline-flex items-center gap-1 text-[11px] font-bold text-[#580D1A] hover:underline cursor-pointer mt-1">
                    <Upload className="w-3 h-3" />
                    <span>{uploadingDishId === dish.id ? "Uploading..." : "Change Photo"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleQuickPhotoUpload(dish, f);
                      }}
                    />
                  </label>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEditDish(dish)}
                    className="p-1.5 rounded-lg text-stone-600 hover:text-[#580D1A] hover:bg-[#FAF7F2] cursor-pointer"
                    title="Edit Dish"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteDish(dish)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                    title="Delete Dish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-stone-500">₹</span>
                  <input
                    type="number"
                    value={priceDrafts[dish.id] ?? String(dish.price)}
                    onChange={(e) =>
                      setPriceDrafts((prev) => ({ ...prev, [dish.id]: e.target.value }))
                    }
                    className="w-20 px-2.5 py-1.5 rounded-lg border border-[#EADBCE] bg-[#FAF7F2] text-xs font-black text-[#580D1A]"
                  />
                  {Number(priceDrafts[dish.id]) !== dish.price && (
                    <button
                      type="button"
                      onClick={() => handleInlinePriceSave(dish)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#580D1A] text-[#DFC17B] font-bold text-[11px] cursor-pointer"
                    >
                      Save
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleStock(dish)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer transition ${
                    dish.isAvailable
                      ? "bg-[#EBF3E8] text-[#2D5A27] hover:bg-red-50 hover:text-red-700"
                      : "bg-red-100 text-red-700 hover:bg-emerald-50 hover:text-emerald-700"
                  }`}
                >
                  {dish.isAvailable ? "Available" : "Not Available"}
                </button>
              </div>
            </div>
          ))}
          {divisionItems.length === 0 && (
            <div className="text-center py-10 text-xs text-stone-400 px-4">
              No food items in this sub-website yet. Click &ldquo;Add Item&rdquo; above!
            </div>
          )}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] text-stone-500 uppercase tracking-wider text-[10px] font-bold border-b border-[#EADBCE]">
              <tr>
                <th className="p-4">Photo &amp; Dish</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price (₹)</th>
                <th className="p-4">Availability</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4EFE6]">
              {divisionItems.map((dish) => (
                <tr key={dish.id} className="hover:bg-[#FAF7F2]/60">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-14 h-14 rounded-full overflow-hidden border border-[#EADBCE] bg-stone-100 flex-shrink-0">
                        <img src={dish.image} alt={dish.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="space-y-1">
                        <div className="font-bold text-[#2B070E] text-sm">{dish.name}</div>
                        <label className="inline-flex items-center gap-1 text-[11px] font-bold text-[#580D1A] hover:underline cursor-pointer">
                          <Upload className="w-3 h-3" />
                          <span>{uploadingDishId === dish.id ? "Uploading..." : "Change Photo"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleQuickPhotoUpload(dish, f);
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 text-stone-600 font-semibold">
                    {dish.category?.name || "General"}
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={priceDrafts[dish.id] ?? String(dish.price)}
                        onChange={(e) =>
                          setPriceDrafts((prev) => ({ ...prev, [dish.id]: e.target.value }))
                        }
                        className="w-20 px-2.5 py-1.5 rounded-lg border border-[#EADBCE] bg-[#FAF7F2] font-black text-[#580D1A]"
                      />
                      {Number(priceDrafts[dish.id]) !== dish.price && (
                        <button
                          type="button"
                          onClick={() => handleInlinePriceSave(dish)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#580D1A] text-[#DFC17B] font-bold text-[11px] cursor-pointer"
                        >
                          Save
                        </button>
                      )}
                    </div>
                  </td>

                  <td className="p-4">
                    <button
                      type="button"
                      onClick={() => handleToggleStock(dish)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer transition ${
                        dish.isAvailable
                          ? "bg-[#EBF3E8] text-[#2D5A27] hover:bg-red-50 hover:text-red-700"
                          : "bg-red-100 text-red-700 hover:bg-emerald-50 hover:text-emerald-700"
                      }`}
                    >
                      {dish.isAvailable ? "Available" : "Not Available"}
                    </button>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditDish(dish)}
                        className="p-1.5 rounded-lg text-stone-600 hover:text-[#580D1A] hover:bg-[#FAF7F2] cursor-pointer"
                        title="Edit Dish"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDish(dish)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                        title="Delete Dish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {divisionItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-stone-400">
                    No food items in this sub-website yet. Click &ldquo;Add Item&rdquo; above!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Dish Modal */}
      {isDishModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsDishModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FAF7F2] rounded-3xl border border-[#D4AF37]/50 shadow-2xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center border-b border-[#EADBCE] pb-3">
              <h3 className="text-lg font-black text-[#2B070E] font-display">
                {editingDish ? `Edit "${editingDish.name}"` : `Add New Item to ${activeSubsite?.shortTitle}`}
              </h3>
              <button type="button" onClick={() => setIsDishModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDishModal} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Dish Name *</label>
                  <input
                    type="text"
                    required
                    value={dishForm.name}
                    onChange={(e) => setDishForm({ ...dishForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={dishForm.price}
                    onChange={(e) => setDishForm({ ...dishForm, price: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded-xl font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Category *</label>
                <select
                  value={dishForm.categoryId}
                  onChange={(e) => setDishForm({ ...dishForm, categoryId: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded-xl font-semibold"
                >
                  {(divisionCategories.length > 0 ? divisionCategories : categories).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={dishForm.description}
                  onChange={(e) => setDishForm({ ...dishForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded-xl font-semibold"
                />
              </div>

              <div className="p-3 rounded-2xl bg-white border border-[#EADBCE] flex items-center gap-3">
                <img
                  src={dishForm.image || "/ghee-karam-dosa.jpg"}
                  alt="Preview"
                  className="w-14 h-14 rounded-full object-cover border border-[#D4AF37]"
                />
                <div className="flex-1 space-y-1.5">
                  <label className="font-bold text-stone-700 block">Item Picture (Path/URL or Upload)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={dishForm.image}
                      onChange={(e) => setDishForm({ ...dishForm, image: e.target.value })}
                      className="flex-1 px-3 py-1.5 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl font-mono text-[11px]"
                    />
                    <label className="px-3 py-1.5 rounded-xl bg-[#580D1A] text-[#DFC17B] font-bold cursor-pointer inline-flex items-center gap-1 whitespace-nowrap">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingModalImg ? "..." : "Upload"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          setUploadingModalImg(true);
                          const url = await uploadImageFile(f);
                          if (url) setDishForm({ ...dishForm, image: url });
                          setUploadingModalImg(false);
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Portion Size</label>
                  <input
                    type="text"
                    value={dishForm.portionSize}
                    onChange={(e) => setDishForm({ ...dishForm, portionSize: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Prep Time</label>
                  <input
                    type="text"
                    value={dishForm.prepTime}
                    onChange={(e) => setDishForm({ ...dishForm, prepTime: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded-xl font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                <label className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-[#EADBCE] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dishForm.isVeg}
                    onChange={(e) => setDishForm({ ...dishForm, isVeg: e.target.checked })}
                  />
                  <span className="font-bold">Pure Veg</span>
                </label>
                <label className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-[#EADBCE] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dishForm.isSignature}
                    onChange={(e) => setDishForm({ ...dishForm, isSignature: e.target.checked })}
                  />
                  <span className="font-bold">Signature</span>
                </label>
                <label className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-[#EADBCE] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dishForm.isBestseller}
                    onChange={(e) => setDishForm({ ...dishForm, isBestseller: e.target.checked })}
                  />
                  <span className="font-bold">Bestseller</span>
                </label>
                <label className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-[#EADBCE] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dishForm.isSpicy}
                    onChange={(e) => setDishForm({ ...dishForm, isSpicy: e.target.checked })}
                  />
                  <span className="font-bold">Spicy</span>
                </label>
                <label className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-[#EADBCE] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dishForm.isAvailable}
                    onChange={(e) => setDishForm({ ...dishForm, isAvailable: e.target.checked })}
                  />
                  <span className="font-bold">Available</span>
                </label>
              </div>

              <div className="pt-3 border-t border-[#EADBCE] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDishModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#EADBCE] font-bold text-stone-600"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-maroon-gold px-5 py-2 rounded-xl font-bold cursor-pointer">
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

