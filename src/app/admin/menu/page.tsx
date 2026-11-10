"use client";

import React, { useState, useEffect } from "react";
import { FoodItem, Category } from "@/types";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  Upload,
} from "lucide-react";
import {
  UPAHAR_DIVISION_LIST,
  getDivisionForCategory,
  type DivisionKey,
} from "@/lib/store-hours";

export default function AdminMenuPage() {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDivision, setSelectedDivision] = useState<DivisionKey | "all">("all");
  const [selectedCat, setSelectedCat] = useState("all");
  const [loading, setLoading] = useState(true);
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({});
  const [uploadingImg, setUploadingImg] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [formData, setFormData] = useState({
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

  const fetchData = async () => {
    try {
      const [menuRes, catRes] = await Promise.all([
        fetch("/api/menu?includeInactive=true"),
        fetch("/api/categories"),
      ]);
      const [menuData, catData] = await Promise.all([
        menuRes.json(),
        catRes.json(),
      ]);
      if (menuData.items) {
        setItems(menuData.items);
        const drafts: Record<string, string> = {};
        for (const it of menuData.items) {
          drafts[it.id] = String(it.price);
        }
        setPriceDrafts(drafts);
      }
      if (catData.categories) setCategories(catData.categories);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const uploadImage = async (file: File): Promise<string | null> => {
    setUploadingImg(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.url) {
        return data.url as string;
      }
      alert(data.error || "Failed to upload photo");
      return null;
    } finally {
      setUploadingImg(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    const matchingCat =
      selectedDivision !== "all"
        ? categories.find((c) => getDivisionForCategory(c) === selectedDivision)
        : categories[0];
    setFormData({
      name: "",
      price: "",
      description: "",
      categoryId: matchingCat?.id || categories[0]?.id || "",
      image: "/butter-masala-dosa.jpg",
      isVeg: true,
      isSpicy: false,
      isBestseller: false,
      isSignature: false,
      isAvailable: true,
      prepTime: "10-15 mins",
      portionSize: "1 Serving",
      ingredients: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: FoodItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price.toString(),
      description: item.description,
      categoryId: item.categoryId,
      image: item.image,
      isVeg: item.isVeg,
      isSpicy: item.isSpicy,
      isBestseller: item.isBestseller,
      isSignature: item.isSignature || false,
      isAvailable: item.isAvailable,
      prepTime: item.prepTime,
      portionSize: item.portionSize || "",
      ingredients: item.ingredients || "",
    });
    setIsModalOpen(true);
  };

  const handleToggleStock = async (item: FoodItem) => {
    const updatedStatus = !item.isAvailable;
    try {
      const res = await fetch(`/api/menu/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: updatedStatus }),
      });
      if (res.ok) {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, isAvailable: updatedStatus } : i))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleQuickPriceSave = async (item: FoodItem) => {
    const num = parseFloat(priceDrafts[item.id]);
    if (isNaN(num) || num <= 0) return;
    try {
      const res = await fetch(`/api/menu/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: num }),
      });
      if (res.ok) {
        setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, price: num } : i)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this dish?")) return;
    try {
      const res = await fetch(`/api/menu/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.categoryId) return;

    try {
      if (editingItem) {
        const res = await fetch(`/api/menu/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          setIsModalOpen(false);
          fetchData();
        }
      } else {
        const res = await fetch("/api/menu", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          setIsModalOpen(false);
          fetchData();
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const visibleCategories =
    selectedDivision === "all"
      ? categories
      : categories.filter((c) => getDivisionForCategory(c) === selectedDivision);

  const filteredItems = items.filter((item) => {
    const matchesDivision =
      selectedDivision === "all" ||
      getDivisionForCategory(item.category || item.categoryId) === selectedDivision;
    const matchesCat = selectedCat === "all" || item.categoryId === selectedCat;
    const matchesSearch =
      searchQuery === "" ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDivision && matchesCat && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-[#FAF7F2] min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 sm:p-6 rounded-3xl border border-[#EADBCE] shadow-sm">
        <div>
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#74171E] block">
            Digital Menu Management (All 4 Websites)
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2B070E] font-display">
            Manage Food Dishes
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Add new items, upload/change dish pictures, adjust prices inline, and mark items Available or Not Available across all 4 sub-websites.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="btn-maroon-gold px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition flex items-center space-x-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#DFC17B]" />
          <span>Add New Dish</span>
        </button>
      </div>

      {/* 4 Sub-Websites Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setSelectedDivision("all");
            setSelectedCat("all");
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
            selectedDivision === "all"
              ? "bg-[#580D1A] text-[#DFC17B] border-[#580D1A]"
              : "bg-white text-stone-700 border-[#EADBCE] hover:bg-[#FAF7F2]"
          }`}
        >
          All 4 Websites ({items.length})
        </button>
        {UPAHAR_DIVISION_LIST.map((div) => {
          const count = items.filter(
            (i) => getDivisionForCategory(i.category || i.categoryId) === div.key
          ).length;
          return (
            <button
              type="button"
              key={div.key}
              onClick={() => {
                setSelectedDivision(div.key);
                setSelectedCat("all");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                selectedDivision === div.key
                  ? "bg-[#580D1A] text-[#DFC17B] border-[#580D1A]"
                  : "bg-white text-stone-700 border-[#EADBCE] hover:bg-[#FAF7F2]"
              }`}
            >
              {div.title} ({count})
            </button>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-2xl border border-[#EADBCE]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search dish by name or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#580D1A]"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl text-xs font-bold text-[#2B070E] focus:outline-none"
          >
            <option value="all">All Categories ({filteredItems.length})</option>
            {visibleCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dishes Table */}
      <div className="bg-white rounded-3xl border border-[#EADBCE] overflow-hidden shadow-sm">
        {/* Mobile Dish Cards */}
        <div className="md:hidden divide-y divide-[#F4EFE6]">
          {loading ? (
            <div className="text-center py-12 text-xs text-stone-400">
              Loading menu catalog...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12 text-xs text-stone-400">
              No dishes found matching criteria.
            </div>
          ) : (
            filteredItems.map((dish) => (
              <div key={dish.id} className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-full bg-stone-100 overflow-hidden relative flex-shrink-0 border border-[#EADBCE]">
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase font-black text-[#580D1A] block">
                      {getDivisionForCategory(dish.category || dish.categoryId)} • {dish.category?.name || "General"}
                    </span>
                    <span className="font-bold text-[#2B070E] block text-sm truncate">
                      {dish.name}
                    </span>
                    <span className="text-[11px] text-stone-500 line-clamp-1">
                      {dish.description}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(dish)}
                      className="p-1.5 rounded-lg text-stone-500 hover:text-[#580D1A] hover:bg-[#FAF7F2] transition cursor-pointer"
                      aria-label="Edit Dish"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(dish.id)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                      aria-label="Delete Dish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  <span
                    className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                      dish.isVeg ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {dish.isVeg ? "Veg" : "Non-Veg"}
                  </span>
                  {dish.isSignature && (
                    <span className="bg-[#580D1A] text-[#DFC17B] text-[9px] font-black uppercase px-2 py-0.5 rounded">
                      Signature
                    </span>
                  )}
                  {dish.isBestseller && (
                    <span className="bg-[#A37F38] text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded">
                      Bestseller
                    </span>
                  )}
                  {dish.isSpicy && (
                    <span className="bg-[#8B1E26] text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded">
                      Spicy
                    </span>
                  )}
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
                      className="w-20 px-2 py-1 rounded-lg border border-[#EADBCE] bg-[#FAF7F2] text-xs font-black text-[#580D1A]"
                    />
                    {Number(priceDrafts[dish.id]) !== dish.price && (
                      <button
                        type="button"
                        onClick={() => handleQuickPriceSave(dish)}
                        className="px-2 py-1 rounded-lg bg-[#580D1A] text-[#DFC17B] font-bold text-[10px] cursor-pointer"
                      >
                        Save
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => handleToggleStock(dish)}
                    className={`px-3 py-1 rounded-lg font-bold text-xs transition cursor-pointer ${
                      dish.isAvailable
                        ? "bg-[#EBF3E8] text-[#2D5A27] hover:bg-red-50 hover:text-red-700"
                        : "bg-red-100 text-red-700 hover:bg-emerald-50 hover:text-emerald-700"
                    }`}
                  >
                    {dish.isAvailable ? "Available" : "Not Available"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] text-stone-500 uppercase tracking-wider text-[10px] font-bold border-b border-[#EADBCE]">
              <tr>
                <th className="p-4">Dish</th>
                <th className="p-4">Sub-Website &amp; Category</th>
                <th className="p-4">Price (₹)</th>
                <th className="p-4">Badges</th>
                <th className="p-4">Availability</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4EFE6]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-stone-400">
                    Loading menu catalog...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-stone-400">
                    No dishes found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map((dish) => (
                  <tr key={dish.id} className="hover:bg-[#FAF7F2]/60 transition">
                    <td className="p-4 flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-stone-100 overflow-hidden relative flex-shrink-0 border border-[#EADBCE]">
                        <img
                          src={dish.image}
                          alt={dish.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <span className="font-bold text-[#2B070E] block text-sm">
                          {dish.name}
                        </span>
                        <span className="text-[11px] text-stone-500 line-clamp-1 max-w-xs">
                          {dish.description}
                        </span>
                      </div>
                    </td>

                    <td className="p-4 text-stone-600 font-semibold">
                      <span className="text-[10px] uppercase font-black text-[#580D1A] block">
                        {getDivisionForCategory(dish.category || dish.categoryId)}
                      </span>
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
                          className="w-18 px-2 py-1 rounded-lg border border-[#EADBCE] bg-[#FAF7F2] font-black text-[#580D1A]"
                        />
                        {Number(priceDrafts[dish.id]) !== dish.price && (
                          <button
                            type="button"
                            onClick={() => handleQuickPriceSave(dish)}
                            className="px-2 py-1 rounded-lg bg-[#580D1A] text-[#DFC17B] font-bold text-[10px] cursor-pointer"
                          >
                            Save
                          </button>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        <span
                          className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                            dish.isVeg ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {dish.isVeg ? "Veg" : "Non-Veg"}
                        </span>
                        {dish.isSignature && (
                          <span className="bg-[#580D1A] text-[#DFC17B] text-[9px] font-black uppercase px-2 py-0.5 rounded">
                            Signature
                          </span>
                        )}
                        {dish.isBestseller && (
                          <span className="bg-[#A37F38] text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded">
                            Bestseller
                          </span>
                        )}
                        {dish.isSpicy && (
                          <span className="bg-[#8B1E26] text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded">
                            Spicy
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => handleToggleStock(dish)}
                        className={`px-3 py-1 rounded-lg font-bold text-xs transition cursor-pointer ${
                          dish.isAvailable
                            ? "bg-[#EBF3E8] text-[#2D5A27] hover:bg-red-50 hover:text-red-700"
                            : "bg-red-100 text-red-700 hover:bg-emerald-50 hover:text-emerald-700"
                        }`}
                      >
                        {dish.isAvailable ? "Available" : "Not Available"}
                      </button>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenEdit(dish)}
                          className="p-1.5 rounded-lg text-stone-500 hover:text-[#580D1A] hover:bg-[#FAF7F2] transition cursor-pointer"
                          aria-label="Edit Dish"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(dish.id)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                          aria-label="Delete Dish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Dish Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FAF7F2] rounded-3xl border border-[#D4AF37]/50 shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto no-scrollbar"
          >
            <div className="flex justify-between items-center border-b border-[#EADBCE] pb-3">
              <h2 className="text-xl font-bold text-[#2B070E] font-display">
                {editingItem ? "Edit Dish Details" : "Add New Dish to Menu"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDish} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 block">Dish Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded-xl font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700 block">Price (₹) *</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded-xl font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700 block">Category *</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded-xl font-semibold"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({getDivisionForCategory(c)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700 block">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded-xl font-semibold"
                />
              </div>

              <div className="p-3 rounded-2xl bg-white border border-[#EADBCE] flex items-center gap-3">
                <img
                  src={formData.image || "/butter-masala-dosa.jpg"}
                  alt="Preview"
                  className="w-16 h-16 rounded-full object-cover border border-[#D4AF37] flex-shrink-0"
                />
                <div className="flex-1 space-y-1.5">
                  <label className="font-bold text-stone-700 block">
                    Dish Photo (Upload from Device or Enter Path/URL)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="flex-1 px-3 py-2 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl font-semibold"
                    />
                    <label className="px-3.5 py-2 rounded-xl bg-[#580D1A] text-[#DFC17B] font-bold cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingImg ? "..." : "Upload"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          const url = await uploadImage(f);
                          if (url) setFormData({ ...formData, image: url });
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 block">Portion Served</label>
                  <input
                    type="text"
                    placeholder="e.g. 1 Large Dosa + Chutneys"
                    value={formData.portionSize}
                    onChange={(e) => setFormData({ ...formData, portionSize: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded-xl font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700 block">Prep Time</label>
                  <input
                    type="text"
                    value={formData.prepTime}
                    onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded-xl font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700 block">Key Ingredients</label>
                <input
                  type="text"
                  placeholder="e.g. Fermented batter, Desi Ghee, Red garlic karam"
                  value={formData.ingredients}
                  onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded-xl font-semibold"
                />
              </div>

              {/* Toggles */}
              <div className="pt-2 grid grid-cols-2 sm:grid-cols-5 gap-2">
                <label className="flex items-center space-x-2 p-2 rounded-xl bg-white border border-[#EADBCE] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isVeg}
                    onChange={(e) => setFormData({ ...formData, isVeg: e.target.checked })}
                  />
                  <span className="font-bold text-stone-700">Pure Veg</span>
                </label>

                <label className="flex items-center space-x-2 p-2 rounded-xl bg-white border border-[#EADBCE] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isSignature}
                    onChange={(e) => setFormData({ ...formData, isSignature: e.target.checked })}
                  />
                  <span className="font-bold text-stone-700">Signature</span>
                </label>

                <label className="flex items-center space-x-2 p-2 rounded-xl bg-white border border-[#EADBCE] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isBestseller}
                    onChange={(e) => setFormData({ ...formData, isBestseller: e.target.checked })}
                  />
                  <span className="font-bold text-stone-700">Bestseller</span>
                </label>

                <label className="flex items-center space-x-2 p-2 rounded-xl bg-white border border-[#EADBCE] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isSpicy}
                    onChange={(e) => setFormData({ ...formData, isSpicy: e.target.checked })}
                  />
                  <span className="font-bold text-stone-700">Spicy</span>
                </label>

                <label className="flex items-center space-x-2 p-2 rounded-xl bg-white border border-[#EADBCE] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  />
                  <span className="font-bold text-stone-700">In Stock</span>
                </label>
              </div>

              <div className="pt-4 border-t border-[#EADBCE] flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#EADBCE] font-bold text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-maroon-gold px-5 py-2 rounded-xl font-bold cursor-pointer"
                >
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
