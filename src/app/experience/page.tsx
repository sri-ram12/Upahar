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
      time: "06:00 AM",
      title: "The Dawn Aroma & Hot Chitti Idly",
      desc: "Granite stone-grinders complete their work. Fresh batches of soft steamed mini Chitti Idlis tossed with ghee podi and piping hot sambar emerge fresh.",
      image: "/images/upahar_chitti_idly.jpg",
    },
    {
      time: "08:00 AM",
      title: "The Morning Tava & Breakfast Rush",
      desc: "Cast-iron tavas roar with sizzling batter. Wafer-crisp ghee karam dosas, masala dosas, and golden wadas served to students and morning commuters.",
      image: "/ghee-karam-dosa.jpg",
    },
    {
      time: "06:00 PM",
      title: "The Upahar Front Counter & Ambience",
      desc: "Our iconic Warli-painted exterior counter lights up on ANITS College Road beside SBI, welcoming guests for evening tiffins and hot takeaway parcels.",
      image: "/images/upahar_hotel_counter.jpg",
    },
    {
      time: "08:00 PM",
      title: "Covered Dining & High-Flame Fast Food",
      desc: "Guests enjoy breezy outdoor dining under our sheltered canopy with steaming wok-tossed Hakka noodles, sizzling fried rice, and crispy starters.",
      image: "/images/upahar_hotel_dining.jpg",
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
