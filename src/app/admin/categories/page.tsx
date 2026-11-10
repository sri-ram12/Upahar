"use client";

import React, { useState, useEffect } from "react";
import { Category } from "@/types";
import { Plus, Trash2, X, Edit2, Upload } from "lucide-react";
import { UPAHAR_DIVISION_LIST, getDivisionForCategory, type DivisionKey } from "@/lib/store-hours";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [division, setDivision] = useState<DivisionKey>("tiffins");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [uploading, setUploading] = useState(false);

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
    setDivision("fast-food");
    setImage("/ghee-karam-dosa.jpg");
    setDescription("");
    setDisplayOrder(categories.length.toString());
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCat(cat);
    setName(cat.name);
    setDivision(getDivisionForCategory(cat));
    setImage(cat.image || "");
    setDescription(cat.description || "");
    setDisplayOrder(cat.displayOrder.toString());
    setIsModalOpen(true);
  };

  const handleUploadImage = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.url) {
        setImage(data.url);
      } else {
        alert(data.error || "Failed to upload category photo");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name: name.trim(),
      division,
      image: image.trim() || null,
      description: description.trim(),
      displayOrder: parseInt(displayOrder || "0", 10),
    };

    try {
      if (editingCat) {
        const res = await fetch(`/api/categories/${editingCat.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setIsModalOpen(false);
          fetchCategories();
        }
      } else {
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
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
            Menu Hierarchy &amp; Circular Icons
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2B070E] font-display">
            Menu Categories (4 Sub-Websites)
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Assign categories to Upahar Tiffins, Biryanis, Fast Foods, or Pickles and set their circular thumbnail images.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="btn-maroon-gold px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition flex items-center space-x-1.5 cursor-pointer"
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
          categories.map((cat) => {
            const catDivision = getDivisionForCategory(cat);
            return (
              <div
                key={cat.id}
                className="bg-white p-6 rounded-3xl border border-[#EADBCE] shadow-sm flex flex-col justify-between space-y-4 hover:border-[#D4AF37] transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase font-black text-white bg-[#580D1A] px-2.5 py-0.5 rounded-full tracking-wider">
                      {catDivision}
                    </span>
                    <span className="text-[11px] font-bold text-[#580D1A] bg-[#FAF7F2] border border-[#EADBCE] px-2.5 py-0.5 rounded-md">
                      {cat._count?.items ?? 0} dishes
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-3">
                    <img
                      src={cat.image || "/ghee-karam-dosa.jpg"}
                      alt={cat.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#D4AF37]/60 flex-shrink-0"
                    />
                    <h3 className="font-bold text-lg text-[#2B070E] font-heading">
                      {cat.name}
                    </h3>
                  </div>

                  {cat.description && (
                    <p className="text-xs text-stone-600 mt-2 line-clamp-2 leading-relaxed">
                      {cat.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-[#F4EFE6] flex items-center justify-between">
                  <span className="text-[10px] text-stone-400 font-mono">
                    #{cat.displayOrder} • /{cat.slug}
                  </span>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1.5 text-stone-500 hover:text-[#580D1A] transition cursor-pointer"
                      aria-label="Edit Category"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-1.5 text-stone-400 hover:text-red-600 transition cursor-pointer"
                      aria-label="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
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
                <label className="font-bold text-stone-700 block">Sub-Website *</label>
                <select
                  value={division}
                  onChange={(e) => setDivision(e.target.value as DivisionKey)}
                  className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded-xl font-bold"
                >
                  {UPAHAR_DIVISION_LIST.map((div) => (
                    <option key={div.key} value={div.key}>
                      {div.title}
                    </option>
                  ))}
                </select>
              </div>

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

              <div className="p-3 rounded-2xl bg-white border border-[#EADBCE] flex items-center gap-3">
                <img
                  src={image || "/ghee-karam-dosa.jpg"}
                  alt="Circular preview"
                  className="w-12 h-12 rounded-full object-cover border border-[#D4AF37] flex-shrink-0"
                />
                <div className="flex-1 space-y-1.5">
                  <label className="font-bold text-stone-700 block">Circular Icon Image</label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="/images/dishes/..."
                      className="flex-1 px-2.5 py-1.5 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl font-semibold"
                    />
                    <label className="px-3 py-1.5 rounded-xl bg-[#580D1A] text-[#DFC17B] font-bold cursor-pointer inline-flex items-center gap-1 whitespace-nowrap">
                      <Upload className="w-3 h-3" />
                      <span>{uploading ? "..." : "Upload"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleUploadImage(f);
                        }}
                      />
                    </label>
                  </div>
                </div>
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
                  className="btn-maroon-gold px-5 py-2 rounded-xl font-bold cursor-pointer"
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
