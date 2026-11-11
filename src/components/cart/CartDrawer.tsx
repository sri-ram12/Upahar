"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Sparkles,
  Bike,
  UtensilsCrossed,
} from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CartDrawer() {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    removeUnavailableItems,
    syncCartWithMenu,
    hasUnavailableItems,
    clearCart,
    totalCount,
    subtotal,
    specialNotes,
    setSpecialNotes,
  } = useCart();

  const [freeThreshold, setFreeThreshold] = useState(199);
  const [minDeliveryOrder, setMinDeliveryOrder] = useState(60);
  const [packagingFee, setPackagingFee] = useState(10);

  useEffect(() => {
    if (!isCartOpen) return;
    syncCartWithMenu();
    fetch("/api/restaurant")
      .then((r) => r.json())
      .then((d) => {
        if (d?.settings?.minOrderFreeDelivery !== undefined) {
          setFreeThreshold(Number(d.settings.minOrderFreeDelivery));
        }
        if (d?.settings?.minDeliveryOrderAmount !== undefined) {
          setMinDeliveryOrder(Number(d.settings.minDeliveryOrderAmount));
        }
        if (d?.settings?.packagingFee !== undefined) {
          setPackagingFee(Number(d.settings.packagingFee));
        }
      })
      .catch(() => {});
  }, [isCartOpen, syncCartWithMenu]);

  if (!isCartOpen) return null;

  // Dynamic thresholds from Admin Settings
  const amountToFree = Math.max(0, freeThreshold - subtotal);
  const progressPercent = freeThreshold > 0 ? Math.min(100, (subtotal / freeThreshold) * 100) : 100;
  const amountToMinOrder = Math.max(0, minDeliveryOrder - subtotal);

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-md bg-brand-cream h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300 border-l border-brand-border">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-white border-b border-brand-border flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-700/10 flex items-center justify-center text-brand-700">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-brand-950 font-display">
                Your Order Bag
              </h2>
              <span className="text-xs text-stone-500 font-medium">
                {totalCount} {totalCount === 1 ? "item" : "items"} selected
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-stone-400 hover:text-red-600 p-2 text-xs font-semibold transition"
                title="Clear all items"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-xl text-stone-500 hover:bg-stone-100 transition"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Free Delivery Bar (Tagarapuvalasa 7km radius) */}
        <div className="bg-brand-700 text-[#DFC17B] px-4 py-2.5 text-xs flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="flex items-center space-x-1.5 font-bold">
              <Bike className="w-3.5 h-3.5" />
              <span>
                {amountToFree === 0
                  ? "🎉 You unlocked FREE Delivery within 7km!"
                  : `Add ₹${amountToFree} more for FREE delivery`}
              </span>
            </span>
            <span className="text-[10px] uppercase font-bold text-stone-300">
              Tagarapuvalasa
            </span>
          </div>
          <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#DFC17B] h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-20 h-20 rounded-full bg-brand-border/50 flex items-center justify-center text-brand-700">
                <UtensilsCrossed className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-base font-bold text-brand-950">
                  Your cart is empty
                </h3>
                <p className="text-xs text-stone-500 mt-1 max-w-xs">
                  Discover our crispy dosas, steaming button idlis, and delicious fast food dishes.
                </p>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="btn-maroon-gold px-6 py-2.5 rounded-xl text-xs font-bold"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <>
              {items.map(({ foodItem, quantity }) => {
                const isSoldOut = foodItem.isAvailable === false;
                return (
                <div
                  key={foodItem.id}
                  className={`p-3 rounded-2xl border shadow-xs flex items-center justify-between gap-3 ${
                    isSoldOut
                      ? "bg-red-50/70 border-red-200 opacity-90"
                      : "bg-white border-brand-border"
                  }`}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                      <Image
                        src={foodItem.image || "/ghee-karam-dosa.jpg"}
                        alt={foodItem.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-brand-950 truncate">
                          {foodItem.name}
                        </h4>
                        {isSoldOut && (
                          <span className="px-1.5 py-0.5 rounded bg-red-600 text-white text-[9px] font-black uppercase flex-shrink-0">
                            Sold Out
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <span className="text-xs font-black text-brand-700">
                          ₹{foodItem.price}
                        </span>
                        {foodItem.portionSize && (
                          <span className="text-[10px] text-stone-400">
                            • {foodItem.portionSize}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center space-x-1.5 bg-brand-cream border border-brand-border rounded-xl px-2 py-1">
                    <button
                      onClick={() => updateQuantity(foodItem.id, -1)}
                      className="w-6 h-6 flex items-center justify-center text-stone-600 hover:text-brand-700 transition cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      {quantity === 1 ? (
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      ) : (
                        <Minus className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <span className="w-6 text-center text-xs font-black text-brand-950">
                      {quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(foodItem.id, 1)}
                      disabled={isSoldOut}
                      className="w-6 h-6 flex items-center justify-center text-stone-600 hover:text-brand-700 transition disabled:opacity-35 cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                );
              })}

              {/* Special Instructions Note */}
              <div className="pt-2">
                <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                  Special Kitchen Note (Optional)
                </label>
                <textarea
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder="e.g. Extra spicy karam podi, less oil, pack chutney separately..."
                  rows={2}
                  className="w-full text-xs p-3 rounded-xl border border-brand-border bg-white focus:outline-none focus:ring-1 focus:ring-brand-700 text-stone-800 resize-none"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer / Checkout CTA */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 bg-white border-t border-brand-border space-y-3">
            <div className="space-y-1.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-brand-950">₹{subtotal}</span>
              </div>
              {packagingFee > 0 && (
                <div className="flex justify-between">
                  <span>Parcel Packaging</span>
                  <span className="font-bold text-brand-950">₹{packagingFee}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="flex items-center space-x-1">
                  <span>Est. Delivery</span>
                  <span className="text-[10px] text-stone-400">(within 7km)</span>
                </span>
                <span className="font-bold text-brand-950">
                  {amountToFree === 0 ? (
                    <span className="text-emerald-700 font-black">FREE</span>
                  ) : (
                    "₹15 - ₹35"
                  )}
                </span>
              </div>
              {amountToMinOrder > 0 && (
                <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-[11px] font-bold text-amber-900">
                  Add ₹{Math.ceil(amountToMinOrder)} more for Doorstep Delivery (Min ₹{minDeliveryOrder}) • Self-Pickup has no minimum!
                </div>
              )}
              {hasUnavailableItems && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-[11px] font-bold text-red-800 flex items-center justify-between gap-2">
                  <span>Some items in your bag just sold out in the kitchen.</span>
                  <button
                    type="button"
                    onClick={removeUnavailableItems}
                    className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-[10px] font-black flex-shrink-0 cursor-pointer hover:bg-red-700"
                  >
                    Remove Sold Out
                  </button>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-brand-surface flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                  Est. Total (incl. pack)
                </span>
                <span className="text-xl font-black text-brand-700 font-display">
                  ₹{subtotal + packagingFee}
                </span>
              </div>

              {hasUnavailableItems ? (
                <button
                  type="button"
                  onClick={removeUnavailableItems}
                  className="px-5 py-3 rounded-2xl text-xs font-black bg-red-600 text-white hover:bg-red-700 transition shadow-md cursor-pointer"
                >
                  Clear Sold-Out First
                </button>
              ) : (
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="btn-maroon-gold px-6 py-3 rounded-2xl text-xs font-black flex items-center space-x-2 shadow-lg shadow-brand-700/20"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 text-[#DFC17B]" />
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

