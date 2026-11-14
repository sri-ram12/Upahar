"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  MapPin,
  Bike,
  Store,
  Compass,
  Navigation,
  Phone,
  MessageSquare,
  Crosshair,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  LocateFixed,
  Sparkles,
} from "lucide-react";
import "leaflet/dist/leaflet.css";
import { UPAHAR_COORDINATES, TAGARAPUVALASA_LOCALITIES } from "@/lib/delivery-zones";

export interface LiveTrackingMapProps {
  status: string;
  orderType: "DELIVERY" | "TAKEAWAY" | "DINE_IN";
  locality?: string | null;
  deliveryAddress?: string | null;
  customerLat?: number | null;
  customerLng?: number | null;
  riderLat?: number | null;
  riderLng?: number | null;
  riderLocationUpdatedAt?: string | Date | null;
  distanceKm?: number | null;
  riderName?: string | null;
  riderPhone?: string | null;
  riderVehicleNumber?: string | null;
  deliveryOtp?: string | null;
  orderNumber?: string | null;
  orderId?: string | null;
  estimatedTime?: string | null;
  onCustomerLocationUpdate?: (lat: number, lng: number) => Promise<void> | void;
}

export default function LiveTrackingMap({
  status,
  orderType,
  locality,
  deliveryAddress,
  customerLat,
  customerLng,
  riderLat,
  riderLng,
  riderLocationUpdatedAt,
  distanceKm,
  riderName,
  riderPhone,
  riderVehicleNumber,
  deliveryOtp,
  orderNumber,
  orderId,
  estimatedTime,
  onCustomerLocationUpdate,
}: LiveTrackingMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const routePolylineRef = useRef<any>(null);
  const kitchenMarkerRef = useRef<any>(null);
  const customerMarkerRef = useRef<any>(null);
  const riderMarkerRef = useRef<any>(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [calibratingGps, setCalibratingGps] = useState(false);
  const [gpsCalibratedMsg, setGpsCalibratedMsg] = useState<string | null>(null);
  const [simulatedProgress, setSimulatedProgress] = useState(0.4);

  // Match destination from locality preset if coordinates are not directly stored
  const matchedLoc = TAGARAPUVALASA_LOCALITIES.find(
    (l) => l.name === locality || locality?.includes(l.area)
  );
  const destLat = customerLat || matchedLoc?.lat || 17.933;
  const destLng = customerLng || matchedLoc?.lng || 83.417;
  const effectiveDist = distanceKm || matchedLoc?.distanceKm || 1.8;

  // Origin (Upahar Restaurant in Sangivalasa, beside SBI, ANITS College Road)
  const originLat = UPAHAR_COORDINATES.lat;
  const originLng = UPAHAR_COORDINATES.lng;

  // Determine current rider position (live GPS or interpolated along road)
  const hasLiveRiderGps = Boolean(riderLat && riderLng);
  const activeRiderLat = hasLiveRiderGps
    ? riderLat!
    : originLat + (destLat - originLat) * simulatedProgress;
  const activeRiderLng = hasLiveRiderGps
    ? riderLng!
    : originLng + (destLng - originLng) * simulatedProgress;

  // Fallback simulation timer if rider GPS is not broadcasting yet
  useEffect(() => {
    if (hasLiveRiderGps) return;
    if (status !== "OUT_FOR_DELIVERY" && status !== "ARRIVED") return;

    const interval = setInterval(() => {
      setSimulatedProgress((prev) => {
        if (prev >= 0.95) return 0.95;
        return Number((prev + 0.03).toFixed(3));
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [hasLiveRiderGps, status]);

  // Handle Customer Live Location Calibration (Both ends live tracking)
  const handleCalibrateCustomerLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setCalibratingGps(true);
    setGpsCalibratedMsg(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCalibratingGps(false);
        setGpsCalibratedMsg("📍 Doorstep GPS calibrated successfully!");
        setTimeout(() => setGpsCalibratedMsg(null), 5000);

        if (onCustomerLocationUpdate) {
          await onCustomerLocationUpdate(latitude, longitude);
        } else if (orderId) {
          fetch(`/api/orders/${orderId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "UPDATE_CUSTOMER_LOCATION",
              customerLat: latitude,
              customerLng: longitude,
            }),
          }).catch(console.error);
        }
      },
      (err) => {
        setCalibratingGps(false);
        alert(
          "Could not detect location. Please allow browser location access to calibrate your doorstep position."
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Google Maps external turn-by-turn navigation URL
  const gmapsRouteUrl = `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}`;

  // Initialize and update Leaflet Interactive Map
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isSubscribed = true;

    async function initMap() {
      const L = (await import("leaflet")).default;
      if (!isSubscribed || !mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        // Create Leaflet map instance
        const map = L.map(mapContainerRef.current, {
          center: [(originLat + destLat) / 2, (originLng + destLng) / 2],
          zoom: 14,
          zoomControl: false,
          attributionControl: false,
        });

        // Add high-contrast CartoDB Voyager tiles (clean Apple Maps / Google Maps styling)
        L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
          {
            maxZoom: 19,
            subdomains: "abcd",
          }
        ).addTo(map);

        mapInstanceRef.current = map;
        setMapLoaded(true);
      }

      const map = mapInstanceRef.current;
      if (!map) return;

      // 1. Source Marker (Upahar Kitchen, Sangivalasa)
      const kitchenIcon = L.divIcon({
        className: "custom-leaflet-marker",
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
            <div style="background: rgba(255,255,255,0.95); backdrop-filter: blur(4px); border: 1px solid #10b981; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 800; color: #065f46; box-shadow: 0 4px 12px rgba(0,0,0,0.15); white-space: nowrap; margin-bottom: 4px;">
              🏪 UPAHAR Kitchen
            </div>
            <div style="width: 20px; height: 20px; border-radius: 9999px; background: #ffffff; border: 4px solid #10b981; box-shadow: 0 4px 10px rgba(16,185,129,0.4);"></div>
          </div>
        `,
        iconSize: [0, 0],
      });

      if (!kitchenMarkerRef.current) {
        kitchenMarkerRef.current = L.marker([originLat, originLng], {
          icon: kitchenIcon,
          zIndexOffset: 100,
        }).addTo(map);
      } else {
        kitchenMarkerRef.current.setLatLng([originLat, originLng]);
      }

      // 2. Destination Marker (Customer Location)
      const customerIcon = L.divIcon({
        className: "custom-leaflet-marker",
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
            <div style="background: rgba(255,255,255,0.95); backdrop-filter: blur(4px); border: 1px solid #ef4444; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 800; color: #991b1b; box-shadow: 0 4px 12px rgba(0,0,0,0.15); white-space: nowrap; margin-bottom: 4px; max-width: 150px; overflow: hidden; text-overflow: ellipsis;">
              📍 ${deliveryAddress || locality || "Delivery Doorstep"}
            </div>
            <div style="position: relative; width: 22px; height: 22px; border-radius: 9999px; background: #dc2626; border: 3px solid #ffffff; box-shadow: 0 4px 14px rgba(220,38,38,0.5); display: flex; align-items: center; justify-content: center;">
              <div style="width: 6px; height: 6px; border-radius: 9999px; background: #ffffff;"></div>
            </div>
          </div>
        `,
        iconSize: [0, 0],
      });

      if (!customerMarkerRef.current) {
        customerMarkerRef.current = L.marker([destLat, destLng], {
          icon: customerIcon,
          zIndexOffset: 150,
        }).addTo(map);
      } else {
        customerMarkerRef.current.setLatLng([destLat, destLng]);
      }

      // 3. Live Moving Delivery Rider Marker
      const riderIcon = L.divIcon({
        className: "custom-leaflet-marker",
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -50%);">
            <div style="background: #1e1b4b; color: #ffffff; padding: 2px 8px; border-radius: 9999px; font-size: 9px; font-weight: 800; box-shadow: 0 4px 12px rgba(0,0,0,0.25); white-space: nowrap; margin-bottom: 6px; border: 1px solid rgba(255,255,255,0.3); display: flex; align-items: center; gap: 4px;">
              <span style="display: inline-block; width: 6px; height: 6px; border-radius: 9999px; background: #22c55e;"></span>
              <span>🛵 ${riderName || "Rider"} • Live</span>
            </div>
            <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;">
              <div style="position: absolute; inset: -4px; border-radius: 9999px; background: rgba(59,130,246,0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="position: relative; width: 34px; height: 34px; border-radius: 9999px; background: #ffffff; border: 2.5px solid #1e1b4b; box-shadow: 0 4px 15px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e1b4b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="18.5" cy="17.5" r="3.5"/>
                  <circle cx="5.5" cy="17.5" r="3.5"/>
                  <circle cx="15" cy="5" r="1"/>
                  <path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
                </svg>
              </div>
            </div>
          </div>
        `,
        iconSize: [0, 0],
      });

      if (!riderMarkerRef.current) {
        riderMarkerRef.current = L.marker([activeRiderLat, activeRiderLng], {
          icon: riderIcon,
          zIndexOffset: 300,
        }).addTo(map);
      } else {
        riderMarkerRef.current.setLatLng([activeRiderLat, activeRiderLng]);
      }

      // 4. Road Route Polyline (Source -> Rider -> Destination)
      const fetchDrivingRoute = async () => {
        try {
          const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson`;
          const res = await fetch(osrmUrl);
          const data = await res.json();

          let polylineCoords: [number, number][] = [];
          if (data.routes && data.routes[0]?.geometry?.coordinates) {
            polylineCoords = data.routes[0].geometry.coordinates.map(
              ([lng, lat]: [number, number]) => [lat, lng]
            );
          } else {
            // Smooth interpolated waypoint fallback through Sangivalasa & NH-16 corridor
            const midLat = originLat + (destLat - originLat) * 0.5 + 0.001;
            const midLng = originLng + (destLng - originLng) * 0.5 - 0.001;
            polylineCoords = [
              [originLat, originLng],
              [midLat, midLng],
              [destLat, destLng],
            ];
          }

          if (routePolylineRef.current) {
            map.removeLayer(routePolylineRef.current);
          }

          routePolylineRef.current = L.polyline(polylineCoords, {
            color: "#18181b",
            weight: 5,
            opacity: 0.9,
            lineCap: "round",
            lineJoin: "round",
          }).addTo(map);

          // Fit route bounds with padding so everything is nicely centered
          const bounds = L.latLngBounds([
            [originLat, originLng],
            [activeRiderLat, activeRiderLng],
            [destLat, destLng],
          ]);
          map.fitBounds(bounds, { padding: [50, 50] });
        } catch {
          // Direct fallback line
          if (routePolylineRef.current) {
            map.removeLayer(routePolylineRef.current);
          }
          routePolylineRef.current = L.polyline(
            [
              [originLat, originLng],
              [activeRiderLat, activeRiderLng],
              [destLat, destLng],
            ],
            { color: "#18181b", weight: 5, opacity: 0.9 }
          ).addTo(map);
        }
      };

      fetchDrivingRoute();
    }

    initMap();

    return () => {
      isSubscribed = false;
    };
  }, [
    originLat,
    originLng,
    destLat,
    destLng,
    activeRiderLat,
    activeRiderLng,
    riderName,
    deliveryAddress,
    locality,
  ]);

  // Recenter map functions
  const handleRecenterRider = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([activeRiderLat, activeRiderLng], 16, {
      duration: 1.2,
    });
  };

  const handleFitFullRoute = () => {
    if (!mapInstanceRef.current) return;
    const bounds = [
      [originLat, originLng],
      [activeRiderLat, activeRiderLng],
      [destLat, destLng],
    ];
    mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60] });
  };

  // If Takeaway or Dine-in
  if (orderType !== "DELIVERY") {
    return (
      <div className="p-4 sm:p-5 rounded-3xl bg-brand-cream border border-brand-border flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-700 text-[#DFC17B] flex items-center justify-center shadow-md">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-black text-brand-950 block">
              Self-Pickup Counter • Sangivalasa
            </span>
            <span className="text-[11px] text-stone-500">
              Beside SBI, ANITS College Road, Tagarapuvalasa
            </span>
          </div>
        </div>
        <a
          href="https://maps.app.goo.gl/6611R6FD1JZagSJt9"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3.5 py-2 rounded-xl bg-brand-700 text-[#DFC17B] text-xs font-bold flex items-center space-x-1.5 shadow-sm"
        >
          <Compass className="w-4 h-4" />
          <span>Directions</span>
        </a>
      </div>
    );
  }

  const riderPhoneClean = riderPhone?.replace(/\D/g, "");
  const whatsappUrl = riderPhoneClean
    ? `https://wa.me/91${riderPhoneClean}?text=${encodeURIComponent(
        `Hi ${riderName || "Delivery Partner"}, I am waiting for my Upahar Order #${orderNumber || ""}.`
      )}`
    : null;

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-white shadow-xl">
      {/* 1. Leaflet Interactive Map Canvas */}
      <div
        ref={mapContainerRef}
        className="w-full h-[400px] sm:h-[460px] bg-stone-100 z-0"
        style={{ minHeight: "380px" }}
      />

      {/* 2. Top Floating Live Status Strip */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none gap-2">
        <div className="pointer-events-auto bg-white/95 dark:bg-stone-900/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-lg flex items-center gap-2 text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-black text-stone-900 dark:text-white">
            {hasLiveRiderGps
              ? "Live GPS Broadcast Active"
              : status === "OUT_FOR_DELIVERY"
              ? "Rider En Route to Doorstep"
              : status === "ARRIVED"
              ? "Rider Arrived at Your Gate"
              : "Cooking & Packing at Kitchen"}
          </span>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
            ~{effectiveDist} km
          </span>
        </div>

        <div className="pointer-events-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleRecenterRider}
            className="p-2.5 rounded-xl bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:text-black dark:hover:text-white shadow-lg transition cursor-pointer"
            title="Recenter Map on Delivery Rider"
          >
            <Crosshair className="w-4 h-4 text-brand-700" />
          </button>
          <button
            type="button"
            onClick={handleFitFullRoute}
            className="p-2.5 rounded-xl bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:text-black dark:hover:text-white shadow-lg transition cursor-pointer"
            title="Fit Full Route"
          >
            <Compass className="w-4 h-4 text-emerald-600" />
          </button>
        </div>
      </div>

      {/* GPS Calibrated Toast */}
      {gpsCalibratedMsg && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl animate-in fade-in flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span>{gpsCalibratedMsg}</span>
        </div>
      )}

      {/* 3. Rapido / Uber Style Floating Bottom Card */}
      <div className="relative z-10 bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl border-t border-stone-200/80 dark:border-stone-800 p-4 sm:p-5 space-y-3.5 shadow-2xl">
        {/* Top Floating Row: Vehicle & ETA */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200/60 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#A0CB2A] via-[#65B741] to-[#2E8B57] text-white flex items-center justify-center shadow-md">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-stone-900 dark:text-white uppercase tracking-wider">
                  Express Bike Delivery
                </span>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                  FASTEST
                </span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                {status === "OUT_FOR_DELIVERY"
                  ? `~${estimatedTime || "10-15 mins"} away • Dropping at your doorstep`
                  : status === "ARRIVED"
                  ? "🎉 Rider has arrived! Please collect your food."
                  : "Kitchen is preparing fresh food • Rider ready for pickup"}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs font-black text-brand-950 dark:text-white block">
              ~{effectiveDist} km
            </span>
            <span className="text-[10px] text-emerald-600 font-bold block">Direct Route</span>
          </div>
        </div>

        {/* Middle Row: Delivery Partner Info + Direct Contacts */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-stone-100 dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 flex items-center justify-center text-stone-700 dark:text-stone-300 font-black text-base shadow-xs">
              {riderName ? riderName.charAt(0).toUpperCase() : "R"}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-stone-900 dark:text-white">
                  {riderName || "Rider Allocation in Progress"}
                </span>
                <span className="text-[10px] text-amber-500 font-black">★ 4.9</span>
              </div>
              <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400 block mt-0.5">
                {riderVehicleNumber || "Tagarapuvalasa 7km Fleet"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {riderPhoneClean && (
              <>
                <a
                  href={`tel:${riderPhoneClean}`}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Rider</span>
                </a>

                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-sm transition"
                    title="Chat on WhatsApp"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>
                )}
              </>
            )}

            <a
              href={gmapsRouteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold flex items-center gap-1.5 transition"
              title="Open turn-by-turn navigation in Google Maps"
            >
              <Navigation className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Google Maps</span>
            </a>
          </div>
        </div>

        {/* High-Visibility Delivery OTP Box (Crucial for Handover Security) */}
        {deliveryOtp && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-rose-500/10 border border-amber-500/30 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-900 flex items-center justify-center shadow-xs shrink-0 font-black">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 dark:text-amber-300 block">
                  Delivery Verification Code
                </span>
                <p className="text-[11px] text-stone-600 dark:text-stone-400">
                  Give this 4-digit OTP to the rider only after receiving food
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black font-mono tracking-[0.25em] bg-white dark:bg-stone-900 px-3.5 py-1.5 rounded-xl border border-amber-400 text-brand-900 dark:text-amber-300 shadow-xs">
                {deliveryOtp}
              </span>
            </div>
          </div>
        )}

        {/* Both Ends Live Location Action: Customer Calibrate Doorstep GPS */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <button
            type="button"
            onClick={handleCalibrateCustomerLocation}
            disabled={calibratingGps}
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-brand-700 hover:text-brand-900 dark:text-amber-400 hover:underline cursor-pointer disabled:opacity-50"
          >
            <LocateFixed className={`w-3.5 h-3.5 ${calibratingGps ? "animate-spin" : ""}`} />
            <span>
              {calibratingGps
                ? "Calibrating your live phone GPS..."
                : "📍 Calibrate to My Exact Doorstep GPS"}
            </span>
          </button>

          <span className="text-[10px] text-stone-400 font-medium">
            Source: UPAHAR Kitchen (1-1 Sangivalasa)
          </span>
        </div>
      </div>
    </div>
  );
}
