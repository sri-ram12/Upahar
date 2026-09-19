import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  UtensilsCrossed,
  Flame,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  HeartHandshake,
} from "lucide-react";

export default function StorySection() {
  return (
    <section id="story" className="py-20 lg:py-28 bg-[#FAF7F2] relative overflow-hidden">
      {/* Decorative background watermark */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-[#EADBCE] text-[#580D1A]">
            <UtensilsCrossed className="w-3.5 h-3.5 text-[#580D1A]" />
            <span>The Upahar Heritage</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#2B070E] font-display tracking-tight">
            The Soul of Honest South Indian Food
          </h2>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            Founded with a commitment to uncompromised tradition: stone-ground grains, natural overnight fermentation, pure desi ghee, and the timeless warmth of Indian hospitality.
          </p>
        </div>

        {/* Story Block 1: The Batter Craft (Image Left, Story Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center mb-20">
          <div className="lg:col-span-6 relative">
            <div className="relative h-80 sm:h-96 rounded-3xl overflow-hidden border border-[#D4AF37]/30 shadow-xl group">
              <Image
                src="https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=900&q=80"
                alt="Stone-ground batter preparation and crispy golden dosa"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 bg-black/40 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-white text-xs">
                <span className="font-bold text-[#DFC17B] block">Traditional Granite Grinding</span>
                <span className="text-[11px] text-stone-200">
                  Urad dal & parboiled rice ground slow to preserve natural active nutrients.
                </span>
              </div>
            </div>
            {/* Decorative Gold Border Badge */}
            <div className="hidden sm:flex absolute -bottom-5 -right-5 bg-[#580D1A] text-[#DFC17B] border border-[#D4AF37] p-4 rounded-2xl shadow-xl flex-col items-center text-center">
              <span className="text-xl font-black font-display">100%</span>
              <span className="text-[9px] uppercase font-bold tracking-widest text-[#FAF7F2]">
                Natural Ferment
              </span>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-[#74171E]">
              <Sparkles className="w-4 h-4 text-[#C5A059]" />
              <span>Our Food Philosophy</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-[#2B070E] font-display leading-snug">
              Why Our Batter Yields That Signature Crisp & Cloud-Soft Center
            </h3>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              In an era of commercial shortcuts and packaged mixes, UPAHAR stays anchored to the authentic method. Every morning begins with traditional granite wet grinders slowly churning urad dal into airy lightness and parboiled rice into fine rava.
            </p>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              We allow nature to do the work through unhurried overnight fermentation. This ancient process imparts our dosas with their golden lace-like crunch and our idlis with their legendary feather-light softness.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white border border-[#EADBCE] text-xs font-semibold text-[#2B070E]">
                <ShieldCheck className="w-4 h-4 text-[#2D5A27]" />
                <span>Zero Artificial Preservatives</span>
              </div>
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white border border-[#EADBCE] text-xs font-semibold text-[#2B070E]">
                <Flame className="w-4 h-4 text-[#580D1A]" />
                <span>Cast-Iron Heavy Tavas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Story Block 2: The Sizzle & Desi Ghee (Story Left, Image Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-6 order-2 lg:order-1 space-y-5">
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-[#74171E]">
              <Flame className="w-4 h-4 text-[#D4AF37]" />
              <span>Sizzling Live Kitchen</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-[#2B070E] font-display leading-snug">
              Roasted in Pure Desi Ghee, Tempered with Whole Spices
            </h3>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              The soul of a South Indian tiffin center is its live counter. When batter touches the red-hot cast-iron tava, that unmistakable hiss accompanied by a ladle of fragrant golden desi ghee creates an aroma that draws morning commuters from blocks away.
            </p>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              Our signature allam-karam (fiery red garlic and ginger chutney) is rubbed onto crisp crusted crepes before folding, served beside thick freshly ground coconut chutney and piping drumstick sambar brewed in small batches throughout the day.
            </p>

            <div className="pt-3">
              <Link
                href="/about"
                className="inline-flex items-center space-x-2 font-bold text-xs uppercase tracking-wider text-[#580D1A] hover:text-[#74171E] transition group"
              >
                <span>Read More About Our Kitchen & Values</span>
                <ArrowRight className="w-4 h-4 text-[#D4AF37] group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2 relative">
            <div className="relative h-80 sm:h-96 rounded-3xl overflow-hidden border border-[#D4AF37]/30 shadow-xl group">
              <Image
                src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80"
                alt="Upahar Kitchen Live Tiffin Preparation Counter"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 bg-black/40 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-white text-xs">
                <span className="font-bold text-[#DFC17B] block">Fresh Batches Every Hour</span>
                <span className="text-[11px] text-stone-200">
                  Open live counters with food-grade stainless steel cookware and pristine hygiene.
                </span>
              </div>
            </div>

            {/* Decorative Hospitality Badge */}
            <div className="hidden sm:flex absolute -top-5 -left-5 bg-white text-[#2B070E] border border-[#EADBCE] p-4 rounded-2xl shadow-xl items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#580D1A] flex items-center justify-center text-[#DFC17B]">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-xs font-black block">Warm Hospitality</span>
                <span className="text-[10px] text-stone-500 block">Every guest treated like family</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
