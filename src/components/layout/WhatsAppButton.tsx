"use client";

import React, { useState } from "react";
import { MessageCircle, X } from "lucide-react";

export default function WhatsAppButton() {
  const [showTooltip, setShowTooltip] = useState(false);
  const whatsappNumber = process.env.NEXT_PUBLIC_RESTAURANT_WHATSAPP || "919876543210";
  const defaultMessage = encodeURIComponent(
    "Hello UPAHAR TIFFINS AND FAST FOOD, I would like to know more about your menu and place an order."
  );

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${defaultMessage}`;

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-5 z-40 flex items-center space-x-2">
      {showTooltip && (
        <div className="bg-stone-900 text-white text-xs py-1.5 px-3 rounded-xl shadow-xl flex items-center space-x-2 animate-fadeIn">
          <span>Need help? Chat with us on WhatsApp!</span>
          <button
            onClick={() => setShowTooltip(false)}
            className="text-stone-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setShowTooltip(true)}
        aria-label="Chat on WhatsApp"
        className="relative group bg-emerald-500 hover:bg-emerald-600 text-white p-3.5 rounded-full shadow-xl shadow-emerald-500/30 transition transform hover:scale-110 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-emerald-300"
      >
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white animate-ping" />
        <MessageCircle className="w-6 h-6 fill-current" />
      </a>
    </div>
  );
}
