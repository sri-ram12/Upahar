"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  QrCode,
  X,
  Copy,
  Check,
  Download,
  Printer,
  ExternalLink,
  Sparkles,
  Smartphone,
  UtensilsCrossed,
  Compass,
} from "lucide-react";
import { generateQRCodeDataUrl } from "@/lib/qr";

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDestination?: "home" | "menu" | "contact";
}

export default function QRModal({
  isOpen,
  onClose,
  defaultDestination = "menu",
}: QRModalProps) {
  const [destination, setDestination] = useState<"home" | "menu" | "contact">(
    defaultDestination
  );
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [origin, setOrigin] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const getTargetUrl = () => {
    const base = origin || "https://upahar.onrender.com";
    if (destination === "menu") return `${base}/menu`;
    if (destination === "contact") return `${base}/contact`;
    return `${base}/`;
  };

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);

    const targetUrl = getTargetUrl();

    generateQRCodeDataUrl(targetUrl, {
      size: 640,
      darkColor: "#2B070E",
      lightColor: "#FFFFFF",
      includeLogo: true,
      logoUrl: "/images/upahar_logo.jpg",
    })
      .then((url) => {
        if (isMounted) {
          setQrDataUrl(url);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to generate QR code:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, destination, origin]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getTargetUrl());
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
    link.download = `upahar-${destination}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-[#FAF7F2] rounded-3xl shadow-2xl border border-[#D4AF37]/40 overflow-hidden text-[#2B070E]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Luxury Maroon Header Banner */}
        <div className="bg-gradient-to-r from-[#2B070E] via-[#580D1A] to-[#2B070E] text-[#FAF7F2] px-6 py-5 relative flex items-center justify-between border-b border-[#D4AF37]/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full border border-[#D4AF37] overflow-hidden bg-[#580D1A] flex-shrink-0 shadow-md">
              <img
                src="/images/upahar_logo.jpg"
                alt="Upahar Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="font-display font-black text-lg text-white tracking-tight">
                  UPAHAR QR
                </h3>
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
              </div>
              <p className="text-[11px] text-[#DFC17B] tracking-wide font-medium">
                Scan with any smartphone camera to open
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Modal"
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-[#FAF7F2] transition border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Destination Selector Tabs */}
          <div className="flex rounded-xl bg-[#EADBCE]/50 p-1 border border-[#EADBCE]">
            <button
              onClick={() => setDestination("menu")}
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition flex items-center justify-center space-x-1.5 ${
                destination === "menu"
                  ? "bg-[#580D1A] text-[#FAF7F2] shadow-sm"
                  : "text-[#2B070E] hover:text-[#580D1A]"
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Digital Menu</span>
            </button>
            <button
              onClick={() => setDestination("home")}
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition flex items-center justify-center space-x-1.5 ${
                destination === "home"
                  ? "bg-[#580D1A] text-[#FAF7F2] shadow-sm"
                  : "text-[#2B070E] hover:text-[#580D1A]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Main Website</span>
            </button>
            <button
              onClick={() => setDestination("contact")}
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition flex items-center justify-center space-x-1.5 ${
                destination === "contact"
                  ? "bg-[#580D1A] text-[#FAF7F2] shadow-sm"
                  : "text-[#2B070E] hover:text-[#580D1A]"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Directions</span>
            </button>
          </div>

          {/* QR Code Presentation Box */}
          <div className="relative mx-auto w-64 h-64 sm:w-72 sm:h-72 bg-white rounded-2xl p-4 shadow-lg border-2 border-[#D4AF37]/40 flex items-center justify-center">
            {/* Elegant Corner Brackets */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#580D1A] rounded-tl-sm pointer-events-none" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#580D1A] rounded-tr-sm pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#580D1A] rounded-bl-sm pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#580D1A] rounded-br-sm pointer-events-none" />

            {loading ? (
              <div className="flex flex-col items-center space-y-3">
                <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-[#580D1A]" />
                <span className="text-xs text-stone-500 font-medium">
                  Generating high-res QR...
                </span>
              </div>
            ) : qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Upahar Restaurant QR Code"
                className="w-full h-full object-contain rounded-lg"
              />
            ) : (
              <div className="text-xs text-red-500 font-semibold">
                Failed to render QR Code
              </div>
            )}
          </div>

          {/* User Guidance Banner */}
          <div className="bg-[#F4EFE6] border border-[#D4AF37]/30 rounded-xl p-3.5 text-center flex items-center justify-center space-x-2 text-xs text-stone-700">
            <Smartphone className="w-4 h-4 text-[#580D1A] flex-shrink-0 animate-bounce" />
            <span>
              Point your smartphone camera or Google Lens at this code to view instantly!
            </span>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={handleCopyLink}
              className="py-2.5 px-3 rounded-xl border border-[#D4AF37]/50 text-xs font-bold bg-white hover:bg-stone-50 text-[#2B070E] transition flex items-center justify-center space-x-1.5 shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#580D1A]" />
                  <span>Copy Web Link</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="py-2.5 px-3 rounded-xl border border-[#D4AF37]/50 text-xs font-bold bg-white hover:bg-stone-50 text-[#2B070E] transition flex items-center justify-center space-x-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-[#580D1A]" />
              <span>Download Image</span>
            </button>
          </div>

          {/* Bottom Standee Link */}
          <div className="pt-2 border-t border-[#EADBCE] text-center">
            <Link
              href="/qr"
              onClick={onClose}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#580D1A] hover:text-[#2B070E] hover:underline"
            >
              <Printer className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Open Printable Table Standee & Tent Cards</span>
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
