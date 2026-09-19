import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  UtensilsCrossed,
  ShieldCheck,
  Flame,
  Clock,
  Sparkles,
  HeartHandshake,
  Compass,
  ArrowRight,
} from "lucide-react";

export const metadata = {
  title: "Our Heritage & Story | UPAHAR TIFFINS AND FAST FOOD",
  description:
    "Learn the story of UPAHAR TIFFINS AND FAST FOOD - traditional granite stone-ground batter, pure desi ghee, hourly fresh sambar, and authentic South Indian hospitality in Sangivalasa.",
};

export default function AboutPage() {
  const pillars = [
    {
      title: "Daily Granite Stone-Ground Batter",
      desc: "Great dosas and idlis begin long before heat touches the tava. We grind premium urad dal and parboiled rice daily using heavy granite wet grinders. Natural unhurried fermentation allows the batter to breathe, yielding that signature feather-light idli and crispy golden dosa.",
    },
    {
      title: "Pure Desi Ghee & Fresh Cooking Oil",
      desc: "We believe in honest cooking without shortcuts. Our tava specialties and karam dosas are roasted in pure fragrant desi ghee. We maintain a strict single-use cooking oil policy so every meal is light on the stomach and wholesome.",
    },
    {
      title: "Small-Batch Hourly Sambar & Chutneys",
      desc: "A South Indian tiffin is defined by its accompaniments. We freshly grind thick coconut chutney, fiery allam (ginger) pachadi, and slow-simmer drumstick sambar with roasted whole spices in fresh batches multiple times a day.",
    },
    {
      title: "Open Live Kitchen & Spotless Hygiene",
      desc: "Transparency is our foundation. Diners can witness their dosas swirled and folded on seasoned cast-iron plates. We use food-grade stainless steel cookware and 100% RO-purified water for all cooking.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#380A11] via-[#580D1A] to-[#2B070E] text-[#FAF7F2] py-20 px-4 text-center relative overflow-hidden border-b border-[#D4AF37]/30">
        <div className="max-w-3xl mx-auto relative z-10 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-black/40 border border-[#D4AF37]/40 text-[#DFC17B]">
            <UtensilsCrossed className="w-3.5 h-3.5 text-[#DFC17B]" />
            <span>Culinary Heritage</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-white">
            The Story of UPAHAR
          </h1>
          <p className="text-stone-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Crafting heartwarming South Indian breakfast staples and vibrant street-style fast food with genuine passion, warmth, and honest ingredients.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 space-y-12">
        {/* Story Section Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-12 border border-[#EADBCE] shadow-xl space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-5">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#74171E] block">
                Tradition Meets Daily Life
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-[#2B070E] font-display tracking-tight leading-snug">
                Born From a Deep Love for Authentic Taste & Honest Cooking
              </h2>
              <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                UPAHAR TIFFINS AND FAST FOOD was founded with a singular purpose: to preserve the timeless joy of a hearty, freshly prepared South Indian breakfast served without shortcuts.
              </p>
              <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                From morning commuters and families seeking piping hot idlis and frothy filter coffee at 6:30 AM to students gathering for crispy evening ghee karam dosas and wok-tossed Hakka noodles, our kitchen is alive with energy through every hour of the day.
              </p>

              <div className="pt-2 flex flex-wrap gap-3">
                <span className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#2D5A27] bg-[#EBF3E8] px-3.5 py-1.5 rounded-xl border border-[#2D5A27]/20">
                  <ShieldCheck className="w-4 h-4 text-[#2D5A27]" />
                  <span>100% Pure Vegetarian Kitchen</span>
                </span>
                <span className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#580D1A] bg-[#FAF7F2] px-3.5 py-1.5 rounded-xl border border-[#EADBCE]">
                  <Flame className="w-4 h-4 text-[#580D1A]" />
                  <span>Stone-Ground Batter Daily</span>
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 relative h-80 sm:h-96 rounded-2xl overflow-hidden border-2 border-[#D4AF37]/40 shadow-lg">
              <Image
                src="/images/upahar_hotel_counter.jpg"
                alt="Upahar Restaurant Front Counter in Sangivalasa"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
          </div>

          {/* Pillars of Quality */}
          <div className="pt-10 border-t border-[#F4EFE6]">
            <h3 className="text-2xl sm:text-3xl font-black text-[#2B070E] font-display text-center mb-8">
              The Four Pillars of Our Kitchen
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pillars.map((pillar, i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE] space-y-2 hover:border-[#D4AF37] transition duration-300"
                >
                  <h4 className="font-bold text-[#2B070E] text-base font-heading">
                    {pillar.title}
                  </h4>
                  <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Community & Hospitality Card */}
        <div className="bg-gradient-to-br from-[#2B070E] to-[#4A0E17] text-[#FAF7F2] rounded-3xl p-8 sm:p-12 border border-[#D4AF37]/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#DFC17B]">
              Experience the Hospitality
            </span>
            <h3 className="text-2xl sm:text-3xl font-black font-display">
              We Look Forward to Welcoming You
            </h3>
            <p className="text-stone-300 text-xs sm:text-sm max-w-lg">
              Located at 1-1, Sangivalasa, ANITS College Road, beside SBI. Visit us for morning tiffins (6am–10am) or evening fast food (6pm–10:30pm).
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/menu"
              className="btn-maroon-gold px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap"
            >
              Explore Menu
            </Link>
            <a
              href="https://maps.app.goo.gl/6611R6FD1JZagSJt9"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-[#DFC17B] border border-[#D4AF37]/50 transition whitespace-nowrap"
            >
              Get Directions
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
