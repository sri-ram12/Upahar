"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import {
  X,
  Clock,
  Flame,
  Sparkles,
  ShieldCheck,
  Compass,
  Phone,
  MessageSquare,
} from "lucide-react";
import { FoodItem } from "@/types";

interface DishDetailModalProps {
  item: FoodItem | null;
  onClose: () => void;
}

export default function DishDetailModal({ item, onClose }: DishDetailModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (item) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dish-modal-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-[#FAF7F2] rounded-3xl overflow-hidden border border-[#D4AF37]/50 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-[#141210]/70 hover:bg-[#141210] text-[#FAF7F2] flex items-center justify-center transition border border-white/20"
          aria-label="Close details"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Image */}
        <div className="relative h-64 sm:h-72 w-full bg-[#141210] flex-shrink-0">
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141210] via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            {item.isSignature && (
              <span className="bg-[#580D1A] text-[#DFC17B] text-xs font-black uppercase tracking-wider px-3 py-1 rounded-lg border border-[#D4AF37]/60 shadow-md">
                Chef's Signature
              </span>
            )}
            {item.isBestseller && !item.isSignature && (
              <span className="bg-[#A37F38] text-[#FAF7F2] text-xs font-black uppercase tracking-wider px-3 py-1 rounded-lg shadow-md flex items-center space-x-1">
                <Sparkles className="w-3 h-3" />
                <span>Popular Choice</span>
              </span>
            )}
            {item.isSpicy && (
              <span className="bg-[#8B1E26] text-white text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-lg flex items-center space-x-1">
                <Flame className="w-3 h-3 text-[#DFC17B]" />
                <span>Spicy Preparation</span>
              </span>
            )}
          </div>

          <div className="absolute bottom-4 left-5 right-5">
            <h3 id="dish-modal-title" className="text-2xl sm:text-3xl font-black text-white font-display">
              {item.name}
            </h3>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto no-scrollbar">
          {/* Price & Meta Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#EADBCE]">
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider block">
                Menu Price
              </span>
              <span className="text-2xl font-black text-[#2B070E] font-display">
                ₹{item.price}
              </span>
            </div>

            <div className="flex items-center space-x-4 text-xs text-stone-600">
              <span className="flex items-center space-x-1 font-semibold">
                <Clock className="w-4 h-4 text-[#580D1A]" />
                <span>{item.prepTime || "10-15 mins"}</span>
              </span>

              <div className="flex items-center space-x-1.5 font-bold text-[#2D5A27] bg-[#EBF3E8] px-2.5 py-1 rounded-lg">
                <div className="w-3 h-3 border-2 border-[#2D5A27] rounded-xs flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#2D5A27]" />
                </div>
                <span>100% Pure Veg</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs uppercase font-extrabold tracking-wider text-[#74171E]">
              Culinary Description
            </h4>
            <p className="text-stone-700 text-sm leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Portion & Ingredients */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {item.portionSize && (
              <div className="p-3.5 rounded-2xl bg-white border border-[#EADBCE]">
                <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                  Portion Served
                </span>
                <span className="text-xs font-bold text-[#2B070E] mt-0.5 block">
                  {item.portionSize}
                </span>
              </div>
            )}

            {item.ingredients && (
              <div className="p-3.5 rounded-2xl bg-white border border-[#EADBCE]">
                <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                  Key Ingredients
                </span>
                <span className="text-xs font-bold text-[#580D1A] mt-0.5 block">
                  {item.ingredients}
                </span>
              </div>
            )}
          </div>

          {/* Kitchen Guarantee */}
          <div className="p-3.5 rounded-2xl bg-[#EADBCE]/40 border border-[#D4AF37]/30 flex items-center space-x-3 text-xs text-stone-700">
            <ShieldCheck className="w-5 h-5 text-[#2D5A27] flex-shrink-0" />
            <span>
              Prepared fresh per order with stone-ground batter, pure desi ghee, and RO-purified cooking water.
            </span>
          </div>

          {/* Action Row */}
          <div className="pt-3 border-t border-[#EADBCE] flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <a
              href={`https://wa.me/919885455342?text=${encodeURIComponent(
                `Hello Sri Vamsi, I would like more details about ${item.name} (₹${item.price}) at Upahar Tiffins.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
            >
              <MessageSquare className="w-3.5 h-3.5 text-white" />
              <span>WhatsApp Sri Vamsi</span>
            </a>

            <a
              href="https://maps.app.goo.gl/6611R6FD1JZagSJt9"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-maroon-gold w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5"
            >
              <Compass className="w-3.5 h-3.5 text-[#DFC17B]" />
              <span>Get Directions</span>
            </a>

            <a
              href="tel:+919885455342"
              className="btn-gold-outline w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5"
            >
              <Phone className="w-3.5 h-3.5 text-[#580D1A]" />
              <span>Call (+91 9885455342)</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
