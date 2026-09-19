import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Compass,
  Clock,
  ShieldCheck,
  Users,
  ShoppingBag,
  Sparkles,
  Phone,
  ArrowRight,
  Coffee,
  CheckCircle2,
} from "lucide-react";

export const metadata = {
  title: "The Upahar Experience | Atmosphere, Timings & Visiting Guide",
  description:
    "Discover what visiting UPAHAR TIFFINS AND FAST FOOD feels like - open live cooking counters, family-friendly dining, takeaway parcel counter, and session timings in Sangivalasa.",
};

export default function ExperiencePage() {
  const moments = [
    {
      time: "06:30 AM",
      title: "The Dawn Aroma & First Batch",
      desc: "Granite grinders complete their night's work. The first round of steamed button idlis emerges in clouds of steam, paired with freshly brewed degree filter coffee.",
      image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
    },
    {
      time: "08:30 AM",
      title: "The Bustling Breakfast Rush",
      desc: "Cast-iron tavas roar with sizzling batter. Crisp ghee karam dosas and puffed pooris are served to morning walkers, office commuters, and neighborhood regulars.",
      image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80",
    },
    {
      time: "05:00 PM",
      title: "Evening Tiffins & Chai Time",
      desc: "As the sun dips, families gather for hot Mysore bondas, buttery pav bhaji with toasted buns, and steaming tumblers of South Indian filter coffee.",
      image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80",
    },
    {
      time: "08:30 PM",
      title: "Dinner & High-Flame Indo-Chinese",
      desc: "The evening counter comes alive with wok-tossed Hakka noodles, Schezwan fried rice, crispy paneer 65, and comforting late-night dosas.",
      image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=800&q=80",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24">
      {/* Banner */}
      <div className="bg-gradient-to-br from-[#380A11] via-[#580D1A] to-[#2B070E] text-[#FAF7F2] py-20 px-4 text-center relative overflow-hidden border-b border-[#D4AF37]/30">
        <div className="max-w-3xl mx-auto relative z-10 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-black/40 border border-[#D4AF37]/40 text-[#DFC17B]">
            <Sparkles className="w-3.5 h-3.5 text-[#DFC17B]" />
            <span>The Guest Journey</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-white">
            The Upahar Dining Experience
          </h1>
          <p className="text-stone-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            What makes dining with us memorable: from morning clatter to sizzling evening tavas, honest hospitality, and pure vegetarian culinary craft.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 space-y-16">
        {/* Atmosphere Overview */}
        <div className="bg-white rounded-3xl p-6 sm:p-12 border border-[#EADBCE] shadow-xl space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black text-[#2B070E] font-display">
              A Day in the Life of Our Restaurant
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm">
              Each session at UPAHAR carries its own distinctive energy, aroma, and beloved comfort foods.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {moments.map((m, i) => (
              <div
                key={i}
                className="rounded-2xl border border-[#EADBCE] overflow-hidden bg-[#FAF7F2] flex flex-col justify-between group hover:border-[#D4AF37] transition duration-300"
              >
                <div className="relative h-56 w-full overflow-hidden">
                  <Image
                    src={m.image}
                    alt={m.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-3 left-3 bg-[#2B070E]/90 text-[#DFC17B] text-[10px] font-black uppercase px-2.5 py-1 rounded-md border border-[#D4AF37]/40 shadow-sm">
                    {m.time}
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <h3 className="text-base font-bold text-[#2B070E] font-heading">
                    {m.title}
                  </h3>
                  <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                    {m.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visiting Practicalities */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-[#EADBCE] shadow-md space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#580D1A] text-[#DFC17B] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#2B070E]">
              Walk-in Dining
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              No reservation required. We operate on a convenient walk-in basis with swift seating in our spotless dining hall.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#EADBCE] shadow-md space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#580D1A] text-[#DFC17B] flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#2B070E]">
              Takeaway Counter
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Quick parcel counter for takeaway. Items are securely packed in food-safe insulated materials to stay steaming hot.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#EADBCE] shadow-md space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#580D1A] text-[#DFC17B] flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#2B070E]">
              Landmark & Parking
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              1-1, Sangivalasa, ANITS College Road, Beside SBI. Convenient street and two-wheeler parking available outside.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-6">
          <Link
            href="/contact"
            className="btn-maroon-gold inline-flex items-center space-x-2 px-8 py-3.5 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider"
          >
            <span>View Full Location & Contact Information</span>
            <ArrowRight className="w-4 h-4 text-[#DFC17B]" />
          </Link>
        </div>
      </div>
    </div>
  );
}
