"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { GalleryImage } from "@/types";
import { X, ZoomIn, Camera, ChevronLeft, ChevronRight } from "lucide-react";

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/gallery")
      .then((res) => res.json())
      .then((data) => {
        if (data.images) setImages(data.images);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const categories = ["All", "Dishes", "Kitchen", "Ambiance", "Heritage"];

  const filteredImages =
    selectedCategory === "All"
      ? images
      : images.filter((img) => img.category === selectedCategory);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowRight") {
        setLightboxIndex((prev) =>
          prev !== null && prev < filteredImages.length - 1 ? prev + 1 : 0
        );
      }
      if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) =>
          prev !== null && prev > 0 ? prev - 1 : filteredImages.length - 1
        );
      }
    };

    if (lightboxIndex !== null) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [lightboxIndex, filteredImages.length]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#380A11] via-[#580D1A] to-[#2B070E] text-[#FAF7F2] py-20 px-4 text-center relative overflow-hidden border-b border-[#D4AF37]/30">
        <div className="max-w-3xl mx-auto relative z-10 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-black/40 border border-[#D4AF37]/40 text-[#DFC17B]">
            <Camera className="w-3.5 h-3.5 text-[#DFC17B]" />
            <span>Visual Culinary Chronicle</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-white">
            Photo Gallery Showcase
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Feast your eyes on our golden roasted dosas, cloud-soft idlis, live cast-iron kitchen, and authentic South Indian restaurant atmosphere.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20 space-y-8">
        {/* Category Tabs */}
        <div className="bg-white p-3 rounded-2xl shadow-xl border border-[#EADBCE] flex items-center justify-center gap-2 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setLightboxIndex(null);
              }}
              className={`px-5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-[#580D1A] text-[#DFC17B] border border-[#D4AF37] shadow-sm"
                  : "bg-[#FAF7F2] text-stone-700 hover:bg-[#EADBCE]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-3xl h-64 shimmer-gold border border-[#EADBCE]"
                />
              ))}
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-[#EADBCE] p-8 space-y-3">
              <Camera className="w-10 h-10 text-[#C5A059] mx-auto opacity-60" />
              <h3 className="text-lg font-bold text-[#2B070E]">No images found</h3>
              <p className="text-stone-500 text-xs">
                No photographs in this category yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredImages.map((img, idx) => (
                <div
                  key={img.id}
                  onClick={() => setLightboxIndex(idx)}
                  className="brand-card group relative h-72 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer border border-[#EADBCE] bg-[#141210]"
                >
                  <Image
                    src={img.imageUrl}
                    alt={img.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#141210]/85 via-[#141210]/20 to-transparent opacity-85 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 text-white">
                    <span className="text-[10px] text-[#DFC17B] font-black uppercase tracking-wider">
                      {img.category}
                    </span>
                    <h4 className="font-bold text-sm text-[#FAF7F2] font-heading mt-0.5 line-clamp-1">
                      {img.title}
                    </h4>
                    {img.caption && (
                      <p className="text-[11px] text-stone-300 line-clamp-1 mt-0.5">
                        {img.caption}
                      </p>
                    )}
                    <div className="mt-2 flex items-center space-x-1 text-[11px] text-[#DFC17B] font-bold">
                      <ZoomIn className="w-3.5 h-3.5" />
                      <span>Click to enlarge</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && filteredImages[lightboxIndex] && (
        <div
          onClick={() => setLightboxIndex(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-5 right-5 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
            aria-label="Close Lightbox"
          >
            <X className="w-5 h-5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((prev) =>
                prev !== null && prev > 0 ? prev - 1 : filteredImages.length - 1
              );
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((prev) =>
                prev !== null && prev < filteredImages.length - 1 ? prev + 1 : 0
              );
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[85vh] w-full flex flex-col items-center"
          >
            <div className="relative w-full h-[60vh] sm:h-[70vh] rounded-3xl overflow-hidden border border-[#D4AF37]/30 shadow-2xl">
              <Image
                src={filteredImages[lightboxIndex].imageUrl}
                alt={filteredImages[lightboxIndex].title}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>

            <div className="mt-4 text-center space-y-1 text-white">
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#DFC17B]">
                {filteredImages[lightboxIndex].category}
              </span>
              <h3 className="text-lg font-bold font-display">
                {filteredImages[lightboxIndex].title}
              </h3>
              {filteredImages[lightboxIndex].caption && (
                <p className="text-xs text-stone-300 max-w-md mx-auto">
                  {filteredImages[lightboxIndex].caption}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
