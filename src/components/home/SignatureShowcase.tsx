"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  Flame,
  Clock,
  ArrowRight,
  ShieldCheck,
  MessageSquare,
} from "lucide-react";

interface Dish {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  image: string;
  prepTime: string;
  portionSize: string;
  ingredients: string;
  isSpicy?: boolean;
}

const signatureDishes: Dish[] = [
  {
    id: "ghee-karam-dosa",
    name: "Ghee Karam Dosa",
    tagline: "The Legendary Crown Jewel of Upahar",
    description:
      "Crispy golden crepe smeared generously with our house-roasted spicy red garlic allam-karam chutney, roasted on high flame with pure fragrant desi ghee, and folded to a crisp perfection. Served with coconut chutney & piping drumstick sambar.",
    price: 45,
    image: "/ghee-karam-dosa.jpg",
    prepTime: "5-7 mins",
    portionSize: "1 Large Dosa + 2 Chutneys + Sambar",
    ingredients: "Fermented batter, Pure Desi Ghee, Roasted red garlic karam, Fresh curry leaves",
    isSpicy: true,
  },
  {
    id: "citti-idly",
    name: "Chitti Idly",
    tagline: "Soft, Steamed Mini Idlies tossed with Ghee Podi",
    description:
      "Delicate bite-sized button idlies steamed to spongy perfection and generously tossed in aromatic roasted gun powder (podi) and pure fragrant ghee. Served with coconut chutney, tomato chutney, and ghee podi.",
    price: 40,
    image: "/images/upahar_chitti_idly.jpg",
    prepTime: "3-5 mins",
    portionSize: "1 Bowl Mini Button Idlis + 3 Chutneys",
    ingredients: "Mini idlis, Pure Desi Ghee, Roasted spiced karam podi, 3 Chutneys",
    isSpicy: true,
  },
  {
    id: "sambar-idly",
    name: "Sambar Idly (3)",
    tagline: "Piping Hot Comfort in Every Spoon",
    description:
      "Three cloud-soft steamed rice cakes submerged completely in a steaming bowl of aromatic drumstick sambar, crowned with a generous drizzle of hot desi ghee and fresh coriander. It melts effortlessly on the tongue.",
    price: 30,
    image: "/sambar-idli.jpg",
    prepTime: "2-3 mins",
    portionSize: "3 Idlis in Sambar Bowl",
    ingredients: "Stone-ground rice & urad dal, Drumstick sambar, Melted Desi Ghee",
    isSpicy: false,
  },
  {
    id: "masala-dosa",
    name: "Masala Dosa",
    tagline: "Golden Crispy Crepe with Fragrant Potato Mash",
    description:
      "Wafer-thin golden crepe cooked on seasoned cast-iron tava with pure ghee, encasing freshly spiced turmeric potato mash with tempered mustard seeds, green chilies, and ginger.",
    price: 40,
    image: "/butter-masala-dosa.jpg",
    prepTime: "5-7 mins",
    portionSize: "1 Large Dosa + Potato Mash",
    ingredients: "Traditional batter, Desi ghee, Spiced potato filling, Mustard, Curry leaves",
    isSpicy: false,
  },
  {
    id: "chicken-fried-rice",
    name: "Chicken Fried Rice",
    tagline: "Wok-Tossed on Roaring High Flame",
    description:
      "Aromatic basmati rice tossed on high flame wok with tender spiced chicken chunks, eggs, and crispy fresh vegetables in garlic glaze.",
    price: 120,
    image: "/chicken-fried-rice.jpg",
    prepTime: "10-12 mins",
    portionSize: "1 Full Plate Chicken Fried Rice",
    ingredients: "Basmati rice, Chicken chunks, Farm eggs, Soy glaze, Spring onions",
    isSpicy: true,
  },
  {
    id: "veg-manchurian-noodles",
    name: "Veg Manchurian Noodles",
    tagline: "Street-Style Sizzling Hakka Noodle Craft",
    description:
      "High heat wok noodles tossed with shredded bell peppers, cabbage, and crisp fried vegetable Manchurian dumplings in tangy dark soya glaze.",
    price: 90,
    image: "/veg-manchurian-noodles.jpg",
    prepTime: "8-10 mins",
    portionSize: "1 Loaded Manchurian Noodle Plate",
    ingredients: "Hakka noodles, Manchurian dumplings, Garlic, Shredded vegetables",
    isSpicy: true,
  },
];

export default function SignatureShowcase() {
  const [activeDish, setActiveDish] = useState<Dish>(signatureDishes[0]);

  return (
    <section className="py-20 sm:py-28 bg-[#141210] text-[#FAF7F2] relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-[#580D1A]/35 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-12">
          <div>
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#580D1A] text-[#DFC17B] border border-[#D4AF37]/30 text-xs font-bold uppercase tracking-widest mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#DFC17B]" />
              <span>Chef&apos;s Signature Tava Craft Showcase</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display text-white">
              The Mastery of Cast Iron Cooking
            </h2>
            <p className="text-stone-300 text-sm sm:text-base mt-2 max-w-xl">
              Cooked on seasoned heavy cast-iron tavas at extreme heat with pure village desi ghee to unlock crisp golden texture and deep aroma.
            </p>
          </div>

          <Link
            href="/menu"
            className="text-xs font-bold text-[#DFC17B] hover:text-white flex items-center space-x-1.5 transition pb-1"
          >
            <span>View All Signatures</span>
            <ArrowRight className="w-4 h-4 text-[#DFC17B]" />
          </Link>
        </div>

        {/* Main Stage Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#1C1917]/90 rounded-3xl p-6 sm:p-10 border border-[#D4AF37]/25 shadow-2xl">
          {/* Featured Large Visual */}
          <div className="lg:col-span-7 relative h-72 sm:h-96 lg:h-[440px] rounded-2xl overflow-hidden border border-[#D4AF37]/20 group">
            <Image
              src={activeDish.image}
              alt={activeDish.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover transition-all duration-700 ease-out group-hover:scale-105 relative z-10"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141210] via-transparent to-transparent z-10" />

            {/* Badges on Visual */}
            <div className="absolute top-4 left-4 flex items-center space-x-2 z-20">
              <span className="bg-[#580D1A] text-[#DFC17B] text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-lg border border-[#D4AF37]/40 shadow-lg">
                Signature Plate
              </span>
              {activeDish.isSpicy && (
                <span className="bg-[#8B1E26] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg flex items-center space-x-1">
                  <Flame className="w-3 h-3 text-[#DFC17B]" />
                  <span>Spicy</span>
                </span>
              )}
            </div>

            {/* Pure Veg Stamp */}
            <div className="absolute top-4 right-4 bg-white/95 p-1.5 rounded-lg shadow-md z-20">
              <div className="w-4 h-4 border-2 border-[#2D5A27] rounded-xs flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[#2D5A27]" />
              </div>
            </div>

            {/* Bottom Dish Name Overlay */}
            <div className="absolute bottom-4 left-4 right-4 z-20">
              <span className="text-[11px] uppercase tracking-widest text-[#DFC17B] font-bold block">
                {activeDish.tagline}
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white font-display">
                {activeDish.name}
              </h3>
            </div>
          </div>

          {/* Dish Details & Storytelling */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                    Menu Price
                  </span>
                  <span className="text-3xl font-black text-[#DFC17B] font-display">
                    ₹{activeDish.price}
                  </span>
                </div>

                <div className="flex items-center space-x-1 text-xs text-stone-300 font-semibold bg-[#141210] px-3 py-1.5 rounded-xl border border-stone-800">
                  <Clock className="w-4 h-4 text-[#DFC17B]" />
                  <span>{activeDish.prepTime}</span>
                </div>
              </div>

              <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
                {activeDish.description}
              </p>

              {/* Portion & Ingredients */}
              <div className="space-y-2 text-xs pt-2">
                <div className="p-3 rounded-xl bg-[#141210] border border-stone-800">
                  <span className="text-stone-400 font-medium block text-[10px] uppercase tracking-wider">
                    Portion Served
                  </span>
                  <span className="text-[#FAF7F2] font-semibold">{activeDish.portionSize}</span>
                </div>

                <div className="p-3 rounded-xl bg-[#141210] border border-stone-800">
                  <span className="text-stone-400 font-medium block text-[10px] uppercase tracking-wider">
                    Key Ingredients
                  </span>
                  <span className="text-[#DFC17B] font-semibold">{activeDish.ingredients}</span>
                </div>
              </div>
            </div>

            {/* Action Row */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2 text-xs text-stone-400">
                <ShieldCheck className="w-4 h-4 text-[#2D5A27]" />
                <span>100% Pure Desi Ghee</span>
              </div>

              <div className="flex items-center space-x-2.5">
                <a
                  href={`https://wa.me/919885455342?text=${encodeURIComponent(
                    `Hello Sri Vamsi, I would like to inquire about ${activeDish.name} at Upahar Tiffins.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-white" />
                  <span>WhatsApp Sri Vamsi</span>
                </a>

                <Link
                  href="/menu"
                  className="btn-maroon-gold px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5"
                >
                  <span>Full Menu</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#DFC17B]" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Supporting Dish Selector Pills (Memorable Brand Moment: Plate switcher) */}
        <div className="mt-8">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#DFC17B] block mb-3 text-center sm:text-left">
            Select a Signature Plate to Inspect:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {signatureDishes.map((dish) => {
              const isSelected = activeDish.id === dish.id;
              return (
                <button
                  key={dish.id}
                  onClick={() => setActiveDish(dish)}
                  className={`p-3 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between ${
                    isSelected
                      ? "bg-[#2B070E] border-[#D4AF37] shadow-lg shadow-[#4A0E17]/40 scale-102"
                      : "bg-[#1C1917]/70 border-stone-800 hover:border-stone-700 hover:bg-[#1C1917]"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-xs text-white line-clamp-1">
                      {dish.name}
                    </span>
                    <span className="text-[11px] font-black text-[#DFC17B]">
                      ₹{dish.price}
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-400 mt-1 block truncate">
                    {dish.tagline}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
