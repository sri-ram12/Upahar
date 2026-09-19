"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Camera,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Maximize2,
} from "lucide-react";
import { GalleryImage } from "@/types";

interface GallerySectionProps {
  initialImages: GalleryImage[];
}

export default function GallerySection({ initialImages }: GallerySectionProps) {
  const [activeTab, setActiveTab] = useState<"All" | "Dishes" | "Ambiance" | "Kitchen">("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filteredImages = initialImages.filter((img) => {
    if (activeTab === "All") return true;
    if (activeTab === "Dishes") return !img.isAmbiance || img.category === "Dishes";
    if (activeTab === "Ambiance") return img.isAmbiance && (img.category === "Ambiance" || img.category === "Heritage");
    if (activeTab === "Kitchen") return img.category === "Kitchen" || img.isAmbiance;
    return true;
  });

  // Lightbox keyboard controls
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
    <section id="gallery" className="py-20 lg:py-28 bg-[#141210] text-[#FAF7F2] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-[#2B070E] border border-[#D4AF37]/30 text-[#DFC17B] mb-2">
              <Camera className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Visual Showcase</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-[#FAF7F2]">
              The Upahar Photo Gallery
            </h2>
            <p className="text-stone-400 text-sm sm:text-base mt-2 max-w-xl">
              An authentic glimpse into our golden roasted dosas, cloud-soft idlis, live cast-iron counters, and dining ambiance.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {(["All", "Dishes", "Ambiance", "Kitchen"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setLightboxIndex(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                  activeTab === tab
                    ? "bg-[#580D1A] text-[#DFC17B] border border-[#D4AF37]"
                    : "bg-[#1C1917] text-stone-400 hover:text-[#FAF7F2] border border-stone-800"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Asymmetric Masonry Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredImages.map((img, idx) => {
            const isSpanned = idx === 0 || idx === 5;
            return (
              <div
                key={img.id || idx}
                onClick={() => setLightboxIndex(idx)}
                className={`relative rounded-2xl overflow-hidden border border-stone-800 hover:border-[#D4AF37]/60 group cursor-pointer shadow-lg transition-all duration-300 ${
                  isSpanned ? "sm:col-span-2 h-72 sm:h-80" : "h-72"
                }`}
              >
                <Image
                  src={img.imageUrl}
                  alt={img.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141210]/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-[#DFC17B] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-4 h-4" />
                </div>

                <div className="absolute bottom-3 left-4 right-4">
                  <span className="text-[10px] uppercase font-bold text-[#DFC17B] tracking-wider block">
                    {img.category}
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-white font-heading line-clamp-1">
                    {img.title}
                  </h4>
                  {img.caption && (
                    <p className="text-[11px] text-stone-300 line-clamp-1 mt-0.5 opacity-90">
                      {img.caption}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Dedicated Gallery Link */}
        <div className="mt-12 text-center">
          <Link
            href="/gallery"
            className="inline-flex items-center space-x-2 text-xs uppercase font-black tracking-wider text-[#DFC17B] hover:text-white transition"
          >
            <span>View Full Screen Gallery Collection</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && filteredImages[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-5 right-5 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
            aria-label="Close Lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation Arrows */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((prev) =>
                prev !== null && prev > 0 ? prev - 1 : filteredImages.length - 1
              );
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
            aria-label="Previous Image"
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
            aria-label="Next Image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Image Container */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[85vh] w-full flex flex-col items-center"
          >
            <div className="relative w-full h-[60vh] sm:h-[70vh] rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-2xl">
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
    </section>
  );
}
