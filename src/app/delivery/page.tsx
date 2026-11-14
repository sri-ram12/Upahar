"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Bike,
  MapPin,
  Phone,
  Navigation,
  CheckCircle2,
  DollarSign,
  QrCode,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  LogOut,
  ArrowRight,
  UserPlus,
  Radio,
  Wallet,
  Volume2,
} from "lucide-react";
import { Order, DeliveryAgent, RestaurantSetting } from "@/types";
import { useRealtimeEvents } from "@/hooks/useRealtimeEvents";
import PaymentQRCard from "@/components/payment/PaymentQRCard";

const RIDER_STORAGE_KEY = "upahar_rider_session_v1";

export default function DeliveryPartnerPage() {
  const [rider, setRider] = useState<DeliveryAgent | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authTab, setAuthTab] = useState<"LOGIN" | "APPLY">("LOGIN");

  // Login Form State
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Self-Signup Application State
  const [applyName, setApplyName] = useState("");
  const [applyPhone, setApplyPhone] = useState("");
  const [applyVehicle, setApplyVehicle] = useState("");
  const [applyPin, setApplyPin] = useState("");
  const [applySuccess, setApplySuccess] = useState<string | null>(null);

  // Orders & Settings State
  const [orders, setOrders] = useState<Order[]>([]);
  const [storeSettings, setStoreSettings] = useState<RestaurantSetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "COMPLETED">("ACTIVE");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Live GPS Sharing
  const [gpsTrackingActive, setGpsTrackingActive] = useState(false);
  const [lastGpsPing, setLastGpsPing] = useState<{ lat: number; lng: number; time: string } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [dispatchNotice, setDispatchNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const gpsWatchRef = useRef<number | null>(null);
  const lastGpsSentAtRef = useRef<number>(0);

  // OTP Verification & QR Payment Modal State
  const [otpModalOrder, setOtpModalOrder] = useState<Order | null>(null);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [collectedMethod, setCollectedMethod] = useState<"COD" | "UPI">("COD");
  const [collectedUtr, setCollectedUtr] = useState("");
  const [showQrInModal, setShowQrInModal] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState<string | null>(null);

  const playRiderChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(784, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch {}
  };

  // Load rider session from localStorage & reconcile with live DB cookie session
  useEffect(() => {
    let active = true;
    Promise.resolve().then(async () => {
      try {
        const saved = localStorage.getItem(RIDER_STORAGE_KEY);
        if (saved && active) {
          setRider(JSON.parse(saved));
        }
      } catch (e) {
        console.error(e);
      }

      try {
        const res = await fetch("/api/delivery/auth", { credentials: "include" });
        const data = await res.json();
        if (!active) return;
        if (res.ok && data?.authenticated && data?.agent) {
          setRider(data.agent);
          localStorage.setItem(RIDER_STORAGE_KEY, JSON.stringify(data.agent));
        } else if (res.status === 403) {
          setRider(null);
          localStorage.removeItem(RIDER_STORAGE_KEY);
          setLoginError(data?.error || "Rider access paused by Admin.");
        }
      } catch {}
      if (active) setAuthLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const handleRiderLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      const res = await fetch("/api/delivery/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, pin }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Rider verification failed");
      }

      setRider(data.agent);
      localStorage.setItem(RIDER_STORAGE_KEY, JSON.stringify(data.agent));
    } catch (err: any) {
      setLoginError(err.message || "Failed to sign in");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRiderApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setApplySuccess(null);
    setLoginLoading(true);

    try {
      const res = await fetch("/api/delivery/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "apply",
          name: applyName,
          phone: applyPhone,
          vehicleNumber: applyVehicle,
          pin: applyPin,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Application failed");
      }
      setApplySuccess(data.message);
      setApplyName("");
      setApplyPhone("");
      setApplyVehicle("");
      setApplyPin("");
    } catch (err: any) {
      setLoginError(err.message || "Failed to submit application");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRiderLogout = async () => {
    if (gpsWatchRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(gpsWatchRef.current);
      gpsWatchRef.current = null;
    }
    setGpsTrackingActive(false);
    setRider(null);
    try {
      localStorage.removeItem(RIDER_STORAGE_KEY);
      await fetch("/api/delivery/auth", { method: "DELETE", credentials: "include" });
    } catch {}
  };

  const handleToggleDutyStatus = async () => {
    if (!rider) return;
    const nextStatus = rider.status === "OFFLINE" ? "ACTIVE" : "OFFLINE";
    try {
      const res = await fetch("/api/delivery/agents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: rider.id, status: nextStatus }),
      });
      if (res.ok) {
        const updated = { ...rider, status: nextStatus as any };
        setRider(updated);
        localStorage.setItem(RIDER_STORAGE_KEY, JSON.stringify(updated));
      }
    } catch {}
  };

  const fetchDeliveryOrders = async () => {
    try {
      const [ordRes, restRes] = await Promise.all([
        fetch("/api/orders?limit=60", { cache: "no-store" }),
        fetch("/api/restaurant", { cache: "no-store" }),
      ]);
      const data = await ordRes.json();
      const restData = await restRes.json();

      if (data.orders) {
        const deliveryOnly = data.orders.filter(
          (o: Order) => o.orderType === "DELIVERY"
        );
        setOrders(deliveryOnly);
      }
      if (restData?.settings) {
        setStoreSettings(restData.settings);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Real-time SSE push for Rider App
  const { isConnected: isRealtimeConnected } = useRealtimeEvents({
    enabled: Boolean(rider),
    onOrderCreated: () => {
      fetchDeliveryOrders();
    },
    onOrderUpdated: (payload) => {
      if (payload?.status === "FOOD_READY") {
        playRiderChime();
        setDispatchNotice(`Food Ready at Kitchen: Order #${payload.orderNumber || "NEW"}`);
        setTimeout(() => setDispatchNotice(null), 6000);
      } else if (rider && payload?.deliveryAgentId === rider.id && payload?.status) {
        playRiderChime();
        setDispatchNotice(
          `Assigned to You: #${payload.orderNumber || ""} (${String(payload.status).replace(/_/g, " ")})`
        );
        setTimeout(() => setDispatchNotice(null), 6000);
      }
      fetchDeliveryOrders();
    },
    onRiderStatusChanged: (payload) => {
      if (rider && payload.deliveryAgentId === rider.id) {
        if (payload.agent && (payload.agent.isActive === false || payload.agent.approvalStatus === "REJECTED")) {
          handleRiderLogout();
          setLoginError("Your rider access was paused or deactivated by Admin.");
          return;
        }
        setRider((prev) => {
          if (!prev) return prev;
          const updated = {
            ...prev,
            status: payload.agent?.status || prev.status,
            vehicleNumber: payload.agent?.vehicleNumber || prev.vehicleNumber,
            cashInHand: payload.cashInHand !== undefined ? payload.cashInHand : prev.cashInHand,
            totalDeliveries:
              payload.totalDeliveries !== undefined
                ? payload.totalDeliveries
                : prev.totalDeliveries,
            totalEarnings:
              payload.totalEarnings !== undefined ? payload.totalEarnings : prev.totalEarnings,
          };
          localStorage.setItem(RIDER_STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });
      }
    },
  });

  useEffect(() => {
    if (!rider) return;
    fetchDeliveryOrders();
    const interval = setInterval(fetchDeliveryOrders, 15000);
    return () => clearInterval(interval);
  }, [rider?.id]);

  // Active transit order IDs key ensures GPS watcher starts cleanly as soon as any run becomes OUT_FOR_DELIVERY
  const activeTransitRunIdsKey = orders
    .filter(
      (o) =>
        Boolean(rider) &&
        o.deliveryAgentId === rider?.id &&
        (o.status === "OUT_FOR_DELIVERY" || o.status === "ARRIVED")
    )
    .map((o) => o.id)
    .join(",");

  // Live GPS Broadcasting to Customer Map when active transit runs exist (throttled every ~3.5s)
  useEffect(() => {
    if (!rider || !gpsTrackingActive || typeof navigator === "undefined" || !navigator.geolocation) {
      if (gpsWatchRef.current !== null && typeof navigator !== "undefined" && navigator.geolocation) {
        navigator.geolocation.clearWatch(gpsWatchRef.current);
        gpsWatchRef.current = null;
      }
      return;
    }

    const activeIds = activeTransitRunIdsKey ? activeTransitRunIdsKey.split(",").filter(Boolean) : [];
    if (activeIds.length === 0) return;

    gpsWatchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setGpsError(null);
        const now = Date.now();
        if (now - lastGpsSentAtRef.current < 3500) return;
        lastGpsSentAtRef.current = now;

        const { latitude, longitude } = pos.coords;
        setLastGpsPing({
          lat: Number(latitude.toFixed(5)),
          lng: Number(longitude.toFixed(5)),
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
        });

        activeIds.forEach((runId) => {
          fetch(`/api/orders/${runId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "UPDATE_RIDER_LOCATION",
              riderLat: latitude,
              riderLng: longitude,
            }),
          }).catch(() => {});
        });
      },
      (err) => {
        setGpsError("Enable browser GPS permission to broadcast live rider route to customer.");
        console.warn("Rider GPS error:", err);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    return () => {
      if (gpsWatchRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(gpsWatchRef.current);
        gpsWatchRef.current = null;
      }
    };
  }, [gpsTrackingActive, rider?.id, activeTransitRunIdsKey]);

  const handleTakeupDelivery = async (orderId: string) => {
    if (!rider) return;
    setActionError(null);
    setIsUpdating(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "OUT_FOR_DELIVERY",
          deliveryAgentId: rider.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data?.error || "Could not claim this delivery run.");
      } else {
        setGpsTrackingActive(true);
      }
      await fetchDeliveryOrders();
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleMarkArrived = async (orderId: string) => {
    setIsUpdating(orderId);
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ARRIVED" }),
      });
      await fetchDeliveryOrders();
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(null);
    }
  };

  const openOtpModal = (order: Order) => {
    setOtpModalOrder(order);
    setEnteredOtp("");
    setOtpError(null);
    setOtpSuccess(null);
    const prefersQr =
      order.paymentMethod === "UPI" || order.paymentMethod === "QR_ON_DELIVERY";
    setCollectedMethod(prefersQr ? "UPI" : "COD");
    setCollectedUtr(order.upiTransactionId || "");
    setShowQrInModal(prefersQr);
  };

  const handleConfirmOtpAndDeliver = async () => {
    if (!otpModalOrder) return;
    setOtpError(null);
    setIsUpdating(otpModalOrder.id);

    try {
      const res = await fetch(`/api/orders/${otpModalOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "DELIVERED",
          enteredOtp: enteredOtp.trim(),
          deliveryAgentId: rider?.id,
          paymentMethod: collectedMethod,
          paymentStatus: "PAID",
          upiTransactionId: collectedMethod === "UPI" ? collectedUtr.trim() || "RIDER_QR_SCANNED" : null,
          paymentConfirmedBy: collectedMethod === "UPI" ? "RIDER_QR" : "COD_CASH",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Invalid OTP code");
      }

      setOtpSuccess(
        `Order #${otpModalOrder.orderNumber} delivered (${collectedMethod} ₹${otpModalOrder.totalAmount} confirmed)!`
      );
      setTimeout(() => {
        setOtpModalOrder(null);
        setEnteredOtp("");
        setOtpSuccess(null);
      }, 1500);

      await fetchDeliveryOrders();
    } catch (err: any) {
      setOtpError(err.message || "Failed to complete delivery");
    } finally {
      setIsUpdating(null);
    }
  };

  // RIDER LOGIN / SIGNUP SCREEN
  if (!rider && !authLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-[#EADBCE] overflow-hidden">
          <div className="bg-[#580D1A] text-white p-6 sm:p-8 text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#2B070E] border border-[#D4AF37]/50 flex items-center justify-center text-[#DFC17B] mx-auto shadow-md">
              <Bike className="w-8 h-8" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black font-display text-white">
              Upahar Rider Portal
            </h1>
            <p className="text-xs text-[#DFC17B] font-semibold">
              Authorized Delivery Boys • Tagarapuvalasa 7km
            </p>
          </div>

          <div className="flex border-b border-[#EADBCE] bg-[#FAF7F2]">
            <button
              type="button"
              onClick={() => {
                setAuthTab("LOGIN");
                setLoginError(null);
                setApplySuccess(null);
              }}
              className={`flex-1 py-3 text-xs font-black transition ${
                authTab === "LOGIN"
                  ? "text-[#580D1A] border-b-2 border-[#580D1A] bg-white"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              Rider Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthTab("APPLY");
                setLoginError(null);
              }}
              className={`flex-1 py-3 text-xs font-black transition ${
                authTab === "APPLY"
                  ? "text-[#580D1A] border-b-2 border-[#580D1A] bg-white"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              New Rider? Apply
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-5">
            {loginError && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            {applySuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold leading-relaxed">
                🎉 {applySuccess}
              </div>
            )}

            {authTab === "LOGIN" ? (
              <form onSubmit={handleRiderLogin} className="space-y-4">
                <div className="p-3 rounded-2xl bg-[#580D1A]/5 border border-[#D4AF37]/40 text-[11px] text-stone-700">
                  <strong className="text-[#580D1A]">🔒 Security:</strong> Only riders registered or approved by Restaurant Admin can sign in.
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    Registered Mobile Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="e.g. 9885455342"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                      className="w-full text-xs pl-9 pr-3 py-3 rounded-xl border border-[#EADBCE] bg-[#FAF7F2] focus:outline-none focus:ring-1 focus:ring-[#580D1A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    Secret 4-digit PIN *
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      maxLength={6}
                      placeholder="Enter your rider secret PIN"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      className="w-full text-xs pl-9 pr-3 py-3 rounded-xl border border-[#EADBCE] bg-[#FAF7F2] focus:outline-none focus:ring-1 focus:ring-[#580D1A]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="btn-maroon-gold w-full py-3.5 rounded-2xl text-xs font-black flex items-center justify-center space-x-2 shadow-md hover:scale-[1.01] transition"
                >
                  <span>{loginLoading ? "Verifying Rider Access..." : "Unlock Rider Console"}</span>
                  <ArrowRight className="w-4 h-4 text-[#DFC17B]" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleRiderApply} className="space-y-3.5">
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
                  Submit your details below. Admin must click <strong>Approve</strong> in the Owner Portal before your delivery access opens.
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Suresh Kumar"
                    value={applyName}
                    onChange={(e) => setApplyName(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#EADBCE] bg-[#FAF7F2]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    Mobile Number (10 digits) *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="e.g. 9848011223"
                    value={applyPhone}
                    onChange={(e) => setApplyPhone(e.target.value.replace(/\D/g, ""))}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#EADBCE] bg-[#FAF7F2]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    Bike / Scooty Registration No. *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AP 39 BK 1234"
                    value={applyVehicle}
                    onChange={(e) => setApplyVehicle(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#EADBCE] bg-[#FAF7F2]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    Choose a 4-Digit Login PIN *
                  </label>
                  <input
                    type="password"
                    required
                    maxLength={6}
                    placeholder="e.g. 4321"
                    value={applyPin}
                    onChange={(e) => setApplyPin(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#EADBCE] bg-[#FAF7F2]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="btn-maroon-gold w-full py-3.5 rounded-2xl text-xs font-black flex items-center justify-center space-x-2 shadow-md"
                >
                  <UserPlus className="w-4 h-4 text-[#DFC17B]" />
                  <span>{loginLoading ? "Submitting..." : "Submit Application for Admin Approval"}</span>
                </button>
              </form>
            )}

            <div className="pt-3 border-t border-[#F4EFE6] text-center">
              <Link
                href="/portal"
                className="text-xs font-bold text-stone-500 hover:text-[#580D1A] transition"
              >
                ← Back to All Panels Hub
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Isolate orders: show unassigned waiting orders + orders claimed by/assigned to THIS rider
  const activeDeliveries = orders.filter((o) => {
    const isActiveStatus =
      o.status === "PENDING" ||
      o.status === "CONFIRMED" ||
      o.status === "PREPARING" ||
      o.status === "FOOD_READY" ||
      o.status === "OUT_FOR_DELIVERY" ||
      o.status === "ARRIVED";
    if (!isActiveStatus) return false;
    return !o.deliveryAgentId || o.deliveryAgentId === rider?.id;
  });

  const completedDeliveries = orders.filter(
    (o) => o.status === "DELIVERED" && (!o.deliveryAgentId || o.deliveryAgentId === rider?.id)
  );
  const displayedOrders = activeTab === "ACTIVE" ? activeDeliveries : completedDeliveries;

  return (
    <div className="min-h-screen bg-[#FAF7F2] p-4 sm:p-6 max-w-3xl mx-auto space-y-5">
      {/* Top Rider Header */}
      <div className="bg-[#580D1A] text-white p-5 sm:p-6 rounded-3xl shadow-xl border border-[#D4AF37]/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#2B070E] border border-[#D4AF37]/40 flex items-center justify-center text-[#DFC17B] shadow-md">
            <Bike className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg sm:text-xl font-black font-display text-white">
                Rider: {rider?.name}
              </h1>
              <span className="bg-[#DFC17B] text-[#580D1A] text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                {rider?.vehicleNumber}
              </span>
            </div>
            <p className="text-xs text-stone-300 mt-0.5">
              Tagarapuvalasa 7km Express • {rider?.status === "OFFLINE" ? "OFF DUTY" : "ON DUTY"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleToggleDutyStatus}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-black border transition ${
              rider?.status === "OFFLINE"
                ? "bg-stone-800 border-stone-600 text-stone-300"
                : "bg-emerald-600 border-emerald-400 text-white"
            }`}
          >
            {rider?.status === "OFFLINE" ? "Go On Duty" : "● On Duty"}
          </button>

          <button
            onClick={() => {
              setGpsError(null);
              setGpsTrackingActive(!gpsTrackingActive);
            }}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border flex items-center space-x-1 transition ${
              gpsTrackingActive
                ? "bg-sky-600 border-sky-400 text-white"
                : "bg-white/10 border-white/20 text-stone-200"
            }`}
            title="Broadcast live bike GPS to Customer map"
          >
            <Radio className={`w-3.5 h-3.5 ${gpsTrackingActive ? "animate-pulse" : ""}`} />
            <span>{gpsTrackingActive ? "GPS Live" : "Share GPS"}</span>
          </button>

          <div
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border flex items-center space-x-1.5 ${
              isRealtimeConnected
                ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-300"
                : "bg-amber-950/60 border-amber-500/50 text-amber-300"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isRealtimeConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
              }`}
            />
            <span>{isRealtimeConnected ? "SSE Live" : "..."}</span>
          </div>

          <button
            onClick={fetchDeliveryOrders}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition text-white"
            title="Refresh Deliveries"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleRiderLogout}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-red-950/60 text-stone-200 hover:text-red-300 transition flex items-center space-x-1"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit</span>
          </button>
        </div>
      </div>

      {/* Live GPS Telemetry & Realtime Alerts */}
      {dispatchNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-600 text-white text-xs font-black flex items-center justify-between gap-2 shadow-lg animate-in fade-in">
          <span>🔔 {dispatchNotice}</span>
          <button
            type="button"
            onClick={() => setDispatchNotice(null)}
            className="underline text-[11px] opacity-90 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center justify-between gap-2">
          <span>{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="underline text-[11px] cursor-pointer"
          >
            Close
          </button>
        </div>
      )}

      {(gpsTrackingActive || gpsError) && (
        <div
          className={`px-4 py-2.5 rounded-2xl border text-[11px] font-bold flex flex-wrap items-center justify-between gap-2 ${
            gpsError
              ? "bg-amber-50 border-amber-300 text-amber-900"
              : "bg-sky-50 border-sky-200 text-sky-900"
          }`}
        >
          <span>
            {gpsError
              ? `⚠️ ${gpsError}`
              : lastGpsPing
              ? `📡 Live GPS Broadcasting (${lastGpsPing.lat}, ${lastGpsPing.lng}) • Pinged at ${lastGpsPing.time}`
              : activeTransitRunIdsKey
              ? "📡 Live GPS armed — waiting for satellite fix on your active delivery run..."
              : "📡 Live GPS armed — starts broadcasting automatically as soon as you pick up a run."}
          </span>
        </div>
      )}

      {/* Stats Banner: COD Cash, Deliveries & Rider Earnings */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-[#EADBCE] shadow-sm flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 flex-shrink-0">
            <DollarSign className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[9px] font-bold uppercase tracking-wider text-stone-500 truncate">
              COD Cash
            </div>
            <div className="text-base sm:text-xl font-black text-emerald-800">
              ₹{(rider?.cashInHand || 0).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-[#EADBCE] shadow-sm flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 flex-shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[9px] font-bold uppercase tracking-wider text-stone-500 truncate">
              Runs Done
            </div>
            <div className="text-base sm:text-xl font-black text-[#580D1A]">
              {rider?.totalDeliveries || 0}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-[#EADBCE] shadow-sm flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#580D1A]/10 border border-[#D4AF37]/40 flex items-center justify-center text-[#580D1A] flex-shrink-0">
            <Wallet className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[9px] font-bold uppercase tracking-wider text-stone-500 truncate">
              Earnings
            </div>
            <div className="text-base sm:text-xl font-black text-[#2B070E]">
              ₹{(rider?.totalEarnings || 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-[#EADBCE] pb-3">
        <button
          onClick={() => setActiveTab("ACTIVE")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center space-x-2 ${
            activeTab === "ACTIVE"
              ? "bg-[#580D1A] text-white shadow-md"
              : "bg-white text-stone-600 border border-[#EADBCE]"
          }`}
        >
          <span>Active Runs</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeDeliveries.length > 0
                ? "bg-amber-400 text-[#580D1A] font-black"
                : "bg-stone-200 text-stone-600"
            }`}
          >
            {activeDeliveries.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("COMPLETED")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center space-x-2 ${
            activeTab === "COMPLETED"
              ? "bg-[#580D1A] text-white shadow-md"
              : "bg-white text-stone-600 border border-[#EADBCE]"
          }`}
        >
          <span>Delivered ({completedDeliveries.length})</span>
        </button>
      </div>

      {/* Delivery Cards */}
      {loading ? (
        <div className="p-12 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#580D1A]" />
        </div>
      ) : displayedOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-[#EADBCE] space-y-3">
          <Bike className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-base font-bold text-[#2B070E]">
            {activeTab === "ACTIVE"
              ? "No delivery runs waiting right now"
              : "No deliveries completed yet"}
          </h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            When kitchen marks food ready or an order is assigned to you, it will chime and appear here instantaneously.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedOrders.map((order) => {
            const isReadyForPickup =
              order.status === "FOOD_READY" || order.status === "PREPARING";
            const isOut = order.status === "OUT_FOR_DELIVERY";
            const isArrived = order.status === "ARRIVED";
            const isCOD = order.paymentMethod === "COD";

            const destinationQuery = encodeURIComponent(
              `${order.deliveryAddress || ""}, Sangivalasa Tagarapuvalasa`
            );
            const mapsUrl =
              order.lat && order.lng
                ? `https://www.google.com/maps/dir/?api=1&destination=${order.lat},${order.lng}`
                : `https://www.google.com/maps/dir/?api=1&destination=${destinationQuery}`;

            return (
              <div
                key={order.id}
                className={`bg-white rounded-3xl p-5 border shadow-sm space-y-4 transition ${
                  isArrived
                    ? "border-emerald-500 ring-2 ring-emerald-500/20"
                    : isOut
                    ? "border-[#580D1A] ring-1 ring-[#580D1A]/30"
                    : "border-amber-300 bg-amber-50/10"
                }`}
              >
                <div className="flex justify-between items-start pb-3 border-b border-[#F4EFE6]">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                        Run #{order.orderNumber}
                      </span>
                      {order.deliveryAgentId === rider?.id && (
                        <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-[#DFC17B] text-[#580D1A] border border-[#D4AF37]">
                          Assigned to You
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-black text-[#2B070E] font-display mt-0.5">
                      {order.customerName}
                    </h3>
                  </div>

                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      isArrived
                        ? "bg-emerald-600 text-white animate-pulse"
                        : isOut
                        ? "bg-[#580D1A] text-[#DFC17B]"
                        : order.status === "FOOD_READY"
                        ? "bg-amber-100 text-amber-900 border border-amber-300"
                        : "bg-stone-100 text-stone-600"
                    }`}
                  >
                    {order.status === "FOOD_READY"
                      ? "Ready at Counter"
                      : order.status.replace(/_/g, " ")}
                  </span>
                </div>

                {/* Delivery Address */}
                <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE] text-xs space-y-1.5">
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-[#580D1A] flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#2B070E] block">
                        {order.deliveryAddress}
                      </span>
                      {order.landmark && (
                        <span className="text-stone-600 text-[11px] block mt-0.5">
                          Landmark: <strong>{order.landmark}</strong>
                        </span>
                      )}
                      {order.distanceKm && (
                        <span className="text-stone-400 text-[10px] block mt-0.5">
                          Distance: ~{order.distanceKm} km from Upahar
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="text-xs space-y-1 border-t border-[#F4EFE6] pt-2">
                  <span className="font-bold text-stone-600 block text-[11px] uppercase tracking-wider">
                    Dishes to Deliver:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {order.items.map((it) => (
                      <span
                        key={it.id}
                        className="bg-stone-100 text-stone-800 px-2 py-0.5 rounded-md font-semibold text-[11px]"
                      >
                        {it.quantity}x {it.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Cash / Business QR Payment Banner */}
                <div
                  className={`p-3 rounded-2xl border flex items-center justify-between text-xs font-bold ${
                    isCOD
                      ? "bg-amber-50 border-amber-200 text-amber-900"
                      : "bg-[#002970]/5 border-[#00BAF2]/40 text-[#002970]"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {isCOD ? <DollarSign className="w-4 h-4" /> : <QrCode className="w-4 h-4" />}
                    <span>
                      {isCOD
                        ? "COLLECT CASH (OR PAYTM QR):"
                        : order.paymentStatus === "VERIFICATION_PENDING"
                        ? `VERIFY UPI REF (${order.upiTransactionId}):`
                        : order.paymentMethod === "QR_ON_DELIVERY"
                        ? "COLLECT VIA PAYTM BUSINESS QR:"
                        : `ONLINE UPI (${order.paymentStatus}):`}
                    </span>
                  </div>
                  <span className="text-base font-black font-display">₹{order.totalAmount}</span>
                </div>

                {/* Action Stage Buttons */}
                <div className="space-y-2 pt-2">
                  {isReadyForPickup && (
                    <button
                      disabled={isUpdating === order.id}
                      onClick={() => handleTakeupDelivery(order.id)}
                      className="btn-maroon-gold w-full py-3 rounded-2xl text-xs font-black flex items-center justify-center space-x-2 shadow-md hover:scale-[1.01]"
                    >
                      <Bike className="w-4 h-4 text-[#DFC17B]" />
                      <span>Pick Up from Kitchen & Start Delivery Run</span>
                    </button>
                  )}

                  {(isOut || isArrived) && (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href={`tel:${order.customerPhone}`}
                          className="p-3 rounded-xl bg-white border border-[#EADBCE] text-xs font-bold text-[#580D1A] flex items-center justify-center space-x-1.5 shadow-xs"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call Customer</span>
                        </a>

                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 rounded-xl bg-[#580D1A] text-xs font-bold text-[#DFC17B] flex items-center justify-center space-x-1.5 shadow-xs"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Google Maps GPS</span>
                        </a>
                      </div>

                      {isOut && (
                        <button
                          disabled={isUpdating === order.id}
                          onClick={() => handleMarkArrived(order.id)}
                          className="w-full py-2.5 rounded-xl text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 transition flex items-center justify-center space-x-1.5"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Reached Customer Doorstep</span>
                        </button>
                      )}

                      <button
                        onClick={() => openOtpModal(order)}
                        className="w-full py-3.5 rounded-2xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center justify-center space-x-2 shadow-lg hover:scale-[1.01]"
                      >
                        <KeyRound className="w-4 h-4" />
                        <span>Show Paytm QR / Enter OTP & Complete</span>
                      </button>
                    </>
                  )}

                  {order.status === "DELIVERED" && (
                    <div className="text-center py-2 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-xl flex items-center justify-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        Delivered ({order.paymentMethod}) • ₹{order.totalAmount}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DELIVERY OTP + DOORSTEP PAYTM BUSINESS QR MODAL */}
      {otpModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-md w-full space-y-4 border border-[#EADBCE] shadow-2xl animate-in zoom-in-95 my-6 max-h-[92vh] overflow-y-auto">
            <div className="text-center space-y-1">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-[#2B070E] font-display">
                Complete Delivery #{otpModalOrder.orderNumber}
              </h3>
              <p className="text-xs text-stone-500">
                Collect <strong>₹{otpModalOrder.totalAmount}</strong> and ask{" "}
                <strong>{otpModalOrder.customerName}</strong> for their 4-digit Delivery OTP.
              </p>
            </div>

            {otpError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{otpError}</span>
              </div>
            )}

            {otpSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{otpSuccess}</span>
              </div>
            )}

            {/* Payment Mode Choice at Doorstep */}
            <div className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-stone-600 block">
                How did customer pay ₹{otpModalOrder.totalAmount}?
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCollectedMethod("COD");
                    setShowQrInModal(false);
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition ${
                    collectedMethod === "COD"
                      ? "bg-amber-50 border-amber-500 text-amber-900 ring-1 ring-amber-500"
                      : "bg-stone-50 border-stone-200 text-stone-600"
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Cash Paid</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCollectedMethod("UPI");
                    setShowQrInModal(true);
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition ${
                    collectedMethod === "UPI"
                      ? "bg-[#00BAF2]/10 border-[#002970] text-[#002970] ring-1 ring-[#002970]"
                      : "bg-stone-50 border-stone-200 text-stone-600"
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>Paytm QR Scanned</span>
                </button>
              </div>
            </div>

            {/* Official Paytm Business QR for Customer to Scan */}
            {(showQrInModal || collectedMethod === "UPI") && (
              <div className="space-y-2">
                <PaymentQRCard
                  amount={otpModalOrder.totalAmount}
                  orderNumber={otpModalOrder.orderNumber}
                  upiId={storeSettings?.upiId || "paytm.s2fno8y@pty"}
                  merchantName={storeSettings?.upiMerchantName || "Suravajjula Sai Sri Vamsi"}
                  paymentQrUrl={storeSettings?.paymentQrUrl || "/images/payment-qr.jpg"}
                  compact
                />
                <input
                  type="text"
                  placeholder="Optional: Last 4 digits / UPI Ref No."
                  value={collectedUtr}
                  onChange={(e) => setCollectedUtr(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 bg-[#FAF7F2] font-mono"
                />
              </div>
            )}

            {/* OTP Input */}
            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1 text-center">
                Enter Customer&apos;s 4-Digit Delivery OTP *
              </label>
              <input
                type="text"
                maxLength={4}
                autoFocus
                placeholder="• • • •"
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ""))}
                className="w-full text-center text-3xl font-mono font-black tracking-[0.5em] py-3 rounded-2xl border-2 border-[#580D1A] bg-[#FAF7F2] text-[#580D1A] focus:outline-none focus:ring-2 focus:ring-[#580D1A]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setOtpModalOrder(null)}
                className="py-3 rounded-xl text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={enteredOtp.length !== 4 || isUpdating === otpModalOrder.id}
                onClick={handleConfirmOtpAndDeliver}
                className="btn-maroon-gold py-3 rounded-xl text-xs font-black shadow-md disabled:opacity-50"
              >
                <span>{isUpdating === otpModalOrder.id ? "Verifying..." : "Confirm & Deliver"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
