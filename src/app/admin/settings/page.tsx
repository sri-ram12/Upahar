"use client";

import React, { useState, useEffect } from "react";
import { RestaurantSetting } from "@/types";
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  Compass,
  Phone,
  ShieldCheck,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<RestaurantSetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/restaurant");
      const data = await res.json();
      if (data.settings) setSettings(data.settings);
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
            Configure contact details, physical address, daily dining sessions, and homepage statements.
          </p>
        </div>
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
    </div>
  );
}
