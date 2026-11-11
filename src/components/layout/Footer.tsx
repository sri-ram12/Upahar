"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MapPin,
  Phone,
  Clock,
  ShieldCheck,
  Compass,
  ArrowUpRight,
  MessageSquare,
  QrCode,
} from "lucide-react";
import { InstagramIcon } from "@/components/ui/Icons";
import { getWebsiteTheme } from "@/lib/store-hours";

export default function Footer() {
  const pathname = usePathname();
  const isStaffPanel =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/kitchen") ||
    pathname?.startsWith("/delivery") ||
    pathname?.startsWith("/portal") ||
    pathname?.startsWith("/dev");

  const theme = isStaffPanel ? "original-maroon" : getWebsiteTheme(null, null, pathname);
  const isLightHub = theme === "light-hub";

  const footerSurface = isLightHub
    ? "bg-[#FAF8F4] text-[#1C1917] border-t border-[#E7E0D3]"
    : "bg-[var(--upahar-footer)] text-[#FAF7F2] border-t border-[#D4AF37]/25";

  const mutedText = isLightHub ? "text-[#57534E]" : "text-stone-300";
  const subMutedText = isLightHub ? "text-[#57534E]" : "text-stone-400";
  const headingAccent = isLightHub ? "text-[#580D1A]" : "text-[#DFC17B]";
  const linkHover = isLightHub ? "hover:text-[#580D1A]" : "hover:text-[#DFC17B]";
  const borderRow = isLightHub ? "border-[#E7E0D3]" : "border-white/15";
  const badgeBox = isLightHub
    ? "bg-white border border-[#E7E0D3] text-[#580D1A] shadow-xs"
    : "bg-black/25 border border-[#D4AF37]/30 text-[#DFC17B]";
  const valueText = isLightHub ? "text-[#1C1917]" : "text-white";

  return (
    <footer className={`${footerSurface} pt-16 pb-12 relative overflow-hidden transition-colors duration-300`}>
      {!isLightHub && (
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-black/15 rounded-full blur-3xl pointer-events-none" />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b ${borderRow}`}>
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="flex items-center space-x-3 group inline-block">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#D4AF37] shadow-lg bg-[#580D1A] flex-shrink-0 group-hover:scale-105 transition duration-300">
                <img
                  src="/images/upahar_logo.jpg"
                  alt="UPAHAR Official Emblem"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className={`text-2xl font-black tracking-tight font-display ${valueText}`}>
                  UPAHAR
                </span>
                <span className={`text-[10px] tracking-[0.2em] uppercase font-bold -mt-1 ${headingAccent}`}>
                  Tiffins &amp; Fast Food
                </span>
              </div>
            </Link>

            <p className={`${subMutedText} text-xs sm:text-sm leading-relaxed max-w-sm`}>
              Sunrise to Sunset • Good Food • Good Mood. Handcrafted morning tiffins and high-flame fast food prepared fresh beside SBI, ANITS College Road, Sangivalasa.
            </p>

            {/* Quality Pledge */}
            <div className={`inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs ${badgeBox}`}>
              <ShieldCheck className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
              <span className="font-semibold tracking-wide">
                Hygienic Kitchen • Fresh Ingredients • Pure Desi Ghee
              </span>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className={`text-xs uppercase font-extrabold tracking-[0.18em] ${headingAccent}`}>
              Explore Upahar
            </h3>
            <ul className={`space-y-2 text-xs font-medium ${mutedText}`}>
              <li>
                <Link href="/" className={`${linkHover} transition`}>
                  Home Showcase
                </Link>
              </li>
              <li>
                <Link href="/menu" className={`${linkHover} transition`}>
                  Complete Menu
                </Link>
              </li>
              <li>
                <Link href="/orders" className={`${linkHover} transition`}>
                  My Orders &amp; Tracker
                </Link>
              </li>
              <li>
                <Link href="/about" className={`${linkHover} transition`}>
                  Culinary Heritage
                </Link>
              </li>
              <li>
                <Link href="/experience" className={`${linkHover} transition`}>
                  Visiting Experience
                </Link>
              </li>
              <li>
                <Link href="/gallery" className={`${linkHover} transition`}>
                  Photo Gallery
                </Link>
              </li>
              <li>
                <Link href="/qr" className={`${headingAccent} hover:opacity-80 font-bold transition flex items-center space-x-1`}>
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Scan QR Code</span>
                </Link>
              </li>
              <li>
                <Link href="/contact" className={`${linkHover} transition`}>
                  Find &amp; Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Operating Sessions */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className={`text-xs uppercase font-extrabold tracking-[0.18em] flex items-center space-x-1.5 ${headingAccent}`}>
              <Clock className="w-3.5 h-3.5" />
              <span>Daily Sessions</span>
            </h3>
            <div className={`space-y-2 text-xs ${mutedText}`}>
              <div className={`flex flex-wrap justify-between items-center gap-x-2 gap-y-0.5 py-1.5 border-b ${borderRow}`}>
                <span className={subMutedText}>Upahar Tiffins:</span>
                <span className={`font-semibold text-right ${valueText}`}>6:00–10:30 AM &amp; 5:00–10:30 PM</span>
              </div>
              <div className={`flex flex-wrap justify-between items-center gap-x-2 gap-y-0.5 py-1.5 border-b ${borderRow}`}>
                <span className={subMutedText}>Upahar Biryanis:</span>
                <span className={`font-semibold text-right ${valueText}`}>12:00 PM – 10:30 PM</span>
              </div>
              <div className={`flex flex-wrap justify-between items-center gap-x-2 gap-y-0.5 py-1.5 border-b ${borderRow}`}>
                <span className={subMutedText}>Upahar Fast Foods:</span>
                <span className={`font-semibold text-right ${valueText}`}>5:00 PM – 10:30 PM</span>
              </div>
              <div className={`flex flex-wrap justify-between items-center gap-x-2 gap-y-0.5 py-1.5 border-b ${borderRow}`}>
                <span className={subMutedText}>Upahar Pickles:</span>
                <span className={`font-semibold text-right ${valueText}`}>Open 24×7 Anytime</span>
              </div>
              <div className="pt-1">
                <span className={`text-[11px] font-semibold block ${headingAccent}`}>
                  7km Delivery Available (Min ₹60 • Free ₹199+)
                </span>
              </div>
            </div>
          </div>

          {/* Location & Contact Shortcuts */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className={`text-xs uppercase font-extrabold tracking-[0.18em] ${headingAccent}`}>
              Visit Our Restaurant
            </h3>
            <div className={`space-y-2 text-xs ${mutedText}`}>
              <p className="flex items-start space-x-2 leading-relaxed">
                <MapPin className={`w-4 h-4 flex-shrink-0 mt-0.5 ${headingAccent}`} />
                <span>
                  1-1, Sangivalasa, ANITS College Road, Beside SBI, Visakhapatnam 531162
                </span>
              </p>
              <p className="flex items-center space-x-2">
                <Phone className={`w-4 h-4 flex-shrink-0 ${headingAccent}`} />
                <a href="tel:+919885455342" className={`${linkHover} font-semibold ${valueText}`}>
                  +91 9885455342
                </a>
              </p>

              <div className="pt-2 flex flex-col gap-2">
                <a
                  href="https://maps.app.goo.gl/6611R6FD1JZagSJt9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center space-x-1.5 text-xs font-bold transition ${headingAccent} hover:opacity-80`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Google Maps Directions</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>

                <a
                  href="https://wa.me/919885455342?text=Namaste%20Sri%20Vamsi!%20I%20am%20inquiring%20from%20the%20Upahar%20website."
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center space-x-1.5 text-xs transition font-semibold ${
                    isLightHub ? "text-emerald-700 hover:text-emerald-900" : "text-emerald-300 hover:text-emerald-200"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp Sri Vamsi</span>
                </a>

                <a
                  href="https://www.instagram.com/upahar_07/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center space-x-1.5 text-xs transition ${subMutedText} ${linkHover}`}
                >
                  <InstagramIcon className="w-3.5 h-3.5" />
                  <span>Follow @upahar_07 on Instagram</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className={`pt-8 flex flex-col sm:flex-row justify-between items-center text-xs gap-4 text-center sm:text-left ${subMutedText}`}>
          <p>
            © {new Date().getFullYear()} UPAHAR TIFFINS AND FAST FOOD. All Rights Reserved. Sunrise to Sunset.
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-4 gap-y-1 text-xs">
            <Link href="/privacy" className={`${linkHover} transition`}>
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className={`${linkHover} transition`}>
              Terms &amp; Conditions
            </Link>
            <span>•</span>
            <a
              href="https://maps.app.goo.gl/6611R6FD1JZagSJt9"
              target="_blank"
              rel="noopener noreferrer"
              className={`${linkHover} transition`}
            >
              Google Maps Listing
            </a>
            <span>•</span>
            <a
              href="https://www.instagram.com/upahar_07/"
              target="_blank"
              rel="noopener noreferrer"
              className={`${linkHover} transition`}
            >
              Instagram @upahar_07
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
