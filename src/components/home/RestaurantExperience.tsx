import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  Users,
  ShieldCheck,
  Zap,
  ShoppingBag,
  Heart,
  ArrowRight,
} from "lucide-react";

export default function RestaurantExperience() {
  const experiences = [
    {
      icon: Users,
      title: "Family-Friendly Dining",
      desc: "A warm, respectful gathering space where grandparents, students, and breakfast aficionados share morning conversations over hot tiffins.",
    },
    {
      icon: ShieldCheck,
      title: "Pristine Kitchen Hygiene",
      desc: "Open counter transparency with food-grade stainless steel cookware, continuous counter sanitization, and RO-purified water throughout.",
    },
    {
      icon: Zap,
      title: "Swift & Piping Hot Service",
      desc: "Fast counter and table service ensuring every dosa arrives at your plate golden crisp, crackling with heat directly from the tava.",
    },
    {
      icon: ShoppingBag,
      title: "Fresh Takeaway Counter",
      desc: "Dedicated parcel counter with food-safe insulated packaging to carry hot idlis, crispy vadas, and chutneys home fresh.",
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-[#F4EFE6] relative overflow-hidden border-t border-[#EADBCE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-white text-[#580D1A] border border-[#EADBCE]">
            <Heart className="w-3.5 h-3.5 text-[#580D1A]" />
            <span>The Guest Experience</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#2B070E] font-display tracking-tight">
            What Visiting Upahar Feels Like
          </h2>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            More than just a meal: it is the lively morning clatter of steel plates, the warm aroma of tempered mustard seeds, and the familiar joy of honest hospitality.
          </p>
        </div>

        {/* Experience Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Visual Showcase Left */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative h-96 rounded-3xl overflow-hidden border border-[#D4AF37]/30 shadow-xl group">
              <Image
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80"
                alt="Welcoming Upahar Restaurant Dining Atmosphere"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141210]/80 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <span className="text-xs uppercase font-extrabold tracking-widest text-[#DFC17B] block">
                  Welcoming Atmosphere
                </span>
                <h3 className="text-xl font-bold font-display">
                  Spacious, Spotless & Always Welcoming
                </h3>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#EADBCE] text-xs text-stone-600 flex items-center justify-between">
              <span className="font-semibold text-[#2B070E]">
                Takeaway Parcel Service Available
              </span>
              <span className="text-[11px] text-[#580D1A] font-bold">
                Direct Counter Pickup
              </span>
            </div>
          </div>

          {/* 4 Pillars Right */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {experiences.map((exp, idx) => {
              const Icon = exp.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-white border border-[#EADBCE] space-y-3 hover:border-[#D4AF37] transition duration-300 shadow-sm"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#EADBCE] flex items-center justify-center text-[#580D1A]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-[#2B070E] font-heading">
                    {exp.title}
                  </h4>
                  <p className="text-stone-600 text-xs leading-relaxed">
                    {exp.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Experience CTA */}
        <div className="mt-14 p-8 rounded-3xl bg-gradient-to-r from-[#2B070E] to-[#4A0E17] text-[#FAF7F2] border border-[#D4AF37]/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#DFC17B]">
              Plan Your Visit Today
            </span>
            <h3 className="text-xl sm:text-2xl font-black font-display">
              Join Us For Fresh Morning Tiffins or Evening Fast Food
            </h3>
            <p className="text-stone-300 text-xs sm:text-sm">
              Located conveniently at 1-1, Sangivalasa, ANITS College Road, beside SBI. Open daily 6 AM-10 AM and 6 PM-10:30 PM.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/experience"
              className="btn-maroon-gold px-6 py-3 rounded-xl text-xs font-bold whitespace-nowrap"
            >
              Visiting Guide
            </Link>
            <a
              href="https://maps.app.goo.gl/6611R6FD1JZagSJt9"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-[#DFC17B] border border-[#D4AF37]/50 transition whitespace-nowrap"
            >
              Get Directions
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
