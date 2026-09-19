"use client";

import React, { useState } from "react";
import { MessageSquare, X } from "lucide-react";

export default function FloatingWhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false);
  const ownerNumber = "919885455342";
  const whatsappUrl = `https://wa.me/${ownerNumber}?text=Namaste%20Sri%20Venkat%20Rao%20ji!%20I%20am%20visiting%20the%20Upahar%20website%20and%20would%20like%20details%20about%20today's%20menu%20and%20timings%20at%20Sangivalasa.`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-auto select-none">
      {/* Popover Card */}
      {isOpen && (
        <div className="mb-3 w-72 sm:w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-emerald-500/30 overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white p-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] tracking-widest uppercase font-bold text-emerald-200">
                  Direct Line with Owner
                </span>
                <h4 className="font-serif font-bold text-base mt-0.5">Sri K. Venkat Rao</h4>
                <p className="text-xs text-emerald-100">Managing Partner & Founder</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-emerald-100 hover:text-white p-1 rounded-lg transition"
                aria-label="Close message"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-4 bg-[#FAF7F2] text-[#141210]">
            <p className="text-xs text-stone-600 leading-relaxed">
              Have questions about morning tiffins, catering orders, fresh pure ghee preparation, or table seating?
              Chat directly with our founder on WhatsApp!
            </p>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3.5 w-full inline-flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md transition transform active:scale-95"
            >
              <svg
                className="w-4 h-4 fill-current"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.599 2.679-.702c.972.553 1.769.816 2.781.816 3.18 0 5.767-2.587 5.767-5.766.001-3.182-2.585-5.77-5.767-5.77zm0-2c4.284 0 7.767 3.483 7.767 7.766 0 4.285-3.483 7.77-7.767 7.77-1.32 0-2.559-.344-3.64-.949l-4.391 1.15 1.174-4.292c-.732-1.156-1.159-2.529-1.159-3.999 0-4.283 3.483-7.766 7.767-7.766z" />
              </svg>
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      )}

      {/* Main Trigger Floating Button with Pulse Rings */}
      <div className="relative group">
        {/* Animated Concentric Glowing Radar Rings */}
        <span className="absolute -inset-2 rounded-full bg-emerald-500/20 animate-ping pointer-events-none" />
        <span className="absolute -inset-1 rounded-full bg-emerald-500/30 animate-pulse pointer-events-none" />

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-4 py-3 rounded-full shadow-2xl transition duration-300 transform group-hover:scale-105 border border-emerald-300/40"
          aria-label="Chat with Owner on WhatsApp"
        >
          {/* WhatsApp Logo SVG */}
          <div className="w-5 h-5 flex items-center justify-center">
            <svg
              className="w-5 h-5 fill-current text-white"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.599 2.679-.702c.972.553 1.769.816 2.781.816 3.18 0 5.767-2.587 5.767-5.766.001-3.182-2.585-5.77-5.767-5.77zm0-2c4.284 0 7.767 3.483 7.767 7.766 0 4.285-3.483 7.77-7.767 7.77-1.32 0-2.559-.344-3.64-.949l-4.391 1.15 1.174-4.292c-.732-1.156-1.159-2.529-1.159-3.999 0-4.283 3.483-7.766 7.767-7.766z" />
            </svg>
          </div>

          <span className="text-xs font-bold tracking-wide hidden sm:inline-block">
            WhatsApp Owner
          </span>
        </button>
      </div>
    </div>
  );
}
