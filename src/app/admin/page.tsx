"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  UtensilsCrossed,
  FolderTree,
  Image as ImageIcon,
  MessageSquare,
  Clock,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Plus,
  Compass,
} from "lucide-react";
import { FoodItem, Category, GalleryImage, ContactMessage } from "@/types";

export default function AdminDashboardPage() {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [storeSettings, setStoreSettings] = useState<any>(null);
  const [storeStatus, setStoreStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [menuRes, catRes, galRes, msgRes, restRes] = await Promise.all([
        fetch("/api/menu?includeInactive=true"),
        fetch("/api/categories"),
        fetch("/api/gallery"),
        fetch("/api/contact"),
        fetch("/api/restaurant"),
      ]);

      const [menuData, catData, galData, msgData, restData] = await Promise.all([
        menuRes.json(),
        catRes.json(),
        galRes.json(),
        msgRes.json(),
        restRes.json(),
      ]);

      if (menuData.items) setItems(menuData.items);
      if (catData.categories) setCategories(catData.categories);
      if (galData.images) setGalleryImages(galData.images);
      if (msgData.messages) setMessages(msgData.messages);
      if (restData.settings) setStoreSettings(restData.settings);
      if (restData.storeStatus) setStoreStatus(restData.storeStatus);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleEmergencyClose = async () => {
    if (!storeSettings) return;
    const newStatus = !storeSettings.isEmergencyClosed;
    try {
      const res = await fetch("/api/restaurant", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEmergencyClosed: newStatus }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleAvailability = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/menu/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !current }),
      });
      if (res.ok) {
        setItems((prev) =>
          prev.map((it) => (it.id === id ? { ...it, isAvailable: !current } : it))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const signatureCount = items.filter((i) => i.isSignature).length;
  const unreadMessagesCount = messages.filter((m) => !m.isRead).length;

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#580D1A]" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 space-y-8 bg-[#FAF7F2] min-h-screen">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#EADBCE] pb-6">
        <div>
          <span className="text-[10px] uppercase tracking-widest font-extrabold text-[#74171E] block">
            Restaurant Management Overview
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2B070E] font-display">
            Upahar Dashboard
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-stone-700 border border-[#EADBCE] hover:bg-[#F4EFE6] transition flex items-center space-x-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <Link
            href="/admin/menu"
            className="btn-maroon-gold px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-[#DFC17B]" />
            <span>Add New Dish</span>
          </Link>
        </div>
      </div>

      {/* Emergency Store Status Banner */}
      <div className="p-5 rounded-2xl bg-white border border-[#EADBCE] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-3">
          <div
            className={`w-3.5 h-3.5 rounded-full ${
              storeStatus?.isOpen
                ? "bg-[#2D5A27] shadow-[0_0_8px_#2D5A27]"
                : "bg-amber-600 shadow-[0_0_8px_#d97706]"
            }`}
          />
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm text-[#2B070E]">
                Live Store Status: {storeStatus?.statusText}
              </span>
              <span className="text-xs text-stone-500 font-medium">
                ({storeSettings?.openingTime} – {storeSettings?.closingTime})
              </span>
            </div>
            <span className="text-xs text-stone-500 block">
              {storeStatus?.subText}
            </span>
          </div>
        </div>

        <button
          onClick={handleToggleEmergencyClose}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            storeSettings?.isEmergencyClosed
              ? "bg-[#2D5A27] text-white hover:bg-emerald-800"
              : "bg-stone-800 text-stone-200 hover:bg-stone-900"
          }`}
        >
          {storeSettings?.isEmergencyClosed ? "Mark Store OPEN" : "Emergency Pause / Close"}
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-2xl bg-white border border-[#EADBCE] shadow-sm space-y-2">
          <div className="flex justify-between items-center text-stone-400">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Total Menu Dishes
            </span>
            <UtensilsCrossed className="w-4 h-4 text-[#580D1A]" />
          </div>
          <div className="text-3xl font-black text-[#2B070E] font-display">
            {items.length}
          </div>
          <span className="text-[11px] text-[#580D1A] font-semibold block">
            {signatureCount} Marked as Chef's Signature
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-[#EADBCE] shadow-sm space-y-2">
          <div className="flex justify-between items-center text-stone-400">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Menu Categories
            </span>
            <FolderTree className="w-4 h-4 text-[#580D1A]" />
          </div>
          <div className="text-3xl font-black text-[#2B070E] font-display">
            {categories.length}
          </div>
          <span className="text-[11px] text-stone-500 font-medium block">
            Tiffins, Dosas, Fast Food & Drinks
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-[#EADBCE] shadow-sm space-y-2">
          <div className="flex justify-between items-center text-stone-400">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Gallery Photos
            </span>
            <ImageIcon className="w-4 h-4 text-[#580D1A]" />
          </div>
          <div className="text-3xl font-black text-[#2B070E] font-display">
            {galleryImages.length}
          </div>
          <span className="text-[11px] text-stone-500 font-medium block">
            Dishes, Live Kitchen & Ambiance
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-[#EADBCE] shadow-sm space-y-2">
          <div className="flex justify-between items-center text-stone-400">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Inquiries Received
            </span>
            <MessageSquare className="w-4 h-4 text-[#580D1A]" />
          </div>
          <div className="text-3xl font-black text-[#2B070E] font-display">
            {messages.length}
          </div>
          <span className="text-[11px] text-[#74171E] font-bold block">
            {unreadMessagesCount} Unread Inquiries
          </span>
        </div>
      </div>

      {/* 2-Column Split: Menu Highlights & Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Menu Dishes Quick Management (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-[#EADBCE] shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <UtensilsCrossed className="w-4 h-4 text-[#580D1A]" />
              <h2 className="text-base font-bold text-[#2B070E]">
                Menu Dishes Quick Stock
              </h2>
            </div>
            <Link
              href="/admin/menu"
              className="text-xs font-bold text-[#580D1A] hover:underline flex items-center space-x-1"
            >
              <span>Manage All Dishes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {items.slice(0, 7).map((dish) => (
              <div
                key={dish.id}
                className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE] flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-stone-200 overflow-hidden relative flex-shrink-0">
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#2B070E] block line-clamp-1">
                      {dish.name}
                    </span>
                    <span className="text-[11px] text-[#580D1A] font-black">
                      ₹{dish.price}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {dish.isSignature && (
                    <span className="hidden sm:inline-block text-[10px] font-black uppercase tracking-wider bg-[#580D1A] text-[#DFC17B] px-2 py-0.5 rounded-md">
                      Signature
                    </span>
                  )}
                  <button
                    onClick={() => handleToggleAvailability(dish.id, dish.isAvailable)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      dish.isAvailable
                        ? "bg-[#EBF3E8] text-[#2D5A27] hover:bg-red-50 hover:text-red-700"
                        : "bg-red-100 text-red-700 hover:bg-emerald-50 hover:text-emerald-700"
                    }`}
                  >
                    {dish.isAvailable ? "Available" : "Sold Out"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Inquiries (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#EADBCE] shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-[#580D1A]" />
                <h2 className="text-base font-bold text-[#2B070E]">
                  Recent Inquiries
                </h2>
              </div>
              <Link
                href="/admin/inquiries"
                className="text-xs font-bold text-[#580D1A] hover:underline flex items-center space-x-1"
              >
                <span>View All ({messages.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {messages.length === 0 ? (
              <div className="text-center py-12 text-stone-400 text-xs">
                No customer inquiries received yet.
              </div>
            ) : (
              <div className="space-y-3">
                {messages.slice(0, 4).map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3.5 rounded-2xl border transition ${
                      !msg.isRead
                        ? "bg-[#FAF7F2] border-[#D4AF37]/50"
                        : "bg-white border-[#EADBCE]"
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-[#2B070E]">{msg.name}</span>
                      <span className="text-[11px] text-stone-400">
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#580D1A] font-semibold block">
                      {msg.contact}
                    </span>
                    <p className="text-xs text-stone-600 mt-1 line-clamp-2">
                      {msg.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#F4EFE6]">
            <Link
              href="/admin/settings"
              className="btn-gold-outline w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2"
            >
              <span>Update Operating Hours & Contact Info</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
