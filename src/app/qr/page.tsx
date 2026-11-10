import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import {
  QrCode,
  Smartphone,
  UtensilsCrossed,
  Sparkles,
  ArrowRight,
  MessageSquare,
  Compass,
  CheckCircle2,
} from "lucide-react";
import TableStandee from "@/components/qr/TableStandee";

export const metadata: Metadata = {
  title: "Scan QR Code | Digital Menu & Table Standees",
  description:
    "Scan the official UPAHAR TIFFINS AND FAST FOOD QR code with your smartphone to explore our live digital menu, daily specials, and restaurant details in Sangivalasa.",
};

export default function QRPage() {
  return (
    <main className="min-h-screen bg-brand-cream py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Page Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-700 text-[#DFC17B] text-xs font-bold uppercase tracking-wider shadow-sm">
            <QrCode className="w-3.5 h-3.5" />
            <span>Official Restaurant QR Portal</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-display text-brand-950 tracking-tight">
            Scan To Open <span className="italic text-brand-700">Upahar</span> On Your Mobile
          </h1>

          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            Visiting our restaurant at Sangivalasa or dining with friends? Simply scan the QR code below with any smartphone camera to open our live digital menu and explore our piping-hot tiffins and evening fast food.
          </p>
        </div>

        {/* Official Standee & QR Code */}
        <TableStandee />

        {/* 3 Step Guide on How to Scan */}
        <div className="bg-white rounded-3xl border border-brand-border p-5 sm:p-10 shadow-sm space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-brand-950 font-display">
              How To Scan With Your Smartphone
            </h2>
            <p className="text-xs text-stone-500">
              No special app required. Works smoothly on both iPhone and Android devices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="p-5 sm:p-6 rounded-2xl bg-brand-surface border border-brand-border space-y-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-brand-700 text-[#DFC17B] flex items-center justify-center font-black mx-auto sm:mx-0 shadow-sm">
                1
              </div>
              <h3 className="font-bold text-sm text-brand-950">Open Your Camera</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Open the default Camera app on your iPhone or the Camera / Google Lens app on your Android smartphone.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-brand-surface border border-brand-border space-y-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-brand-700 text-[#DFC17B] flex items-center justify-center font-black mx-auto sm:mx-0 shadow-sm">
                2
              </div>
              <h3 className="font-bold text-sm text-brand-950">Aim at the QR Code</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Hold your device steadily so the QR code appears clearly within your viewfinder. A link banner will appear instantly.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-brand-surface border border-brand-border space-y-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-brand-700 text-[#DFC17B] flex items-center justify-center font-black mx-auto sm:mx-0 shadow-sm">
                3
              </div>
              <h3 className="font-bold text-sm text-brand-950">Tap Link & Browse</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Tap the banner to view our full menu, prices, spicy ghee karam dosas, Hakka noodles, and restaurant hours.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Links CTA Section */}
        <div className="bg-gradient-to-r from-brand-950 via-brand-700 to-brand-950 text-brand-cream rounded-3xl p-6 sm:p-10 shadow-xl border border-[#D4AF37]/30 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-black font-display text-white">
              Prefer To Explore Directly Online?
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 max-w-xl">
              You can jump straight into our dishes or connect with our owner Sri Vamsi directly on WhatsApp for catering and bulk party orders.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <Link
              href="/menu"
              className="btn-gold-outline bg-white text-brand-950 hover:bg-brand-cream px-5 py-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-md transition"
            >
              <UtensilsCrossed className="w-4 h-4 text-brand-700" />
              <span>Explore Live Menu</span>
            </Link>

            <a
              href="https://wa.me/919885455342?text=Namaste!%20I%20scanned%20the%20Upahar%20QR%20code%20and%20would%20like%20to%20order."
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition flex items-center justify-center space-x-2"
            >
              <MessageSquare className="w-4 h-4 text-emerald-100" />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
