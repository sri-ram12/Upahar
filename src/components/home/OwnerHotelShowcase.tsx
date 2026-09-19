"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  MessageSquare,
  Phone,
  CheckCircle2,
  Award,
  Sparkles,
  MapPin,
  ExternalLink,
  ZoomIn,
  X,
  FileText,
} from "lucide-react";

export default function OwnerHotelShowcase() {
  const [activeMenuModal, setActiveMenuModal] = useState(false);
  const [selectedMenuCard, setSelectedMenuCard] = useState<"tiffins" | "fastfood">("tiffins");

  const hotelPhotos = [
    {
      title: "Front Dining & Takeaway Counter",
      subtitle: "1-1, ANITS College Road, beside SBI, Sangivalasa",
      image: "/images/upahar_hotel_counter.jpg",
      tag: "Authentic Exterior",
    },
    {
      title: "Covered Dining & Seating Space",
      subtitle: "Clean, breezy and hygienic seating for ANITS students & families",
      image: "/images/upahar_hotel_dining.jpg",
      tag: "Dining Space",
    },
    {
      title: "Signature Chitti Idly & Dosa Craft",
      subtitle: "Soft steamed mini idlis tossed with ghee podi & spicy chutneys",
      image: "/images/upahar_chitti_idly.jpg",
      tag: "Signature Dish",
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-[#141210] text-[#FAF7F2] relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#580D1A]/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-20">
        {/* ================================================================= */}
        {/* PART 1: OWNER DETAILS & CULINARY PROMISE                          */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Owner Portrait Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl overflow-hidden border-2 border-[#D4AF37]/40 shadow-2xl bg-[#1C1917] p-2">
              <div className="relative h-96 sm:h-[450px] w-full rounded-2xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=800&q=85"
                  alt="Sri Vamsi - Founder & Host of UPAHAR TIFFINS AND FAST FOOD"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover object-top filter contrast-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141210] via-transparent to-transparent" />

                {/* Floating Experience Badge */}
                <div className="absolute top-4 left-4 bg-[#580D1A]/90 backdrop-blur-md text-[#DFC17B] border border-[#D4AF37]/50 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-lg">
                  <Award className="w-4 h-4 text-[#DFC17B]" />
                  <span>Sunrise To Sunset Taste</span>
                </div>

                {/* Owner Name Tag */}
                <div className="absolute bottom-4 left-4 right-4 bg-[#141210]/95 backdrop-blur-md p-4 rounded-2xl border border-stone-800">
                  <span className="text-[10px] uppercase font-bold text-[#DFC17B] tracking-widest block">
                    Proprietor & Master Host
                  </span>
                  <h3 className="text-xl font-black text-white font-display">
                    Sri Vamsi
                  </h3>
                  <p className="text-xs text-stone-300 mt-0.5">
                    UPAHAR TIFFINS AND FAST FOOD, Sangivalasa
                  </p>
                  <p className="text-[11px] text-[#DFC17B] mt-1 font-semibold flex items-center space-x-1">
                    <Phone className="w-3 h-3 text-[#DFC17B]" />
                    <span>Ph: 9885455342</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Owner Story & Direct WhatsApp Line */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#580D1A] border border-[#D4AF37]/30 text-[#DFC17B] text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Meet The Owner & Management</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display text-white leading-tight">
              &ldquo;Serving Honest Flavours With Purity, Sunrise To Sunset.&rdquo;
            </h2>

            <div className="space-y-4 text-stone-300 text-sm sm:text-base leading-relaxed">
              <p>
                Welcome to <strong>UPAHAR TIFFINS AND FAST FOOD</strong>, conveniently located at <strong>1-1, Sangivalasa, ANITS College Road, beside SBI</strong>. Our kitchen operates on two dedicated daily sessions designed for your routine: hearty, steaming tiffins from <strong>6:00 AM to 10:00 AM</strong>, and sizzling fast food & Chinese delicacies from <strong>6:00 PM to 10:30 PM</strong>.
              </p>
              <p>
                Under the personal direction of Sri Vamsi, every tawa dosa is roasted with pure desi ghee, every idli is steamed from freshly ground batter, and every wok of noodles is tossed hot with vibrant fresh vegetables and tender chicken.
              </p>
            </div>

            {/* Direct Owner Guarantees */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="p-3.5 rounded-2xl bg-[#1C1917] border border-stone-800 flex items-start space-x-3">
                <CheckCircle2 className="w-4 h-4 text-[#2D5A27] mt-0.5 flex-shrink-0" />
                <span className="text-xs text-stone-200">
                  <strong>Daily Fresh Batter:</strong> Stone-ground fresh every dawn without preservatives.
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#1C1917] border border-stone-800 flex items-start space-x-3">
                <CheckCircle2 className="w-4 h-4 text-[#2D5A27] mt-0.5 flex-shrink-0" />
                <span className="text-xs text-stone-200">
                  <strong>Pure Desi Ghee & Fresh Oil:</strong> Authentic roasting on traditional cast-iron tavas.
                </span>
              </div>
            </div>

            {/* Direct WhatsApp & Contact Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-3.5">
              <a
                href="https://wa.me/919885455342?text=Namaste%20Sri%20Vamsi%20ji,%20I%20visited%20the%20Upahar%20website%20and%20would%20like%20to%20inquire%20about%20today's%20menu%20and%20timings."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-xs sm:text-sm tracking-wide bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl transition flex items-center justify-center space-x-2 border border-emerald-400/40"
              >
                <MessageSquare className="w-4 h-4 text-emerald-100" />
                <span>Chat with Sri Vamsi on WhatsApp</span>
              </a>

              <a
                href="tel:+919885455342"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-xs sm:text-sm tracking-wide text-[#FAF7F2] bg-white/10 hover:bg-white/20 border border-[#D4AF37]/50 transition flex items-center justify-center space-x-2"
              >
                <Phone className="w-4 h-4 text-[#DFC17B]" />
                <span>Call Sri Vamsi (9885455342)</span>
              </a>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* PART 2: HOTEL & RESTAURANT SHOWCASE (PICS)                        */}
        {/* ================================================================= */}
        <div className="pt-12 border-t border-stone-800/80 space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#DFC17B] block mb-1">
                Hotel Atmosphere & Architecture
              </span>
              <h3 className="text-2xl sm:text-3xl font-black font-display text-white">
                Hotel Pics & Live Dining Environment
              </h3>
            </div>
            <span className="text-xs text-stone-400">
              1-1, Sangivalasa, ANITS College Road, beside SBI
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {hotelPhotos.map((photo) => (
              <div
                key={photo.title}
                className="group rounded-2xl overflow-hidden border border-stone-800 bg-[#1C1917] hover:border-[#D4AF37]/60 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="relative h-60 w-full overflow-hidden">
                  <Image
                    src={photo.image}
                    alt={photo.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-106 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141210]/80 via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 bg-[#580D1A]/90 text-[#DFC17B] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border border-[#D4AF37]/30 shadow-md">
                    {photo.tag}
                  </span>
                </div>

                <div className="p-4">
                  <h4 className="font-bold text-base text-[#FAF7F2] font-display">
                    {photo.title}
                  </h4>
                  <p className="text-xs text-stone-400 mt-1">
                    {photo.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================================================================= */}
        {/* PART 3: REAL PHYSICAL MENU CARDS INSPECTION (TIFFINS & FAST FOOD) */}
        {/* ================================================================= */}
        <div className="pt-12 border-t border-stone-800/80">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#DFC17B] block mb-2">
              Complete Pricing Transparency
            </span>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display text-white">
              Official Physical Menu Cards & Tariffs
            </h3>
            <p className="text-stone-300 text-xs sm:text-sm mt-2">
              Inspect our authentic wall tariff boards with exact approved prices. Click either menu below to zoom and inspect every item in high resolution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card 1: Upahar Tiffins Official Banner */}
            <div
              onClick={() => {
                setSelectedMenuCard("tiffins");
                setActiveMenuModal(true);
              }}
              className="bg-gradient-to-br from-[#2B070E] to-[#1C1917] rounded-3xl p-6 border border-[#D4AF37]/40 shadow-xl cursor-pointer group hover:border-[#D4AF37] transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-[#580D1A] text-[#DFC17B] border border-[#D4AF37]/50 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg">
                    Tiffins Tariff Board
                  </span>
                  <span className="text-xs text-stone-400">Door Delivery Available</span>
                </div>
                <h4 className="text-xl font-bold font-display text-white mb-2">
                  Upahar Tiffins & Dosa Menu
                </h4>
                <p className="text-xs text-stone-300 leading-relaxed mb-4">
                  Idly (₹30), Tatte Idly (₹25), Ghee Podi Idly (₹35), Dosa specials (₹30–₹80), Chapati & Paratha (₹55).
                </p>
              </div>

              <div className="relative h-48 sm:h-56 w-full rounded-2xl overflow-hidden border border-stone-700 bg-black">
                <Image
                  src="/images/upahar_tiffins_menu.jpg"
                  alt="Official Upahar Tiffins Physical Menu Board"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition flex items-center justify-center">
                  <div className="bg-[#141210]/95 border border-[#D4AF37] px-4 py-2 rounded-xl text-xs font-bold text-[#DFC17B] flex items-center space-x-2 shadow-xl group-hover:scale-105 transition">
                    <ZoomIn className="w-4 h-4" />
                    <span>Click to Zoom Tiffins Menu</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Upahar Fast Food Official Card */}
            <div
              onClick={() => {
                setSelectedMenuCard("fastfood");
                setActiveMenuModal(true);
              }}
              className="bg-gradient-to-br from-[#1F1918] to-[#120F0E] rounded-3xl p-6 border border-[#D4AF37]/40 shadow-xl cursor-pointer group hover:border-[#D4AF37] transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-[#8B1E26] text-[#DFC17B] border border-[#D4AF37]/50 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg">
                    Fast Food Card
                  </span>
                  <span className="text-xs text-stone-400">Veg & Non-Veg Specials</span>
                </div>
                <h4 className="text-xl font-bold font-display text-white mb-2">
                  Upahar Fast Food Tariff Card
                </h4>
                <p className="text-xs text-stone-300 leading-relaxed mb-4">
                  Veg & Non-Veg Noodles (₹60–₹120), Fried Rice (₹80–₹210), Starters & Manchurian (₹80–₹150).
                </p>
              </div>

              <div className="relative h-48 sm:h-56 w-full rounded-2xl overflow-hidden border border-stone-700 bg-black">
                <Image
                  src="/images/upahar_fastfood_menu.jpg"
                  alt="Official Upahar Fast Food Physical Menu Card"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition flex items-center justify-center">
                  <div className="bg-[#141210]/95 border border-[#D4AF37] px-4 py-2 rounded-xl text-xs font-bold text-[#DFC17B] flex items-center space-x-2 shadow-xl group-hover:scale-105 transition">
                    <ZoomIn className="w-4 h-4" />
                    <span>Click to Zoom Fast Food Menu</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen High-Resolution Menu Inspection Modal */}
      {activeMenuModal && (
        <div
          onClick={() => setActiveMenuModal(false)}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl w-full bg-[#1C1917] rounded-3xl overflow-hidden border border-[#D4AF37]/50 shadow-2xl p-4 sm:p-6 space-y-4 max-h-[92vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-3 border-b border-stone-800">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSelectedMenuCard("tiffins")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                    selectedMenuCard === "tiffins"
                      ? "bg-[#580D1A] text-[#DFC17B] border border-[#D4AF37]"
                      : "bg-white/10 text-stone-300 hover:bg-white/15"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Upahar Tiffins Banner</span>
                </button>

                <button
                  onClick={() => setSelectedMenuCard("fastfood")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                    selectedMenuCard === "fastfood"
                      ? "bg-[#8B1E26] text-[#DFC17B] border border-[#D4AF37]"
                      : "bg-white/10 text-stone-300 hover:bg-white/15"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Fast Food Menu Card</span>
                </button>
              </div>

              <button
                onClick={() => setActiveMenuModal(false)}
                className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* High Resolution Image Container */}
            <div className="relative flex-1 min-h-[50vh] sm:min-h-[65vh] w-full rounded-2xl overflow-hidden border border-stone-800 bg-black">
              <Image
                src={
                  selectedMenuCard === "tiffins"
                    ? "/images/upahar_tiffins_menu.jpg"
                    : "/images/upahar_fastfood_menu.jpg"
                }
                alt={
                  selectedMenuCard === "tiffins"
                    ? "Upahar Tiffins Official Tariff Card"
                    : "Upahar Fast Food Official Tariff Card"
                }
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
              <div className="text-xs text-stone-400 text-center sm:text-left">
                <span>1-1, Sangivalasa, ANITS Road • Ph: 9885455342 • </span>
                <a
                  href="https://www.instagram.com/upahar_07"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#DFC17B] hover:text-white font-semibold transition-colors"
                >
                  Instagram: @upahar_07
                </a>
              </div>

              <div className="flex items-center space-x-2.5">
                <a
                  href="https://wa.me/919885455342?text=Hello%20Sri%20Vamsi,%20I%20am%20reviewing%20your%20menu%20cards%20and%20would%20like%20to%20order%20parcel%20or%20check%20today's%20batch%20timing."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-maroon-gold px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#DFC17B]" />
                  <span>Chat with Sri Vamsi About Menu</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
