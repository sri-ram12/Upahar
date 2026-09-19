"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { GalleryImage } from "@/types";
import { Plus, Trash2, Camera, X } from "lucide-react";

export default function AdminGalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "Dishes",
    imageUrl: "",
    caption: "",
    isAmbiance: false,
  });

  const fetchImages = async () => {
    try {
      const res = await fetch("/api/gallery");
      const data = await res.json();
      if (data.images) setImages(data.images);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.imageUrl) return;

    try {
      const res = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setFormData({
          title: "",
          category: "Dishes",
          imageUrl: "",
          caption: "",
          isAmbiance: false,
        });
        fetchImages();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this photo?")) return;
    try {
      const res = await fetch(`/api/gallery?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setImages((prev) => prev.filter((img) => img.id !== id));
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
            Media & Photography Library
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2B070E] font-display">
            Photo Gallery Manager
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Manage high-resolution dish photography and restaurant ambiance showcased to visitors.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-maroon-gold px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4 text-[#DFC17B]" />
          <span>Add New Photograph</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {loading ? (
          <div className="col-span-4 text-center py-20 text-stone-400 text-xs">
            Loading photo gallery...
          </div>
        ) : images.length === 0 ? (
          <div className="col-span-4 text-center py-20 bg-white rounded-3xl border border-[#EADBCE] p-8 space-y-3">
            <Camera className="w-8 h-8 text-[#C5A059] mx-auto opacity-70" />
            <h3 className="text-lg font-bold text-[#2B070E]">No photos yet</h3>
            <p className="text-stone-500 text-xs">
              Add your first photo using the button above.
            </p>
          </div>
        ) : (
          images.map((img) => (
            <div
              key={img.id}
              className="bg-white rounded-2xl border border-[#EADBCE] shadow-sm overflow-hidden flex flex-col justify-between"
            >
              <div className="relative h-48 w-full bg-stone-100">
                <Image
                  src={img.imageUrl}
                  alt={img.title}
                  fill
                  sizes="300px"
                  className="object-cover"
                />
                <span className="absolute top-2 left-2 bg-[#2B070E]/80 text-[#DFC17B] text-[9px] font-black uppercase px-2 py-0.5 rounded">
                  {img.category}
                </span>
              </div>

              <div className="p-4 space-y-2">
                <div>
                  <h4 className="font-bold text-xs text-[#2B070E] line-clamp-1">
                    {img.title}
                  </h4>
                  {img.caption && (
                    <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                      {img.caption}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-[#F4EFE6] flex justify-end">
                  <button
                    onClick={() => handleDelete(img.id)}
                    className="p-1.5 text-stone-400 hover:text-red-600 transition"
                    aria-label="Delete image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Photo Modal */}
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
                Add Photo to Showcase
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-stone-700 block">Photo Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Crisp Ghee Karam Dosa on Banana Leaf"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded-xl font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700 block">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value,
                      isAmbiance: e.target.value === "Ambiance" || e.target.value === "Kitchen",
                    })
                  }
                  className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded-xl font-semibold"
                >
                  <option value="Dishes">Dishes & Food</option>
                  <option value="Kitchen">Live Kitchen Counter</option>
                  <option value="Ambiance">Restaurant Ambiance</option>
                  <option value="Heritage">Brassware & Heritage</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700 block">Image URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded-xl font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700 block">Caption / Subtitle</label>
                <input
                  type="text"
                  placeholder="e.g. Roasted on hot cast iron with pure ghee"
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
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
                  Save Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
