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
  ShoppingBag,
  Bike,
  DollarSign,
  ShieldAlert,
  Globe,
} from "lucide-react";
import { FoodItem, Category, GalleryImage, ContactMessage, Order } from "@/types";
import { useRealtimeEvents } from "@/hooks/useRealtimeEvents";

export default function AdminDashboardPage() {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderStats, setOrderStats] = useState<any>(null);
  const [storeSettings, setStoreSettings] = useState<any>(null);
  const [storeStatus, setStoreStatus] = useState<any>(null);
  const [subsites, setSubsites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [menuRes, catRes, galRes, msgRes, restRes, ordersRes] = await Promise.all([
        fetch("/api/menu?includeInactive=true"),
        fetch("/api/categories"),
        fetch("/api/gallery"),
        fetch("/api/contact"),
        fetch("/api/restaurant"),
        fetch("/api/orders?limit=50&stats=true"),
      ]);

      const [menuData, catData, galData, msgData, restData, ordersData] = await Promise.all([
        menuRes.json(),
        catRes.json(),
        galRes.json(),
        msgRes.json(),
        restRes.json(),
        ordersRes.json(),
      ]);

      if (menuData.items) setItems(menuData.items);
      if (catData.categories) setCategories(catData.categories);
      if (galData.images) setGalleryImages(galData.images);
      if (msgData.messages) setMessages(msgData.messages);
      if (restData.settings) setStoreSettings(restData.settings);
      if (restData.storeStatus) setStoreStatus(restData.storeStatus);
      if (Array.isArray(restData.subsites)) setSubsites(restData.subsites);
      if (ordersData.orders) setOrders(ordersData.orders);
      if (ordersData.stats) setOrderStats(ordersData.stats);
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

  // Instant real-time updates for revenue, orders, and emergency status
  useRealtimeEvents({
    onOrderCreated: () => fetchData(),
    onOrderDelivered: () => fetchData(),
    onOrderUpdated: () => fetchData(),
    onEmergencyStopChanged: (payload) => {
      setStoreSettings((prev: any) =>
        prev
          ? {
              ...prev,
              isEmergencyWebsiteStopped: payload.isEmergencyWebsiteStopped,
              isEmergencyClosed: payload.isEmergencyClosed,
            }
          : prev
      );
    },
  });

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

  const handleToggleEmergencyWebsiteStop = async () => {
    if (!storeSettings) return;
    const newStatus = !storeSettings.isEmergencyWebsiteStopped;
    try {
      const res = await fetch("/api/restaurant", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEmergencyWebsiteStopped: newStatus }),
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
  const pendingOrdersCount = orders.filter((o) => o.status === "PENDING").length;
  const cookingOrdersCount = orders.filter((o) => o.status === "CONFIRMED" || o.status === "PREPARING" || o.status === "FOOD_READY").length;
  
  const deliveredOrders = orders.filter((o) => o.status === "DELIVERED");
  const totalRevenue =
    orderStats?.totalRevenue ?? deliveredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const todayRevenue =
    orderStats?.todayRevenue ??
    deliveredOrders
      .filter((o) => new Date(o.createdAt).toDateString() === new Date().toDateString())
      .reduce((sum, o) => sum + o.totalAmount, 0);

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

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleToggleEmergencyWebsiteStop}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center space-x-1.5 shadow-sm ${
              storeSettings?.isEmergencyWebsiteStopped
                ? "bg-red-600 text-white animate-pulse"
                : "bg-red-50 border border-red-300 text-red-700 hover:bg-red-100"
            }`}
            title="Instant kill-switch to pause all online orders"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>
              {storeSettings?.isEmergencyWebsiteStopped
                ? "🚨 ORDERS STOPPED (Click to Resume)"
                : "Emergency Stop Orders"}
            </span>
          </button>

          <button
            onClick={handleToggleEmergencyClose}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              storeSettings?.isEmergencyClosed
                ? "bg-[#2D5A27] text-white hover:bg-emerald-800"
                : "bg-stone-800 text-stone-200 hover:bg-stone-900"
            }`}
          >
            {storeSettings?.isEmergencyClosed ? "Store: OPEN" : "Store: Closed"}
          </button>
        </div>
      </div>

      {/* 4 Sub-Websites Quick Control Strip */}
      {subsites.length > 0 && (
        <div className="bg-white p-5 rounded-3xl border border-[#EADBCE] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#580D1A]" />
              <h2 className="text-sm font-black text-[#2B070E] font-display">
                4 Upahar Sub-Websites Live Status
              </h2>
            </div>
            <Link
              href="/admin/websites"
              className="text-xs font-bold text-[#580D1A] hover:underline flex items-center gap-1"
            >
              <span>Manage All 4 Websites, Photos, Prices &amp; Timings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {subsites.map((site) => (
              <Link
                key={site.id}
                href="/admin/websites"
                className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE] hover:border-[#D4AF37] transition flex items-center gap-3"
              >
                <img
                  src={site.heroImage}
                  alt={site.title}
                  className="w-11 h-11 rounded-full object-cover border border-[#D4AF37]/60 flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black text-[#2B070E] truncate">{site.title}</div>
                  <div className="text-[10px] text-stone-500 truncate">{site.status?.timingText}</div>
                  <span
                    className={`inline-block mt-1 text-[9px] font-black px-2 py-0.5 rounded-full ${
                      site.status?.isOpen
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-900"
                    }`}
                  >
                    {site.status?.statusLabel} • {site.itemCount} items
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Live Orders Highlight Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-[#580D1A] to-[#2B070E] text-white shadow-lg border border-[#D4AF37]/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-[#D4AF37]/40 flex items-center justify-center text-[#DFC17B] relative">
            <ShoppingBag className="w-6 h-6" />
            {pendingOrdersCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-ping" />
            )}
            {pendingOrdersCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                {pendingOrdersCount}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-black text-white font-display">
                Kitchen Live Order Desk
              </h2>
              <span className="bg-red-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                5km Tagarapuvalasa
              </span>
            </div>
            <p className="text-xs text-stone-300 mt-0.5">
              {pendingOrdersCount > 0
                ? `🚨 ${pendingOrdersCount} new pending order(s) awaiting kitchen confirmation!`
                : `${cookingOrdersCount} order(s) currently being cooked in kitchen.`}
            </p>
          </div>
        </div>

        <Link
          href="/admin/orders"
          className="btn-gold px-5 py-2.5 rounded-xl text-xs font-black flex items-center space-x-2 shadow-md hover:scale-105 transition"
        >
          <span>Open Live Kitchen Desk</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Total Revenue Generation */}
        <div className="p-6 rounded-2xl bg-white border border-[#EADBCE] shadow-sm space-y-2">
          <div className="flex justify-between items-center text-stone-400">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Total Revenue
            </span>
            <DollarSign className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-3xl font-black text-[#580D1A] font-display">
            ₹{totalRevenue}
          </div>
          <span className="text-[11px] text-emerald-700 font-bold block">
            ₹{todayRevenue} Generated Today
          </span>
          {orderStats && (
            <div className="pt-1 flex items-center justify-between text-[10px] text-stone-500 font-semibold border-t border-[#F4EFE6]">
              <span>COD: ₹{orderStats.codRevenue}</span>
              <span>UPI QR: ₹{orderStats.upiRevenue}</span>
              {orderStats.avgRating && (
                <span className="text-amber-600 font-black">★ {orderStats.avgRating}/5</span>
              )}
            </div>
          )}
        </div>

        {/* Metric 2: Live Orders */}
        <Link
          href="/admin/orders"
          className="p-6 rounded-2xl bg-white border border-[#EADBCE] hover:border-[#580D1A] transition shadow-sm space-y-2 block"
        >
          <div className="flex justify-between items-center text-stone-400">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Live Orders
            </span>
            <ShoppingBag className="w-4 h-4 text-[#580D1A]" />
          </div>
          <div className="text-3xl font-black text-[#2B070E] font-display flex items-center gap-2">
            <span>{orders.length}</span>
            {pendingOrdersCount > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-red-100 text-red-700">
                {pendingOrdersCount} New
              </span>
            )}
          </div>
          <span className="text-[11px] text-[#2D5A27] font-semibold block">
            {cookingOrdersCount} Cooking / Ready
          </span>
        </Link>

        {/* Metric 3: Delivery Agents Fleet */}
        <Link
          href="/admin/delivery-agents"
          className="p-6 rounded-2xl bg-white border border-[#EADBCE] hover:border-[#580D1A] transition shadow-sm space-y-2 block"
        >
          <div className="flex justify-between items-center text-stone-400">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Delivery Fleet
            </span>
            <Bike className="w-4 h-4 text-[#580D1A]" />
          </div>
          <div className="text-3xl font-black text-[#2B070E] font-display">
            Tagarapuvalasa
          </div>
          <span className="text-[11px] text-[#580D1A] font-bold block">
            Manage Registered Riders →
          </span>
        </Link>

        {/* Metric 4: Total Menu Dishes */}
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
            Tiffins, Biryanis, Fast Foods &amp; Pickles
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
