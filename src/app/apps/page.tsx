"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Download,
  Smartphone,
  Laptop,
  Apple,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Globe,
  UtensilsCrossed,
  Bike,
  Code2,
  Info,
  FileDown,
} from "lucide-react";
import {
  usePwa,
  UPAHAR_PWA_APPS,
  downloadWebShortcut,
  downloadAllPwaShortcuts,
  type PwaAppDefinition,
} from "@/components/pwa/PwaRegister";

export default function AppsPage() {
  const { activeApp, deferredPrompt } = usePwa();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [downloadedId, setDownloadedId] = useState<string | null>(null);

  const handleCopyLink = (app: PwaAppDefinition) => {
    const url = `${window.location.origin}${app.startUrl}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedId(app.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleDownloadShortcut = (app: PwaAppDefinition) => {
    downloadWebShortcut(app.name, app.startUrl, app.iconSrc);
    setDownloadedId(app.id);
    setTimeout(() => setDownloadedId(null), 2500);
  };

  const getAppIcon = (id: string) => {
    switch (id) {
      case "customer":
        return <UtensilsCrossed className="w-4 h-4 text-amber-600" />;
      case "admin":
        return <Globe className="w-4 h-4 text-sky-600" />;
      case "kitchen":
        return <UtensilsCrossed className="w-4 h-4 text-orange-600" />;
      case "rider":
        return <Bike className="w-4 h-4 text-red-600" />;
      case "portal":
        return <Code2 className="w-4 h-4 text-indigo-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#D4AF37]" />;
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#580D1A]/10 border border-[#580D1A]/20 text-[#580D1A] text-xs font-black uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>UPAHAR Multi-Panel Web Applications</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display text-stone-900 tracking-tight">
          Download &amp; Install All 5 Apps
        </h1>
        <p className="mt-3 text-sm sm:text-base text-stone-600 leading-relaxed font-medium">
          Install lightweight Progressive Web Apps directly onto your Android, iPhone, or Desktop PC. Each panel features its own dedicated icon, offline support, and 1-tap launcher access without app store downloads.
        </p>

        {/* Batch Download Button */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={downloadAllPwaShortcuts}
            className="btn-maroon-gold px-5 py-3 rounded-2xl text-xs font-black flex items-center gap-2 shadow-md hover:scale-[1.02] transition cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-[#DFC17B]" />
            <span>Download All 5 Windows Shortcuts (.url)</span>
          </button>
        </div>
      </div>

      {/* Installation Requirement Info Banner */}
      <div className="mb-8 p-4 rounded-3xl bg-amber-50/80 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-xs">
        <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <strong className="font-bold text-amber-950">How Web App Installation Works:</strong>
          <span className="block mt-0.5 text-stone-700">
            Browsers install the PWA for the specific URL route you are currently viewing. Click <strong>&quot;Open &amp; Install&quot;</strong> on any app card below to open its specific panel, or click <strong>&quot;Desktop File&quot;</strong> to immediately download a ready-to-run Windows shortcut!
          </span>
        </div>
      </div>

      {/* The 5 Dedicated App Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
        {UPAHAR_PWA_APPS.map((app) => {
          return (
            <div
              key={app.id}
              className="bg-white rounded-3xl border border-stone-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group hover:border-[#D4AF37]/50"
            >
              <div>
                {/* Card Header with Icon */}
                <div className="p-6 pb-4 flex items-start justify-between gap-3">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-md border border-stone-200 bg-stone-50 group-hover:scale-105 transition">
                    <Image
                      src={app.iconSrc}
                      alt={app.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 text-[10px] font-black uppercase tracking-wider border border-stone-200 flex items-center gap-1">
                    {getAppIcon(app.id)}
                    <span>{app.role}</span>
                  </span>
                </div>

                {/* Card Info */}
                <div className="px-6 pb-4">
                  <h3 className="text-lg font-black text-stone-900 group-hover:text-[#580D1A] transition">
                    {app.name}
                  </h3>
                  <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
                    {app.description}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-[10px] text-stone-400 font-mono">
                    <span>Scope: {app.scope}</span>
                    <span>•</span>
                    <span>PWA Standalone</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-stone-50/80 border-t border-stone-100 flex items-center gap-2">
                <Link
                  href={`${app.startUrl}?pwa=install`}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-[#580D1A] text-white text-xs font-black flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#DFC17B]" />
                  <span>Open &amp; Install</span>
                  <ArrowRight className="w-3 h-3 opacity-70" />
                </Link>

                <button
                  type="button"
                  onClick={() => handleDownloadShortcut(app)}
                  className="py-2.5 px-3 rounded-xl border border-stone-300 hover:bg-white text-stone-700 text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-xs"
                  title="Download ready-to-run Windows Desktop Shortcut (.url)"
                >
                  {downloadedId === app.id ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <FileDown className="w-3.5 h-3.5 text-stone-600" />
                  )}
                  <span className="text-[11px]">Shortcut</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopyLink(app)}
                  className="p-2.5 rounded-xl border border-stone-200 hover:bg-white text-stone-600 hover:text-stone-900 transition cursor-pointer"
                  title="Copy App URL"
                  aria-label="Copy App URL"
                >
                  {copiedId === app.id ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <ExternalLink className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Step-by-Step Installation Guide */}
      <div className="bg-[#FAF7F2] rounded-3xl border border-[#EADBCE] p-6 sm:p-8">
        <div className="flex items-center gap-2.5 mb-6">
          <ShieldCheck className="w-6 h-6 text-[#580D1A]" />
          <div>
            <h2 className="text-xl font-black font-display text-stone-900">
              Quick Installation Guide for Any Device
            </h2>
            <p className="text-xs text-stone-600">Follow these 3 easy steps depending on your platform</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Laptop / Desktop */}
          <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-2.5 shadow-xs">
            <div className="flex items-center gap-2 text-sky-700">
              <Laptop className="w-5 h-5" />
              <h3 className="text-xs font-black text-stone-900">Chrome / Edge (Desktop PC &amp; Mac)</h3>
            </div>
            <ol className="list-decimal list-inside text-xs text-stone-600 space-y-1.5 font-medium">
              <li>Open any app panel link above in Chrome or Edge.</li>
              <li>Look at the right side of the address bar at the top for the <strong>Install ⊕</strong> icon.</li>
              <li>Or click the <strong>3 dots ⋮ &gt; &quot;Install app&quot;</strong>.</li>
              <li>Or click <strong>&quot;Shortcut&quot;</strong> on any card above to download an instant Windows <code>.url</code> file!</li>
            </ol>
          </div>

          {/* Android Mobile */}
          <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-2.5 shadow-xs">
            <div className="flex items-center gap-2 text-emerald-700">
              <Smartphone className="w-5 h-5" />
              <h3 className="text-xs font-black text-stone-900">Android (Chrome / Brave / Edge)</h3>
            </div>
            <ol className="list-decimal list-inside text-xs text-stone-600 space-y-1.5 font-medium">
              <li>Open any of the 5 app links in <strong>Google Chrome</strong>.</li>
              <li>Tap the <strong>3-dots menu (⋮)</strong> in the top-right corner.</li>
              <li>Tap <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.</li>
              <li>The dedicated app icon will appear on your phone app drawer and home screen.</li>
            </ol>
          </div>

          {/* iOS Safari */}
          <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-2.5 shadow-xs">
            <div className="flex items-center gap-2 text-purple-700">
              <Apple className="w-5 h-5" />
              <h3 className="text-xs font-black text-stone-900">iPhone / iPad (Apple Safari)</h3>
            </div>
            <ol className="list-decimal list-inside text-xs text-stone-600 space-y-1.5 font-medium">
              <li>Open the app link in <strong>Safari</strong> on your iPhone or iPad.</li>
              <li>Tap the <strong>Share button ⎋</strong> (square with arrow at bottom bar).</li>
              <li>Scroll down and tap <strong>&quot;Add to Home Screen&quot; ➕</strong>.</li>
              <li>Tap <strong>Add</strong> in the top right to install it as a standalone iOS app.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
