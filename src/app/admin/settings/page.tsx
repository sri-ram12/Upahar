"use client";

import React, { useState, useEffect } from "react";
import { RestaurantSetting, Coupon } from "@/types";
import Link from "next/link";
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  Compass,
  Phone,
  ShieldCheck,
  Bike,
  QrCode,
  Tag,
  Plus,
  Globe,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<RestaurantSetting | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponDesc, setNewCouponDesc] = useState("");
  const [newCouponType, setNewCouponType] = useState<"FLAT" | "PERCENT">("FLAT");
  const [newCouponValue, setNewCouponValue] = useState("25");
  const [newCouponMin, setNewCouponMin] = useState("149");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchSettings = async () => {
    try {
      const [res, coupRes] = await Promise.all([
        fetch("/api/restaurant"),
        fetch("/api/coupons?all=true"),
      ]);
      const data = await res.json();
      const coupData = await coupRes.json();
      if (data.settings) setSettings(data.settings);
      if (coupData.coupons) setCoupons(coupData.coupons);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/restaurant", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to update restaurant settings.");
      } else {
        setSuccessMsg("Restaurant settings, dining sessions, and brand information saved successfully!");
        setSettings(data.settings);
      }
    } catch (e) {
      console.error(e);
      setErrorMsg("An unexpected error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#580D1A]" />
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-4xl bg-[#FAF7F2] min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-[#EADBCE] shadow-sm">
        <div>
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#74171E] block">
            Brand & Restaurant Profile
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2B070E] font-display">
            Restaurant Settings & Timings
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Configure contact details, physical address, delivery fees, and global controls.
          </p>
        </div>

        <Link
          href="/admin/websites"
          className="btn-maroon-gold px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
        >
          <Globe className="w-4 h-4 text-[#DFC17B]" />
          <span>4 Sub-Websites Controls</span>
        </Link>
      </div>

      {successMsg && (
        <div className="p-4 bg-[#EBF3E8] border border-[#2D5A27]/30 rounded-2xl flex items-center space-x-2 text-[#2D5A27] text-xs">
          <CheckCircle2 className="w-4 h-4 text-[#2D5A27] flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center space-x-2 text-red-800 text-xs">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Card 1: Brand & Headings */}
        <div className="bg-white p-6 rounded-3xl border border-[#EADBCE] shadow-sm space-y-4">
          <h2 className="text-base font-bold text-[#2B070E] border-b border-[#F4EFE6] pb-2 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-[#580D1A]" />
            <span>Brand Identity & Taglines</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-stone-700 block">Restaurant Name</label>
              <input
                type="text"
                value={settings.restaurantName}
                onChange={(e) => setSettings({ ...settings, restaurantName: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl font-semibold text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-stone-700 block">Brand Tagline</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl font-semibold text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-stone-700 block">Hero Main Headline</label>
            <input
              type="text"
              value={settings.heroHeadline || ""}
              onChange={(e) => setSettings({ ...settings, heroHeadline: e.target.value })}
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl font-semibold text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-stone-700 block">Hero Subheadline Statement</label>
            <textarea
              rows={2}
              value={settings.heroSubheadline || ""}
              onChange={(e) => setSettings({ ...settings, heroSubheadline: e.target.value })}
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl font-semibold text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-stone-700 block">Story Section Text</label>
            <textarea
              rows={3}
              value={settings.storyText || ""}
              onChange={(e) => setSettings({ ...settings, storyText: e.target.value })}
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl font-semibold text-xs"
            />
          </div>
        </div>

        {/* Card 2: Contact & Location Details */}
        <div className="bg-white p-6 rounded-3xl border border-[#EADBCE] shadow-sm space-y-4">
          <h2 className="text-base font-bold text-[#2B070E] border-b border-[#F4EFE6] pb-2 flex items-center space-x-2">
            <Compass className="w-4 h-4 text-[#580D1A]" />
            <span>Contact & Physical Address</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-stone-700 block">Telephone Number</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl font-semibold text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-stone-700 block">WhatsApp Number</label>
              <input
                type="text"
                value={settings.whatsappNumber}
                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl font-semibold text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-stone-700 block">Email Address</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl font-semibold text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-stone-700 block">Full Physical Address</label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl font-semibold text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-stone-700 block">Landmark</label>
              <input
                type="text"
                value={settings.landmark || ""}
                onChange={(e) => setSettings({ ...settings, landmark: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl font-semibold text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-stone-700 block">Google Maps Link</label>
              <input
                type="url"
                value={settings.googleMapsUrl}
                onChange={(e) => setSettings({ ...settings, googleMapsUrl: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl font-semibold text-xs"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Operating Hours & Dining Sessions */}
        <div className="bg-white p-6 rounded-3xl border border-[#EADBCE] shadow-sm space-y-4">
          <h2 className="text-base font-bold text-[#2B070E] border-b border-[#F4EFE6] pb-2 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-[#580D1A]" />
            <span>Operating Hours & Dining Sessions</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-stone-700 block">Opening Time (24h)</label>
              <input
                type="time"
                value={settings.openingTime}
                onChange={(e) => setSettings({ ...settings, openingTime: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl font-semibold text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-stone-700 block">Closing Time (24h)</label>
              <input
                type="time"
                value={settings.closingTime}
                onChange={(e) => setSettings({ ...settings, closingTime: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl font-semibold text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <label className="font-bold text-stone-700 block">Breakfast Session Label</label>
              <input
                type="text"
                value={settings.breakfastHours || "6:30 AM – 11:30 AM"}
                onChange={(e) => setSettings({ ...settings, breakfastHours: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl font-semibold text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-stone-700 block">Lunch Session Label</label>
              <input
                type="text"
                value={settings.lunchHours || "11:30 AM – 4:00 PM"}
                onChange={(e) => setSettings({ ...settings, lunchHours: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl font-semibold text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-stone-700 block">Evening Snacks Session Label</label>
              <input
                type="text"
                value={settings.eveningHours || "4:00 PM – 8:00 PM"}
                onChange={(e) => setSettings({ ...settings, eveningHours: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl font-semibold text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-stone-700 block">Dinner Session Label</label>
              <input
                type="text"
                value={settings.dinnerHours || "8:00 PM – 11:00 PM"}
                onChange={(e) => setSettings({ ...settings, dinnerHours: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl font-semibold text-xs"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#F4EFE6]">
            <label className="flex items-center space-x-3 p-3 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE] cursor-pointer">
              <input
                type="checkbox"
                checked={settings.isEmergencyClosed}
                onChange={(e) => setSettings({ ...settings, isEmergencyClosed: e.target.checked })}
              />
              <div>
                <span className="font-bold text-[#2B070E] block">
                  Mark Restaurant Temporarily Closed
                </span>
                <span className="text-[11px] text-stone-500">
                  Activates temporary closed banner across the site for kitchen cleaning or holiday.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Card 4: Online Orders & Tagarapuvalasa Delivery Zone */}
        <div className="bg-white p-6 rounded-3xl border border-[#EADBCE] shadow-sm space-y-4">
          <h2 className="text-base font-bold text-[#2B070E] border-b border-[#F4EFE6] pb-2 flex items-center space-x-2">
            <Bike className="w-4 h-4 text-[#580D1A]" />
            <span>Online Orders & Tagarapuvalasa 5km Delivery Configuration</span>
          </h2>

          <div className="space-y-3">
            <label className="flex items-center space-x-3 p-3 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE] cursor-pointer">
              <input
                type="checkbox"
                checked={settings.isOnlineOrderingEnabled ?? true}
                onChange={(e) =>
                  setSettings({ ...settings, isOnlineOrderingEnabled: e.target.checked })
                }
              />
              <div>
                <span className="font-bold text-[#2B070E] block">
                  Enable Online Food Ordering
                </span>
                <span className="text-[11px] text-stone-500">
                  Allows customers to add items to cart and place orders for doorstep delivery or takeaway.
                </span>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-3 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE] cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enforceStoreHours ?? true}
                onChange={(e) =>
                  setSettings({ ...settings, enforceStoreHours: e.target.checked })
                }
              />
              <div>
                <span className="font-bold text-[#2B070E] block">
                  Enforce Sub-Website Operating Schedules
                </span>
                <span className="text-[11px] text-stone-500">
                  Enforces Tiffins (6–10:30 AM &amp; 5–10:30 PM), Biryanis (12–10:30 PM), Fast Foods (5–10:30 PM), and Pickles (24×7 Anytime).
                </span>
              </div>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 pt-2">
              <div className="space-y-1">
                <label className="font-bold text-stone-700 block">
                  Max Radius (km)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={settings.deliveryRadiusKm ?? 5.0}
                  onChange={(e) =>
                    setSettings({ ...settings, deliveryRadiusKm: parseFloat(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl font-semibold text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700 block">
                  Min Delivery Order (₹)
                </label>
                <input
                  type="number"
                  value={settings.minDeliveryOrderAmount ?? 60}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      minDeliveryOrderAmount: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl font-semibold text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700 block">
                  Parcel Packaging (₹)
                </label>
                <input
                  type="number"
                  value={settings.packagingFee ?? 10}
                  onChange={(e) =>
                    setSettings({ ...settings, packagingFee: parseFloat(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl font-semibold text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700 block">
                  Base Delivery Fee (₹)
                </label>
                <input
                  type="number"
                  value={settings.deliveryBaseFee ?? 25}
                  onChange={(e) =>
                    setSettings({ ...settings, deliveryBaseFee: parseFloat(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl font-semibold text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700 block">
                  Free Delivery Above (₹)
                </label>
                <input
                  type="number"
                  value={settings.minOrderFreeDelivery ?? 199}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      minOrderFreeDelivery: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl font-semibold text-xs"
                />
              </div>
            </div>

            <div className="pt-1">
              <label className="font-bold text-stone-700 block">
                FSSAI License No. (Optional — printed on Customer Bill Receipts)
              </label>
              <input
                type="text"
                placeholder="e.g. 20124000000123"
                value={settings.fssaiNumber || ""}
                onChange={(e) => setSettings({ ...settings, fssaiNumber: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl font-semibold text-xs mt-1 font-mono"
              />
            </div>

            <div className="pt-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-stone-700 block">
                    Official Business UPI ID (Paytm / GPay / PhonePe)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. paytm.s2fno8y@pty"
                    value={settings.upiId || "paytm.s2fno8y@pty"}
                    onChange={(e) => setSettings({ ...settings, upiId: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl font-semibold text-xs mt-1 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block">
                    Merchant / Payee Display Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Suravajjula Sai Sri Vamsi"
                    value={settings.upiMerchantName || "Suravajjula Sai Sri Vamsi"}
                    onChange={(e) =>
                      setSettings({ ...settings, upiMerchantName: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl font-semibold text-xs mt-1"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE] flex flex-col sm:flex-row items-center gap-4">
                <img
                  src={settings.paymentQrUrl || "/images/payment-qr.jpg"}
                  alt="Business Payment QR"
                  className="w-24 h-28 object-contain rounded-xl border border-stone-200 bg-white p-1"
                />
                <div className="flex-1 space-y-2 w-full">
                  <label className="font-bold text-stone-700 block">
                    Business Payment QR Image URL (Displayed at Checkout, Tracking & Delivery App)
                  </label>
                  <input
                    type="text"
                    value={settings.paymentQrUrl || "/images/payment-qr.jpg"}
                    onChange={(e) => setSettings({ ...settings, paymentQrUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#EADBCE] rounded-xl font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="btn-maroon-gold px-7 py-3 rounded-2xl font-bold uppercase tracking-wider flex items-center space-x-2"
          >
            <Save className="w-4 h-4 text-[#DFC17B]" />
            <span>{saving ? "Saving Changes..." : "Save All Settings"}</span>
          </button>
        </div>
      </form>

      {/* Card 5: Promo Coupons Management */}
      <div className="bg-white p-6 rounded-3xl border border-[#EADBCE] shadow-sm space-y-5 text-xs">
        <div className="border-b border-[#F4EFE6] pb-3">
          <h2 className="text-base font-bold text-[#2B070E] flex items-center space-x-2">
            <Tag className="w-4 h-4 text-[#580D1A]" />
            <span>Promo Codes & Student Offers (Checkout Discounts)</span>
          </h2>
          <p className="text-[11px] text-stone-500 mt-0.5">
            Create or pause discount codes visible to Tagarapuvalasa & ANITS customers during checkout.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 items-end">
          <div>
            <label className="font-bold text-stone-600 block mb-1">Code</label>
            <input
              type="text"
              placeholder="e.g. GHEE20"
              value={newCouponCode}
              onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 rounded-xl border border-[#EADBCE] bg-[#FAF7F2] font-mono font-bold uppercase"
            />
          </div>
          <div>
            <label className="font-bold text-stone-600 block mb-1">Type</label>
            <select
              value={newCouponType}
              onChange={(e) => setNewCouponType(e.target.value as "FLAT" | "PERCENT")}
              className="w-full px-3 py-2 rounded-xl border border-[#EADBCE] bg-[#FAF7F2] font-semibold"
            >
              <option value="FLAT">Flat ₹ Off</option>
              <option value="PERCENT">Percent % Off</option>
            </select>
          </div>
          <div>
            <label className="font-bold text-stone-600 block mb-1">Discount</label>
            <input
              type="number"
              value={newCouponValue}
              onChange={(e) => setNewCouponValue(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#EADBCE] bg-[#FAF7F2] font-bold"
            />
          </div>
          <div>
            <label className="font-bold text-stone-600 block mb-1">Min Order (₹)</label>
            <input
              type="number"
              value={newCouponMin}
              onChange={(e) => setNewCouponMin(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#EADBCE] bg-[#FAF7F2] font-bold"
            />
          </div>
          <button
            type="button"
            onClick={async () => {
              if (!newCouponCode.trim()) return;
              const res = await fetch("/api/coupons", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  code: newCouponCode.trim(),
                  description:
                    newCouponDesc ||
                    `${
                      newCouponType === "PERCENT" ? `${newCouponValue}% OFF` : `Flat ₹${newCouponValue} OFF`
                    } on orders ₹${newCouponMin}+`,
                  discountType: newCouponType,
                  discountValue: Number(newCouponValue),
                  minOrderAmount: Number(newCouponMin),
                }),
              });
              if (res.ok) {
                setNewCouponCode("");
                setNewCouponDesc("");
                fetchSettings();
              } else {
                const err = await res.json();
                setErrorMsg(err.error || "Sign in to Admin first to add coupons");
              }
            }}
            className="btn-maroon-gold py-2.5 px-4 rounded-xl font-black flex items-center justify-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5 text-[#DFC17B]" />
            <span>Add Offer</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {coupons.map((cp) => (
            <div
              key={cp.id}
              className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE] flex items-center justify-between gap-2"
            >
              <div>
                <span className="font-mono font-black text-sm text-[#580D1A] block">
                  {cp.code}
                </span>
                <span className="text-[11px] text-stone-600 block">{cp.description}</span>
                <span className="text-[10px] text-stone-400">Used {cp.usageCount} times</span>
              </div>
              <button
                type="button"
                onClick={async () => {
                  const res = await fetch("/api/coupons", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: cp.id, isActive: !cp.isActive }),
                  });
                  if (res.ok) fetchSettings();
                }}
                className={`px-3 py-1 rounded-xl text-[11px] font-black transition ${
                  cp.isActive
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-stone-200 text-stone-600"
                }`}
              >
                {cp.isActive ? "Active" : "Paused"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
