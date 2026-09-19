"use client";

import React from "react";
import {
  MapPin,
  Clock,
  Phone,
  Compass,
  MessageSquare,
  ArrowUpRight,
  ShieldCheck,
  Bike,
} from "lucide-react";
import { InstagramIcon } from "@/components/ui/Icons";

interface LocationSectionProps {
  settings?: any;
  storeStatus?: {
    isOpen: boolean;
    statusText: string;
    subText: string;
    currentSession?: string;
  } | null;
}

export default function LocationSection({ settings, storeStatus }: LocationSectionProps) {
  const sessions = [
    {
      name: "Morning Tiffins Session",
      time: "6:00 AM – 10:00 AM",
      highlights: "Steaming Idlys, Tatte Idly, Ghee Podi Idly, Plain/Onion/Masala Dosas, Poori & Wada",
      tag: "Fresh Morning Start",
    },
    {
      name: "Evening Fast Food & Tiffins",
      time: "6:00 PM – 10:30 PM",
      highlights: "Veg & Non-Veg Noodles, Fried Rice, Manchurian, Sizzling Dosas, Chapati & Paratha",
      tag: "Evening Favorites",
    },
  ];

  return (
    <section id="location" className="py-16 sm:py-24 bg-[#141210] text-[#FAF7F2] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-[#580D1A] text-[#DFC17B] border border-[#D4AF37]/30 text-xs font-bold uppercase tracking-widest mb-3">
            <MapPin className="w-3.5 h-3.5" />
            <span>Visit The Restaurant</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black font-display text-white">
            Location, Hours & Directions
          </h2>
          <p className="text-stone-400 text-sm mt-2">
            1-1, Sangivalasa, ANITS College Road, beside SBI
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Address, Phone & Sessions */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#1C1917] border border-[#D4AF37]/30 shadow-2xl space-y-6">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#DFC17B] tracking-widest block mb-1">
                  Exact Restaurant Location
                </span>
                <h3 className="font-display font-bold text-xl text-white">
                  UPAHAR TIFFINS AND FAST FOOD
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 mt-2 leading-relaxed">
                  1-1, Sangivalasa, ANITS College Road, Beside SBI, Visakhapatnam, Andhra Pradesh 531162
                </p>
                <span className="text-xs text-[#DFC17B] font-semibold mt-1.5 block">
                  Landmark: Beside SBI, ANITS College Road
                </span>
              </div>

              {/* Operating Status Pill */}
              <div className="p-4 rounded-2xl bg-[#2B070E] border border-[#D4AF37]/40 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <div>
                    <span className="font-bold text-xs text-white block">
                      {storeStatus ? storeStatus.statusText : "OPEN FOR SERVICE"}
                    </span>
                    <span className="text-[10px] text-[#DFC17B]">
                      Morning: 6:00 AM – 10:00 AM • Evening: 6:00 PM – 10:30 PM
                    </span>
                  </div>
                </div>
              </div>

              {/* Door Delivery Badge */}
              <div className="p-3.5 rounded-2xl bg-black/40 border border-emerald-500/30 flex items-center space-x-3 text-xs">
                <Bike className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <span className="font-bold text-white block">Door Delivery Available</span>
                  <span className="text-stone-400 text-[11px]">Minimum order basis. Call or WhatsApp to order.</span>
                </div>
              </div>

              {/* Direct Actions */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <a
                  href="https://maps.app.goo.gl/6611R6FD1JZagSJt9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-maroon-gold flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-lg hover:scale-102 transition"
                >
                  <Compass className="w-4 h-4 text-[#DFC17B]" />
                  <span>Google Maps Directions</span>
                </a>

                <a
                  href="https://wa.me/919885455342?text=Namaste%20Upahar!%20I%20would%20like%20to%20inquire%20about%20today's%20menu%20and%20directions."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition flex items-center justify-center space-x-2 shadow-lg hover:scale-102"
                >
                  <MessageSquare className="w-4 h-4 text-white" />
                  <span>WhatsApp (9885455342)</span>
                </a>
              </div>

              {/* Contact Information & Instagram */}
              <div className="pt-4 border-t border-stone-800 space-y-2 text-xs text-stone-300">
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">Direct Phone:</span>
                  <a href="tel:+919885455342" className="font-bold text-[#DFC17B] hover:underline">
                    +91 9885455342
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">Instagram:</span>
                  <a
                    href="https://www.instagram.com/upahar_07/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-[#DFC17B] hover:underline flex items-center space-x-1"
                  >
                    <InstagramIcon className="w-3.5 h-3.5" />
                    <span>@upahar_07</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Two Sessions & Map Embed */}
          <div className="lg:col-span-7 space-y-6">
            {/* Daily Sessions Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sessions.map((session) => (
                <div
                  key={session.name}
                  className="p-5 rounded-2xl bg-[#1C1917] border border-[#D4AF37]/20 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#DFC17B] bg-[#580D1A] px-2 py-0.5 rounded-md inline-block mb-2">
                      {session.tag}
                    </span>
                    <h4 className="font-bold text-sm text-white font-display">
                      {session.name}
                    </h4>
                    <span className="text-xs text-[#DFC17B] font-bold block mt-1">
                      {session.time}
                    </span>
                    <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                      {session.highlights}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Interactive Map Visual */}
            <div className="rounded-3xl overflow-hidden border border-[#D4AF37]/30 shadow-2xl relative h-72 sm:h-80 bg-stone-900 group">
              <iframe
                title="UPAHAR TIFFINS AND FAST FOOD - Google Maps Location"
                src="https://maps.google.com/maps?q=1-1+sangivalasa+anits+college+road+beside+sbi&t=&z=16&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, filter: "contrast(1.05) saturate(1.1)" }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />

              {/* Floating Map Pin Overlay */}
              <div className="absolute top-4 left-4 bg-[#141210]/90 backdrop-blur-md p-3 rounded-xl border border-[#D4AF37]/50 shadow-lg text-xs pointer-events-none">
                <span className="font-bold text-white block">UPAHAR TIFFINS AND FAST FOOD</span>
                <span className="text-[#DFC17B] text-[11px]">1-1, Sangivalasa, Beside SBI</span>
              </div>

              <a
                href="https://maps.app.goo.gl/6611R6FD1JZagSJt9"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-4 right-4 bg-[#580D1A] hover:bg-[#74171E] text-[#DFC17B] border border-[#D4AF37] px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xl transition"
              >
                <span>Open in Google Maps</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
