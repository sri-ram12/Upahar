"use client";

import React, { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  Bike,
  Phone,
  MessageSquare,
  MapPin,
  RefreshCw,
  AlertCircle,
  Printer,
  RotateCcw,
  Star,
  XCircle,
  QrCode,
  Volume2,
  VolumeX,
  Share2,
} from "lucide-react";
import { Order, RestaurantSetting, FoodItem } from "@/types";
import { useRealtimeEvents } from "@/hooks/useRealtimeEvents";
import { useCart } from "@/context/CartContext";
import LiveTrackingMap from "@/components/orders/LiveTrackingMap";
import PaymentQRCard from "@/components/payment/PaymentQRCard";

function WhatsAppIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.34C9.33 7.34 9 7.42 8.72 7.74C8.44 8.05 7.64 8.81 7.64 10.36C7.64 11.91 8.77 13.4 8.93 13.61C9.09 13.81 11.16 16.99 14.32 18.35C15.07 18.68 15.66 18.88 16.11 19.02C16.87 19.26 17.55 19.23 18.1 19.15C18.71 19.06 19.98 18.38 20.24 17.64C20.5 16.9 20.5 16.26 20.42 16.13C20.34 16 20.14 15.92 19.82 15.76C19.5 15.6 17.96 14.84 17.67 14.74C17.38 14.64 17.18 14.59 16.98 14.9C16.78 15.22 16.2 15.92 16.02 16.13C15.84 16.34 15.66 16.36 15.34 16.2C15.02 16.04 13.98 15.7 12.75 14.61C11.79 13.76 11.14 12.7 10.96 12.39C10.78 12.07 10.94 11.9 11.1 11.74C11.25 11.59 11.43 11.36 11.59 11.17C11.75 10.98 11.81 10.84 11.91 10.63C12.01 10.42 11.96 10.24 11.88 10.08C11.8 9.92 11.2 8.45 10.96 7.85C10.72 7.27 10.47 7.35 10.29 7.34C10.12 7.34 9.92 7.34 9.53 7.34Z"/>
    </svg>
  );
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function OrderTrackingPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;
  const router = useRouter();
  const { addToCart, clearCart, setIsCartOpen } = useCart();

  const [order, setOrder] = useState<Order | null>(null);
  const [settings, setSettings] = useState<RestaurantSetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Action states
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showQrPayBox, setShowQrPayBox] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [liveUpdateBanner, setLiveUpdateBanner] = useState<string | null>(null);

  // Play audio alert on live status changes
  const playCustomerChime = (type: "update" | "delivered" = "update") => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return;
      const audioCtx = new AudioCtxClass();
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + start);
        gain.gain.setValueAtTime(0.25, audioCtx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + start + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + start);
        osc.stop(audioCtx.currentTime + start + duration);
      };

      if (type === "delivered") {
        // Celebratory 3-tone chime for delivered
        playTone(523.25, 0, 0.25);    // C5
        playTone(659.25, 0.18, 0.25); // E5
        playTone(783.99, 0.36, 0.5);  // G5
      } else {
        // Melodic 2-tone notification chime
        playTone(587.33, 0, 0.25);    // D5
        playTone(880.00, 0.18, 0.4);  // A5
      }
    } catch {
      // Browser autoplay policy guard
    }
  };

  // Rating State
  const [foodRating, setFoodRating] = useState(5);
  const [deliveryRating, setDeliveryRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      const [ordRes, restRes] = await Promise.all([
        fetch(`/api/orders/${orderId}`),
        fetch("/api/restaurant"),
      ]);
      const data = await ordRes.json();
      const restData = await restRes.json();

      if (!ordRes.ok || !data.order) {
        throw new Error(data.error || "Order not found");
      }
      setOrder(data.order);
      if (restData?.settings) {
        setSettings(restData.settings);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load order details";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  // Real-time SSE push listener for live tracking & rider GPS
  const { isConnected: isRealtimeConnected } = useRealtimeEvents({
    onOrderUpdated: (payload) => {
      if (
        payload.orderId === orderId ||
        payload.orderNumber === orderId ||
        (order && payload.orderId === order.id)
      ) {
        if (payload.status) {
          playCustomerChime(payload.status === "DELIVERED" ? "delivered" : "update");
          setLiveUpdateBanner(`Live Update: Order is now ${String(payload.status).replace(/_/g, " ")}`);
          setTimeout(() => setLiveUpdateBanner(null), 5000);
        }
        fetchOrder();
      }
    },
    onOrderDelivered: (payload) => {
      if (
        payload.orderId === orderId ||
        payload.orderNumber === orderId ||
        (order && payload.orderId === order.id)
      ) {
        playCustomerChime("delivered");
        setLiveUpdateBanner("Order Delivered! Enjoy your fresh Upahar meal.");
        setTimeout(() => setLiveUpdateBanner(null), 6000);
        fetchOrder();
      }
    },
    onRiderLocationUpdated: (payload) => {
      if (
        payload.orderId === orderId ||
        payload.orderNumber === orderId ||
        (order && payload.orderId === order.id)
      ) {
        setOrder((prev) =>
          prev
            ? {
                ...prev,
                riderLat: payload.riderLat,
                riderLng: payload.riderLng,
                riderLocationUpdatedAt: new Date().toISOString(),
              }
            : prev
        );
      }
    },
  });

  useEffect(() => {
    let isDisposed = false;
    const fetchLiveStatus = async () => {
      try {
        const [ordRes, restRes] = await Promise.all([
          fetch(`/api/orders/${orderId}`),
          fetch("/api/restaurant"),
        ]);
        const data = await ordRes.json();
        const restData = await restRes.json();

        if (isDisposed) return;
        if (!ordRes.ok || !data.order) {
          throw new Error(data.error || "Order not found");
        }
        setOrder(data.order);
        if (restData?.settings) {
          setSettings(restData.settings);
        }
      } catch (err: unknown) {
        if (isDisposed) return;
        const message = err instanceof Error ? err.message : "Failed to load order details";
        setError(message);
      } finally {
        if (!isDisposed) setLoading(false);
      }
    };

    fetchLiveStatus();
    const interval = setInterval(fetchLiveStatus, 15000);
    return () => {
      isDisposed = true;
      clearInterval(interval);
    };
  }, [orderId]);

  const handleCancelOrder = async () => {
    if (!order) return;
    if (!confirm("Are you sure you want to cancel this order?")) return;
    setCancelling(true);
    setCancelError(null);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CUSTOMER_CANCEL" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Could not cancel order");
      }
      setOrder(data.order);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to cancel order";
      setCancelError(message);
    } finally {
      setCancelling(false);
    }
  };

  const handleSubmitUtr = async (utr: string) => {
    if (!order) return;
    const res = await fetch(`/api/orders/${order.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "SUBMIT_UPI_PAYMENT",
        upiTransactionId: utr,
      }),
    });
    const data = await res.json();
    if (res.ok && data.order) {
      setOrder(data.order);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SUBMIT_REVIEW",
          rating: foodRating,
          deliveryRating,
          reviewComment,
        }),
      });
      const data = await res.json();
      if (res.ok && data.order) {
        setOrder(data.order);
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleReorder = async () => {
    if (!order) return;
    try {
      const menuRes = await fetch("/api/menu");
      const menuData = await menuRes.json();
      const menuMap = new Map<string, FoodItem>();
      if (Array.isArray(menuData?.items)) {
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
    } catch {
      router.push("/menu");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-brand-cream">
        <div className="w-12 h-12 rounded-full border-4 border-brand-700/20 border-t-brand-700 animate-spin mb-4" />
        <span className="text-xs font-bold text-stone-600">
          Fetching live order status...
        </span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-brand-cream">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-brand-950">
          {error || "Order Not Found"}
        </h1>
        <p className="text-xs text-stone-500 mt-1 max-w-sm">
          Please check the order number or contact Upahar Tiffins & Fast Food.
        </p>
        <div className="flex gap-3 mt-6">
          <Link href="/orders" className="btn-gold-outline px-5 py-2.5 rounded-xl text-xs font-bold">
            My Orders
          </Link>
          <Link href="/menu" className="btn-maroon-gold px-6 py-2.5 rounded-xl text-xs font-bold">
            Return to Menu
          </Link>
        </div>
      </div>
    );
  }

  const steps = [
    { key: "PENDING", label: "Received" },
    { key: "CONFIRMED", label: "Accepted" },
    { key: "PREPARING", label: "Cooking" },
    { key: "FOOD_READY", label: "Food Ready" },
    {
      key: "OUT_FOR_DELIVERY",
      label: order.orderType === "DELIVERY" ? "On The Way" : "Ready at Counter",
    },
    { key: "DELIVERED", label: "Delivered" },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case "PENDING":
        return 0;
      case "CONFIRMED":
        return 1;
      case "PREPARING":
        return 2;
      case "FOOD_READY":
        return 3;
      case "OUT_FOR_DELIVERY":
      case "ARRIVED":
        return 4;
      case "DELIVERED":
        return 5;
      case "CANCELLED":
        return -1;
      default:
        return 0;
    }
  };

  const currentStepIdx = getStepIndex(order.status);
  const isCancelled = order.status === "CANCELLED";
  const isUpiOrQrOrder = order.paymentMethod === "UPI" || order.paymentMethod === "QR_ON_DELIVERY";
  const shouldShowQrSection =
    !isCancelled &&
    order.paymentStatus !== "PAID" &&
    (isUpiOrQrOrder || showQrPayBox);

  const restaurantPhone = "919885455342";
  const itemsSummary = order.items?.map((it) => `${it.quantity}x ${it.name}`).join(", ") || "";
  const currentUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `https://upahar.onrender.com/orders/${order.orderNumber}`;

  const whatsappMessage = encodeURIComponent(
    `*UPAHAR Food Order #${order.orderNumber}*\n` +
      `👤 Customer: ${order.customerName}\n` +
      `🍲 Items: ${itemsSummary}\n` +
      `💰 Total: ₹${order.totalAmount} (${order.paymentMethod})\n` +
      (order.orderType === "DELIVERY" && order.deliveryAddress
        ? `📍 Address: ${order.deliveryAddress} (${order.locality || ""})\n`
        : "") +
      (order.deliveryOtp ? `🔐 Delivery OTP: ${order.deliveryOtp}\n` : "") +
      `🔗 Track Live: ${currentUrl}`
  );

  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${whatsappMessage}`;
  const whatsappRestaurantUrl = `https://api.whatsapp.com/send?phone=${restaurantPhone}&text=${whatsappMessage}`;
  const riderPhoneClean = order.deliveryAgent?.phone?.replace(/\D/g, "");
  const whatsappRiderUrl = riderPhoneClean
    ? `https://api.whatsapp.com/send?phone=91${riderPhoneClean}&text=${encodeURIComponent(
        `Hi ${order.deliveryAgent?.name}, I am ${order.customerName} for Upahar Order #${order.orderNumber}.`
      )}`
    : null;

  return (
    <div className="bg-brand-cream min-h-screen py-8 sm:py-12 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Top Action Navigation */}
        <div className="print:hidden flex flex-wrap items-center justify-between gap-2 text-xs">
          <Link
            href="/orders"
            className="font-bold text-brand-700 hover:underline flex items-center space-x-1"
          >
            <span>← All My Orders</span>
          </Link>
          <div className="flex items-center flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? "Mute real-time chime" : "Enable real-time chime"}
              className={`p-2 rounded-xl border font-bold flex items-center transition cursor-pointer shadow-xs ${
                soundEnabled
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-stone-100 border-stone-200 text-stone-400"
              }`}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
            <a
              href={whatsappShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold flex items-center space-x-1.5 shadow-xs transition"
              title="Share order details on WhatsApp"
            >
              <WhatsAppIcon className="w-3.5 h-3.5" />
              <span>Share Order</span>
            </a>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl bg-white border border-brand-border text-stone-700 hover:bg-brand-surface font-bold flex items-center space-x-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-brand-700" />
              <span>Print Receipt</span>
            </button>
            <button
              type="button"
              onClick={handleReorder}
              className="px-3 py-1.5 rounded-xl bg-brand-700 text-[#DFC17B] font-bold flex items-center space-x-1.5 shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Re-Order</span>
            </button>
          </div>
        </div>

        {/* Top Status Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-sm relative overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-brand-border pb-5">
            <div>
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-brand-600 block">
                Live Order Tracking
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-brand-950 font-display">
                Order #{order.orderNumber}
              </h1>
              <span className="text-xs text-stone-500 font-medium">
                Placed on{" "}
                {new Date(order.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            <div className="flex items-center space-x-2 print:hidden">
              <div
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center space-x-1.5 ${
                  isRealtimeConnected
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-amber-50 border-amber-200 text-amber-800"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isRealtimeConnected ? "bg-emerald-500 animate-ping" : "bg-amber-500"
                  }`}
                />
                <span>{isRealtimeConnected ? "Live Real-Time" : "Connecting..."}</span>
              </div>

              <span
                className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                  isCancelled
                    ? "bg-red-100 text-red-700"
                    : order.status === "DELIVERED"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-brand-700 text-[#DFC17B] animate-pulse"
                }`}
              >
                {order.status.replace(/_/g, " ")}
              </span>
            </div>
          </div>

          {isCancelled && (
            <div className="mt-5 p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800">
              <span className="font-bold block">This order was cancelled:</span>
              <span>
                {order.rejectionReason || "Please contact the restaurant for more info."}
              </span>
            </div>
          )}

          {/* Live Map + 6-Step Progress Pipeline */}
          {!isCancelled && (
            <div className="mt-6 space-y-6">
              {/* Interactive Route Map */}
              <div className="print:hidden">
                <LiveTrackingMap
                  status={order.status}
                  orderType={order.orderType}
                  locality={order.locality}
                  deliveryAddress={order.deliveryAddress}
                  customerLat={order.lat}
                  customerLng={order.lng}
                  riderLat={order.riderLat}
                  riderLng={order.riderLng}
                  riderLocationUpdatedAt={order.riderLocationUpdatedAt}
                  distanceKm={order.distanceKm}
                  riderName={order.deliveryAgent?.name}
                  riderPhone={order.deliveryAgent?.phone}
                  riderVehicleNumber={order.deliveryAgent?.vehicleNumber}
                  deliveryOtp={order.deliveryOtp}
                  orderNumber={order.orderNumber}
                  orderId={order.id}
                  estimatedTime={order.estimatedTime}
                  onCustomerLocationUpdate={async (lat, lng) => {
                    try {
                      const res = await fetch(`/api/orders/${order.id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          action: "UPDATE_CUSTOMER_LOCATION",
                          customerLat: lat,
                          customerLng: lng,
                        }),
                      });
                      if (res.ok) {
                        setOrder((prev) => (prev ? { ...prev, lat, lng } : prev));
                      }
                    } catch (e) {
                      console.error("Failed to calibrate doorstep GPS:", e);
                    }
                  }}
                />
              </div>

              {liveUpdateBanner && (
                <div className="p-3 rounded-2xl bg-emerald-600 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md animate-in fade-in">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  <span>{liveUpdateBanner}</span>
                </div>
              )}

              {/* 6-Step Visual Stepper */}
              <div className="grid grid-cols-6 gap-1 sm:gap-2 relative pt-2">
                <div className="absolute top-6 left-4 right-4 h-1 bg-stone-200 -z-0" />
                <div
                  className="absolute top-6 left-4 h-1 bg-brand-700 -z-0 transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (currentStepIdx / (steps.length - 1)) * 100)}%`,
                  }}
                />

                {steps.map((st, idx) => {
                  const isDone = currentStepIdx > idx;
                  const isCurrent = currentStepIdx === idx;
                  return (
                    <div
                      key={st.key}
                      className="flex flex-col items-center text-center relative z-10"
                    >
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-bold transition-all shadow-sm ${
                          isDone
                            ? "bg-brand-700 text-white"
                            : isCurrent
                            ? "bg-[#DFC17B] text-brand-700 ring-4 ring-brand-700/20 scale-110"
                            : "bg-stone-200 text-stone-500"
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <span>{idx + 1}</span>
                        )}
                      </div>
                      <span
                        className={`text-[9px] sm:text-[11px] font-bold mt-1.5 leading-tight ${
                          isCurrent
                            ? "text-brand-700 font-black"
                            : isDone
                            ? "text-brand-950"
                            : "text-stone-400"
                        }`}
                      >
                        {st.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Delivery OTP Card */}
              {order.orderType === "DELIVERY" && order.status !== "DELIVERED" && (
                <div className="p-4 sm:p-5 rounded-2xl bg-brand-700/5 border-2 border-[#D4AF37] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center space-x-3 text-center sm:text-left">
                    <div className="w-10 h-10 rounded-xl bg-brand-700 text-[#DFC17B] flex items-center justify-center font-bold text-lg flex-shrink-0">
                      🔐
                    </div>
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-brand-700 block">
                        Your Secure Delivery OTP
                      </span>
                      <p className="text-[11px] text-stone-600 mt-0.5">
                        Tell this code to the Upahar delivery boy ONLY when you collect your food package.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-brand-700 text-brand-700 px-5 py-2 rounded-2xl font-mono text-2xl font-black tracking-[0.25em] shadow-md flex-shrink-0">
                    {order.deliveryOtp || "----"}
                  </div>
                </div>
              )}

              {/* Assigned Rider Card */}
              {order.deliveryAgent && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-950">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                      <Bike className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block">
                        Assigned Delivery Partner
                      </span>
                      <span className="font-extrabold text-sm text-brand-950 block">
                        {order.deliveryAgent.name} • {order.deliveryAgent.vehicleNumber}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 print:hidden">
                    {whatsappRiderUrl && (
                      <a
                        href={whatsappRiderUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center space-x-1 shadow-sm transition"
                        title="Chat with Rider on WhatsApp"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                    <a
                      href={`tel:${order.deliveryAgent.phone}`}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center space-x-1 shadow-sm hover:bg-emerald-700 transition"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Rider</span>
                    </a>
                  </div>
                </div>
              )}

              {/* WhatsApp Live Support & Sharing Card */}
              <div className="p-4 rounded-2xl bg-[#E8F8EE] border border-[#25D366]/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs print:hidden">
                <div className="flex items-center space-x-3 text-center sm:text-left">
                  <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center font-bold flex-shrink-0 shadow-xs">
                    <WhatsAppIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-extrabold text-[#075E54] block">
                      WhatsApp Instant Order Updates &amp; Support
                    </span>
                    <p className="text-[11px] text-stone-600 mt-0.5">
                      Share live tracking with friends or message the Upahar team for any special requests.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
                  <a
                    href={whatsappRestaurantUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-[#075E54] hover:bg-[#128C7E] text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chat with Upahar</span>
                  </a>
                  <a
                    href={whatsappShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-xs"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share Live Link</span>
                  </a>
                </div>
              </div>

              {/* Estimated Time + Pending Self-Cancel */}
              <div className="p-4 rounded-2xl bg-brand-700/5 border border-[#D4AF37]/40 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-2.5">
                  <Clock className="w-5 h-5 text-brand-700" />
                  <div>
                    <span className="font-bold text-brand-950 block">
                      Estimated Preparation / Arrival:
                    </span>
                    <span className="text-stone-600 text-[11px]">
                      {order.estimatedTime || "20-30 mins"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 print:hidden">
                  {order.status === "PENDING" && (
                    <button
                      type="button"
                      disabled={cancelling}
                      onClick={handleCancelOrder}
                      className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs flex items-center space-x-1 transition"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{cancelling ? "Cancelling..." : "Cancel Order"}</span>
                    </button>
                  )}

                  {!shouldShowQrSection &&
                    order.paymentStatus !== "PAID" &&
                    order.status !== "DELIVERED" && (
                      <button
                        type="button"
                        onClick={() => setShowQrPayBox(true)}
                        className="px-3 py-1.5 rounded-xl bg-[#002970] text-white font-bold text-xs flex items-center space-x-1 shadow-xs"
                      >
                        <QrCode className="w-3.5 h-3.5 text-[#00BAF2]" />
                        <span>Pay via Paytm QR</span>
                      </button>
                    )}

                  <div className="flex items-center space-x-1.5 text-stone-400 text-[10px]">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Live</span>
                  </div>
                </div>
              </div>

              {cancelError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                  {cancelError}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Official Paytm Business QR Card for Order Payment */}
        {shouldShowQrSection && (
          <div className="print:hidden">
            <PaymentQRCard
              amount={order.totalAmount}
              orderNumber={order.orderNumber}
              upiId={settings?.upiId || "paytm.s2fno8y@pty"}
              merchantName={settings?.upiMerchantName || "Suravajjula Sai Sri Vamsi"}
              paymentQrUrl={settings?.paymentQrUrl || "/images/payment-qr.jpg"}
              onSubmitUtr={handleSubmitUtr}
              existingUtr={order.upiTransactionId}
              paymentStatus={order.paymentStatus}
            />
          </div>
        )}

        {/* Post-Delivery Rating & Review Card */}
        {order.status === "DELIVERED" && (
          <div className="print:hidden bg-white rounded-3xl p-6 border border-brand-border shadow-sm space-y-4">
            {order.rating ? (
              <div className="space-y-2 text-center py-2">
                <div className="flex items-center justify-center space-x-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-5 h-5 ${
                        s <= (order.rating || 5)
                          ? "fill-amber-400 text-amber-500"
                          : "text-stone-300"
                      }`}
                    />
                  ))}
                </div>
                <h3 className="text-base font-black text-brand-950 font-display">
                  Thank You for Rating Your Order!
                </h3>
                {order.reviewComment && (
                  <p className="text-xs text-stone-600 italic">&ldquo;{order.reviewComment}&rdquo;</p>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-600 block">
                    Order Delivered • Rate Your Experience
                  </span>
                  <h3 className="text-lg font-black text-brand-950 font-display">
                    How was your Upahar meal & delivery?
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-2xl bg-brand-cream border border-brand-border">
                    <span className="text-xs font-bold text-stone-700 block mb-2">
                      Food Taste & Freshness
                    </span>
                    <div className="flex items-center space-x-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFoodRating(star)}
                          className="p-1 hover:scale-110 transition"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= foodRating
                                ? "fill-amber-400 text-amber-500"
                                : "text-stone-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {order.orderType === "DELIVERY" && (
                    <div className="p-3.5 rounded-2xl bg-brand-cream border border-brand-border">
                      <span className="text-xs font-bold text-stone-700 block mb-2">
                        Delivery Speed & Partner
                      </span>
                      <div className="flex items-center space-x-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setDeliveryRating(star)}
                            className="p-1 hover:scale-110 transition"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                star <= deliveryRating
                                  ? "fill-amber-400 text-amber-500"
                                  : "text-stone-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <textarea
                  rows={2}
                  placeholder="Share feedback on crispy dosas, sambar, or delivery speed (optional)..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-brand-border bg-brand-cream resize-none"
                />

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn-maroon-gold px-6 py-2.5 rounded-xl text-xs font-black"
                >
                  {submittingReview ? "Submitting..." : "Submit Rating"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Contact Restaurant & WhatsApp */}
        <div className="print:hidden grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href="tel:+919885455342"
            className="p-4 rounded-2xl bg-white border border-brand-border hover:border-brand-700 transition flex items-center space-x-3 shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-700/10 flex items-center justify-center text-brand-700">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-brand-950 block">
                Call Upahar Kitchen
              </span>
              <span className="text-[11px] text-stone-500">
                +91 98854 55342 (Sri Vamsi)
              </span>
            </div>
          </a>

          <a
            href={`https://wa.me/919885455342?text=${encodeURIComponent(
              `Hello Upahar, I am inquiring about my Order #${order.orderNumber} placed for ${order.customerName}.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl bg-white border border-brand-border hover:border-emerald-600 transition flex items-center space-x-3 shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-brand-950 block">
                WhatsApp Us
              </span>
              <span className="text-[11px] text-stone-500">
                Instant order inquiry & updates
              </span>
            </div>
          </a>
        </div>

        {/* Printable Order Summary & Receipt Card */}
        <div className="bg-white rounded-3xl p-6 border border-brand-border shadow-xs space-y-5">
          <div className="flex justify-between items-center pb-3 border-b border-brand-border">
            <div>
              <h3 className="text-base font-bold text-brand-950">
                Order Summary & Receipt
              </h3>
              <span className="text-[11px] text-stone-400">
                UPAHAR TIFFINS & FAST FOOD • Sangivalasa
              </span>
            </div>
            <span className="text-xs font-bold text-brand-700 bg-brand-700/10 px-3 py-1 rounded-full">
              {order.orderType === "DELIVERY" ? "Doorstep Delivery (7km)" : "Self-Pickup"}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-brand-cream border border-brand-border text-xs space-y-1">
            <div className="flex items-center space-x-1.5 font-bold text-brand-950">
              <MapPin className="w-3.5 h-3.5 text-brand-700" />
              <span>
                {order.customerName} ({order.customerPhone})
              </span>
            </div>
            <p className="text-stone-600 pl-5">{order.deliveryAddress}</p>
            {order.landmark && (
              <p className="text-stone-500 text-[11px] pl-5 italic">
                Landmark: {order.landmark}
              </p>
            )}
          </div>

          <div className="space-y-2.5">
            {order.items.map((it) => (
              <div key={it.id} className="flex items-center justify-between text-xs py-1">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-md bg-brand-700/10 text-brand-700 font-black flex items-center justify-center text-[11px]">
                    {it.quantity}x
                  </span>
                  <span className="font-bold text-brand-950">{it.name}</span>
                </div>
                <span className="font-bold text-brand-950">₹{it.price * it.quantity}</span>
              </div>
            ))}
          </div>

          {order.specialInstructions && (
            <div className="p-3 rounded-xl bg-stone-50 text-[11px] text-stone-600">
              <span className="font-bold text-brand-700 block">Kitchen Note:</span>
              <span>{order.specialInstructions}</span>
            </div>
          )}

          {/* Billing breakdown */}
          <div className="pt-4 border-t border-brand-border space-y-1.5 text-xs text-stone-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-brand-950">₹{order.subtotal}</span>
            </div>
            {(order.packagingFee || 0) > 0 && (
              <div className="flex justify-between">
                <span>Parcel &amp; Packaging Fee</span>
                <span className="font-bold text-brand-950">₹{order.packagingFee}</span>
              </div>
            )}
            {order.orderType === "DELIVERY" && (
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-bold text-brand-950">
                  {order.deliveryFee === 0 ? "FREE" : `₹${order.deliveryFee}`}
                </span>
              </div>
            )}
            {(order.discountAmount || 0) > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Promo Discount ({order.couponCode})</span>
                <span>- ₹{order.discountAmount}</span>
              </div>
            )}
            <div className="pt-2 border-t border-brand-surface flex justify-between items-center text-sm">
              <span className="font-bold text-brand-950">Total Amount</span>
              <span className="text-lg font-black text-brand-700 font-display">
                ₹{order.totalAmount}
              </span>
            </div>
            <div className="text-[11px] text-stone-500 text-right">
              Payment: <strong>{order.paymentMethod.replace(/_/g, " ")}</strong> ({order.paymentStatus})
              {order.upiTransactionId && ` • Ref: ${order.upiTransactionId}`}
            </div>
            {settings?.fssaiNumber && (
              <div className="text-[10px] text-stone-400 text-right font-mono">
                FSSAI Lic. No: {settings.fssaiNumber}
              </div>
            )}
          </div>
        </div>

        <div className="print:hidden text-center pt-4">
          <Link href="/menu" className="text-xs font-bold text-brand-700 hover:underline">
            ← Order More from Menu
          </Link>
        </div>
      </div>
    </div>
  );
}
