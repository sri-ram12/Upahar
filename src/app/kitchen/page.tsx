"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  UtensilsCrossed,
  Clock,
  CheckCircle2,
  AlertCircle,
  Volume2,
  VolumeX,
  RefreshCw,
  Flame,
  ChefHat,
  ArrowRight,
  ExternalLink,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Order, FoodItem } from "@/types";
import { useRealtimeEvents } from "@/hooks/useRealtimeEvents";

export default function KitchenDisplayPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<FoodItem[]>([]);
  const [showStockDrawer, setShowStockDrawer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [nowTick, setNowTick] = useState<number>(Date.now());

  const prevPendingRef = useRef(0);

  // Kitchen Sound Alert (High-contrast Ding-Dong)
  const playKitchenChime = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + start);
        gain.gain.setValueAtTime(0.4, audioCtx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + start + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + start);
        osc.stop(audioCtx.currentTime + start + duration);
      };
      playTone(523.25, 0, 0.4); // C5
      playTone(659.25, 0.2, 0.4); // E5
      playTone(783.99, 0.4, 0.6); // G5
    } catch (e) {
      console.warn("Audio chime prevented by browser autoplay policy", e);
    }
  };

  const fetchKitchenOrders = async () => {
    try {
      const res = await fetch("/api/orders?limit=50");
      const data = await res.json();
      if (data.orders) {
        // Kitchen cares about PENDING, CONFIRMED, PREPARING, and FOOD_READY (waiting for rider)
        const active = data.orders.filter(
          (o: Order) =>
            o.status === "PENDING" ||
            o.status === "CONFIRMED" ||
            o.status === "PREPARING" ||
            o.status === "FOOD_READY"
        );
        setOrders(active);

        const newCount = data.orders.filter((o: Order) => o.status === "PENDING").length;
        if (newCount > prevPendingRef.current && prevPendingRef.current >= 0) {
          playKitchenChime();
        }
        prevPendingRef.current = newCount;
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Sub-50ms Realtime SSE Push Stream
  const { isConnected: isRealtimeConnected } = useRealtimeEvents({
    onOrderCreated: () => {
      playKitchenChime();
      fetchKitchenOrders();
    },
    onOrderUpdated: () => {
      fetchKitchenOrders();
    },
  });

  useEffect(() => {
    fetchKitchenOrders();
    fetch("/api/menu?includeInactive=true")
      .then((r) => r.json())
      .then((d) => {
        if (d.items) setMenuItems(d.items);
      })
      .catch(() => {});

    // Fallback background refresh every 15s (SSE pushes events instantly)
    const timer = setInterval(fetchKitchenOrders, 15000);
    const clockTimer = setInterval(() => setNowTick(Date.now()), 30000);
    return () => {
      clearInterval(timer);
      clearInterval(clockTimer);
    };
  }, [soundEnabled]);

  // Repeat alert chime every 10s while unaccepted PENDING tickets remain
  useEffect(() => {
    if (!soundEnabled) return;
    const hasPending = orders.some((o) => o.status === "PENDING");
    if (!hasPending) return;
    const beepInterval = setInterval(() => {
      playKitchenChime();
    }, 10000);
    return () => clearInterval(beepInterval);
  }, [orders, soundEnabled]);

  const handleToggleDishStock = async (item: FoodItem) => {
    const nextAvail = item.isAvailable === false;
    try {
      const res = await fetch(`/api/menu/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: nextAvail, source: "KDS" }),
      });
      if (res.ok) {
        setMenuItems((prev) =>
          prev.map((m) => (m.id === item.id ? { ...m, isAvailable: nextAvail } : m))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: string, estimatedTime?: string) => {
    setIsUpdating(orderId);
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, ...(estimatedTime && { estimatedTime }) }),
      });
      await fetchKitchenOrders();
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#121110] text-stone-100 p-4 sm:p-6 font-sans">
      {/* Top KDS Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800 pb-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-[#580D1A] border border-[#D4AF37]/40 flex items-center justify-center text-[#DFC17B] shadow-lg">
            <ChefHat className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white font-display">
                UPAHAR KITCHEN DISPLAY (KDS)
              </h1>
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <span className="text-xs text-amber-400 font-bold tracking-wider uppercase">
              Live Cooking Station • Sangivalasa
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Real-time SSE indicator */}
          <div
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center space-x-1.5 ${
              isRealtimeConnected
                ? "bg-emerald-950/60 border-emerald-600/60 text-emerald-300"
                : "bg-amber-950/60 border-amber-600/60 text-amber-300"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isRealtimeConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
              }`}
            />
            <span>{isRealtimeConnected ? "Live SSE (<50ms)" : "Connecting..."}</span>
          </div>

          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) playKitchenChime();
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center space-x-2 ${
              soundEnabled
                ? "bg-emerald-950/80 border-emerald-600 text-emerald-300"
                : "bg-stone-900 border-stone-700 text-stone-400"
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
            <span>{soundEnabled ? "Chime: ON" : "Chime: OFF"}</span>
          </button>

          <button
            onClick={() => setShowStockDrawer(!showStockDrawer)}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-950/60 border border-amber-600/50 text-amber-300 hover:bg-amber-900/60 transition flex items-center space-x-1.5"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Quick Stock ({menuItems.filter((m) => m.isAvailable === false).length} Out)</span>
          </button>

          <button
            onClick={fetchKitchenOrders}
            className="p-2.5 rounded-xl bg-stone-900 border border-stone-700 text-stone-300 hover:text-white transition"
            title="Refresh Tickets"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <Link
            href="/portal"
            className="px-3 py-2 rounded-xl text-xs font-bold bg-stone-800 text-stone-300 hover:bg-stone-700 transition"
          >
            All Panels
          </Link>
        </div>
      </div>

      {/* Quick Kitchen Stock Panel */}
      {showStockDrawer && (
        <div className="mb-6 bg-[#1C1A18] rounded-3xl p-5 border border-amber-500/40 space-y-3">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                Instant Dish Availability Sync (&lt;50ms to Customer Menu)
              </span>
              <h2 className="text-base font-black text-white">
                Kitchen Dish Stock Switcher
              </h2>
            </div>
            <button
              onClick={() => setShowStockDrawer(false)}
              className="p-1.5 rounded-lg bg-stone-800 text-stone-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-60 overflow-y-auto pr-1">
            {menuItems.map((m) => {
              const avail = m.isAvailable !== false;
              return (
                <button
                  key={m.id}
                  onClick={() => handleToggleDishStock(m)}
                  className={`p-2.5 rounded-xl border text-left text-xs transition flex items-center justify-between gap-2 ${
                    avail
                      ? "bg-stone-900 border-stone-700 text-stone-200 hover:border-emerald-500"
                      : "bg-red-950/60 border-red-600/70 text-red-200"
                  }`}
                >
                  <span className="font-bold truncate">{m.name}</span>
                  <span
                    className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded flex-shrink-0 ${
                      avail ? "bg-emerald-900 text-emerald-300" : "bg-red-600 text-white"
                    }`}
                  >
                    {avail ? "IN" : "OUT"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tickets Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DFC17B]" />
        </div>
      ) : orders.length === 0 ? (
        <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8 bg-stone-900/50 rounded-3xl border border-stone-800 space-y-3">
          <UtensilsCrossed className="w-16 h-16 text-stone-600" />
          <h2 className="text-xl font-black text-stone-200">
            Kitchen Clear! No Active Tickets
          </h2>
          <p className="text-xs text-stone-400 max-w-sm">
            When a customer orders online or dine-in, their ticket will chime and appear here in real-time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {orders.map((order) => {
            const isNew = order.status === "PENDING";
            const elapsedMins = Math.max(
              0,
              Math.floor((nowTick - new Date(order.createdAt).getTime()) / 60000)
            );

            return (
              <div
                key={order.id}
                className={`rounded-3xl border flex flex-col justify-between overflow-hidden shadow-xl transition ${
                  isNew
                    ? "bg-red-950/40 border-red-500/80 ring-2 ring-red-500/30"
                    : "bg-[#1A1816] border-amber-500/40"
                }`}
              >
                {/* Ticket Header */}
                <div
                  className={`p-4 flex items-center justify-between border-b ${
                    isNew ? "bg-red-900/40 border-red-800" : "bg-stone-900/80 border-stone-800"
                  }`}
                >
                  <div>
                    <span className="text-lg font-black text-white font-mono tracking-wider block">
                      #{order.orderNumber}
                    </span>
                    <span className="text-[11px] text-stone-300 font-bold block truncate max-w-[160px]">
                      {order.customerName}
                    </span>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        order.orderType === "DELIVERY"
                          ? "bg-[#580D1A] text-[#DFC17B] border border-[#D4AF37]/40"
                          : "bg-emerald-900/80 text-emerald-300"
                      }`}
                    >
                      {order.orderType === "DELIVERY" ? "Delivery 7km" : "Takeaway"}
                    </span>
                    <span className="text-[11px] text-stone-400 block font-mono mt-0.5">
                      {elapsedMins}m ago
                    </span>
                  </div>
                </div>

                {/* Items List (Big readable text for chefs) */}
                <div className="p-4 sm:p-5 flex-1 space-y-3">
                  <div className="space-y-2">
                    {order.items.map((it) => (
                      <div
                        key={it.id}
                        className="flex items-start justify-between gap-2 border-b border-stone-800/60 pb-2"
                      >
                        <span className="text-base sm:text-lg font-black text-stone-100 leading-snug">
                          {it.name}
                        </span>
                        <span className="text-lg font-black bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-xl font-mono flex-shrink-0">
                          {it.quantity}x
                        </span>
                      </div>
                    ))}
                  </div>

                  {order.specialInstructions && (
                    <div className="p-3 rounded-2xl bg-amber-950/60 border border-amber-600/50 text-xs text-amber-200">
                      <strong className="block text-amber-400 font-extrabold uppercase text-[10px] tracking-wider">
                        ⚠️ Special Kitchen Note:
                      </strong>
                      <span className="font-semibold text-xs mt-0.5 block">
                        {order.specialInstructions}
                      </span>
                    </div>
                  )}
                </div>

                {/* Bottom Action Row */}
                <div className="p-4 bg-stone-900/90 border-t border-stone-800 space-y-2">
                  {isNew ? (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                        Accept & Start Cooking:
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          disabled={isUpdating === order.id}
                          onClick={() => handleUpdateStatus(order.id, "PREPARING", "15-20 mins")}
                          className="py-2.5 rounded-xl text-xs font-black bg-amber-600 hover:bg-amber-500 text-stone-950 transition flex items-center justify-center space-x-1"
                        >
                          <Flame className="w-3.5 h-3.5" />
                          <span>15 Mins</span>
                        </button>
                        <button
                          disabled={isUpdating === order.id}
                          onClick={() => handleUpdateStatus(order.id, "PREPARING", "25-30 mins")}
                          className="py-2.5 rounded-xl text-xs font-black bg-amber-600 hover:bg-amber-500 text-stone-950 transition flex items-center justify-center space-x-1"
                        >
                          <Flame className="w-3.5 h-3.5" />
                          <span>25 Mins</span>
                        </button>
                      </div>
                    </div>
                  ) : order.status === "FOOD_READY" ? (
                    <div className="w-full py-2.5 rounded-xl text-xs font-black bg-blue-900/60 text-blue-300 border border-blue-500/50 flex items-center justify-center space-x-2">
                      <Clock className="w-4 h-4 animate-spin" />
                      <span>Food Packaged • Waiting for Delivery Boy Pickup</span>
                    </div>
                  ) : (
                    <button
                      disabled={isUpdating === order.id}
                      onClick={() =>
                        handleUpdateStatus(
                          order.id,
                          order.orderType === "DELIVERY" ? "FOOD_READY" : "DELIVERED"
                        )
                      }
                      className="w-full py-3 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center justify-center space-x-2 shadow-lg"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {order.orderType === "DELIVERY"
                          ? "Food Cooked → Ready for Rider Pickup"
                          : "Food Cooked → Hand Over at Counter"}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

