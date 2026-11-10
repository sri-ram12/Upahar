"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Bike,
  RotateCcw,
  Search,
  ArrowRight,
  UtensilsCrossed,
  KeyRound,
  Star,
  QrCode,
  User,
} from "lucide-react";
import { Order, FoodItem } from "@/types";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { useCart } from "@/context/CartContext";
import { useRealtimeEvents } from "@/hooks/useRealtimeEvents";

const RECENT_ORDERS_KEY = "upahar_recent_orders_v1";

export default function CustomerOrdersPage() {
  const router = useRouter();
  const { customer, setIsAuthModalOpen } = useCustomerAuth();
  const { addToCart, clearCart, setIsCartOpen } = useCart();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [lookupInput, setLookupInput] = useState("");
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  const fetchOrders = async (customLookup?: string) => {
    try {
      const params = new URLSearchParams();
      params.set("limit", "40");

      const query = (customLookup ?? lookupInput).trim();
      if (query) {
        if (query.toUpperCase().startsWith("UPH-")) {
          params.set("orderNumbers", query.toUpperCase());
        } else {
          params.set("phone", query.replace(/\D/g, ""));
        }
      } else {
        if (customer?.id) params.set("customerId", customer.id);
        if (customer?.phone) params.set("phone", customer.phone);

        try {
          const savedRaw = localStorage.getItem(RECENT_ORDERS_KEY);
          if (savedRaw) {
            const nums: string[] = JSON.parse(savedRaw);
            if (Array.isArray(nums) && nums.length > 0) {
              params.set("orderNumbers", nums.join(","));
            }
          }
        } catch {}

        // If neither customer is logged in nor any local recent orders exist, avoid showing other people's orders
        if (!params.get("customerId") && !params.get("phone") && !params.get("orderNumbers")) {
          setOrders([]);
          setLoading(false);
          return;
        }
      }

      const res = await fetch(`/api/orders?${params.toString()}`);
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (e) {
      console.error("Failed to fetch customer orders:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [customer?.id, customer?.phone]);

  useRealtimeEvents({
    onOrderUpdated: () => fetchOrders(),
    onOrderDelivered: () => fetchOrders(),
  });

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    fetchOrders(lookupInput);
  };

  const handleReorder = async (order: Order) => {
    setReorderingId(order.id);
    try {
      // Fetch current menu to map fresh prices & images where available
      const menuRes = await fetch("/api/menu");
      const menuData = await menuRes.json();
      const menuMap = new Map<string, FoodItem>();
      if (menuData.items) {
        for (const item of menuData.items as FoodItem[]) {
          menuMap.set(item.id, item);
          menuMap.set(item.name.toLowerCase(), item);
        }
      }

      clearCart();
      for (const it of order.items) {
        const matched =
          (it.foodItemId && menuMap.get(it.foodItemId)) ||
          menuMap.get(it.name.toLowerCase());

        const dishObj: FoodItem = matched || {
          id: it.foodItemId || `reorder-${it.id}`,
          name: it.name,
          slug: it.name.toLowerCase().replace(/\s+/g, "-"),
          description: it.portionSize || "Freshly prepared Upahar specialty",
          price: it.price,
          image: "/ghee-karam-dosa.jpg",
          categoryId: "reorder",
          isVeg: true,
          isSpicy: false,
          isBestseller: false,
          isSignature: false,
          isAvailable: true,
          prepTime: "10-15 mins",
          portionSize: it.portionSize || null,
          displayOrder: 0,
        };
        addToCart(dishObj, it.quantity);
      }

      setIsCartOpen(true);
      router.push("/checkout");
    } catch (e) {
      console.error(e);
    } finally {
      setReorderingId(null);
    }
  };

  const activeOrders = orders.filter(
    (o) => o.status !== "DELIVERED" && o.status !== "CANCELLED"
  );
  const pastOrders = orders.filter(
    (o) => o.status === "DELIVERED" || o.status === "CANCELLED"
  );

  return (
    <div className="bg-brand-cream min-h-screen py-8 sm:py-12 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Top Header */}
        <div className="bg-brand-700 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-[#D4AF37]/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest font-black text-[#DFC17B] block">
              Order History & Live Tracker
            </span>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-white">
              {customer ? `${customer.name}'s Orders` : "My Orders"}
            </h1>
            <p className="text-xs text-stone-300">
              View live delivery status, your secret 4-digit OTP, Paytm QR receipts, and 1-tap re-order.
            </p>
          </div>

          {!customer && (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="btn-gold px-4 py-2.5 rounded-xl text-xs font-black flex items-center space-x-1.5 shadow-md flex-shrink-0"
            >
              <User className="w-4 h-4" />
              <span>Sign In with Mobile OTP</span>
            </button>
          )}
        </div>

        {/* Track Any Order by Phone or Order Number */}
        <form
          onSubmit={handleLookupSubmit}
          className="bg-white p-4 rounded-2xl border border-brand-border shadow-xs flex flex-col sm:flex-row gap-2.5"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Find order by Phone (e.g. 9885455342) or Order ID (e.g. UPH-4900)..."
              value={lookupInput}
              onChange={(e) => setLookupInput(e.target.value)}
              className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-brand-border bg-brand-cream focus:outline-none focus:ring-1 focus:ring-brand-700"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="btn-maroon-gold px-5 py-2.5 rounded-xl text-xs font-black flex items-center justify-center space-x-1.5"
            >
              <span>Find Orders</span>
            </button>
            {lookupInput && (
              <button
                type="button"
                onClick={() => {
                  setLookupInput("");
                  fetchOrders("");
                }}
                className="px-3 py-2.5 rounded-xl text-xs font-bold bg-stone-100 text-stone-600 hover:bg-stone-200"
              >
                Reset
              </button>
            )}
          </div>
        </form>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 rounded-full border-4 border-brand-700/20 border-t-brand-700 animate-spin" />
            <span className="text-xs font-bold text-stone-500">Loading your orders...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-brand-border space-y-4">
            <div className="w-16 h-16 rounded-full bg-brand-cream border border-brand-border flex items-center justify-center text-brand-700 mx-auto">
              <UtensilsCrossed className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-brand-950 font-display">
              No Orders Found Yet
            </h2>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Sign in with your mobile number or enter your phone / Order ID above to retrieve past orders, or place your first piping-hot order from Sangivalasa!
            </p>
            <div className="pt-2">
              <Link href="/menu" className="btn-maroon-gold px-6 py-3 rounded-2xl text-xs font-black inline-flex items-center space-x-2">
                <ShoppingBag className="w-4 h-4 text-[#DFC17B]" />
                <span>Explore Signature Menu</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Active Orders */}
            {activeOrders.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-sm font-black uppercase tracking-wider text-brand-700 flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>Live Active Orders ({activeOrders.length})</span>
                </h2>

                <div className="space-y-4">
                  {activeOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-[#D4AF37] shadow-md space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-brand-surface">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-base font-black text-brand-950 font-display">
                              Order #{order.orderNumber}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-brand-700 text-[#DFC17B] animate-pulse">
                              {order.status.replace(/_/g, " ")}
                            </span>
                          </div>
                          <span className="text-xs text-stone-500 block mt-0.5">
                            {new Date(order.createdAt).toLocaleString([], {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        {order.orderType === "DELIVERY" && (
                          <div className="px-3.5 py-2 rounded-xl bg-brand-cream border border-brand-700/30 flex items-center space-x-2">
                            <KeyRound className="w-4 h-4 text-brand-700" />
                            <div className="text-xs">
                              <span className="text-stone-500 text-[10px] font-bold block leading-none">
                                Delivery OTP
                              </span>
                              <span className="font-mono font-black text-base text-brand-700 tracking-widest">
                                {order.deliveryOtp}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1.5 text-xs">
                        {order.items.map((it) => (
                          <span
                            key={it.id}
                            className="bg-brand-cream border border-brand-border px-2.5 py-1 rounded-lg font-semibold text-brand-950"
                          >
                            {it.quantity}x {it.name}
                          </span>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-brand-surface">
                        <div className="text-xs">
                          <span className="font-black text-lg text-brand-700 font-display">
                            ₹{order.totalAmount}
                          </span>{" "}
                          <span className="text-stone-500 font-semibold">
                            • {order.paymentMethod.replace(/_/g, " ")} ({order.paymentStatus})
                          </span>
                        </div>

                        <Link
                          href={`/orders/${order.orderNumber}`}
                          className="btn-maroon-gold px-5 py-2.5 rounded-xl text-xs font-black flex items-center space-x-1.5 shadow-sm"
                        >
                          <Bike className="w-4 h-4 text-[#DFC17B]" />
                          <span>Track Live & View QR / OTP</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#DFC17B]" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Past Orders */}
            {pastOrders.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-sm font-black uppercase tracking-wider text-stone-600">
                  Past Orders ({pastOrders.length})
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pastOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-3xl p-5 border border-brand-border shadow-xs flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-brand-surface">
                          <div>
                            <span className="text-sm font-black text-brand-950 font-display block">
                              #{order.orderNumber}
                            </span>
                            <span className="text-[11px] text-stone-400">
                              {new Date(order.createdAt).toLocaleString([], {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <span
                            className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                              order.status === "DELIVERED"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>

                        <div className="text-xs text-stone-700 space-y-1">
                          {order.items.map((it) => (
                            <div key={it.id} className="flex justify-between">
                              <span className="font-medium truncate pr-2">
                                {it.quantity}x {it.name}
                              </span>
                              <span className="font-bold">₹{it.price * it.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-brand-surface space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-stone-500">
                            {order.paymentMethod} • {order.paymentStatus}
                          </span>
                          <span className="text-base font-black text-brand-700 font-display">
                            ₹{order.totalAmount}
                          </span>
                        </div>

                        {order.rating && (
                          <div className="flex items-center space-x-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            <span>You rated {order.rating}/5</span>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                          <Link
                            href={`/orders/${order.orderNumber}`}
                            className="py-2 rounded-xl text-xs font-bold text-center bg-brand-cream border border-brand-border text-brand-700 hover:bg-brand-surface"
                          >
                            {order.status === "DELIVERED" && !order.rating
                              ? "Rate & Receipt"
                              : "View Receipt"}
                          </Link>
                          <button
                            type="button"
                            disabled={reorderingId === order.id}
                            onClick={() => handleReorder(order)}
                            className="btn-maroon-gold py-2 rounded-xl text-xs font-black flex items-center justify-center space-x-1"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-[#DFC17B]" />
                            <span>{reorderingId === order.id ? "Adding..." : "Re-Order"}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

