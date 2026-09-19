"use client";

import React, { useState, useEffect } from "react";
import { Category } from "@/types";
import { Plus, FolderTree, Trash2, X, Edit2 } from "lucide-react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.categories) setCategories(data.categories);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingCat(null);
    setName("");
    setDescription("");
    setDisplayOrder(categories.length.toString());
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCat(cat);
    setName(cat.name);
    setDescription(cat.description || "");
    setDisplayOrder(cat.displayOrder.toString());
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      if (editingCat) {
        const res = await fetch(`/api/categories/${editingCat.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim(),
            displayOrder: parseInt(displayOrder || "0", 10),
          }),
        });
        if (res.ok) {
          setIsModalOpen(false);
          fetchCategories();
        }
      } else {
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim(),
            displayOrder: parseInt(displayOrder || "0", 10),
          }),
        });
        if (res.ok) {
          setIsModalOpen(false);
          fetchCategories();
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category? Any assigned dishes will be affected.")) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 bg-[#FAF7F2] min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-[#EADBCE] shadow-sm">
        <div>
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#74171E] block">
            Menu Hierarchy & Taxonomy
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2B070E] font-display">
            Menu Categories
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Organize dishes into logical dining sections (Dosas, Idlis, Tiffins, Fast Food, Drinks).
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="btn-maroon-gold px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4 text-[#DFC17B]" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-3 text-center py-20 text-stone-400 text-xs">
            Loading categories...
          </div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white p-6 rounded-3xl border border-[#EADBCE] shadow-sm flex flex-col justify-between space-y-4 hover:border-[#D4AF37] transition"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                    Display Order #{cat.displayOrder}
                  </span>
                  <span className="text-[11px] font-bold text-[#580D1A] bg-[#FAF7F2] border border-[#EADBCE] px-2.5 py-0.5 rounded-md">
                    {cat._count?.items ?? 0} dishes
                  </span>
                </div>
                <h3 className="font-bold text-lg text-[#2B070E] font-heading mt-2">
                  {cat.name}
                </h3>
                {cat.description && (
                  <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-[#F4EFE6] flex items-center justify-between">
                <span className="text-[10px] text-stone-400 font-mono">
                  slug: /{cat.slug}
                </span>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-1.5 text-stone-500 hover:text-[#580D1A] transition"
                    aria-label="Edit Category"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-1.5 text-stone-400 hover:text-red-600 transition"
                    aria-label="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FAF7F2] rounded-3xl border border-[#D4AF37]/50 shadow-2xl max-w-md w-full p-6 space-y-4"
          >
            <div className="flex justify-between items-center border-b border-[#EADBCE] pb-3">
              <h2 className="text-lg font-bold text-[#2B070E] font-display">
                {editingCat ? "Edit Category" : "Add Menu Category"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-stone-700 block">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Crispy Dosas"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded-xl font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700 block">Description</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Thin fermented crepes roasted in desi ghee..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded-xl font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700 block">Display Order</label>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded-xl font-semibold"
                />
              </div>

              <div className="pt-3 border-t border-[#EADBCE] flex justify-end space-x-2">
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
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
