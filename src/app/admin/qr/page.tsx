"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  QrCode,
  Printer,
  Download,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  Plus,
  Trash2,
  RefreshCw,
  UtensilsCrossed,
  ShieldCheck,
  MapPin,
  Phone,
  Layers,
} from "lucide-react";
import { generateQRCodeDataUrl } from "@/lib/qr";

interface TableItem {
  id: string;
  name: string;
  destination: "menu" | "home";
  qrUrl?: string;
}

export default function AdminQRManagerPage() {
  const [baseUrl, setBaseUrl] = useState<string>("https://upahar.onrender.com");
  const [includeLogo, setIncludeLogo] = useState<boolean>(true);
  const [tables, setTables] = useState<TableItem[]>([
    { id: "1", name: "Table 01", destination: "menu" },
    { id: "2", name: "Table 02", destination: "menu" },
    { id: "3", name: "Table 03", destination: "menu" },
    { id: "4", name: "Table 04", destination: "menu" },
    { id: "5", name: "Table 05", destination: "menu" },
    { id: "counter", name: "Billing Counter", destination: "menu" },
    { id: "takeaway", name: "Takeaway & Parcel", destination: "menu" },
  ]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"batch" | "single">("batch");
  const [selectedTable, setSelectedTable] = useState<string>("Table 01");
  const [newTableName, setNewTableName] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // If deployed or custom origin, default to current origin unless changed
      if (window.location.hostname !== "localhost") {
        setBaseUrl(window.location.origin);
      }
    }
  }, []);

  // Generate QR codes for all tables
  useEffect(() => {
    let isCancelled = false;

    async function generateAll() {
      setLoading(true);
      try {
        const updated = await Promise.all(
          tables.map(async (t) => {
            const path = t.destination === "menu" ? "/menu" : "/";
            const targetUrl = `${baseUrl.replace(/\/$/, "")}${path}?table=${encodeURIComponent(
              t.name
            )}`;
            const qrUrl = await generateQRCodeDataUrl(targetUrl, {
              size: 600,
              darkColor: "#2B070E",
              lightColor: "#FFFFFF",
              includeLogo,
              logoUrl: "/images/upahar_logo.jpg",
            });
            return { ...t, qrUrl };
          })
        );

        if (!isCancelled) {
          setTables(updated);
          setLoading(false);
        }
      } catch (err) {
        console.error("Batch QR generation failed:", err);
        if (!isCancelled) setLoading(false);
      }
    }

    generateAll();

    return () => {
      isCancelled = true;
    };
  }, [baseUrl, includeLogo]);

  const handleAddTable = () => {
    if (!newTableName.trim()) return;
    const newId = Date.now().toString();
    const newEntry: TableItem = {
      id: newId,
      name: newTableName.trim(),
      destination: "menu",
    };
    setTables((prev) => [...prev, newEntry]);
    setNewTableName("");
  };

  const handleRemoveTable = (id: string) => {
    setTables((prev) => prev.filter((t) => t.id !== id));
  };

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleBatchPrint = () => {
    window.print();
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto bg-[#FAF7F2] min-h-screen">
      {/* Header section (hidden in print) */}
      <div className="print:hidden flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#EADBCE] shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-[#580D1A] text-[#DFC17B]">
              <QrCode className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#2B070E] font-display">
              Tabletop Standees & QR Generator
            </h1>
          </div>
          <p className="text-xs text-stone-500">
            Generate, customize, and print authentic table tent cards and counter QR codes for UPAHAR TIFFINS.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleBatchPrint}
            className="btn-maroon-gold px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md hover:scale-105 transition"
          >
            <Printer className="w-4 h-4 text-[#DFC17B]" />
            <span>Print All Standees</span>
          </button>

          <Link
            href="/qr"
            target="_blank"
            className="btn-gold-outline px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-1.5"
          >
            <ExternalLink className="w-4 h-4 text-[#580D1A]" />
            <span>View Public QR Page</span>
          </Link>
        </div>
      </div>

      {/* Settings & Configuration Toolbar (hidden in print) */}
      <div className="print:hidden bg-white p-6 rounded-3xl border border-[#EADBCE] shadow-sm space-y-4">
        <h2 className="text-xs uppercase font-extrabold tracking-[0.2em] text-[#580D1A]">
          Standee Configuration
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-stone-700 mb-1">
              Production Website Base URL:
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#580D1A] bg-stone-50 font-mono text-xs"
              placeholder="https://upahar.onrender.com"
            />
            <span className="text-[10px] text-stone-500 mt-1 block">
              Ensure this points to your live website so printed cards scan accurately.
            </span>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">
              Branding Options:
            </label>
            <label className="flex items-center space-x-2 py-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeLogo}
                onChange={(e) => setIncludeLogo(e.target.checked)}
                className="w-4 h-4 rounded text-[#580D1A] focus:ring-[#580D1A]"
              />
              <span className="font-semibold text-stone-700">
                Overlay Upahar Emblem in Center
              </span>
            </label>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">
              Add New Table or Location:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTableName}
                onChange={(e) => setNewTableName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTable()}
                placeholder="e.g. Table 06 or Rooftop"
                className="flex-1 px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#580D1A] bg-stone-50"
              />
              <button
                onClick={handleAddTable}
                className="px-3.5 py-2 bg-[#580D1A] text-[#DFC17B] rounded-xl font-bold hover:bg-[#400812] transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Standee Cards (Formatted for print and screen) */}
      <div className="space-y-4">
        <div className="print:hidden flex items-center justify-between">
          <h2 className="text-sm font-bold text-stone-800 flex items-center space-x-2">
            <Layers className="w-4 h-4 text-[#D4AF37]" />
            <span>Ready-to-Print Standees ({tables.length})</span>
          </h2>
          <span className="text-xs text-stone-500">
            Click &quot;Print All Standees&quot; to print directly to your card printer or save as PDF.
          </span>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center space-y-3 bg-white rounded-3xl border border-[#EADBCE]">
            <RefreshCw className="w-8 h-8 text-[#580D1A] animate-spin" />
            <p className="text-xs text-stone-500 font-medium">
              Generating high-resolution standees with official Upahar emblems...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-1 print:gap-12">
            {tables.map((table) => {
              const targetUrl = `${baseUrl.replace(/\/$/, "")}/${
                table.destination === "menu" ? "menu" : ""
              }?table=${encodeURIComponent(table.name)}`;

              return (
                <div
                  key={table.id}
                  className="bg-white rounded-3xl border-2 border-[#D4AF37] shadow-lg p-6 relative overflow-hidden flex flex-col justify-between print:break-inside-avoid print:shadow-none print:border-2 print:border-black print:mb-8"
                >
                  {/* Decorative top strip */}
                  <div className="h-1.5 bg-gradient-to-r from-[#D4AF37] via-[#580D1A] to-[#D4AF37] -mt-6 -mx-6 mb-5" />

                  {/* Card Header */}
                  <div className="text-center space-y-1.5">
                    <div className="relative mx-auto w-12 h-12 rounded-full overflow-hidden border border-[#D4AF37] shadow-sm bg-[#580D1A] flex items-center justify-center">
                      <img
                        src="/images/upahar_logo.jpg"
                        alt="Upahar Logo"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <h3 className="text-lg font-black font-display tracking-tight text-[#2B070E] flex items-center justify-center gap-1">
                      UPAHAR
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                    </h3>
                    <p className="text-[9px] uppercase tracking-[0.2em] font-extrabold text-[#74171E] -mt-1">
                      Tiffins & Fast Food
                    </p>

                    <div className="pt-1.5">
                      <span className="inline-block bg-[#580D1A] text-[#FAF7F2] border border-[#D4AF37]/50 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                        {table.name}
                      </span>
                    </div>
                  </div>

                  {/* QR Graphic */}
                  <div className="my-4 flex justify-center">
                    <div className="relative w-44 h-44 p-2.5 bg-white rounded-2xl border border-[#D4AF37] shadow-inner flex items-center justify-center">
                      {table.qrUrl ? (
                        <img
                          src={table.qrUrl}
                          alt={`QR for ${table.name}`}
                          className="w-full h-full object-contain rounded-lg"
                        />
                      ) : (
                        <div className="text-xs text-stone-400">Loading...</div>
                      )}
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="text-center space-y-1">
                    <h4 className="text-xs font-black text-[#580D1A] uppercase tracking-wide">
                      Scan To View Menu & Order
                    </h4>
                    <p className="text-[10px] text-stone-600 leading-tight">
                      Point camera to open live menu on your phone
                    </p>
                  </div>

                  {/* Footer details */}
                  <div className="mt-4 pt-3 border-t border-[#EADBCE] text-center space-y-1 text-[9px] text-stone-500">
                    <p className="font-semibold text-stone-700">
                      Beside SBI, ANITS College Road, Sangivalasa
                    </p>
                    <p>Ph: +91 9885455342 • Pure Desi Ghee & Fresh Batter</p>
                  </div>

                  {/* Action Buttons (Screen only) */}
                  <div className="print:hidden mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleCopy(targetUrl, table.id)}
                      className="px-2.5 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-[11px] font-semibold text-stone-600 flex items-center space-x-1"
                    >
                      {copiedId === table.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Link</span>
                        </>
                      )}
                    </button>

                    {table.qrUrl && (
                      <a
                        href={table.qrUrl}
                        download={`upahar-${table.name.replace(/\s+/g, "-").toLowerCase()}.png`}
                        className="px-2.5 py-1.5 rounded-lg border border-[#D4AF37]/50 hover:bg-[#F4EFE6] text-[11px] font-bold text-[#580D1A] flex items-center space-x-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>PNG</span>
                      </a>
                    )}

                    <button
                      onClick={() => handleRemoveTable(table.id)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition"
                      title="Remove standee"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
