"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Printer,
  Download,
  Copy,
  Check,
  Sparkles,
  Phone,
  MapPin,
  ShieldCheck,
  RefreshCw,
  Globe,
} from "lucide-react";
import { generateQRCodeDataUrl } from "@/lib/qr";

interface TableStandeeProps {
  baseUrl?: string;
}

export default function TableStandee({ baseUrl }: TableStandeeProps) {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [targetUrl, setTargetUrl] = useState(baseUrl || "https://upahar.onrender.com");

  const printCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setTargetUrl(baseUrl || window.location.origin);
    }
  }, [baseUrl]);

  useEffect(() => {
    let active = true;
    setLoading(true);

    generateQRCodeDataUrl(targetUrl, {
      size: 800,
      darkColor: "#2B070E",
      lightColor: "#FFFFFF",
      includeLogo: true,
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
  }, [targetUrl]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(targetUrl);
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
    link.download = `upahar-website-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Action Controls Bar (Hidden during print) */}
      <div className="print:hidden bg-white p-5 sm:p-6 rounded-3xl border border-[#EADBCE] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-[#2B070E] font-display flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#D4AF37]" />
            <span>Official Website QR Code</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            This QR code opens the Upahar website directly when scanned by customers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePrint}
            className="btn-maroon-gold px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md hover:scale-105 transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#DFC17B]" />
            <span>Print Standee Card</span>
          </button>

          <button
            onClick={handleDownload}
            className="btn-gold-outline px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#580D1A]" />
            <span>Download PNG</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="px-3.5 py-2.5 rounded-xl text-xs font-bold border border-stone-200 hover:bg-stone-50 text-stone-700 flex items-center space-x-1.5 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-stone-500" />
                <span>Copy Link</span>
              </>
            )}
          </button>
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

            {/* Official Website Badge */}
            <div className="pt-2">
              <div className="inline-flex items-center space-x-1.5 bg-[#580D1A] text-[#FAF7F2] border border-[#D4AF37]/50 px-4 py-1.5 rounded-full shadow-sm text-xs font-black uppercase tracking-wider">
                <Globe className="w-3.5 h-3.5 text-[#DFC17B]" />
                <span>Scan To Open Website</span>
              </div>
            </div>
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
                  alt="Official Upahar Website QR Code"
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
              SCAN WITH YOUR PHONE CAMERA
            </h3>
            <p className="text-xs text-stone-600 max-w-xs mx-auto leading-relaxed">
              Open your camera app, aim at the QR code, and tap the link to open the website, explore our menu & daily specials!
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
                <span>Phone & Orders: +91 9885455342</span>
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
