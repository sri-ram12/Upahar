"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  QrCode,
  Printer,
  Download,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Globe,
  MapPin,
  Phone,
  RefreshCw,
} from "lucide-react";
import { generateQRCodeDataUrl } from "@/lib/qr";

export default function AdminQRManagerPage() {
  const [baseUrl, setBaseUrl] = useState<string>("https://upahar.onrender.com");
  const [includeLogo, setIncludeLogo] = useState<boolean>(true);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const printCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.location.hostname !== "localhost") {
        setBaseUrl(window.location.origin);
      }
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    generateQRCodeDataUrl(baseUrl, {
      size: 800,
      darkColor: "#2B070E",
      lightColor: "#FFFFFF",
      includeLogo,
      logoUrl: "/images/upahar_logo.jpg",
    })
      .then((url) => {
        if (!isCancelled) {
          setQrDataUrl(url);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("QR generation failed:", err);
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [baseUrl, includeLogo]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(baseUrl);
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
    link.download = `upahar-official-website-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-4xl mx-auto bg-[#FAF7F2] min-h-screen">
      {/* Header section (hidden in print) */}
      <div className="print:hidden flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#EADBCE] shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-[#580D1A] text-[#DFC17B]">
              <QrCode className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#2B070E] font-display">
              Official Website QR Code
            </h1>
          </div>
          <p className="text-xs text-stone-500">
            One single, high-definition QR code for UPAHAR TIFFINS that opens the website on any customer smartphone.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="btn-maroon-gold px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md hover:scale-105 transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#DFC17B]" />
            <span>Print Standee Card</span>
          </button>

          <Link
            href="/qr"
            target="_blank"
            className="btn-gold-outline px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-1.5"
          >
            <ExternalLink className="w-4 h-4 text-[#580D1A]" />
            <span>Public View</span>
          </Link>
        </div>
      </div>

      {/* URL & Controls Toolbar (hidden in print) */}
      <div className="print:hidden bg-white p-6 rounded-3xl border border-[#EADBCE] shadow-sm space-y-4">
        <h2 className="text-xs uppercase font-extrabold tracking-[0.2em] text-[#580D1A]">
          Website Destination
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-stone-700 mb-1">
              Website URL Encoded in QR:
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#580D1A] bg-stone-50 font-mono text-xs"
              placeholder="https://upahar.onrender.com"
            />
            <span className="text-[10px] text-stone-500 mt-1 block">
              When customers scan the QR, this website will open on their phone.
            </span>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">
              Brand Emblem:
            </label>
            <label className="flex items-center space-x-2 py-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeLogo}
                onChange={(e) => setIncludeLogo(e.target.checked)}
                className="w-4 h-4 rounded text-[#580D1A] focus:ring-[#580D1A]"
              />
              <span className="font-semibold text-stone-700">
                Include Upahar Emblem in Center
              </span>
            </label>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap gap-2">
          <button
            onClick={handleDownload}
            className="btn-gold-outline px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#580D1A]" />
            <span>Download High-Res PNG</span>
          </button>

          <button
            onClick={handleCopy}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-stone-200 hover:bg-stone-50 text-stone-700 flex items-center space-x-1.5 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-stone-500" />
                <span>Copy Website URL</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Standee Preview & Printable View */}
      <div className="flex justify-center">
        <div
          ref={printCardRef}
          id="printable-standee"
          className="w-full max-w-sm sm:max-w-md bg-white rounded-3xl border-2 border-[#D4AF37] shadow-xl p-6 sm:p-8 text-[#2B070E] relative overflow-hidden print:shadow-none print:border-2 print:border-black print:m-0 print:p-8 print:w-full print:max-w-none"
        >
          {/* Decorative top strip */}
          <div className="h-1.5 bg-gradient-to-r from-[#D4AF37] via-[#580D1A] to-[#D4AF37] -mt-6 sm:-mt-8 -mx-6 sm:-mx-8 mb-6" />

          {/* Card Header */}
          <div className="text-center space-y-2">
            <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-[#D4AF37] shadow-md bg-[#580D1A] flex items-center justify-center">
              <img
                src="/images/upahar_logo.jpg"
                alt="Upahar Logo"
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h3 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-[#2B070E] flex items-center justify-center gap-1.5">
                UPAHAR
                <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
              </h3>
              <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] font-extrabold text-[#74171E]">
                Tiffins & Fast Food
              </p>
              <p className="text-[11px] text-stone-500 font-medium italic mt-0.5">
                Sunrise to Sunset • Sangivalasa
              </p>
            </div>

            <div className="pt-1.5">
              <span className="inline-flex items-center space-x-1.5 bg-[#580D1A] text-[#FAF7F2] border border-[#D4AF37]/50 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
                <Globe className="w-3.5 h-3.5 text-[#DFC17B]" />
                <span>Scan To Open Website</span>
              </span>
            </div>
          </div>

          {/* QR Graphic */}
          <div className="my-6 flex justify-center">
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 p-3 bg-white rounded-2xl border-2 border-[#D4AF37] shadow-inner flex items-center justify-center">
              {/* Corner Accents */}
              <div className="absolute top-1.5 left-1.5 w-3.5 h-3.5 border-t-2 border-l-2 border-[#580D1A]" />
              <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 border-t-2 border-r-2 border-[#580D1A]" />
              <div className="absolute bottom-1.5 left-1.5 w-3.5 h-3.5 border-b-2 border-l-2 border-[#580D1A]" />
              <div className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 border-b-2 border-r-2 border-[#580D1A]" />

              {loading ? (
                <div className="flex flex-col items-center space-y-2">
                  <RefreshCw className="w-8 h-8 text-[#580D1A] animate-spin" />
                  <span className="text-xs text-stone-500">Generating QR...</span>
                </div>
              ) : qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Official Upahar Website QR Code"
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <div className="text-xs text-stone-400">Failed to render</div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="text-center space-y-1">
            <h4 className="text-sm font-black text-[#580D1A] uppercase tracking-wide">
              Scan With Any Smartphone
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed max-w-xs mx-auto">
              Aim camera to open our live website, browse dishes & check today&apos;s specials!
            </p>
          </div>

          {/* Footer details */}
          <div className="mt-5 pt-4 border-t border-[#EADBCE] text-center space-y-2 text-[10px] text-stone-500">
            <div className="inline-flex items-center space-x-1.5 text-[11px] font-bold text-[#580D1A] bg-[#F4EFE6] px-3 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>100% Pure Veg • Pure Desi Ghee • Stone-Ground</span>
            </div>

            <p className="flex items-center justify-center space-x-1">
              <MapPin className="w-3 h-3 text-[#D4AF37] flex-shrink-0" />
              <span>1-1, Sangivalasa, Beside SBI, ANITS College Road</span>
            </p>
            <p className="flex items-center justify-center space-x-1 font-semibold text-stone-600">
              <Phone className="w-3 h-3 text-[#D4AF37] flex-shrink-0" />
              <span>Orders & Catering: +91 9885455342</span>
            </p>
          </div>

          {/* Bottom Gold Trim */}
          <div className="h-1 bg-[#D4AF37]/50 -mb-6 sm:-mb-8 -mx-6 sm:-mx-8 mt-5" />
        </div>
      </div>
    </div>
  );
}
