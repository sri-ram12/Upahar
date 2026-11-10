"use client";

import React from "react";
import Link from "next/link";
import { Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { FoodItem } from "@/types";
import { useCart } from "@/context/CartContext";

export default function DishOrderControls({
  item,
  disabledReason,
}: {
  item: FoodItem;
  disabledReason?: string | null;
}) {
  const { addToCart, updateQuantity, getItemQuantity, setIsCartOpen } = useCart();
  const quantity = getItemQuantity(item.id);
  const isAvailable = item.isAvailable !== false;

  if (disabledReason) {
    return (
      <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold text-center">
        🕒 {disabledReason}
      </div>
    );
  }

  if (!isAvailable) {
    return (
      <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold text-center">
        Currently Sold Out — Fresh batch preparing soon!
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {quantity === 0 ? (
        <button
          type="button"
          onClick={() => addToCart(item, 1)}
          className="btn-maroon-gold px-6 py-3 rounded-2xl text-xs font-black flex items-center space-x-2 shadow-lg hover:scale-105 active:scale-95 transition"
        >
          <Plus className="w-4 h-4 text-[#DFC17B]" />
          <span>ADD TO ORDER • ₹{item.price}</span>
        </button>
      ) : (
        <>
          <div className="flex items-center space-x-3 bg-brand-700 text-white rounded-2xl px-3.5 py-2 shadow-lg">
            <button
              type="button"
              onClick={() => updateQuantity(item.id, -1)}
              className="w-7 h-7 flex items-center justify-center text-[#DFC17B] hover:text-white rounded-lg transition"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-6 text-center text-sm font-black text-white">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => updateQuantity(item.id, 1)}
              className="w-7 h-7 flex items-center justify-center text-[#DFC17B] hover:text-white rounded-lg transition"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="btn-gold px-5 py-2.5 rounded-2xl text-xs font-black flex items-center space-x-1.5 shadow-md"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>View Bag</span>
          </button>

          <Link
            href="/checkout"
            className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center space-x-1 shadow-sm"
          >
            <span>Checkout</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </>
      )}
    </div>
  );
}

