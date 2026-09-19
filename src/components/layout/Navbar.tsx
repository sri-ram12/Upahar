"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu as MenuIcon,
  X,
  Clock,
  Phone,
  UtensilsCrossed,
  MapPin,
  Compass,
  ArrowRight,
  MessageSquare,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [storeStatus, setStoreStatus] = useState<{
    isOpen: boolean;
    statusText: string;
    subText: string;
    currentSession?: string;
  } | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetch("/api/restaurant")
      .then((res) => res.json())
      .then((data) => {
        if (data.storeStatus) {
          setStoreStatus(data.storeStatus);
        }
      })
      .catch((err) => console.error("Error fetching restaurant status:", err));
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Our Story", href: "/about" },
    { name: "Signature Menu", href: "/menu" },
    { name: "The Experience", href: "/experience" },
    { name: "Photo Gallery", href: "/gallery" },
    { name: "Visit & Contact", href: "/contact" },
  ];

  return (
    <>
      {/* Top Banner: Authentic Heritage Hours & Quick Dial */}
      <div className="bg-[#2B070E] text-[#F3DEAB] text-xs py-2 px-4 border-b border-[#D4AF37]/20 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center font-medium">
          <div className="flex items-center space-x-6">
            <span className="flex items-center space-x-2">
              <Clock className="w-3.5 h-3.5 text-[#DFC17B]" />
              <span>
                {storeStatus ? (
                  <>
                    <strong className={storeStatus.isOpen ? "text-[#DFC17B] font-bold" : "text-amber-200"}>
                      {storeStatus.statusText}
                    </strong>{" "}
                    • {storeStatus.subText}
                  </>
                ) : (
                  "Morning 6:00 AM – 10:00 AM • Evening 6:00 PM – 10:30 PM"
                )}
              </span>
            </span>
            <a
              href="https://maps.app.goo.gl/6611R6FD1JZagSJt9"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 text-stone-300 hover:text-[#DFC17B] transition"
            >
              <MapPin className="w-3.5 h-3.5 text-[#DFC17B]" />
              <span>1-1, Sangivalasa, ANITS Road, Beside SBI</span>
            </a>
          </div>

          <div className="flex items-center space-x-5">
            <a
              href="https://wa.me/919885455342?text=Namaste!%20I%20am%20visiting%20your%20website%20and%20would%20like%20further%20details%20about%20Upahar%20Tiffins."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 text-emerald-300 hover:text-emerald-200 transition font-semibold"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp (9885455342)</span>
            </a>
            <span className="text-[#C5A059]/40">|</span>
            <a
              href="tel:+919885455342"
              className="flex items-center space-x-1.5 text-[#FAF7F2] hover:text-[#DFC17B] transition font-semibold"
            >
              <Phone className="w-3.5 h-3.5 text-[#DFC17B]" />
              <span>+91 9885455342</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Luxury Sticky Header */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? "luxury-glass-nav shadow-lg py-2.5"
            : "bg-[#FAF7F2]/95 backdrop-blur-md py-3 border-b border-[#EADBCE]"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Emblem & Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-[#D4AF37] shadow-md shadow-[#4A0E17]/20 group-hover:scale-105 transition duration-300 flex-shrink-0 bg-[#580D1A]">
              <img
                src="/images/upahar_logo.jpg"
                alt="UPAHAR Official Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-[#2B070E] font-display flex items-center gap-1.5">
                UPAHAR
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
              </span>
              <span className="text-[9px] sm:text-[10px] tracking-[0.2em] uppercase font-bold text-[#74171E] -mt-1">
                Tiffins & Fast Food
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 font-medium text-sm">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "text-[#4A0E17] font-bold bg-[#EADBCE]/50 border-b-2 border-[#580D1A]"
                      : "text-[#292524] hover:text-[#580D1A] hover:bg-[#F4EFE6]"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            <a
              href="https://maps.app.goo.gl/6611R6FD1JZagSJt9"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold-outline px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5"
            >
              <Compass className="w-3.5 h-3.5 text-[#580D1A]" />
              <span>Get Directions</span>
            </a>

            <Link
              href="/menu"
              className="btn-maroon-gold px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5"
            >
              <span>Explore Menu</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#DFC17B]" />
            </Link>
          </div>

          {/* Mobile Menu Hamburger Button */}
          <div className="flex items-center space-x-2 lg:hidden">
            <a
              href="tel:+919885455342"
              className="p-2 rounded-xl bg-[#580D1A] text-[#DFC17B] shadow-sm"
              aria-label="Call Restaurant"
            >
              <Phone className="w-4 h-4" />
            </a>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-[#F4EFE6] text-[#2B070E] border border-[#EADBCE]"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#FAF7F2] border-b border-[#EADBCE] shadow-2xl px-5 py-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
            {/* Store hours pill on mobile */}
            <div className="p-3 rounded-xl bg-[#F4EFE6] border border-[#D4AF37]/30 flex items-center space-x-2.5 text-xs text-[#2B070E]">
              <Clock className="w-4 h-4 text-[#580D1A] flex-shrink-0" />
              <div>
                <span className="font-bold block">
                  {storeStatus ? storeStatus.statusText : "Open Daily: 6am - 10am | 6pm - 10:30pm"}
                </span>
                <span className="text-[11px] text-stone-600 block">
                  {storeStatus?.subText || "Serving Breakfast, Lunch, Evening Snacks & Dinner"}
                </span>
              </div>
            </div>

            {/* Mobile Nav Links */}
            <nav className="flex flex-col space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-3.5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-between ${
                      isActive
                        ? "bg-[#580D1A] text-[#FAF7F2]"
                        : "text-[#2B070E] hover:bg-[#F4EFE6]"
                    }`}
                  >
                    <span>{link.name}</span>
                    <ArrowRight className="w-4 h-4 opacity-70" />
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Action CTAs */}
            <div className="pt-3 border-t border-[#EADBCE] flex flex-col gap-2">
              <a
                href="https://wa.me/919885455342?text=Namaste!%20I%20am%20visiting%20your%20website%20and%20would%20like%20further%20details%20about%20Upahar%20Tiffins."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl text-xs font-bold text-center flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              >
                <MessageSquare className="w-4 h-4 text-white" />
                <span>WhatsApp Owner (9885455342)</span>
              </a>

              <a
                href="https://maps.app.goo.gl/6611R6FD1JZagSJt9"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold-outline w-full py-2.5 rounded-xl text-xs font-bold text-center flex items-center justify-center space-x-2"
              >
                <MapPin className="w-4 h-4 text-[#580D1A]" />
                <span>Directions to Sangivalasa</span>
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
