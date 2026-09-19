import React from "react";
import Link from "next/link";
import { Sparkles, MessageSquare, Compass, ArrowRight, UtensilsCrossed } from "lucide-react";

export default function SensoryCTASection() {
  return (
    <section className="py-20 sm:py-28 bg-gradient-to-b from-[#141210] via-[#2B070E] to-[#141210] text-[#FAF7F2] relative overflow-hidden border-t border-[#D4AF37]/30">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#580D1A] border border-[#D4AF37]/40 text-[#DFC17B] text-xs font-bold uppercase tracking-widest shadow-lg">
          <UtensilsCrossed className="w-3.5 h-3.5" />
          <span>The Tables Are Set • The Tawas Are Sizzling</span>
        </div>

        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display text-white leading-tight">
          Experience Authentic Flavours <br />
          <span className="italic text-gradient-gold">Freshly Served With Warmth</span>
        </h2>

        <p className="text-stone-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          From the slow rhythm of dawn stone grinders to the fragrance of sputtering mustard seeds and piping hot drumstick sambar. We invite you and your loved ones to taste the true spirit of South Indian cooking.
        </p>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/menu"
              className="btn-maroon-gold px-8 py-3.5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wide flex items-center justify-center space-x-2 shadow-2xl hover:scale-105 transition"
            >
              <span>Explore Complete Menu</span>
              <ArrowRight className="w-4 h-4 text-[#DFC17B]" />
            </Link>

          <a
            href="https://wa.me/919885455342?text=Namaste!%20I%20am%20planning%20to%20visit%20Upahar%20Tiffins%20and%20Fast%20Food%20at%20Sangivalasa.%20Could%20you%20share%20directions%20and%20today's%20specials?"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl font-bold text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-700 border border-emerald-400/40 backdrop-blur-md transition flex items-center justify-center space-x-2 shadow-xl hover:scale-105"
          >
            <MessageSquare className="w-4 h-4 text-emerald-100" />
            <span>WhatsApp Owner (9885455342)</span>
          </a>

          <a
            href="https://maps.app.goo.gl/6611R6FD1JZagSJt9"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl font-bold text-xs sm:text-sm text-[#FAF7F2] bg-white/10 hover:bg-white/20 border border-[#D4AF37]/50 backdrop-blur-md transition flex items-center justify-center space-x-2 shadow-md hover:scale-105"
          >
            <Compass className="w-4 h-4 text-[#DFC17B]" />
            <span>Get Directions (Google Maps)</span>
          </a>
        </div>
      </div>
    </section>
  );
}
