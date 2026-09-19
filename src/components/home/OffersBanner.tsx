"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, MessageSquare, ArrowRight, Award, Utensils } from "lucide-react";

export default function OffersBanner() {
  const specials = [
    {
      title: "Dawn Tiffin Combo",
      timing: "6:30 AM – 11:30 AM",
      desc: "Button Sambar Idli (14 Pcs) + Ghee Karam Dosa + Degree Filter Coffee",
      tag: "Breakfast Favorite",
      price: "₹180 Only",
    },
    {
      title: "Evening Street Sizzle",
      timing: "4:00 PM – 8:00 PM",
      desc: "Amul Butter Pav Bhaji + Crispy Paneer 65 + Chilled Kesar Badam Milk",
      tag: "Evening Special",
      price: "₹280 Only",
    },
    {
      title: "Catering & Group Dining",
      timing: "Pre-order on WhatsApp",
      desc: "Authentic pure ghee breakfast spreads delivered fresh for family gatherings & office events",
      tag: "Special Orders",
      price: "Inquire Directly",
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-br from-[#380A11] via-[#580D1A] to-[#2B070E] text-[#FAF7F2] relative overflow-hidden border-y border-[#D4AF37]/30">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-black/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-[#141210]/60 border border-[#D4AF37]/40 text-[#DFC17B] text-xs font-bold uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#DFC17B]" />
            <span>Daily Culinary Combos & Special Highlights</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black font-display text-white">
            Specially Curated Taste Experiences
          </h2>
          <p className="text-stone-200 text-sm mt-2">
            Enjoy our most cherished signature pairings crafted fresh with pure desi ghee.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {specials.map((sp) => (
            <div
              key={sp.title}
              className="p-6 rounded-3xl bg-[#141210]/80 border border-[#D4AF37]/30 shadow-2xl flex flex-col justify-between hover:border-[#D4AF37] transition duration-300 group"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] uppercase font-bold text-[#DFC17B] bg-[#580D1A] px-2.5 py-1 rounded-lg border border-[#D4AF37]/30">
                    {sp.tag}
                  </span>
                  <span className="text-xs font-bold text-stone-400">
                    {sp.timing}
                  </span>
                </div>

                <h3 className="text-xl font-bold font-display text-white group-hover:text-[#DFC17B] transition">
                  {sp.title}
                </h3>
                <p className="text-xs text-stone-300 mt-2 leading-relaxed">
                  {sp.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-800 flex items-center justify-between">
                <span className="text-base font-black text-[#DFC17B] font-display">
                  {sp.price}
                </span>

                <a
                  href={`https://wa.me/919885455342?text=${encodeURIComponent(
                    `Hello Upahar Tiffins, I am interested in your ${sp.title} special.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 transition"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp Inquire</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
