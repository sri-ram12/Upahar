"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Bike,
  Store,
  MapPin,
  Phone,
  User,
  Navigation,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  QrCode,
  DollarSign,
  UtensilsCrossed,
  Tag,
  Bookmark,
  Trash2,
  X,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { useRealtimeEvents } from "@/hooks/useRealtimeEvents";
import PaymentQRCard from "@/components/payment/PaymentQRCard";
import { Coupon, RestaurantSetting, CustomerAddress } from "@/types";
import { getDivisionForCategory } from "@/lib/store-hours";
import {
  TAGARAPUVALASA_LOCALITIES,
  PopularLocality,
  UPAHAR_COORDINATES,
  calculateDistanceKm,
  getDeliveryFee,
  MAX_DELIVERY_RADIUS_KM,
} from "@/lib/delivery-zones";

const RECENT_ORDERS_KEY = "upahar_recent_orders_v1";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, specialNotes, clearCart } = useCart();
  const { customer, setIsAuthModalOpen, saveAddress, deleteAddress } = useCustomerAuth();

  // Restaurant Live Settings & Subsite Statuses
  const [storeSettings, setStoreSettings] = useState<RestaurantSetting | null>(null);
  const [subsitesData, setSubsitesData] = useState<any[]>([]);
  const [emergencyStopNotice, setEmergencyStopNotice] = useState<string | null>(null);
  const [closedHoursNotice, setClosedHoursNotice] = useState<string | null>(null);

  // Form State
  const [orderType, setOrderType] = useState<"DELIVERY" | "TAKEAWAY">("DELIVERY");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedLocality, setSelectedLocality] = useState<PopularLocality>(
    TAGARAPUVALASA_LOCALITIES[0]
  );
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [landmark, setLandmark] = useState("");

  // Save Address State
  const [saveAddressChecked, setSaveAddressChecked] = useState(false);
  const [addressLabel, setAddressLabel] = useState("Hostel");

  // Payment State (Cash, QR at Delivery, Online UPI QR Now)
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "QR_ON_DELIVERY" | "UPI">("COD");
  const [upiTransactionId, setUpiTransactionId] = useState("");

  // Coupons State
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // Auto-fill from logged-in customer account or default saved address
  useEffect(() => {
    if (customer) {
      if (customer.name && !customerName) setCustomerName(customer.name);
      if (customer.phone && !customerPhone) setCustomerPhone(customer.phone);

      const defaultAddr =
        customer.addresses?.find((a) => a.isDefault) || customer.addresses?.[0];

      if (defaultAddr && !deliveryAddress) {
        setDeliveryAddress(defaultAddr.address);
        if (defaultAddr.landmark) setLandmark(defaultAddr.landmark);
        const locMatch = TAGARAPUVALASA_LOCALITIES.find(
          (l) => l.name === defaultAddr.locality
        );
        if (locMatch) setSelectedLocality(locMatch);
      } else {
        if (customer.address && !deliveryAddress) setDeliveryAddress(customer.address);
        if (customer.landmark && !landmark) setLandmark(customer.landmark);
      }
    }
  }, [customer]);

  // Load live restaurant settings & coupons
  useEffect(() => {
    Promise.all([fetch("/api/restaurant"), fetch("/api/coupons")])
      .then(async ([restRes, coupRes]) => {
        const restData = await restRes.json();
        const coupData = await coupRes.json();

        if (restData?.settings) {
          setStoreSettings(restData.settings);
          if (restData.settings.isEmergencyWebsiteStopped) {
            setEmergencyStopNotice(
              restData.settings.emergencyStopMessage ||
                "Online orders are temporarily stopped by restaurant management."
            );
          } else if (restData.settings.isOnlineOrderingEnabled === false) {
            setEmergencyStopNotice(
              "Online ordering is currently paused by the restaurant. Please try again soon."
            );
          }
        }
        if (Array.isArray(restData?.subsites)) {
          setSubsitesData(restData.subsites);
        }
        if (coupData?.coupons) {
          setAvailableCoupons(coupData.coupons);
        }
      })
      .catch(console.error);
  }, []);

  // Recompute per-division closed notice whenever cart items or settings load
  useEffect(() => {
    if (!storeSettings || storeSettings.enforceStoreHours === false || subsitesData.length === 0) {
      setClosedHoursNotice(null);
      return;
    }
    const subsiteStatusMap = new Map<string, any>(subsitesData.map((s: any) => [s.id, s]));
    const blockedDivisions = new Set<string>();
    for (const cartItem of items) {
      const divKey = getDivisionForCategory(
        cartItem.foodItem.category || cartItem.foodItem.categoryId
      );
      const subInfo = subsiteStatusMap.get(divKey);
      if (subInfo?.status?.isLocked) {
        blockedDivisions.add(
          subInfo.status.lockBanner || `${subInfo.title} is only open ${subInfo.status.timingText}`
        );
      }
    }
    setClosedHoursNotice(
      blockedDivisions.size > 0 ? Array.from(blockedDivisions).join(" ") : null
    );
  }, [items, storeSettings, subsitesData]);

  // Instant real-time listener: if admin hits Emergency Website Stop, lock checkout immediately!
  useRealtimeEvents({
    onEmergencyStopChanged: (payload) => {
      if (payload.isEmergencyWebsiteStopped) {
        setEmergencyStopNotice(
          payload.emergencyStopMessage ||
            "Emergency Stop: Restaurant administration has paused online ordering."
        );
      } else if (payload.isOnlineOrderingEnabled === false) {
        setEmergencyStopNotice("Online ordering has been paused by restaurant management.");
      } else {
        setEmergencyStopNotice(null);
      }
    },
  });

  // GPS State
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsDistance, setGpsDistance] = useState<number | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active distance & delivery calculation honoring live RestaurantSetting
  const maxRadiusKm = storeSettings?.deliveryRadiusKm ?? MAX_DELIVERY_RADIUS_KM;
  const activeDistance =
    gpsDistance !== null ? gpsDistance : selectedLocality.distanceKm;

  const deliveryCalc =
    orderType === "DELIVERY"
      ? getDeliveryFee(activeDistance, subtotal, {
          maxRadiusKm,
          baseFee: storeSettings?.deliveryBaseFee,
          freeAbove: storeSettings?.minOrderFreeDelivery,
        })
      : { fee: 0, isFree: true, isEligible: true, freeThreshold: 0 };

  const finalDeliveryFee = orderType === "DELIVERY" ? deliveryCalc.fee : 0;
  const packagingFee = storeSettings?.packagingFee ?? 10;
  const minDeliveryOrderAmount = storeSettings?.minDeliveryOrderAmount ?? 60;
  const belowMinDelivery =
    orderType === "DELIVERY" && subtotal < minDeliveryOrderAmount;
  const grandTotal = Math.max(
    0,
    subtotal + packagingFee + finalDeliveryFee - discountAmount
  );

  const handleSelectSavedAddress = (addr: CustomerAddress) => {
    setDeliveryAddress(addr.address);
    setLandmark(addr.landmark || "");
    const loc = TAGARAPUVALASA_LOCALITIES.find((l) => l.name === addr.locality);
    if (loc) setSelectedLocality(loc);
    if (addr.lat && addr.lng) {
      setGpsCoords({ lat: addr.lat, lng: addr.lng });
      setGpsDistance(addr.distanceKm || null);
    }
  };

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = (codeToApply ?? couponInput).trim().toUpperCase();
    if (!code) return;
    setCouponError(null);
    setCouponMessage(null);
    setApplyingCoupon(true);

    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "validate", code, subtotal }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setCouponError(data.error || "Invalid promo code");
        setAppliedCoupon(null);
        setDiscountAmount(0);
      } else {
        setAppliedCoupon(data.coupon);
        setDiscountAmount(data.discountAmount);
        setCouponInput(data.coupon.code);
        setCouponMessage(data.message);
      }
    } catch {
      setCouponError("Failed to validate promo code");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponInput("");
    setCouponMessage(null);
    setCouponError(null);
  };

  // GPS auto-detect handler
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser.");
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setGpsCoords({ lat, lng });

        const dist = calculateDistanceKm(
          UPAHAR_COORDINATES.lat,
          UPAHAR_COORDINATES.lng,
          lat,
          lng
        );
        setGpsDistance(dist);
        setGpsLoading(false);

        if (dist > maxRadiusKm) {
          setGpsError(
            `You are ${dist}km away from Upahar, Sangivalasa. Delivery is available within ${maxRadiusKm}km. You may still order for Self-Pickup!`
          );
        }
      },
      () => {
        setGpsLoading(false);
        setGpsError(
          "Unable to retrieve GPS location. Please choose your locality from the dropdown below."
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (emergencyStopNotice) {
      setErrorMessage(emergencyStopNotice);
      return;
    }

    if (items.length === 0) {
      setErrorMessage("Your order bag is empty.");
      return;
    }

    if (!customerName.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }

    const cleanPhone = customerPhone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (orderType === "DELIVERY") {
      if (!deliveryCalc.isEligible) {
        setErrorMessage(
          deliveryCalc.reason ||
            `Delivery is available only within ${maxRadiusKm}km of Tagarapuvalasa.`
        );
        return;
      }

      if (!deliveryAddress.trim()) {
        setErrorMessage(
          "Please enter your detailed delivery address (Hostel/Room No. or House Address)."
        );
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Save new address if user checked "Save address"
      if (customer && orderType === "DELIVERY" && saveAddressChecked && deliveryAddress.trim()) {
        await saveAddress({
          label: addressLabel || "Saved",
          address: deliveryAddress.trim(),
          landmark: landmark.trim() || undefined,
          locality: selectedLocality.name,
          lat: gpsCoords?.lat ?? selectedLocality.lat,
          lng: gpsCoords?.lng ?? selectedLocality.lng,
          distanceKm: activeDistance,
          isDefault: (customer.addresses?.length || 0) === 0,
        });
      }

      const orderPayload = {
        customerId: customer?.id || null,
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        customerEmail: customer?.email || null,
        orderType,
        deliveryAddress:
          orderType === "DELIVERY"
            ? `${deliveryAddress.trim()}, ${selectedLocality.name}, ${selectedLocality.area}`
            : "Self-Pickup at Upahar Restaurant Counter, Sangivalasa",
        landmark: landmark.trim() || null,
        locality: selectedLocality.name,
        lat: gpsCoords?.lat || selectedLocality.lat || null,
        lng: gpsCoords?.lng || selectedLocality.lng || null,
        distanceKm: activeDistance,
        specialInstructions: specialNotes || null,
        paymentMethod,
        couponCode: appliedCoupon?.code || null,
        upiTransactionId: paymentMethod === "UPI" && upiTransactionId.trim() ? upiTransactionId.trim() : null,
        items: items.map((it) => ({
          foodItemId: it.foodItem.id,
          name: it.foodItem.name,
          price: it.foodItem.price,
          quantity: it.quantity,
          portionSize: it.foodItem.portionSize || null,
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to place order");
      }

      // Persist order number in browser history for guest / quick My Orders access
      try {
        const existingRaw = localStorage.getItem(RECENT_ORDERS_KEY);
        const existingList: string[] = existingRaw ? JSON.parse(existingRaw) : [];
        const updated = [
          data.order.orderNumber,
          ...existingList.filter((o) => o !== data.order.orderNumber),
        ].slice(0, 20);
        localStorage.setItem(RECENT_ORDERS_KEY, JSON.stringify(updated));
      } catch {}

      clearCart();
      router.push(`/orders/${data.order.orderNumber}`);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-brand-cream">
        <div className="w-20 h-20 rounded-full bg-brand-border/50 flex items-center justify-center text-brand-700 mb-4">
          <UtensilsCrossed className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-black text-brand-950 font-display">
          Your Bag is Empty
        </h1>
        <p className="text-stone-500 text-sm mt-2 max-w-sm">
          Please add some delicious South Indian tiffins or fast food dishes to your order bag first.
        </p>
        <div className="flex items-center gap-3 mt-6">
          <Link
            href="/menu"
            className="btn-maroon-gold px-6 py-3 rounded-2xl text-xs font-bold"
          >
            Explore Upahar Menu
          </Link>
          <Link
            href="/orders"
            className="btn-gold-outline px-5 py-3 rounded-2xl text-xs font-bold"
          >
            View My Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-cream min-h-screen py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Top Back Link */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/menu"
            className="inline-flex items-center space-x-2 text-xs font-bold text-stone-600 hover:text-brand-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Menu</span>
          </Link>

          <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider bg-brand-700/10 px-3 py-1 rounded-full">
            Tagarapuvalasa {maxRadiusKm}km Express
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Checkout Form (7 Cols) */}
          <form onSubmit={handleSubmitOrder} className="lg:col-span-7 space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-brand-950 font-display">
                Complete Your Order
              </h1>
              <p className="text-xs text-stone-500 mt-1">
                Freshly prepared and delivered piping hot across Tagarapuvalasa & Sangivalasa.
              </p>
            </div>

            {emergencyStopNotice && (
              <div className="p-4 rounded-2xl bg-red-600 text-white text-xs font-bold flex items-center space-x-3 shadow-lg animate-pulse">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <div>
                  <span className="block font-black uppercase tracking-wider text-[11px]">
                    Emergency Order Pause Active
                  </span>
                  <span>{emergencyStopNotice}</span>
                </div>
              </div>
            )}

            {closedHoursNotice && !emergencyStopNotice && (
              <div className="p-4 rounded-2xl bg-amber-900 text-amber-50 border border-amber-500/40 text-xs font-bold flex items-center space-x-3 shadow-md">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-[#DFC17B]" />
                <div>
                  <span className="block font-black uppercase tracking-wider text-[11px] text-[#DFC17B]">
                    Kitchen Closed Outside Session Hours
                  </span>
                  <span>{closedHoursNotice}</span>
                </div>
              </div>
            )}

            {belowMinDelivery && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs font-semibold flex items-center justify-between gap-2">
                <span>
                  Minimum order for Doorstep Delivery is <strong>₹{minDeliveryOrderAmount}</strong>. Add{" "}
                  <strong>₹{Math.ceil(minDeliveryOrderAmount - subtotal)}</strong> more or choose{" "}
                  <strong>Self-Pickup</strong> above.
                </span>
                <Link href="/menu" className="px-3 py-1.5 rounded-xl bg-brand-700 text-[#DFC17B] font-black text-[11px] flex-shrink-0">
                  + Add Dishes
                </Link>
              </div>
            )}

            {!customer ? (
              <div className="p-4 rounded-2xl bg-brand-700/5 border border-[#D4AF37]/50 flex items-center justify-between text-xs gap-3">
                <div>
                  <span className="font-bold text-brand-950 block">
                    Sign In with Mobile OTP or Account
                  </span>
                  <span className="text-[11px] text-stone-500">
                    Auto-fill saved hostel/home addresses and track orders anytime.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-brand-700 text-[#DFC17B] text-xs font-bold hover:scale-105 transition flex-shrink-0"
                >
                  Sign In
                </button>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                <span className="font-semibold">
                  Signed in as <strong>{customer.name}</strong> ({customer.phone})
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-300">
                  Verified
                </span>
              </div>
            )}

            {errorMessage && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start space-x-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Step 1: Order Type */}
            <div className="bg-white rounded-3xl p-5 border border-brand-border shadow-xs space-y-3">
              <label className="block text-xs font-extrabold text-brand-600 uppercase tracking-wider">
                1. Select Order Type
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setOrderType("DELIVERY")}
                  className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between space-y-2 ${
                    orderType === "DELIVERY"
                      ? "border-brand-700 bg-brand-700/5 ring-1 ring-brand-700"
                      : "border-brand-border hover:bg-brand-cream"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Bike
                      className={`w-6 h-6 ${
                        orderType === "DELIVERY" ? "text-brand-700" : "text-stone-400"
                      }`}
                    />
                    {orderType === "DELIVERY" && (
                      <CheckCircle2 className="w-4 h-4 text-brand-700" />
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-brand-950 block">
                      Doorstep Delivery
                    </span>
                    <span className="text-[11px] text-stone-500 block">
                      Within {maxRadiusKm}km radius
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setOrderType("TAKEAWAY")}
                  className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between space-y-2 ${
                    orderType === "TAKEAWAY"
                      ? "border-brand-700 bg-brand-700/5 ring-1 ring-brand-700"
                      : "border-brand-border hover:bg-brand-cream"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Store
                      className={`w-6 h-6 ${
                        orderType === "TAKEAWAY" ? "text-brand-700" : "text-stone-400"
                      }`}
                    />
                    {orderType === "TAKEAWAY" && (
                      <CheckCircle2 className="w-4 h-4 text-brand-700" />
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-brand-950 block">
                      Self-Pickup
                    </span>
                    <span className="text-[11px] text-stone-500 block">
                      Upahar Sangivalasa Counter
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Step 2: Contact Info */}
            <div className="bg-white rounded-3xl p-5 border border-brand-border shadow-xs space-y-4">
              <label className="block text-xs font-extrabold text-brand-600 uppercase tracking-wider">
                2. Contact Information
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    Your Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-brand-border bg-brand-cream focus:outline-none focus:ring-1 focus:ring-brand-700 text-stone-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    Mobile Number (10 digits) *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ""))}
                      placeholder="e.g. 9885455342"
                      className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-brand-border bg-brand-cream focus:outline-none focus:ring-1 focus:ring-brand-700 text-stone-800"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Delivery Address + Saved Addresses */}
            {orderType === "DELIVERY" && (
              <div className="bg-white rounded-3xl p-5 border border-brand-border shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-extrabold text-brand-600 uppercase tracking-wider">
                    3. Delivery Location in Tagarapuvalasa
                  </label>

                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={gpsLoading}
                    className="text-[11px] font-bold text-brand-700 bg-brand-700/10 hover:bg-brand-700/20 px-3 py-1 rounded-xl transition flex items-center space-x-1"
                  >
                    <Navigation className={`w-3 h-3 ${gpsLoading ? "animate-spin" : ""}`} />
                    <span>{gpsLoading ? "Detecting..." : "Detect GPS"}</span>
                  </button>
                </div>

                {/* Saved Address Quick Pills */}
                {customer?.addresses && customer.addresses.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 block">
                      Saved Addresses (Tap to fill):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {customer.addresses.map((addr) => (
                        <div
                          key={addr.id}
                          className="flex items-center bg-brand-cream border border-brand-border rounded-xl text-xs overflow-hidden"
                        >
                          <button
                            type="button"
                            onClick={() => handleSelectSavedAddress(addr)}
                            className="px-3 py-1.5 font-bold text-brand-950 hover:bg-brand-700/10 transition text-left"
                          >
                            <span className="text-brand-700">{addr.label}:</span>{" "}
                            <span className="truncate max-w-[140px] inline-block align-bottom">
                              {addr.address}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteAddress(addr.id)}
                            className="px-2 py-1.5 text-stone-400 hover:text-red-600 border-l border-brand-border"
                            title="Delete saved address"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {gpsDistance !== null && (
                  <div
                    className={`p-3 rounded-xl text-xs font-medium flex items-center space-x-2 ${
                      gpsDistance <= maxRadiusKm
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                  >
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span>
                      {gpsDistance <= maxRadiusKm
                        ? `GPS Verified: You are ${gpsDistance}km from Upahar (Within our ${maxRadiusKm}km delivery zone).`
                        : `GPS Alert: You are ${gpsDistance}km away. Online delivery is limited to ${maxRadiusKm}km.`}
                    </span>
                  </div>
                )}

                {gpsError && (
                  <div className="p-3 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs">
                    {gpsError}
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    Select Your Area / Landmark Zone *
                  </label>
                  <select
                    value={selectedLocality.id}
                    onChange={(e) => {
                      const found = TAGARAPUVALASA_LOCALITIES.find(
                        (l) => l.id === e.target.value
                      );
                      if (found) setSelectedLocality(found);
                    }}
                    className="w-full text-xs p-3 rounded-xl border border-brand-border bg-brand-cream focus:outline-none focus:ring-1 focus:ring-brand-700 text-stone-800 font-semibold"
                  >
                    {TAGARAPUVALASA_LOCALITIES.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.area} • ~{loc.distanceKm}km)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    Room No. / Flat / Street Address *
                  </label>
                  <textarea
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    rows={2}
                    placeholder="e.g. Room 304, Boys Hostel Block 2, ANITS Campus, Sangivalasa"
                    className="w-full text-xs p-3 rounded-xl border border-brand-border bg-brand-cream focus:outline-none focus:ring-1 focus:ring-brand-700 text-stone-800 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    Nearby Landmark (Helps Delivery Boy Reach Faster)
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="e.g. Opposite SBI ATM, near canteen gate, Apollo pharmacy"
                    className="w-full text-xs p-3 rounded-xl border border-brand-border bg-brand-cream focus:outline-none focus:ring-1 focus:ring-brand-700 text-stone-800"
                  />
                </div>

                {customer && (
                  <div className="pt-2 border-t border-brand-surface flex flex-wrap items-center justify-between gap-2 text-xs">
                    <label className="flex items-center space-x-2 cursor-pointer font-semibold text-stone-700">
                      <input
                        type="checkbox"
                        checked={saveAddressChecked}
                        onChange={(e) => setSaveAddressChecked(e.target.checked)}
                      />
                      <span className="flex items-center space-x-1">
                        <Bookmark className="w-3.5 h-3.5 text-brand-700" />
                        <span>Save this address to my account</span>
                      </span>
                    </label>

                    {saveAddressChecked && (
                      <div className="flex items-center space-x-1">
                        {["Hostel", "Home", "Work"].map((lbl) => (
                          <button
                            key={lbl}
                            type="button"
                            onClick={() => setAddressLabel(lbl)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition ${
                              addressLabel === lbl
                                ? "bg-brand-700 text-[#DFC17B]"
                                : "bg-stone-100 text-stone-600"
                            }`}
                          >
                            {lbl}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Payment Method with Official Paytm Business QR */}
            <div className="bg-white rounded-3xl p-5 border border-brand-border shadow-xs space-y-4">
              <label className="block text-xs font-extrabold text-brand-600 uppercase tracking-wider">
                {orderType === "DELIVERY" ? "4. Choose Payment Method" : "3. Choose Payment Method"}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("COD")}
                  className={`p-3.5 rounded-2xl border text-left transition flex sm:flex-col items-center sm:items-start gap-2.5 ${
                    paymentMethod === "COD"
                      ? "border-brand-700 bg-brand-700/5 ring-1 ring-brand-700"
                      : "border-brand-border hover:bg-brand-cream"
                  }`}
                >
                  <DollarSign className="w-5 h-5 text-brand-700 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-brand-950 block">
                      Cash on Delivery
                    </span>
                    <span className="text-[10px] text-stone-500">
                      Pay cash at doorstep
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("QR_ON_DELIVERY")}
                  className={`p-3.5 rounded-2xl border text-left transition flex sm:flex-col items-center sm:items-start gap-2.5 ${
                    paymentMethod === "QR_ON_DELIVERY"
                      ? "border-[#002970] bg-[#00BAF2]/10 ring-1 ring-[#002970]"
                      : "border-brand-border hover:bg-brand-cream"
                  }`}
                >
                  <Bike className="w-5 h-5 text-[#002970] flex-shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-brand-950 block">
                      Pay QR on Delivery
                    </span>
                    <span className="text-[10px] text-stone-500">
                      Scan rider Paytm QR at door
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("UPI")}
                  className={`p-3.5 rounded-2xl border text-left transition flex sm:flex-col items-center sm:items-start gap-2.5 ${
                    paymentMethod === "UPI"
                      ? "border-[#002970] bg-[#00BAF2]/10 ring-1 ring-[#002970]"
                      : "border-brand-border hover:bg-brand-cream"
                  }`}
                >
                  <QrCode className="w-5 h-5 text-[#002970] flex-shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-brand-950 block">
                      Pay UPI QR Now
                    </span>
                    <span className="text-[10px] text-stone-500">
                      Paytm, GPay, PhonePe
                    </span>
                  </div>
                </button>
              </div>

              {paymentMethod === "QR_ON_DELIVERY" && (
                <div className="p-3.5 rounded-2xl bg-[#002970]/5 border border-[#00BAF2]/40 text-xs space-y-1">
                  <span className="font-bold text-[#002970] block">
                    📱 Scan Paytm Business QR when Food Arrives
                  </span>
                  <p className="text-stone-600 text-[11px]">
                    Our delivery partner will present the official{" "}
                    <strong>{storeSettings?.upiMerchantName || "Suravajjula Sai Sri Vamsi"}</strong>{" "}
                    Paytm QR code at your doorstep. Pay ₹{grandTotal} cleanly via GPay, PhonePe, or Paytm!
                  </p>
                </div>
              )}

              {paymentMethod === "UPI" && (
                <div className="space-y-3 pt-1">
                  <PaymentQRCard
                    amount={grandTotal}
                    orderNumber="NEW-ORDER"
                    upiId={storeSettings?.upiId || "paytm.s2fno8y@pty"}
                    merchantName={storeSettings?.upiMerchantName || "Suravajjula Sai Sri Vamsi"}
                    paymentQrUrl={storeSettings?.paymentQrUrl || "/images/payment-qr.jpg"}
                    compact
                  />
                  <div className="p-3 rounded-2xl bg-brand-cream border border-brand-border space-y-1.5">
                    <label className="block text-[11px] font-bold text-stone-700">
                      Optional: Enter UPI Ref / UTR Number (or pay later on tracking screen)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 431592817264"
                      value={upiTransactionId}
                      onChange={(e) => setUpiTransactionId(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 bg-white font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Place Order CTA Button */}
            <button
              type="submit"
              disabled={
                isSubmitting ||
                Boolean(emergencyStopNotice) ||
                Boolean(closedHoursNotice) ||
                belowMinDelivery ||
                (orderType === "DELIVERY" && !deliveryCalc.isEligible)
              }
              className="btn-maroon-gold w-full py-4 rounded-2xl text-sm font-black flex items-center justify-center space-x-2 shadow-xl shadow-brand-700/20 transition disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01]"
            >
              <span>
                {emergencyStopNotice
                  ? "Ordering Temporarily Paused"
                  : closedHoursNotice
                  ? "Store Closed • Opens 6:00 AM / 12:00 PM"
                  : belowMinDelivery
                  ? `Add ₹${Math.ceil(minDeliveryOrderAmount - subtotal)} more (Min Delivery ₹${minDeliveryOrderAmount})`
                  : isSubmitting
                  ? "Placing Your Order..."
                  : `Place Order • ₹${grandTotal}`}
              </span>
            </button>
          </form>

          {/* Right Column: Order Summary + Coupons (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-brand-border shadow-sm space-y-4 sticky top-24">
              <div className="flex items-center justify-between pb-3 border-b border-brand-border">
                <h3 className="text-base font-black text-brand-950 font-display">
                  Order Summary
                </h3>
                <span className="text-xs text-stone-400 font-bold">
                  {items.length} {items.length === 1 ? "Item" : "Items"}
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {items.map(({ foodItem, quantity }) => (
                  <div
                    key={foodItem.id}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <span className="font-bold text-brand-700 bg-brand-700/10 w-5 h-5 rounded-md flex items-center justify-center text-[11px] flex-shrink-0">
                        {quantity}x
                      </span>
                      <span className="font-bold text-brand-950 truncate">
                        {foodItem.name}
                      </span>
                    </div>
                    <span className="font-bold text-brand-950 flex-shrink-0">
                      ₹{foodItem.price * quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Promo Code / Coupon Box */}
              <div className="pt-3 border-t border-brand-border space-y-2.5">
                <div className="flex items-center space-x-1.5 text-xs font-extrabold text-brand-600 uppercase tracking-wider">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Promo Code & Offers</span>
                </div>

                {appliedCoupon ? (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-black text-emerald-900 block">
                        🎉 {appliedCoupon.code} Applied (-₹{discountAmount})
                      </span>
                      <span className="text-[10px] text-emerald-700">
                        {appliedCoupon.description}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="p-1 text-red-500 hover:bg-red-50 rounded-lg"
                      title="Remove coupon"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter code (e.g. ANITS10)"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        className="flex-1 text-xs px-3 py-2 rounded-xl border border-brand-border bg-brand-cream font-mono uppercase font-bold"
                      />
                      <button
                        type="button"
                        disabled={applyingCoupon || !couponInput.trim()}
                        onClick={() => handleApplyCoupon()}
                        className="px-4 py-2 rounded-xl bg-brand-700 text-[#DFC17B] text-xs font-black disabled:opacity-50 transition"
                      >
                        {applyingCoupon ? "..." : "Apply"}
                      </button>
                    </div>

                    {couponError && (
                      <p className="text-[11px] font-semibold text-red-600">{couponError}</p>
                    )}

                    {availableCoupons.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {availableCoupons.map((cp) => (
                          <button
                            key={cp.id}
                            type="button"
                            onClick={() => handleApplyCoupon(cp.code)}
                            className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-brand-cream border border-dashed border-[#D4AF37] text-brand-700 hover:bg-brand-700/10 transition"
                            title={cp.description}
                          >
                            {cp.code} ({cp.discountType === "PERCENT" ? `${cp.discountValue}% OFF` : `₹${cp.discountValue} OFF`})
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {specialNotes && (
                <div className="p-3 rounded-xl bg-brand-cream border border-brand-border text-[11px] text-stone-600">
                  <span className="font-bold block text-brand-700">Kitchen Note:</span>
                  <span>{specialNotes}</span>
                </div>
              )}

              {/* Bill Details */}
              <div className="pt-3 border-t border-brand-border space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Item Subtotal</span>
                  <span className="font-bold text-brand-950">₹{subtotal}</span>
                </div>

                {packagingFee > 0 && (
                  <div className="flex justify-between text-stone-600">
                    <span>Parcel &amp; Packaging Fee</span>
                    <span className="font-bold text-brand-950">₹{packagingFee}</span>
                  </div>
                )}

                {orderType === "DELIVERY" && (
                  <div className="flex justify-between text-stone-600">
                    <span className="flex items-center space-x-1">
                      <span>Delivery Fee</span>
                      <span className="text-[10px] text-stone-400">
                        (~{activeDistance}km)
                      </span>
                    </span>
                    <span className="font-bold text-brand-950">
                      {deliveryCalc.isFree ? (
                        <span className="text-emerald-700 font-black">FREE</span>
                      ) : (
                        `₹${deliveryCalc.fee}`
                      )}
                    </span>
                  </div>
                )}

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Promo Discount ({appliedCoupon?.code})</span>
                    <span>- ₹{discountAmount}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-brand-surface flex justify-between items-center text-sm">
                  <span className="font-bold text-brand-950">Total Payable</span>
                  <span className="text-xl font-black text-brand-700 font-display">
                    ₹{grandTotal}
                  </span>
                </div>
              </div>

              {/* Hygiene Guarantee */}
              <div className="p-3 rounded-2xl bg-[#EBF3E8] text-[#2D5A27] text-[11px] font-bold flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span>Hygienic Kitchen • Fresh Ingredients • 4-Digit Delivery OTP</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
