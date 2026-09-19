"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FoodItem, Category } from "@/types";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Sparkles,
  Flame,
  Check,
  X,
  Clock,
  UtensilsCrossed,
} from "lucide-react";

export default function AdminMenuPage() {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");
  const [loading, setLoading] = useState(true);

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
      if (menuData.items) setItems(menuData.items);
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

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      price: "",
      description: "",
      categoryId: categories[0]?.id || "",
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

  const filteredItems = items.filter((item) => {
    const matchesCat = selectedCat === "all" || item.categoryId === selectedCat;
    const matchesSearch =
      searchQuery === "" ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="p-6 sm:p-8 space-y-6 bg-[#FAF7F2] min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-[#EADBCE] shadow-sm">
        <div>
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#74171E] block">
            Digital Menu Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2B070E] font-display">
            Manage Food Dishes
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Add new tiffins, update prices, manage ingredients, and toggle availability.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="btn-maroon-gold px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4 text-[#DFC17B]" />
          <span>Add New Dish</span>
        </button>
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
            <option value="all">All Categories ({items.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dishes Table */}
      <div className="bg-white rounded-3xl border border-[#EADBCE] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] text-stone-500 uppercase tracking-wider text-[10px] font-bold border-b border-[#EADBCE]">
              <tr>
                <th className="p-4">Dish</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
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
                      <div className="w-12 h-12 rounded-xl bg-stone-100 overflow-hidden relative flex-shrink-0">
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
                      {dish.category?.name || "General"}
                    </td>

                    <td className="p-4 font-black text-sm text-[#580D1A] font-display">
                      ₹{dish.price}
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
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
                        className={`px-3 py-1 rounded-lg font-bold text-xs transition ${
                          dish.isAvailable
                            ? "bg-[#EBF3E8] text-[#2D5A27] hover:bg-red-50 hover:text-red-700"
                            : "bg-red-100 text-red-700 hover:bg-emerald-50 hover:text-emerald-700"
                        }`}
                      >
                        {dish.isAvailable ? "Available" : "Sold Out"}
                      </button>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenEdit(dish)}
                          className="p-1.5 rounded-lg text-stone-500 hover:text-[#580D1A] hover:bg-[#FAF7F2] transition"
                          aria-label="Edit Dish"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(dish.id)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition"
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
                      {c.name}
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

              <div className="space-y-1">
                <label className="font-bold text-stone-700 block">Image URL</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded-xl font-semibold"
                />
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
              <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                  className="btn-maroon-gold px-5 py-2 rounded-xl font-bold"
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
