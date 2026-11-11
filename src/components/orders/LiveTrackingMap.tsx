"use client";

import React, { useState } from "react";
import { MapPin, Bike, Store, Compass, Navigation } from "lucide-react";
import { UPAHAR_COORDINATES, TAGARAPUVALASA_LOCALITIES } from "@/lib/delivery-zones";

interface LiveTrackingMapProps {
  status: string;
  orderType: "DELIVERY" | "TAKEAWAY" | "DINE_IN";
  locality?: string | null;
  deliveryAddress?: string | null;
  customerLat?: number | null;
  customerLng?: number | null;
  riderLat?: number | null;
  riderLng?: number | null;
  distanceKm?: number | null;
  riderName?: string | null;
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
  distanceKm,
  riderName,
}: LiveTrackingMapProps) {
  const [viewMode, setViewMode] = useState<"RADAR" | "STREET_MAP">("RADAR");

  // Resolve customer destination coordinates from GPS or selected locality preset
  const matchedLoc = TAGARAPUVALASA_LOCALITIES.find(
    (l) => l.name === locality || locality?.includes(l.area)
  );
  const destLat = customerLat || matchedLoc?.lat || 17.933;
  const destLng = customerLng || matchedLoc?.lng || 83.417;
  const effectiveDist = distanceKm || matchedLoc?.distanceKm || 1.8;

  // Map geo bounding box around Sangivalasa / Tagarapuvalasa (covers ~6km across)
  const minLat = 17.898;
  const maxLat = 17.956;
  const minLng = 83.395;
  const maxLng = 83.455;

  const project = (lat: number, lng: number) => {
    const x = Math.min(90, Math.max(10, ((lng - minLng) / (maxLng - minLng)) * 100));
    const y = Math.min(88, Math.max(12, 100 - ((lat - minLat) / (maxLat - minLat)) * 100));
    return { x, y };
  };

  const kitchenPos = project(UPAHAR_COORDINATES.lat, UPAHAR_COORDINATES.lng);
  const customerPos = project(destLat, destLng);

  // Determine stage progress fraction (0 = at kitchen, 1 = at customer doorstep)
  const getProgressFraction = () => {
    if (status === "DELIVERED" || status === "ARRIVED") return 1;
    if (status === "OUT_FOR_DELIVERY") return 0.62;
    if (status === "FOOD_READY") return 0.15;
    if (status === "PREPARING" || status === "CONFIRMED") return 0.04;
    return 0;
  };

  const hasLiveGpsRider = Boolean(riderLat && riderLng);
  const progress = getProgressFraction();

  const riderPos = hasLiveGpsRider
    ? project(riderLat!, riderLng!)
    : {
        x: kitchenPos.x + (customerPos.x - kitchenPos.x) * progress,
        y: kitchenPos.y + (customerPos.y - kitchenPos.y) * progress,
      };

  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${minLng}%2C${minLat}%2C${maxLng}%2C${maxLat}&layer=mapnik&marker=${destLat}%2C${destLng}`;
  const gmapsRouteUrl = `https://www.google.com/maps/dir/?api=1&origin=${UPAHAR_COORDINATES.lat},${UPAHAR_COORDINATES.lng}&destination=${destLat},${destLng}`;

  if (orderType !== "DELIVERY") {
    return (
      <div className="p-4 rounded-2xl bg-brand-cream border border-brand-border flex items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-brand-700 text-[#DFC17B] flex items-center justify-center">
            <Store className="w-5 h-5" />
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
          className="px-3 py-1.5 rounded-xl bg-brand-700 text-[#DFC17B] text-xs font-bold flex items-center space-x-1"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Directions</span>
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-brand-border bg-[#F3EFE6] shadow-xs">
      {/* Map Header Controls */}
      <div className="bg-white px-4 py-2.5 border-b border-brand-border flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-black text-brand-950">
            {hasLiveGpsRider
              ? `Live GPS Tracking • ${riderName || "Rider"} on the move`
              : `Tagarapuvalasa 7km Route (~${effectiveDist} km)`}
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          <div className="flex bg-stone-100 rounded-lg p-0.5 text-[10px] font-bold">
            <button
              type="button"
              onClick={() => setViewMode("RADAR")}
              className={`px-2 py-1 rounded-md transition ${
                viewMode === "RADAR" ? "bg-white text-brand-700 shadow-xs" : "text-stone-500"
              }`}
            >
              Live Route
            </button>
            <button
              type="button"
              onClick={() => setViewMode("STREET_MAP")}
              className={`px-2 py-1 rounded-md transition ${
                viewMode === "STREET_MAP" ? "bg-white text-brand-700 shadow-xs" : "text-stone-500"
              }`}
            >
              Street Map
            </button>
          </div>

          <a
            href={gmapsRouteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-bold text-brand-700 bg-brand-700/10 hover:bg-brand-700/20 px-2.5 py-1 rounded-lg flex items-center space-x-1"
          >
            <Navigation className="w-3 h-3" />
            <span>Google Maps</span>
          </a>
        </div>
      </div>

      {viewMode === "STREET_MAP" ? (
        <div className="relative h-60 w-full bg-stone-200">
          <iframe
            title="Tagarapuvalasa Delivery Area Map"
            src={osmUrl}
            className="w-full h-full border-0"
            loading="lazy"
          />
          <div className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl text-[11px] font-bold text-brand-950 shadow-sm flex items-center justify-between">
            <span className="truncate">Destination: {deliveryAddress || locality || "Tagarapuvalasa"}</span>
            <span className="text-brand-700 flex-shrink-0 ml-2">~{effectiveDist} km</span>
          </div>
        </div>
      ) : (
        <div className="relative h-60 w-full bg-[#EAE4D7] overflow-hidden select-none">
          {/* Subtle Street Grid Background */}
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full"
          >
            {/* Roads */}
            <path d="M 0 32 L 100 28" stroke="#FFFFFF" strokeWidth="1.8" opacity="0.8" />
            <path d="M 15 0 L 42 100" stroke="#FFFFFF" strokeWidth="2.2" opacity="0.85" />
            <path d="M 55 0 L 72 100" stroke="#FFFFFF" strokeWidth="1.4" opacity="0.7" />
            <path d="M 0 70 L 100 62" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.75" />

            {/* Radius Circle around Kitchen */}
            <circle
              cx={kitchenPos.x}
              cy={kitchenPos.y}
              r="34"
              fill="var(--upahar-700)"
              fillOpacity="0.04"
              stroke="#D4AF37"
              strokeDasharray="2 2"
              strokeWidth="0.6"
            />

            {/* Dashed Complete Route Line */}
            <line
              x1={kitchenPos.x}
              y1={kitchenPos.y}
              x2={customerPos.x}
              y2={customerPos.y}
              stroke="#C5A059"
              strokeWidth="1.2"
              strokeDasharray="2 2"
            />

            {/* Completed Active Path */}
            <line
              x1={kitchenPos.x}
              y1={kitchenPos.y}
              x2={riderPos.x}
              y2={riderPos.y}
              stroke="var(--upahar-700)"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>

          {/* Local Landmarks Watermarks */}
          <span className="absolute top-3 left-3 text-[9px] font-bold text-stone-500/80 uppercase tracking-wider">
            Tagarapuvalasa / NH-16
          </span>
          <span className="absolute bottom-3 right-3 text-[9px] font-bold text-stone-500/80 uppercase tracking-wider">
            Sangivalasa • ANITS Rd
          </span>

          {/* Kitchen Origin Marker */}
          <div
            style={{ left: `${kitchenPos.x}%`, top: `${kitchenPos.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center"
          >
            <div className="w-8 h-8 rounded-full bg-brand-700 text-[#DFC17B] border-2 border-white shadow-lg flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
            <span className="mt-1 px-2 py-0.5 rounded-md bg-white/95 text-brand-700 text-[9px] font-black shadow-xs whitespace-nowrap border border-brand-border">
              UPAHAR Kitchen
            </span>
          </div>

          {/* Customer Destination Marker */}
          <div
            style={{ left: `${customerPos.x}%`, top: `${customerPos.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white border-2 border-white shadow-lg flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <span className="mt-1 px-2 py-0.5 rounded-md bg-white/95 text-emerald-900 text-[9px] font-black shadow-xs whitespace-nowrap border border-emerald-200 max-w-[140px] truncate">
              {locality || "Delivery Drop"}
            </span>
          </div>

          {/* Live Moving Rider Pin */}
          {status !== "CANCELLED" && (
            <div
              style={{ left: `${riderPos.x}%`, top: `${riderPos.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 transition-all duration-700 flex flex-col items-center"
            >
              <div className="relative">
                {status === "OUT_FOR_DELIVERY" && (
                  <span className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-60" />
                )}
                <div className="relative w-9 h-9 rounded-full bg-[#DFC17B] text-brand-700 border-2 border-brand-700 shadow-xl flex items-center justify-center">
                  <Bike className="w-5 h-5" />
                </div>
              </div>
              {riderName && (
                <span className="mt-0.5 px-2 py-0.5 rounded-full bg-brand-700 text-[#DFC17B] text-[9px] font-black shadow-md whitespace-nowrap">
                  🛵 {riderName}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

