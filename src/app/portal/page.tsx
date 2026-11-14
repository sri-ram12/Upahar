"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  UtensilsCrossed,
  ChefHat,
  Bike,
  ShieldAlert,
  Code2,
  ArrowRight,
  ExternalLink,
  QrCode,
  LayoutDashboard,
  ShoppingBag,
  Sparkles,
  MapPin,
  Settings,
  KeyRound,
  CheckCircle2,
  RefreshCw,
  Play,
  Check,
  AlertTriangle,
  Download,
  Smartphone,
  Layers,
} from "lucide-react";
import { Order } from "@/types";
import { useRealtimeEvents } from "@/hooks/useRealtimeEvents";
import { usePwa } from "@/components/pwa/PwaRegister";

export default function PortalHubPage() {
  const { installApp, isInstalled } = usePwa();
  const [latestOrder, setLatestOrder] = useState<Order | null>(null);
  const [simLoading, setSimLoading] = useState(false);
  const [simStep, setSimStep] = useState<string | null>(null);
  const [simMessage, setSimMessage] = useState<string | null>(null);

  const [emergencyStopped, setEmergencyStopped] = useState(false);
  const [stopping, setStopping] = useState(false);

  const fetchStatus = async () => {
    try {
      const [restRes, ordersRes] = await Promise.all([
        fetch("/api/restaurant"),
        fetch("/api/orders?limit=1"),
      ]);
      const restData = await restRes.json();
      const ordersData = await ordersRes.json();

      if (restData.settings) {
        setEmergencyStopped(Boolean(restData.settings.isEmergencyWebsiteStopped));
      }
      if (ordersData.orders && ordersData.orders.length > 0) {
        setLatestOrder(ordersData.orders[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Real-time SSE push listener for developer portal
  const { isConnected: isRealtimeConnected } = useRealtimeEvents({
    onOrderCreated: () => {
      fetchStatus();
    },
    onOrderUpdated: () => {
      fetchStatus();
    },
    onOrderDelivered: () => {
      fetchStatus();
    },
    onEmergencyStopChanged: (payload) => {
      if (payload.isEmergencyWebsiteStopped !== undefined) {
        setEmergencyStopped(Boolean(payload.isEmergencyWebsiteStopped));
      }
    },
  });

  useEffect(() => {
    fetchStatus();
    // Safety fallback interval every 15s (SSE pushes events instantly)
    const interval = setInterval(fetchStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleEmergencyStop = async () => {
    setStopping(true);
    try {
      const res = await fetch("/api/restaurant", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEmergencyWebsiteStopped: !emergencyStopped }),
      });
      if (res.ok) {
        setEmergencyStopped(!emergencyStopped);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setStopping(false);
    }
  };

  // Seed default delivery boy if not exists
  const handleSeedDemoRider = async () => {
    setSimLoading(true);
    setSimMessage(null);
    try {
      const res = await fetch("/api/delivery/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Ravi Teja",
          phone: "9885455342",
          vehicleNumber: "AP 39 BK 4567",
          pin: "1234",
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSimMessage("✅ Demo Rider Ravi Teja registered! Log into /delivery with Phone: 9885455342 and PIN: 1234");
      } else {
        setSimMessage(data.error || "Rider already registered (Phone: 9885455342, PIN: 1234)");
      }
    } catch (e: any) {
      setSimMessage(e.message || "Failed to seed demo rider");
    } finally {
      setSimLoading(false);
    }
  };

  // Developer Simulator: Step 1 (Create Order)
  const handleSimulateNewOrder = async () => {
    setSimLoading(true);
    setSimMessage(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: "Rahul Sharma (Student)",
          customerPhone: "9885455342",
          orderType: "DELIVERY",
          locality: "ANITS Campus & Hostels",
          deliveryAddress: "Boys Hostel Block 2, Room 304, Sangivalasa",
          landmark: "Near College Gate 2",
          distanceKm: 0.6,
          paymentMethod: "COD",
          simulatorBypassHours: true,
          specialInstructions: "Extra spicy karam podi on the dosa please",
          items: [
            { name: "Ghee Karam Dosa", price: 70, quantity: 2 },
            { name: "Sambar Vada (2 pcs)", price: 50, quantity: 1 },
          ],
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLatestOrder(data.order);
        setSimStep("CREATED");
        setSimMessage(
          `🎉 Step 1 Complete: Order #${data.order.orderNumber} created! Generated Delivery OTP: ${data.order.deliveryOtp}. It is now in PENDING status for the Admin and Kitchen.`
        );
      } else {
        setSimMessage(data.error || "Failed to create order");
      }
    } catch (e: any) {
      setSimMessage(e.message);
    } finally {
      setSimLoading(false);
    }
  };

  // Developer Simulator: Step 2 (Kitchen Start Cooking)
  const handleSimulateCooking = async () => {
    if (!latestOrder) return;
    setSimLoading(true);
    try {
      const res = await fetch(`/api/orders/${latestOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PREPARING", estimatedTime: "15-20 mins" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLatestOrder(data.order);
        setSimStep("PREPARING");
        setSimMessage(`🍳 Step 2 Complete: Kitchen is now cooking Order #${latestOrder.orderNumber}! Customer tracking screen shows 'Cooking Fresh'.`);
      }
    } catch (e: any) {
      setSimMessage(e.message);
    } finally {
      setSimLoading(false);
    }
  };

  // Developer Simulator: Step 3 (Kitchen Food Ready)
  const handleSimulateFoodReady = async () => {
    if (!latestOrder) return;
    setSimLoading(true);
    try {
      const res = await fetch(`/api/orders/${latestOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "FOOD_READY" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLatestOrder(data.order);
        setSimStep("FOOD_READY");
        setSimMessage(`🍽️ Step 3 Complete: Kitchen packaged food! Order #${latestOrder.orderNumber} is marked FOOD_READY, waiting for rider takeup.`);
      }
    } catch (e: any) {
      setSimMessage(e.message);
    } finally {
      setSimLoading(false);
    }
  };

  // Developer Simulator: Step 4 (Rider Takeup)
  const handleSimulateRiderTakeup = async () => {
    if (!latestOrder) return;
    setSimLoading(true);
    try {
      const res = await fetch(`/api/orders/${latestOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "OUT_FOR_DELIVERY" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLatestOrder(data.order);
        setSimStep("OUT_FOR_DELIVERY");
        setSimMessage(`🛵 Step 4 Complete: Delivery rider picked up Order #${latestOrder.orderNumber}! Status is now OUT_FOR_DELIVERY.`);
      }
    } catch (e: any) {
      setSimMessage(e.message);
    } finally {
      setSimLoading(false);
    }
  };

  // Developer Simulator: Step 5 (Verify OTP & Complete Delivery)
  const handleSimulateVerifyOtpAndDeliver = async () => {
    if (!latestOrder) return;
    setSimLoading(true);
    try {
      const res = await fetch(`/api/orders/${latestOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "DELIVERED",
          enteredOtp: latestOrder.deliveryOtp,
          paymentStatus: "PAID",
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLatestOrder(data.order);
        setSimStep("DELIVERED");
        setSimMessage(`✅ Step 5 Complete: Verified Customer OTP (${latestOrder.deliveryOtp})! Order #${latestOrder.orderNumber} marked DELIVERED, ₹${latestOrder.totalAmount} recorded in Admin Revenue!`);
      } else {
        setSimMessage(data.error);
      }
    } catch (e: any) {
      setSimMessage(e.message);
    } finally {
      setSimLoading(false);
    }
  };

  const pwaWebApps = [
    {
      id: "customer-app",
      number: "1",
      name: "Customer Web App",
      title: "UPAHAR Food & Pickles",
      scope: "/",
      manifest: "/manifest.json",
      iconSrc: "/images/upahar_logo.jpg",
      badge: "Customer PWA",
      color: "from-amber-500/15 via-rose-500/10 to-transparent",
      borderColor: "border-amber-400/40",
      accentBadge: "bg-amber-100 text-amber-900 border-amber-300",
      btnGrad: "from-[#580D1A] to-[#2B070E] text-white",
      desc: "Authentic Andhra homemade pickles, hot tiffins, fast food & royal biryanis in Tagarapuvalasa.",
      url: "/",
    },
    {
      id: "admin-app",
      number: "2",
      name: "Admin Panel Web App",
      title: "UPAHAR Owner Command",
      scope: "/admin",
      manifest: "/manifest-admin.json",
      iconSrc: "/icons/admin-192.png",
      badge: "Admin PWA",
      color: "from-sky-500/15 via-blue-500/10 to-transparent",
      borderColor: "border-sky-400/40",
      accentBadge: "bg-sky-100 text-sky-900 border-sky-300",
      btnGrad: "from-[#0F172A] to-[#1E293B] text-white",
      desc: "Live order desk, menu catalog dishes, 4 sub-websites control, rider management, and store settings.",
      url: "/admin",
    },
    {
      id: "kitchen-app",
      number: "3",
      name: "Kitchen Display Web App",
      title: "UPAHAR Cooking Station (KDS)",
      scope: "/kitchen",
      manifest: "/manifest-kitchen.json",
      iconSrc: "/icons/kitchen-192.png",
      badge: "Kitchen PWA",
      color: "from-orange-500/15 via-red-500/10 to-transparent",
      borderColor: "border-orange-400/40",
      accentBadge: "bg-orange-100 text-orange-900 border-orange-300",
      btnGrad: "from-orange-600 to-red-700 text-white",
      desc: "Live order tickets, high-contrast cooking timers, audio chime & 1-click food ready dispatch.",
      url: "/kitchen",
    },
    {
      id: "rider-app",
      number: "4",
      name: "Delivery Rider Web App",
      title: "UPAHAR Rider Console",
      scope: "/delivery",
      manifest: "/manifest-rider.json",
      iconSrc: "/icons/rider-192.png",
      badge: "Rider PWA",
      color: "from-red-500/15 via-orange-500/10 to-transparent",
      borderColor: "border-red-400/40",
      accentBadge: "bg-red-100 text-red-900 border-red-300",
      btnGrad: "from-[#DC2626] to-[#991B1B] text-white",
      desc: "Order dispatch, turn-by-turn navigation, cash/UPI collection & customer OTP delivery verification.",
      url: "/delivery",
    },
    {
      id: "developer-app",
      number: "5",
      name: "Developer Master Web App",
      title: "Master Console (All Controls)",
      scope: "/portal",
      manifest: "/manifest-dev.json",
      iconSrc: "/icons/dev-192.png",
      badge: "Developer PWA",
      color: "from-indigo-500/15 via-purple-500/10 to-transparent",
      borderColor: "border-indigo-400/40",
      accentBadge: "bg-indigo-100 text-indigo-900 border-indigo-300",
      btnGrad: "from-[#1E1B4B] to-[#312E81] text-white",
      desc: "Master system control over all panels, 1-click end-to-end lifecycle simulator, live SSE stream & kill-switch.",
      url: "/portal",
    },
  ];

  const panels = [
    {
      id: "customer",
      role: "Panel 1: Customer Platform",
      title: "Public Website & Online Orders",
      desc: "Menu browsing, dish steppers, customer login/signup, cart drawer, Tagarapuvalasa 7km geofencing, COD/UPI checkout, and live order tracking with secret Delivery OTP.",
      icon: UtensilsCrossed,
      imageIcon: "/images/upahar_logo.jpg",
      color: "from-amber-600 to-amber-700",
      badge: "Public Access",
      primaryLink: { label: "Open Menu & Order", href: "/menu" },
      subLinks: [
        { label: "Light Hub (/)", href: "/" },
        { label: "01. Tiffins", href: "/tiffins" },
        { label: "02. Biryanis", href: "/biryanis" },
        { label: "03. Fast Foods", href: "/fast-food" },
        { label: "04. Pickles (24×7)", href: "/pickles" },
        { label: "My Orders", href: "/orders" },
        { label: "Checkout", href: "/checkout" },
        { label: "Live Tracker", href: latestOrder ? `/orders/${latestOrder.orderNumber}` : "/orders" },
      ],
    },
    {
      id: "admin",
      role: "Panel 2: Restaurant Administration",
      title: "Executive Owner Command Center",
      desc: "Manage live orders, total revenue generation analytics, catalog dishes CRUD, categories, and add new delivery agents to grant them system access.",
      icon: LayoutDashboard,
      imageIcon: "/icons/admin-192.png",
      color: "from-[#580D1A] to-[#2B070E]",
      badge: "Heart of System",
      primaryLink: { label: "Open Admin Dashboard", href: "/admin" },
      subLinks: [
        { label: "4 Websites Control", href: "/admin/websites" },
        { label: "Menu & Photos", href: "/admin/menu" },
        { label: "Live Order Desk", href: "/admin/orders" },
        { label: "Register Riders", href: "/admin/delivery-agents" },
        { label: "7km Store Settings", href: "/admin/settings" },
      ],
    },
    {
      id: "kitchen",
      role: "Panel 3: Kitchen Display System (KDS)",
      title: "Chefs Cooking Station",
      desc: "High-contrast cooking tickets for stove cooks. Loud chime on new orders, timer display, and 1-click 'Food Cooked → Ready for Rider Pickup'.",
      icon: ChefHat,
      imageIcon: "/icons/kitchen-192.png",
      color: "from-orange-600 to-red-700",
      badge: "Kitchen Counter",
      primaryLink: { label: "Open Kitchen KDS", href: "/kitchen" },
      subLinks: [
        { label: "Cooking Tickets Station", href: "/kitchen" },
      ],
    },
    {
      id: "delivery",
      role: "Panel 4: Rider Delivery Desk",
      title: "Delivery Partner Console",
      desc: "Delivery boy login (authorized by admin), pickup ready orders, Google Maps turn-by-turn navigation, enter customer OTP, collect cash/UPI, and confirm delivery.",
      icon: Bike,
      imageIcon: "/icons/rider-192.png",
      color: "from-emerald-700 to-teal-800",
      badge: "Rider App",
      primaryLink: { label: "Open Rider App", href: "/delivery" },
      subLinks: [
        { label: "Active Delivery Runs", href: "/delivery" },
      ],
    },
    {
      id: "developer",
      role: "Panel 5: Developer & Diagnostics",
      title: "Engineering Control Hub",
      desc: "Complete multi-role system test suite, database inspection, emergency kill-switch, API routes, and 1-click lifecycle simulator.",
      icon: Code2,
      imageIcon: "/icons/dev-192.png",
      color: "from-slate-800 to-stone-900",
      badge: "Engineering",
      primaryLink: { label: "API Orders Endpoint", href: "/api/orders" },
      subLinks: [
        { label: "Restaurant API", href: "/api/restaurant" },
        { label: "Menu API", href: "/api/menu" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-10 sm:py-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 bg-[#580D1A]/10 text-[#580D1A] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#DFC17B]" />
            <span>5 Unified Panels Ecosystem</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[#2B070E] font-display">
            UPAHAR Master Command Hub
          </h1>

          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            All 5 dedicated platforms powering online food delivery within the 7km Tagarapuvalasa / Sangivalasa radius.
          </p>
        </div>

        {/* Master Emergency Kill-Switch Bar */}
        <div
          className={`p-5 rounded-3xl border shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition ${
            emergencyStopped
              ? "bg-red-600 text-white border-red-700 animate-pulse"
              : "bg-white text-stone-800 border-[#EADBCE]"
          }`}
        >
          <div className="flex items-center space-x-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                emergencyStopped
                  ? "bg-white text-red-600"
                  : "bg-red-50 text-red-600 border border-red-200"
              }`}
            >
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span
                className={`text-[10px] font-black uppercase tracking-wider block ${
                  emergencyStopped ? "text-red-100" : "text-red-600"
                }`}
              >
                Emergency Control Kill-Switch
              </span>
              <h3 className="text-base font-black font-display">
                {emergencyStopped
                  ? "🚨 WEBSITE ONLINE ORDERS ARE CURRENTLY STOPPED"
                  : "All Systems Operational • Online Orders Enabled"}
              </h3>
              <p
                className={`text-xs mt-0.5 ${
                  emergencyStopped ? "text-red-100" : "text-stone-500"
                }`}
              >
                Admin emergency switch pauses customer ordering across the whole site with 1 click.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center space-x-1.5 ${
                emergencyStopped
                  ? "bg-red-700/80 border-red-500 text-white"
                  : isRealtimeConnected
                  ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                  : "bg-amber-50 border-amber-300 text-amber-800"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isRealtimeConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                }`}
              />
              <span>{isRealtimeConnected ? "Realtime SSE Active (<50ms)" : "Connecting..."}</span>
            </div>

            <button
              onClick={handleToggleEmergencyStop}
              disabled={stopping}
              className={`px-5 py-2.5 rounded-2xl text-xs font-black shadow-md transition hover:scale-105 ${
                emergencyStopped
                  ? "bg-white text-red-700 hover:bg-stone-100"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              {stopping
                ? "Updating..."
                : emergencyStopped
                ? "Resume Online Orders"
                : "Emergency Stop Orders"}
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 5 DEDICATED PROGRESSIVE WEB APPS (PWAs) & MASTER CONTROL */}
        {/* ============================================================ */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#EADBCE] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#580D1A]" />
                <h2 className="text-xl sm:text-2xl font-black text-[#2B070E] font-display">
                  Five Dedicated Progressive Web Apps (PWAs)
                </h2>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Installable on Android, iPhone, Mac & Windows desktop with custom scopes, dedicated icons & isolated sessions.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>PWA Manifests & Service Worker Ready</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {pwaWebApps.map((app) => (
              <div
                key={app.id}
                className={`bg-white rounded-3xl p-5 border ${app.borderColor} shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 relative overflow-hidden group`}
              >
                {/* Background Tint Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${app.color} pointer-events-none opacity-40 group-hover:opacity-70 transition`} />

                <div className="relative z-10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-md bg-white shrink-0 group-hover:scale-105 transition">
                      <Image
                        src={app.iconSrc}
                        alt={app.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${app.accentBadge}`}>
                      App {app.number}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-stone-500 block">
                      {app.name}
                    </span>
                    <h3 className="text-base font-black text-[#2B070E] font-display leading-tight mt-0.5">
                      {app.title}
                    </h3>
                    <p className="text-[11px] text-stone-600 leading-relaxed mt-1 line-clamp-2">
                      {app.desc}
                    </p>
                  </div>

                  <div className="text-[10px] font-mono text-stone-500 space-y-0.5 pt-1 border-t border-stone-200/60">
                    <div className="flex justify-between">
                      <span className="font-semibold text-stone-400">Start URL:</span>
                      <strong className="text-stone-700">{app.url}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-stone-400">Manifest:</span>
                      <strong className="text-stone-700">{app.manifest}</strong>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 pt-2 space-y-2 border-t border-stone-200/60">
                  <Link
                    href={app.url}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-sm transition hover:brightness-110 active:scale-[0.99] bg-gradient-to-r ${app.btnGrad}`}
                  >
                    <span>Launch Web App</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    type="button"
                    onClick={installApp}
                    className="w-full py-2 px-3 rounded-xl text-[11px] font-bold border border-stone-300 bg-white/80 hover:bg-stone-50 text-stone-700 flex items-center justify-center gap-1.5 transition cursor-pointer"
                    title={`Install ${app.name} to Home Screen`}
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Install PWA to Device</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 1-Click Interactive Lifecycle Simulator */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBCE] shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#F4EFE6] pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <Play className="w-5 h-5 text-[#580D1A]" />
                <h2 className="text-lg font-black text-[#2B070E] font-display">
                  Developer 1-Click Flow Simulator
                </h2>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Test the complete journey: Customer Order → Admin & Kitchen Cook → Rider Pickup → Doorstep OTP → Payment.
              </p>
            </div>

            <button
              onClick={handleSeedDemoRider}
              disabled={simLoading}
              className="px-3.5 py-1.5 rounded-xl bg-[#580D1A]/10 text-[#580D1A] hover:bg-[#580D1A] hover:text-[#DFC17B] text-xs font-bold transition flex items-center space-x-1"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Create Demo Rider (PIN: 1234)</span>
            </button>
          </div>

          {simMessage && (
            <div className="p-4 rounded-2xl bg-stone-900 text-stone-100 text-xs font-mono border border-stone-800 leading-relaxed shadow-sm">
              {simMessage}
            </div>
          )}

          {/* Step Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
            <button
              onClick={handleSimulateNewOrder}
              disabled={simLoading || emergencyStopped}
              className="p-3.5 rounded-2xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-left transition space-y-1"
            >
              <span className="text-[10px] font-black uppercase text-amber-800 block">
                Step 1: Customer
              </span>
              <span className="text-xs font-bold text-[#2B070E] block">
                Place Order in Sangivalasa
              </span>
            </button>

            <button
              onClick={handleSimulateCooking}
              disabled={simLoading || !latestOrder}
              className="p-3.5 rounded-2xl border border-orange-300 bg-orange-50 hover:bg-orange-100 text-left transition space-y-1 disabled:opacity-50"
            >
              <span className="text-[10px] font-black uppercase text-orange-800 block">
                Step 2: Kitchen
              </span>
              <span className="text-xs font-bold text-[#2B070E] block">
                Start Cooking Fresh
              </span>
            </button>

            <button
              onClick={handleSimulateFoodReady}
              disabled={simLoading || !latestOrder}
              className="p-3.5 rounded-2xl border border-blue-300 bg-blue-50 hover:bg-blue-100 text-left transition space-y-1 disabled:opacity-50"
            >
              <span className="text-[10px] font-black uppercase text-blue-800 block">
                Step 3: Counter
              </span>
              <span className="text-xs font-bold text-[#2B070E] block">
                Mark Food Ready
              </span>
            </button>

            <button
              onClick={handleSimulateRiderTakeup}
              disabled={simLoading || !latestOrder}
              className="p-3.5 rounded-2xl border border-purple-300 bg-purple-50 hover:bg-purple-100 text-left transition space-y-1 disabled:opacity-50"
            >
              <span className="text-[10px] font-black uppercase text-purple-800 block">
                Step 4: Rider
              </span>
              <span className="text-xs font-bold text-[#2B070E] block">
                Dispatch & Travel
              </span>
            </button>

            <button
              onClick={handleSimulateVerifyOtpAndDeliver}
              disabled={simLoading || !latestOrder}
              className="p-3.5 rounded-2xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-left transition space-y-1 disabled:opacity-50"
            >
              <span className="text-[10px] font-black uppercase text-emerald-800 block">
                Step 5: Doorstep
              </span>
              <span className="text-xs font-bold text-[#2B070E] block">
                Verify OTP & Pay
              </span>
            </button>
          </div>

          {latestOrder && (
            <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE] text-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-[#2B070E]">
                  Active Test Order: <strong>#{latestOrder.orderNumber}</strong> ({latestOrder.customerName})
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#580D1A] text-[#DFC17B]">
                  {latestOrder.status}
                </span>
                <span className="font-mono text-amber-900 bg-amber-100 px-2 py-0.5 rounded font-black">
                  OTP: {latestOrder.deliveryOtp}
                </span>
              </div>

              <Link
                href={`/orders/${latestOrder.orderNumber}`}
                target="_blank"
                className="font-bold text-[#580D1A] hover:underline flex items-center space-x-1"
              >
                <span>Open Live Customer Tracker</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>

        {/* The 5 Dedicated Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {panels.map((panel) => {
            const Icon = panel.icon;
            return (
              <div
                key={panel.id}
                className="bg-white rounded-3xl p-6 border border-[#EADBCE] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-5 group hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-[#F4EFE6]">
                    {panel.imageIcon ? (
                      <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-[#D4AF37]/50 shadow-md bg-white shrink-0 group-hover:scale-105 transition">
                        <Image
                          src={panel.imageIcon}
                          alt={panel.title}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                    ) : (
                      <div
                        className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${panel.color} flex items-center justify-center text-white shadow-md`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                    )}

                    <span className="text-[10px] font-black uppercase tracking-wider bg-stone-100 text-stone-700 px-2.5 py-1 rounded-full">
                      {panel.badge}
                    </span>
                  </div>

                  <div className="pt-4 space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#74171E] block">
                      {panel.role}
                    </span>
                    <h3 className="text-lg font-black text-[#2B070E] font-display group-hover:text-[#580D1A] transition">
                      {panel.title}
                    </h3>
                    <p className="text-xs text-stone-500 leading-relaxed line-clamp-3">
                      {panel.desc}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-[#F4EFE6]">
                  <Link
                    href={panel.primaryLink.href}
                    className="btn-maroon-gold w-full py-2.5 rounded-xl text-xs font-black flex items-center justify-center space-x-2 shadow-sm"
                  >
                    <span>{panel.primaryLink.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#DFC17B]" />
                  </Link>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {panel.subLinks.map((sub) => (
                      <Link
                        key={sub.label}
                        href={sub.href}
                        className="text-[11px] font-bold text-stone-600 hover:text-[#580D1A] bg-[#FAF7F2] hover:bg-[#F4EFE6] px-2.5 py-1 rounded-lg border border-[#EADBCE] transition"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Location & Territory Banner */}
        <div className="p-6 rounded-3xl bg-[#580D1A] text-white border border-[#D4AF37]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-center sm:text-left">
            <MapPin className="w-6 h-6 text-[#DFC17B] flex-shrink-0 hidden sm:block" />
            <div>
              <span className="text-xs font-bold text-[#DFC17B] uppercase tracking-wider block">
                Central Kitchen & Dispatch Station
              </span>
              <p className="text-xs text-stone-200 mt-0.5">
                1-1, Sangivalasa, ANITS College Road, beside SBI • Tagarapuvalasa 531162
              </p>
            </div>
          </div>

          <a
            href="https://maps.app.goo.gl/6611R6FD1JZagSJt9"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold px-4 py-2 rounded-xl text-xs font-black flex items-center space-x-1.5 flex-shrink-0"
          >
            <span>Google Maps GPS</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
