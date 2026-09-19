import React from "react";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Clock,
  ShieldCheck,
  Compass,
  ArrowUpRight,
  MessageSquare,
} from "lucide-react";
import { InstagramIcon } from "@/components/ui/Icons";

export default function Footer() {
  return (
    <footer className="bg-[#141210] text-[#FAF7F2] border-t border-[#D4AF37]/20 pt-16 pb-12 relative overflow-hidden">
      {/* Subtle background radial maroon warmth */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#4A0E17]/25 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-stone-800">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="flex items-center space-x-3 group inline-block">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#D4AF37] shadow-lg shadow-[#4A0E17]/40 bg-[#580D1A] flex-shrink-0 group-hover:scale-105 transition duration-300">
                <img
                  src="/images/upahar_logo.jpg"
                  alt="UPAHAR Official Emblem"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tight text-[#FAF7F2] font-display">
                  UPAHAR
                </span>
                <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#DFC17B] -mt-1">
                  Tiffins & Fast Food
                </span>
              </div>
            </Link>

            <p className="text-stone-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              Sunrise to Sunset • Good Food • Good Mood. Handcrafted morning tiffins and high-flame evening fast food prepared fresh beside SBI, ANITS College Road, Sangivalasa.
            </p>

            {/* Quality Pledge */}
            <div className="inline-flex items-center space-x-2 bg-[#2B070E]/80 border border-[#D4AF37]/30 px-3.5 py-2 rounded-xl text-xs text-[#DFC17B]">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              <span className="font-semibold tracking-wide">
                Hygienic Kitchen • Fresh Ingredients • Pure Desi Ghee
              </span>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs uppercase font-extrabold tracking-[0.18em] text-[#DFC17B]">
              Explore Upahar
            </h3>
            <ul className="space-y-2 text-xs text-stone-300 font-medium">
              <li>
                <Link href="/" className="hover:text-[#DFC17B] transition">
                  Home Showcase
                </Link>
              </li>
              <li>
                <Link href="/menu" className="hover:text-[#DFC17B] transition">
                  Complete Menu
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#DFC17B] transition">
                  Culinary Heritage
                </Link>
              </li>
              <li>
                <Link href="/experience" className="hover:text-[#DFC17B] transition">
                  Visiting Experience
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-[#DFC17B] transition">
                  Photo Gallery
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#DFC17B] transition">
                  Find & Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Operating Sessions */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-xs uppercase font-extrabold tracking-[0.18em] text-[#DFC17B] flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-[#DFC17B]" />
              <span>Daily Sessions</span>
            </h3>
            <div className="space-y-2 text-xs text-stone-300">
              <div className="flex justify-between py-1.5 border-b border-stone-800">
                <span className="text-stone-400">Morning Tiffins:</span>
                <span className="font-semibold text-[#FAF7F2]">6:00 AM – 10:00 AM</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-800">
                <span className="text-stone-400">Afternoon Prep Break:</span>
                <span className="text-stone-500 text-[11px]">10:00 AM – 6:00 PM</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-800">
                <span className="text-stone-400">Evening Fast Food:</span>
                <span className="font-semibold text-[#FAF7F2]">6:00 PM – 10:30 PM</span>
              </div>
              <div className="pt-1">
                <span className="text-[11px] text-[#DFC17B] block">
                  Door Delivery Available on Minimum Order
                </span>
              </div>
            </div>
          </div>

          {/* Location & Contact Shortcuts */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-xs uppercase font-extrabold tracking-[0.18em] text-[#DFC17B]">
              Visit Our Restaurant
            </h3>
            <div className="space-y-2 text-xs text-stone-300">
              <p className="flex items-start space-x-2 leading-relaxed">
                <MapPin className="w-4 h-4 text-[#DFC17B] flex-shrink-0 mt-0.5" />
                <span>
                  1-1, Sangivalasa, ANITS College Road, Beside SBI, Visakhapatnam 531162
                </span>
              </p>
              <p className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-[#DFC17B] flex-shrink-0" />
                <a href="tel:+919885455342" className="hover:text-[#DFC17B] font-semibold text-[#FAF7F2]">
                  +91 9885455342
                </a>
              </p>

              <div className="pt-2 flex flex-col gap-2">
                <a
                  href="https://maps.app.goo.gl/6611R6FD1JZagSJt9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#DFC17B] hover:text-white transition"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Google Maps Directions</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>

                <a
                  href="https://wa.me/919885455342?text=Namaste%20Sri%20Vamsi!%20I%20am%20inquiring%20from%20the%20Upahar%20website."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp Sri Vamsi</span>
                </a>

                <a
                  href="https://www.instagram.com/upahar_07/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 text-xs text-stone-400 hover:text-[#DFC17B] transition"
                >
                  <InstagramIcon className="w-3.5 h-3.5" />
                  <span>Follow @upahar_07 on Instagram</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-stone-500 gap-4">
          <p>
            © {new Date().getFullYear()} UPAHAR TIFFINS AND FAST FOOD. All Rights Reserved. Sunrise to Sunset.
          </p>
          <div className="flex items-center space-x-4 text-xs">
            <a
              href="https://maps.app.goo.gl/6611R6FD1JZagSJt9"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#DFC17B] transition"
            >
              Google Maps Listing
            </a>
            <span>•</span>
            <a
              href="https://www.instagram.com/upahar_07/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#DFC17B] transition"
            >
              Instagram @upahar_07
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
