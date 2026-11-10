"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function FloatingCartBar() {
  const pathname = usePathname();
  const { totalCount, subtotal, toggleCart } = useCart();

  // Don't show floating bar on checkout, staff panels, or tracking pages
  if (
    totalCount === 0 ||
    pathname?.startsWith("/checkout") ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/kitchen") ||
    pathname?.startsWith("/delivery") ||
    pathname?.startsWith("/portal") ||
    pathname?.startsWith("/orders/")
  ) {
    return null;
  }

  return (
    <div className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-6 z-40 sm:max-w-md animate-in slide-in-from-bottom duration-300">
      <div className="bg-brand-700 text-white p-3.5 sm:px-5 rounded-2xl shadow-2xl border border-[#D4AF37]/40 flex items-center justify-between gap-4">
        {/* Left Info */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={toggleCart}>
          <div className="relative w-10 h-10 rounded-xl bg-brand-950 flex items-center justify-center text-[#DFC17B] border border-[#D4AF37]/30">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-1.5 -right-1.5 bg-[#DFC17B] text-brand-700 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md">
              {totalCount}
            </span>
          </div>

          <div>
            <div className="text-[11px] font-bold text-[#DFC17B] uppercase tracking-wider">
              {totalCount} {totalCount === 1 ? "Item" : "Items"} in Bag
            </div>
            <div className="text-base font-black font-display text-white">
              ₹{subtotal}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleCart}
            className="hidden sm:inline-flex px-3 py-2 rounded-xl text-xs font-bold text-stone-200 hover:text-white bg-white/10 hover:bg-white/20 transition"
          >
            View Cart
          </button>

          <Link
            href="/checkout"
            className="btn-gold px-4 py-2 rounded-xl text-xs font-black flex items-center space-x-1.5 shadow-md"
          >
            <span>Checkout</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

