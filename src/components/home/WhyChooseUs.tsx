"use client";

import React from "react";
import { ShieldCheck, Sparkles, Flame, Clock, HeartHandshake, CheckCircle } from "lucide-react";

export default function WhyChooseUs() {
  const pillars = [
    {
      icon: <Sparkles className="w-6 h-6 text-[#DFC17B]" />,
      title: "Stone-Ground Batter Daily",
      desc: "Fresh batches ground every dawn using traditional granite wet grinders. Naturally fermented without yeast, soda, or preservatives.",
    },
    {
      icon: <Flame className="w-6 h-6 text-[#DFC17B]" />,
      title: "100% Pure Village Desi Ghee",
      desc: "Every signature dosa, button idli bowl, and upma is doused in fragrant pure cow ghee for authentic aroma and effortless digestion.",
    },
    {
      icon: <Clock className="w-6 h-6 text-[#DFC17B]" />,
      title: "Hourly Simmered Sambar",
      desc: "Slow-simmered throughout the day with fresh drumsticks, shallots, and hand-pounded whole spices. Never reheated from yesterday.",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#DFC17B]" />,
      title: "Uncompromising Pure Veg Hygiene",
      desc: "A strictly 100% pure vegetarian kitchen using 5-stage RO purified cooking water, stainless steel preparation counters, and spotless dining halls.",
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-[#FAF7F2] text-[#141210] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-[#580D1A]/10 text-[#580D1A] text-xs font-bold uppercase tracking-widest mb-3">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Our Heritage Commitment</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black font-display text-[#2B070E]">
            Four Pillars of Upahar Freshness
          </h2>
          <p className="text-stone-600 text-sm mt-2">
            Why families and food enthusiasts across Secunderabad have trusted us since 1994.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((p) => (
            <div
              key={p.title}
              className="p-6 rounded-3xl bg-white border border-[#EADBCE] hover:border-[#D4AF37] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#580D1A] to-[#2B070E] border border-[#D4AF37]/50 flex items-center justify-center mb-5 shadow-md group-hover:scale-105 transition">
                  {p.icon}
                </div>
                <h3 className="font-bold font-display text-lg text-[#2B070E] group-hover:text-[#580D1A] transition">
                  {p.title}
                </h3>
                <p className="text-xs text-stone-600 mt-2.5 leading-relaxed">
                  {p.desc}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-[#F4EFE6] flex items-center space-x-1.5 text-[11px] font-bold text-[#2D5A27]">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Verified Kitchen Standard</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
