import React from "react";
import {
  Sparkles,
  Flame,
  ShieldCheck,
  Clock,
  HeartHandshake,
  Coins,
} from "lucide-react";

export default function WhyUpahar() {
  const pillars = [
    {
      icon: Flame,
      title: "Stone-Ground Batter Daily",
      desc: "Urad dal and parboiled rice ground slow in traditional granite grinders, naturally fermented for airy idlis and golden dosas.",
    },
    {
      icon: ShieldCheck,
      title: "100% Pure Desi Ghee",
      desc: "Our tiffins and karam dosas are roasted in pure aromatic desi ghee with single-use cooking oil for light digestion.",
    },
    {
      icon: Clock,
      title: "Hourly Sambar Brews",
      desc: "Authentic drumstick sambar and coconut-ginger chutneys freshly prepared multiple times daily with whole spices.",
    },
    {
      icon: Sparkles,
      title: "Open Kitchen Hygiene",
      desc: "Food-grade stainless steel cookware, RO-purified cooking water, and transparent live cooking stations.",
    },
    {
      icon: Coins,
      title: "Honest & Affordable Value",
      desc: "Generous wholesome portions made with premium ingredients at fair prices for everyday community dining.",
    },
    {
      icon: HeartHandshake,
      title: "Genuine Indian Hospitality",
      desc: "Every guest welcomed with warm service, whether grabbing a quick filter coffee or dining with extended family.",
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-[#FAF7F2] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-[#EADBCE] text-[#580D1A]">
            <Sparkles className="w-3.5 h-3.5 text-[#580D1A]" />
            <span>The Six Pillars of Upahar</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#2B070E] font-display tracking-tight">
            Why Food Enthusiasts Choose Us
          </h2>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            Our daily promise to every diner who walks through our doors: authentic taste, pure ingredients, and zero compromises.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="brand-card p-6 sm:p-7 bg-white border border-[#EADBCE] space-y-3 hover:border-[#D4AF37] transition duration-300 shadow-sm"
              >
                <div className="w-11 h-11 rounded-xl bg-[#580D1A] flex items-center justify-center text-[#DFC17B] shadow-md shadow-[#4A0E17]/20">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-[#2B070E] font-heading">
                  {p.title}
                </h3>
                <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                  {p.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
