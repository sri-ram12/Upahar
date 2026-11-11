"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Bell,
  Volume2,
  VolumeX,
  RefreshCw,
  Phone,
  MessageSquare,
  Bike,
  Store,
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
  Printer,
  AlertCircle,
  UtensilsCrossed,
  Filter,
  Zap,
  Star,
  QrCode,
} from "lucide-react";
import { Order, DeliveryAgent } from "@/types";
import { useRealtimeEvents } from "@/hooks/useRealtimeEvents";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [agents, setAgents] = useState<DeliveryAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "ALL" | "PENDING" | "PREPARING" | "OUT_FOR_DELIVERY" | "DELIVERED"
  >("PENDING");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [rejectModalOrder, setRejectModalOrder] = useState<Order | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [realtimeToast, setRealtimeToast] = useState<{ title: string; subtitle: string } | null>(null);

  const prevPendingCountRef = useRef(0);

  // Play audio alert using Web Audio API synthesized chime
  const playAlertSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + start);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + start + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + start);
        osc.stop(audioCtx.currentTime + start + duration);
      };

      // Two-tone bell chime (ding-dong)
      playTone(659.25, 0, 0.4); // E5
      playTone(880.00, 0.25, 0.6); // A5
    } catch (e) {
      console.warn("Audio chime prevented by browser autoplay policy", e);
    }
  };

  const fetchOrders = async () => {
    try {
      const [res, agentsRes] = await Promise.all([
        fetch("/api/orders?limit=100"),
        fetch("/api/delivery/agents"),
      ]);
      const data = await res.json();
      const agentsData = await agentsRes.json();
      if (agentsData.agents) {
        setAgents(agentsData.agents.filter((a: DeliveryAgent) => a.isActive));
      }
      if (data.orders) {
        setOrders(data.orders);
        setLastRefreshed(new Date());

        const pendingCount = data.orders.filter(
          (o: Order) => o.status === "PENDING"
        ).length;

        // If new pending orders arrived, trigger loud chime!
        if (pendingCount > prevPendingCountRef.current && prevPendingCountRef.current >= 0) {
          playAlertSound();
        }
        prevPendingCountRef.current = pendingCount;
      }
    } catch (e) {
      console.error("Failed to fetch admin orders", e);
    } finally {
      setLoading(false);
    }
  };

  // Instant sub-50ms Real-Time Push Stream via Server-Sent Events (SSE)
  const { isConnected: isRealtimeConnected } = useRealtimeEvents({
    onOrderCreated: (payload) => {
      playAlertSound();
      fetchOrders();
      setRealtimeToast({
        title: `🔥 New Order Placed: #${payload.orderNumber || "NEW"}`,
        subtitle: `${payload.customerName || "Customer"} placed ₹${payload.totalAmount} (${payload.orderType})`,
      });
      setTimeout(() => setRealtimeToast(null), 7000);
    },
    onOrderUpdated: () => {
      fetchOrders();
    },
    onOrderDelivered: (payload) => {
      fetchOrders();
      setRealtimeToast({
        title: `✅ Order Delivered: #${payload.orderNumber}`,
        subtitle: `Delivered to ${payload.customerName}. Payment of ₹${payload.totalAmount} collected!`,
      });
      setTimeout(() => setRealtimeToast(null), 5000);
    },
    onRiderStatusChanged: () => {
      fetch("/api/delivery/agents")
        .then((r) => r.json())
        .then((agentsData) => {
          if (Array.isArray(agentsData?.agents)) {
            setAgents(agentsData.agents.filter((a: DeliveryAgent) => a.isActive));
          }
        })
        .catch(() => {});
    },
    onRiderLocationUpdated: (payload) => {
      if (!payload?.orderId) return;
      setOrders((prev) =>
        prev.map((o) =>
          o.id === payload.orderId
            ? {
                ...o,
                riderLat: payload.riderLat,
                riderLng: payload.riderLng,
                riderLocationUpdatedAt: new Date().toISOString(),
              }
            : o
        )
      );
    },
  });

  useEffect(() => {
    fetchOrders();
    // Background safety fallback refresh every 15s (SSE handles sub-second instant updates)
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [soundEnabled]);

  const handleUpdateStatus = async (
    orderId: string,
    newStatus?: string,
    extraData: Record<string, any> = {}
  ) => {
    setIsUpdating(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...(newStatus && { status: newStatus }), ...extraData }),
      });
      if (res.ok) {
        await fetchOrders();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectModalOrder) return;
    await handleUpdateStatus(rejectModalOrder.id, "CANCELLED", {
      rejectionReason: rejectReason || "Kitchen busy / Item out of stock",
    });
    setRejectModalOrder(null);
    setRejectReason("");
  };

  const handlePrintKOT = (order: Order) => {
    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>KOT #${order.orderNumber} - UPAHAR</title>
          <style>
            body { font-family: monospace; font-size: 13px; margin: 10px; line-height: 1.4; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .line { border-bottom: 1px dashed #000; margin: 8px 0; }
            .flex { display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="center bold" style="font-size: 16px;">UPAHAR TIFFINS</div>
          <div class="center">Sangivalasa, ANITS Road</div>
          <div class="line"></div>
          <div class="bold flex"><span>KOT: #${order.orderNumber}</span><span>${order.orderType}</span></div>
          <div>Time: ${new Date(order.createdAt).toLocaleTimeString()}</div>
          <div>Customer: ${order.customerName} (${order.customerPhone})</div>
          ${order.deliveryAddress ? `<div>Address: ${order.deliveryAddress}</div>` : ""}
          ${order.landmark ? `<div>Landmark: ${order.landmark}</div>` : ""}
          <div class="line"></div>
          <div class="bold flex"><span>ITEM</span><span>QTY</span></div>
          <div class="line"></div>
          ${order.items
            .map(
              (i) =>
                `<div class="flex"><span class="bold">${i.name}</span><span class="bold">${i.quantity}</span></div>`
            )
            .join("")}
          <div class="line"></div>
          ${order.specialInstructions ? `<div class="bold">NOTE: ${order.specialInstructions}</div><div class="line"></div>` : ""}
          ${(order.packagingFee || 0) > 0 ? `<div class="flex"><span>PACKAGING:</span><span>Rs. ${order.packagingFee}</span></div>` : ""}
          ${(order.discountAmount || 0) > 0 ? `<div class="flex"><span>DISCOUNT (${order.couponCode}):</span><span>- Rs. ${order.discountAmount}</span></div>` : ""}
          <div class="flex bold"><span>TOTAL:</span><span>Rs. ${order.totalAmount} (${order.paymentMethod})</span></div>
          <div class="line"></div>
          <div class="center">-- KITCHEN DISPATCH --</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const pendingOrders = orders.filter((o) => o.status === "PENDING");
  const prepOrders = orders.filter(
    (o) => o.status === "CONFIRMED" || o.status === "PREPARING" || o.status === "FOOD_READY"
  );
  const outOrders = orders.filter(
    (o) => o.status === "OUT_FOR_DELIVERY" || o.status === "ARRIVED"
  );
  const deliveredOrders = orders.filter((o) => o.status === "DELIVERED");

  const filteredOrders = orders.filter((o) => {
    if (activeTab === "ALL") return true;
    if (activeTab === "PENDING") return o.status === "PENDING";
    if (activeTab === "PREPARING")
      return o.status === "CONFIRMED" || o.status === "PREPARING" || o.status === "FOOD_READY";
    if (activeTab === "OUT_FOR_DELIVERY")
      return o.status === "OUT_FOR_DELIVERY" || o.status === "ARRIVED";
    if (activeTab === "DELIVERED") return o.status === "DELIVERED";
    return true;
  });

  return (
    <div className="p-4 sm:p-8 space-y-6 bg-[#FAF7F2] min-h-screen">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#EADBCE] pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-[#74171E] block">
              Live Order Management & Kitchen Desk
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2B070E] font-display">
            Live Orders (Tagarapuvalasa 7km)
          </h1>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* Real-time Status Badge */}
          <div
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center space-x-1.5 ${
              isRealtimeConnected
                ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                : "bg-amber-50 border-amber-300 text-amber-800"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isRealtimeConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
              }`}
            />
            <span>{isRealtimeConnected ? "Realtime SSE (<50ms)" : "Connecting..."}</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) playAlertSound();
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center space-x-1.5 ${
              soundEnabled
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-stone-100 border-stone-200 text-stone-500"
            }`}
            title="Toggle incoming order audio chime"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-emerald-600" />
                <span>Audio Alert: ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4" />
                <span>Audio Alert: MUTED</span>
              </>
            )}
          </button>

          {/* Refresh Button */}
          <button
            onClick={fetchOrders}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-stone-700 border border-[#EADBCE] hover:bg-[#F4EFE6] transition flex items-center space-x-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#580D1A]" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Instant Real-Time Alert Toast */}
      {realtimeToast && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center justify-between animate-bounce">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">⚡</span>
            <div>
              <div className="font-black text-sm">{realtimeToast.title}</div>
              <div className="text-xs text-emerald-100">{realtimeToast.subtitle}</div>
            </div>
          </div>
          <button
            onClick={() => setRealtimeToast(null)}
            className="text-white hover:text-emerald-200 text-xs font-bold underline px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs / Pipeline Filter */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-[#EADBCE]">
        <button
          onClick={() => setActiveTab("PENDING")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center space-x-2 ${
            activeTab === "PENDING"
              ? "bg-[#580D1A] text-white shadow-md"
              : "bg-white text-stone-600 hover:bg-[#F4EFE6] border border-[#EADBCE]"
          }`}
        >
          <span>🔴 New / Pending</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] ${
              pendingOrders.length > 0
                ? "bg-red-500 text-white font-black animate-pulse"
                : "bg-stone-200 text-stone-600"
            }`}
          >
            {pendingOrders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("PREPARING")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center space-x-2 ${
            activeTab === "PREPARING"
              ? "bg-[#580D1A] text-white shadow-md"
              : "bg-white text-stone-600 hover:bg-[#F4EFE6] border border-[#EADBCE]"
          }`}
        >
          <span>🟡 Cooking</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-stone-200 text-stone-600">
            {prepOrders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("OUT_FOR_DELIVERY")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center space-x-2 ${
            activeTab === "OUT_FOR_DELIVERY"
              ? "bg-[#580D1A] text-white shadow-md"
              : "bg-white text-stone-600 hover:bg-[#F4EFE6] border border-[#EADBCE]"
          }`}
        >
          <span>🔵 Out for Delivery</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-stone-200 text-stone-600">
            {outOrders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("DELIVERED")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center space-x-2 ${
            activeTab === "DELIVERED"
              ? "bg-[#580D1A] text-white shadow-md"
              : "bg-white text-stone-600 hover:bg-[#F4EFE6] border border-[#EADBCE]"
          }`}
        >
          <span>🟢 Completed</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-stone-200 text-stone-600">
            {deliveredOrders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("ALL")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center space-x-2 ${
            activeTab === "ALL"
              ? "bg-[#580D1A] text-white shadow-md"
              : "bg-white text-stone-600 hover:bg-[#F4EFE6] border border-[#EADBCE]"
          }`}
        >
          <span>All Orders ({orders.length})</span>
        </button>
      </div>

      {/* Orders Grid */}
      {loading ? (
        <div className="p-12 flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#580D1A]" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#EADBCE] space-y-3">
          <UtensilsCrossed className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-base font-bold text-[#2B070E]">
            No {activeTab.replace(/_/g, " ").toLowerCase()} orders at the moment
          </h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            When customer places an order from Tagarapuvalasa or Sangivalasa, it will chime and appear here instantly.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredOrders.map((order) => {
            const isPending = order.status === "PENDING";
            const isCooking =
              order.status === "CONFIRMED" ||
              order.status === "PREPARING" ||
              order.status === "FOOD_READY";
            const isOut =
              order.status === "OUT_FOR_DELIVERY" || order.status === "ARRIVED";
            const isCompleted = order.status === "DELIVERED";

            return (
              <div
                key={order.id}
                className={`bg-white rounded-3xl p-5 border shadow-xs flex flex-col justify-between space-y-4 transition ${
                  isPending
                    ? "border-red-400 ring-2 ring-red-400/20 bg-red-50/20"
                    : isCooking
                    ? "border-amber-300 bg-amber-50/10"
                    : isOut
                    ? "border-blue-300 bg-blue-50/10"
                    : "border-[#EADBCE]"
                }`}
              >
                {/* Order Top Bar */}
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-[#F4EFE6]">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                        #{order.orderNumber}
                      </span>
                      <span className="text-sm font-black text-[#2B070E] font-display">
                        {order.customerName}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                          order.orderType === "DELIVERY"
                            ? "bg-[#580D1A]/10 text-[#580D1A]"
                            : "bg-emerald-50 text-emerald-800"
                        }`}
                      >
                        {order.orderType === "DELIVERY" ? "Delivery 7km" : "Takeaway"}
                      </span>
                      <button
                        onClick={() => handlePrintKOT(order)}
                        className="p-1.5 rounded-lg text-stone-500 hover:text-[#580D1A] hover:bg-[#FAF7F2] transition"
                        title="Print Kitchen Ticket (KOT)"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Customer Contact & Destination */}
                  <div className="pt-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <a
                        href={`tel:${order.customerPhone}`}
                        className="font-bold text-[#580D1A] flex items-center space-x-1 hover:underline"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{order.customerPhone}</span>
                      </a>

                      <a
                        href={`https://wa.me/91${order.customerPhone}?text=${encodeURIComponent(
                          `Hello ${order.customerName}, regarding your Upahar order #${order.orderNumber}...`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 font-bold flex items-center space-x-1 hover:underline text-[11px]"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    </div>

                    {order.deliveryAddress && (
                      <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EADBCE] text-[11px] text-stone-700">
                        <div className="flex items-start space-x-1 font-semibold text-[#2B070E]">
                          <MapPin className="w-3.5 h-3.5 text-[#580D1A] flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-2">
                            {order.deliveryAddress}
                          </span>
                        </div>
                        {order.landmark && (
                          <div className="pl-4 text-stone-500 text-[10px] italic mt-0.5">
                            Landmark: {order.landmark}
                          </div>
                        )}
                        {order.distanceKm && (
                          <div className="pl-4 text-stone-400 text-[10px] mt-0.5">
                            Distance: ~{order.distanceKm} km from Upahar
                          </div>
                        )}
                      </div>
                    )}

                    {/* Items List */}
                    <div className="pt-2 border-t border-[#F4EFE6] space-y-1.5">
                      <span className="text-[10px] font-extrabold text-[#74171E] uppercase tracking-wider block">
                        Ordered Dishes ({order.items.length})
                      </span>
                      {order.items.map((it) => (
                        <div
                          key={it.id}
                          className="flex justify-between items-center text-xs"
                        >
                          <span className="font-bold text-[#2B070E]">
                            <span className="text-[#580D1A] mr-1.5 font-black">
                              {it.quantity}x
                            </span>
                            {it.name}
                          </span>
                          <span className="text-stone-500 font-semibold">
                            ₹{it.price * it.quantity}
                          </span>
                        </div>
                      ))}
                    </div>

                    {order.specialInstructions && (
                      <div className="p-2 rounded-lg bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 font-medium">
                        <strong>Kitchen Note:</strong> {order.specialInstructions}
                      </div>
                    )}

                    <div className="pt-2 border-t border-[#F4EFE6] space-y-2 text-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-stone-600 block">
                            Total ({order.paymentMethod.replace(/_/g, " ")} • {order.paymentStatus}):
                          </span>
                          {(order.discountAmount || 0) > 0 && (
                            <span className="text-[10px] text-emerald-700 font-bold block">
                              Coupon {order.couponCode}: -₹{order.discountAmount}
                            </span>
                          )}
                          {order.upiTransactionId && (
                            <span className="text-[10px] text-[#002970] font-mono font-bold block">
                              UPI Ref: {order.upiTransactionId}
                            </span>
                          )}
                          {order.deliveryOtp && order.orderType === "DELIVERY" && (
                            <span className="text-[10px] text-amber-800 font-mono font-bold block">
                              Delivery OTP: <strong>{order.deliveryOtp}</strong>
                            </span>
                          )}
                          {order.deliveryAgent && (
                            <span className="text-[10px] text-emerald-800 font-bold block">
                              Rider: {order.deliveryAgent.name} ({order.deliveryAgent.vehicleNumber})
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-black text-[#580D1A] font-display">
                          ₹{order.totalAmount}
                        </span>
                      </div>

                      {/* Verify Paytm QR / UPI Payment */}
                      {order.paymentStatus === "VERIFICATION_PENDING" && (
                        <button
                          type="button"
                          disabled={isUpdating === order.id}
                          onClick={() =>
                            handleUpdateStatus(order.id, undefined, {
                              paymentStatus: "PAID",
                              paymentConfirmedBy: "ADMIN",
                            })
                          }
                          className="w-full py-1.5 rounded-xl bg-[#002970] text-white text-[11px] font-black flex items-center justify-center space-x-1"
                        >
                          <QrCode className="w-3.5 h-3.5 text-[#00BAF2]" />
                          <span>Verify Paytm UPI Paid (Ref: {order.upiTransactionId})</span>
                        </button>
                      )}

                      {/* Assign Registered Rider Dropdown */}
                      {order.orderType === "DELIVERY" && !isCompleted && order.status !== "CANCELLED" && agents.length > 0 && (
                        <div className="pt-1">
                          <select
                            value={order.deliveryAgentId || ""}
                            onChange={(e) => {
                              if (!e.target.value) return;
                              handleUpdateStatus(order.id, undefined, {
                                deliveryAgentId: e.target.value,
                              });
                            }}
                            className="w-full text-[11px] px-2.5 py-1.5 rounded-xl border border-[#EADBCE] bg-[#FAF7F2] font-semibold text-stone-700"
                          >
                            <option value="">-- Assign Rider Manually --</option>
                            {agents.map((ag) => (
                              <option key={ag.id} value={ag.id}>
                                {ag.name} ({ag.vehicleNumber})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {order.rating && (
                        <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-center justify-between">
                          <span className="flex items-center space-x-1 font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            <span>Customer Rated: {order.rating}/5</span>
                          </span>
                          {order.reviewComment && (
                            <span className="truncate max-w-[140px] italic text-[10px]">
                              &ldquo;{order.reviewComment}&rdquo;
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Staff Action Buttons */}
                <div className="pt-3 border-t border-[#F4EFE6] space-y-2">
                  {isPending && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                        Accept Order with Cooking Time:
                      </span>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          disabled={isUpdating === order.id}
                          onClick={() =>
                            handleUpdateStatus(order.id, "PREPARING", {
                              estimatedTime: "15-20 mins",
                            })
                          }
                          className="py-1.5 rounded-xl text-xs font-bold bg-[#EBF3E8] text-[#2D5A27] hover:bg-[#2D5A27] hover:text-white transition"
                        >
                          15 Mins
                        </button>
                        <button
                          disabled={isUpdating === order.id}
                          onClick={() =>
                            handleUpdateStatus(order.id, "PREPARING", {
                              estimatedTime: "25-30 mins",
                            })
                          }
                          className="py-1.5 rounded-xl text-xs font-bold bg-[#EBF3E8] text-[#2D5A27] hover:bg-[#2D5A27] hover:text-white transition"
                        >
                          25 Mins
                        </button>
                        <button
                          disabled={isUpdating === order.id}
                          onClick={() =>
                            handleUpdateStatus(order.id, "PREPARING", {
                              estimatedTime: "35-40 mins",
                            })
                          }
                          className="py-1.5 rounded-xl text-xs font-bold bg-[#EBF3E8] text-[#2D5A27] hover:bg-[#2D5A27] hover:text-white transition"
                        >
                          35 Mins
                        </button>
                      </div>

                      <button
                        disabled={isUpdating === order.id}
                        onClick={() => setRejectModalOrder(order)}
                        className="w-full py-1.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition border border-red-200"
                      >
                        Reject Order
                      </button>
                    </div>
                  )}

                  {isCooking && (
                    <div className="grid grid-cols-2 gap-2">
                      {order.orderType === "DELIVERY" ? (
                        <button
                          disabled={isUpdating === order.id}
                          onClick={() =>
                            handleUpdateStatus(order.id, "OUT_FOR_DELIVERY")
                          }
                          className="btn-maroon-gold py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1"
                        >
                          <Bike className="w-3.5 h-3.5 text-[#DFC17B]" />
                          <span>Dispatch (Out)</span>
                        </button>
                      ) : (
                        <button
                          disabled={isUpdating === order.id}
                          onClick={() =>
                            handleUpdateStatus(order.id, "DELIVERED", { adminOverride: true })
                          }
                          className="btn-maroon-gold py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#DFC17B]" />
                          <span>Handed Over</span>
                        </button>
                      )}

                      <button
                        disabled={isUpdating === order.id}
                        onClick={() =>
                          handleUpdateStatus(order.id, "DELIVERED", { adminOverride: true })
                        }
                        className="py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center justify-center space-x-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Delivered</span>
                      </button>
                    </div>
                  )}

                  {isOut && (
                    <button
                      disabled={isUpdating === order.id}
                      onClick={() =>
                        handleUpdateStatus(order.id, "DELIVERED", { adminOverride: true })
                      }
                      className="w-full py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center justify-center space-x-1.5 shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark Delivered & Completed</span>
                    </button>
                  )}

                  {isCompleted && (
                    <div className="text-center text-xs font-bold text-emerald-700 bg-emerald-50 py-1.5 rounded-xl flex items-center justify-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Order Completed</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 border border-[#EADBCE] shadow-2xl">
            <h3 className="text-base font-bold text-[#2B070E]">
              Reject Order #{rejectModalOrder.orderNumber}
            </h3>
            <p className="text-xs text-stone-500">
              Please specify the reason (this will be shown to the customer):
            </p>

            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-[#EADBCE] bg-[#FAF7F2] font-semibold text-stone-800"
            >
              <option value="Kitchen is experiencing extreme peak rush">
                Kitchen is experiencing peak rush
              </option>
              <option value="Some ordered items are currently sold out">
                Some ordered items are currently sold out
              </option>
              <option value="Delivery address is outside our 7km service boundary">
                Outside 7km Tagarapuvalasa boundary
              </option>
              <option value="Store closing / tiffin hours ended">
                Store closing / session ended
              </option>
            </select>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setRejectModalOrder(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

