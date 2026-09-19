"use client";

import React from "react";
import {
  MapPin,
  Clock,
  Phone,
  Compass,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { InstagramIcon } from "@/components/ui/Icons";

interface LocationHoursSectionProps {
  settings: any;
  storeStatus?: {
    isOpen: boolean;
    statusText: string;
    subText: string;
    currentSession?: string;
  } | null;
}

export default function LocationHoursSection({
  settings,
  storeStatus,
}: LocationHoursSectionProps) {
  const diningSessions = [
    {
      name: "Morning Tiffins & Breakfast",
      time: "6:30 AM – 11:30 AM",
      desc: "Piping button sambar idlis, crispy ghee karam dosas, medu vadas & hot filter coffee.",
    },
    {
      name: "Afternoon Lunch & Tiffins",
      time: "11:30 AM – 4:00 PM",
      desc: "South Indian tiffins, poori masala, curd rice, and freshly wok-tossed Hakka noodles.",
    },
    {
      name: "Evening Tiffins & Snacks",
      time: "4:00 PM – 8:00 PM",
      desc: "Golden Mysore bondas, sizzling Amul butter pav bhaji, samosa chaats & degree coffee.",
    },
    {
      name: "Dinner & Indo-Chinese",
      time: "8:00 PM – 11:00 PM",
      desc: "Fresh crispy dosas, Schezwan fried rice, noodles, and wholesome evening tiffins.",
    },
  ];

  return (
    <section id="location-hours" className="py-20 lg:py-28 bg-[#FAF7F2] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-[#EADBCE] text-[#580D1A]">
            <MapPin className="w-3.5 h-3.5 text-[#580D1A]" />
            <span>Visit The Restaurant</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#2B070E] font-display tracking-tight">
            Location, Sessions & Hours
          </h2>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            Conveniently situated at 1-1, Sangivalasa, ANITS College Road, beside SBI. Welcoming food lovers daily from morning till night.
          </p>
        </div>

        {/* 2-Column Composition: Location Info & Hours */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Address, Quick Dial & Dining Sessions */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6 bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBCE] shadow-lg">
            <div>
              {/* Live Status Badge */}
              <div className="p-4 rounded-2xl bg-[#2B070E] text-white flex items-center justify-between border border-[#D4AF37]/40 mb-6 shadow-md">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-[#D4AF37] animate-pulse" />
                  <div>
                    <span className="font-black text-sm text-[#DFC17B] block">
                      {storeStatus ? storeStatus.statusText : "OPEN NOW"}
                    </span>
                    <span className="text-xs text-stone-300">
                      {storeStatus ? storeStatus.subText : "Welcoming diners for hot fresh tiffins"}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400 bg-black/40 px-2.5 py-1 rounded-md">
                  Live Status
                </span>
              </div>

              {/* Address Card */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] border border-[#EADBCE] flex items-center justify-center text-[#580D1A] flex-shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#2B070E] uppercase tracking-wider">
                      Physical Restaurant Address
                    </h4>
                    <p className="text-stone-700 text-sm leading-relaxed mt-1">
                      {settings?.address ||
                        "1-1, Sangivalasa, ANITS College Road, Beside SBI, Visakhapatnam, Andhra Pradesh 531162"}
                    </p>
                    <span className="text-xs text-[#74171E] font-semibold mt-1 block">
                      Landmark: Beside SBI, ANITS College Road, Sangivalasa
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] border border-[#EADBCE] flex items-center justify-center text-[#580D1A] flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                      Telephone & WhatsApp Direct
                    </h4>
                    <a
                      href="tel:+919885455342"
                      className="text-sm font-bold text-[#2B070E] hover:text-[#580D1A] transition block"
                    >
                      +91 9885455342
                    </a>
                  </div>
                </div>
              </div>

              {/* Dining Sessions Breakdown */}
              <div className="mt-6 pt-6 border-t border-[#F4EFE6] space-y-3">
                <h4 className="text-xs uppercase font-extrabold tracking-widest text-[#74171E] flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#580D1A]" />
                  <span>Daily Dining Sessions (Monday – Sunday)</span>
                </h4>

                <div className="space-y-2.5">
                  {diningSessions.map((session, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE] flex flex-col sm:flex-row sm:items-center justify-between gap-1"
                    >
                      <div>
                        <span className="text-xs font-bold text-[#2B070E] block">
                          {session.name}
                        </span>
                        <span className="text-[11px] text-stone-500">
                          {session.desc}
                        </span>
                      </div>
                      <span className="text-xs font-black text-[#580D1A] whitespace-nowrap bg-white px-2.5 py-1 rounded-lg border border-[#EADBCE] self-start sm:self-auto">
                        {session.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-[#F4EFE6] flex flex-col sm:flex-row gap-3">
              <a
                href={settings?.googleMapsUrl || "https://maps.app.goo.gl/6611R6FD1JZagSJt9"}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-maroon-gold flex-1 py-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-2"
              >
                <Compass className="w-4 h-4 text-[#DFC17B]" />
                <span>Get Driving Directions</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>

              <a
                href="tel:+919876543210"
                className="btn-gold-outline py-3 px-5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2"
              >
                <Phone className="w-4 h-4 text-[#580D1A]" />
                <span>Call Restaurant</span>
              </a>
            </div>
          </div>

          {/* Right Column: Google Maps Interactive Embed */}
          <div className="lg:col-span-6 rounded-3xl overflow-hidden border border-[#EADBCE] shadow-lg flex flex-col bg-white min-h-[420px]">
            <div className="p-4 bg-[#2B070E] text-[#FAF7F2] flex items-center justify-between border-b border-[#D4AF37]/30">
              <div className="flex items-center space-x-2 text-xs font-semibold">
                <MapPin className="w-4 h-4 text-[#DFC17B]" />
                <span>Google Maps Landmark Location</span>
              </div>
              <a
                href="https://maps.app.goo.gl/6611R6FD1JZagSJt9"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-[#DFC17B] hover:text-white transition flex items-center space-x-1"
              >
                <span>Open in Maps App</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>

            <div className="flex-1 relative w-full min-h-[380px] bg-stone-100">
              <iframe
                title="UPAHAR TIFFINS AND FAST FOOD Location Map"
                src="https://maps.google.com/maps?q=Sangivalasa+ANITS+College+Road&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 w-full h-full"
              />
            </div>

            <div className="p-4 bg-[#FAF7F2] border-t border-[#EADBCE] flex flex-wrap items-center justify-between text-xs text-stone-600 gap-2">
              <span className="flex items-center space-x-1 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#2D5A27]" />
                <span>Street & Two-Wheeler Parking Available</span>
              </span>

              <a
                href="https://www.instagram.com/upahar_07"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[#580D1A] hover:text-[#74171E] flex items-center space-x-1"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
                <span>Follow @upahar_07 on Instagram</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
