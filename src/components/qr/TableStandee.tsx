"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Printer,
  Download,
  Copy,
  Check,
  Sparkles,
  UtensilsCrossed,
  Phone,
  MapPin,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { generateQRCodeDataUrl } from "@/lib/qr";

interface TableStandeeProps {
  initialTable?: string;
  initialDestination?: "menu" | "home";
  baseUrl?: string;
}

export default function TableStandee({
  initialTable = "Table 01",
  initialDestination = "menu",
  baseUrl,
}: TableStandeeProps) {
  const [tableNumber, setTableNumber] = useState(initialTable);
  const [destination, setDestination] = useState<"menu" | "home">(initialDestination);
  const [qrColor, setQrColor] = useState<"#2B070E" | "#000000">("#2B070E");
  const [includeLogo, setIncludeLogo] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");

  const printCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const getComputedUrl = () => {
    const base = baseUrl || origin || "https://upahar.onrender.com";
    const path = destination === "menu" ? "/menu" : "/";
    const cleanTable = tableNumber.trim();
    if (cleanTable) {
      const param = encodeURIComponent(cleanTable);
      return `${base}${path}?table=${param}`;
    }
    return `${base}${path}`;
  };

  useEffect(() => {
    let active = true;
    setLoading(true);

    const targetUrl = getComputedUrl();

    generateQRCodeDataUrl(targetUrl, {
      size: 800,
      darkColor: qrColor,
      lightColor: "#FFFFFF",
      includeLogo: includeLogo,
      logoUrl: "/images/upahar_logo.jpg",
    })
      .then((url) => {
        if (active) {
          setQrDataUrl(url);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("QR generation error:", err);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [tableNumber, destination, qrColor, includeLogo, origin, baseUrl]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getComputedUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `upahar-${tableNumber.replace(/\s+/g, "-").toLowerCase() || "qr"}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Configuration Controls Bar (Hidden during print) */}
      <div className="print:hidden bg-white p-5 sm:p-6 rounded-3xl border border-[#EADBCE] shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#EADBCE]">
          <div>
            <h2 className="text-lg font-black text-[#2B070E] font-display flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#D4AF37]" />
              <span>Tabletop Standee & QR Customizer</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Customize the table number and destination, then print or download high-resolution tent cards.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePrint}
              className="btn-maroon-gold px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md hover:scale-105 transition"
            >
              <Printer className="w-4 h-4 text-[#DFC17B]" />
              <span>Print Table Standee</span>
            </button>

            <button
              onClick={handleDownload}
              className="btn-gold-outline px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm"
            >
              <Download className="w-4 h-4 text-[#580D1A]" />
              <span>Download High-Res PNG</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold border border-stone-200 hover:bg-stone-50 text-stone-700 flex items-center space-x-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-stone-500" />
                  <span>Copy QR Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Table / Location label */}
          <div>
            <label className="block font-bold text-stone-700 mb-1.5">
              Table / Standee Label:
            </label>
            <input
              type="text"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="e.g. Table 01 or Counter"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#580D1A] bg-stone-50 font-semibold"
            />
          </div>

          {/* Destination */}
          <div>
            <label className="block font-bold text-stone-700 mb-1.5">
              Destination Page:
            </label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#580D1A] bg-stone-50 font-semibold"
            >
              <option value="menu">Digital Signature Menu (/menu)</option>
              <option value="home">Home Page & Specials (/)</option>
            </select>
          </div>

          {/* QR Color */}
          <div>
            <label className="block font-bold text-stone-700 mb-1.5">
              QR Color Palette:
            </label>
            <select
              value={qrColor}
              onChange={(e) => setQrColor(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#580D1A] bg-stone-50 font-semibold"
            >
              <option value="#2B070E">Upahar Royal Maroon (#2B070E)</option>
              <option value="#000000">Classic Deep Black (#000000)</option>
            </select>
          </div>

          {/* Include Brand Logo */}
          <div className="flex flex-col justify-between">
            <label className="block font-bold text-stone-700 mb-1.5">
              Center Brand Emblem:
            </label>
            <label className="flex items-center space-x-2 py-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeLogo}
                onChange={(e) => setIncludeLogo(e.target.checked)}
                className="w-4 h-4 rounded text-[#580D1A] focus:ring-[#580D1A]"
              />
              <span className="font-semibold text-stone-700">
                Include Upahar Logo
              </span>
            </label>
          </div>
        </div>

        {/* Live target URL display */}
        <div className="pt-2 flex items-center space-x-2 text-[11px] text-stone-500 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
          <span className="font-bold text-stone-700">QR Encodes Target:</span>
          <code className="text-[#580D1A] font-mono break-all">
            {getComputedUrl()}
          </code>
        </div>
      </div>

      {/* Luxury Printable Tabletop Standee Card */}
      <div className="flex justify-center">
        <div
          ref={printCardRef}
          id="printable-standee"
          className="w-full max-w-sm sm:max-w-md bg-white rounded-3xl border-2 border-[#D4AF37] shadow-2xl p-6 sm:p-8 text-[#2B070E] relative overflow-hidden print:shadow-none print:border-2 print:border-black print:m-0 print:p-8 print:w-full print:max-w-none"
        >
          {/* Subtle top gold accent line */}
          <div className="h-1.5 bg-gradient-to-r from-[#D4AF37] via-[#580D1A] to-[#D4AF37] -mt-6 sm:-mt-8 -mx-6 sm:-mx-8 mb-6" />

          {/* Card Header with Brand Crest */}
          <div className="text-center space-y-2">
            <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-[#D4AF37] shadow-md bg-[#580D1A] flex items-center justify-center">
              <img
                src="/images/upahar_logo.jpg"
                alt="Upahar Logo"
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-[#2B070E] flex items-center justify-center gap-1.5">
                UPAHAR
                <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
              </h1>
              <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] font-extrabold text-[#74171E]">
                Tiffins & Fast Food
              </p>
              <p className="text-[11px] text-stone-500 font-medium italic mt-0.5">
                Sunrise to Sunset • Sangivalasa
              </p>
            </div>

            {/* Table Number Pill */}
            {tableNumber && (
              <div className="pt-2">
                <div className="inline-flex items-center space-x-1.5 bg-[#580D1A] text-[#FAF7F2] border border-[#D4AF37]/50 px-4 py-1.5 rounded-full shadow-sm text-xs font-black uppercase tracking-wider">
                  <UtensilsCrossed className="w-3.5 h-3.5 text-[#DFC17B]" />
                  <span>{tableNumber}</span>
                </div>
              </div>
            )}
          </div>

          {/* QR Code Graphic with Brass Frame */}
          <div className="my-6 relative flex justify-center">
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 p-3.5 bg-white rounded-2xl border-2 border-[#D4AF37] shadow-inner flex items-center justify-center">
              {/* Corner Accents */}
              <div className="absolute top-1.5 left-1.5 w-3.5 h-3.5 border-t-2 border-l-2 border-[#580D1A]" />
              <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 border-t-2 border-r-2 border-[#580D1A]" />
              <div className="absolute bottom-1.5 left-1.5 w-3.5 h-3.5 border-b-2 border-l-2 border-[#580D1A]" />
              <div className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 border-b-2 border-r-2 border-[#580D1A]" />

              {loading ? (
                <div className="flex flex-col items-center space-y-2">
                  <RefreshCw className="w-8 h-8 text-[#580D1A] animate-spin" />
                  <span className="text-xs text-stone-500">Preparing QR...</span>
                </div>
              ) : qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR Code for ${tableNumber || "Upahar Tiffins"}`}
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <div className="text-xs text-red-500 font-semibold">
                  Failed to load QR code
                </div>
              )}
            </div>
          </div>

          {/* Call to Action Prompt */}
          <div className="text-center space-y-2">
            <h3 className="text-sm sm:text-base font-black text-[#580D1A] tracking-tight">
              SCAN TO VIEW OUR DIGITAL MENU
            </h3>
            <p className="text-xs text-stone-600 max-w-xs mx-auto leading-relaxed">
              Open your smartphone camera, aim at the QR code, and tap the link to browse our steaming dosas, button idlis & fast food specials!
            </p>
          </div>

          {/* Pledge & Footnote */}
          <div className="mt-5 pt-4 border-t border-[#EADBCE] space-y-2.5 text-center">
            <div className="inline-flex items-center space-x-1.5 text-[11px] font-bold text-[#580D1A] bg-[#F4EFE6] px-3 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>100% Pure Veg • Pure Desi Ghee • Stone-Ground</span>
            </div>

            <div className="text-[10px] text-stone-500 space-y-0.5">
              <p className="flex items-center justify-center space-x-1">
                <MapPin className="w-3 h-3 text-[#D4AF37] flex-shrink-0" />
                <span>1-1, Sangivalasa, Beside SBI, ANITS College Road</span>
              </p>
              <p className="flex items-center justify-center space-x-1 font-semibold text-stone-600">
                <Phone className="w-3 h-3 text-[#D4AF37] flex-shrink-0" />
                <span>Customer Care & Catering: +91 9885455342</span>
              </p>
            </div>
          </div>

          {/* Bottom Gold Trim */}
          <div className="h-1 bg-[#D4AF37]/50 -mb-6 sm:-mb-8 -mx-6 sm:-mx-8 mt-5" />
        </div>
      </div>
    </div>
  );
}
