"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  Download,
  Smartphone,
  Laptop,
  Apple,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Shield,
  HelpCircle,
  FileDown,
  Monitor,
} from "lucide-react";
import {
  usePwa,
  UPAHAR_PWA_APPS,
  downloadWebShortcut,
  downloadAllPwaShortcuts,
  type PwaAppDefinition,
} from "./PwaRegister";

export default function PwaInstallModal() {
  const {
    isInstallModalOpen,
    setIsInstallModalOpen,
    activeApp,
    deferredPrompt,
    installCurrentApp,
  } = usePwa();

  const [activeTab, setActiveTab] = useState<"apps" | "guide">("apps");
  const [copiedAppId, setCopiedAppId] = useState<string | null>(null);
  const [downloadedAppId, setDownloadedAppId] = useState<string | null>(null);
  const [showBrowserHint, setShowBrowserHint] = useState(false);

  if (!isInstallModalOpen) return null;

  const handleClose = () => {
    setIsInstallModalOpen(false);
  };

  const handleShareApp = (app: PwaAppDefinition) => {
    const fullUrl = `${window.location.origin}${app.startUrl}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullUrl);
      setCopiedAppId(app.id);
      setTimeout(() => setCopiedAppId(null), 2000);
    }
  };

  const handleDownloadShortcut = (app: PwaAppDefinition) => {
    downloadWebShortcut(app.name, app.startUrl, app.iconSrc);
    setDownloadedAppId(app.id);
    setTimeout(() => setDownloadedAppId(null), 2500);
  };

  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      await installCurrentApp();
    } else {
      setShowBrowserHint(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-[28px] shadow-2xl border border-[#D4AF37]/40 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Top Decorative Gold Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#D4AF37] via-[#FFF2B2] to-[#DFC17B] shrink-0" />

        {/* Modal Header */}
        <div className="bg-gradient-to-br from-[#4A0E17] via-[#380A11] to-[#2B070E] text-white p-5 sm:p-6 shrink-0 border-b border-[#D4AF37]/30 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#DFC17B] text-[10px] font-black uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3 text-[#DFC17B]" />
              <span>5 Dedicated Progressive Web Apps</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-display text-white tracking-tight">
              Download UPAHAR Web Apps
            </h2>
            <p className="text-xs text-[#FFF2B2]/80 mt-0.5">
              Install to Phone Home Screen or Download Windows Desktop Shortcuts
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition flex-shrink-0 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab & Batch Download Bar */}
        <div className="p-2.5 bg-[#FAF7F2] border-b border-[#EADBCE] shrink-0 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-stone-200/70 rounded-2xl w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab("apps")}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "apps"
                  ? "bg-white text-[#580D1A] shadow-xs font-black border border-stone-200"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>All 5 Apps ({UPAHAR_PWA_APPS.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("guide")}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "guide"
                  ? "bg-white text-[#580D1A] shadow-xs font-black border border-stone-200"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Installation Guide</span>
            </button>
          </div>

          <button
            type="button"
            onClick={downloadAllPwaShortcuts}
            className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
            title="Download all 5 Desktop shortcut (.url) files at once"
          >
            <FileDown className="w-3.5 h-3.5 text-amber-800" />
            <span>Download All 5 Windows Shortcuts</span>
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {showBrowserHint && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="font-black text-amber-900 flex items-center gap-1.5">
                  <Monitor className="w-4 h-4 text-amber-700" />
                  <span>How to Complete Browser Installation</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowBrowserHint(false)}
                  className="text-amber-800 hover:text-amber-950"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="leading-relaxed">
                If the automatic install popup was blocked or already shown:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-1 text-stone-700 font-medium">
                <li>
                  <strong>On PC / Laptop (Chrome / Edge):</strong> Look at the <strong>address bar at the top right</strong> and click the <strong>Install ⊕</strong> icon, or click Menu (⋮) &gt; <strong>Install {activeApp.name}</strong>.
                </li>
                <li>
                  <strong>On Android Mobile:</strong> Tap the <strong>3 dots (⋮)</strong> at top right &gt; tap <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.
                </li>
                <li>
                  <strong>Or click &quot;Download Windows Shortcut (.url)&quot; below</strong> to immediately save an executable shortcut on your computer!
                </li>
              </ul>
            </div>
          )}

          {activeTab === "apps" ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                {UPAHAR_PWA_APPS.map((app) => {
                  const isCurrentActive = activeApp?.id === app.id;

                  return (
                    <div
                      key={app.id}
                      className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                        isCurrentActive
                          ? "bg-gradient-to-r from-amber-50/90 via-white to-amber-50/40 border-[#D4AF37] ring-2 ring-[#D4AF37]/30 shadow-sm"
                          : "bg-white border-stone-200 hover:border-stone-300 shadow-xs"
                      }`}
                    >
                      {/* App Info & Icon */}
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden shrink-0 border border-stone-200 shadow-md bg-stone-50">
                          <Image
                            src={app.iconSrc}
                            alt={app.name}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-black text-stone-900 truncate">
                              {app.name}
                            </h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                              {app.role}
                            </span>
                            {isCurrentActive && (
                              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                <span>Active on this page</span>
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-stone-600 line-clamp-2 mt-1">
                            {app.description}
                          </p>
                          <span className="text-[10px] text-stone-400 font-mono mt-0.5 block">
                            Scope: {app.scope} • Icon: Dedicated {app.shortName}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100 justify-end flex-wrap sm:flex-nowrap">
                        {isCurrentActive ? (
                          <button
                            type="button"
                            onClick={handleNativeInstall}
                            className="btn-maroon-gold px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm hover:scale-[1.02] transition cursor-pointer flex-1 sm:flex-none justify-center"
                          >
                            <Download className="w-3.5 h-3.5 text-[#DFC17B]" />
                            <span>{deferredPrompt ? "Install PWA" : "Install to Device"}</span>
                          </button>
                        ) : (
                          <Link
                            href={`${app.startUrl}?pwa=install`}
                            onClick={handleClose}
                            className="px-3.5 py-2 rounded-xl text-xs font-black bg-stone-900 text-white hover:bg-stone-800 flex items-center gap-1.5 transition cursor-pointer shadow-xs flex-1 sm:flex-none justify-center"
                          >
                            <span>Open &amp; Install</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        )}

                        {/* Direct Windows Desktop Shortcut (.url) Download */}
                        <button
                          type="button"
                          onClick={() => handleDownloadShortcut(app)}
                          className="px-2.5 py-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-xs"
                          title="Download ready-to-run Windows Desktop Shortcut (.url)"
                        >
                          {downloadedAppId === app.id ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700 text-[11px]">Downloaded</span>
                            </>
                          ) : (
                            <>
                              <FileDown className="w-3.5 h-3.5 text-stone-600" />
                              <span className="hidden sm:inline text-[11px]">Desktop File</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleShareApp(app)}
                          className="p-2 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-600 hover:text-stone-900 transition cursor-pointer flex-shrink-0"
                          title="Copy Link"
                          aria-label="Copy Link"
                        >
                          {copiedAppId === app.id ? (
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
            </div>
          ) : (
            /* ============================================================ */
            /* HOW TO INSTALL (GUIDE TAB) */
            /* ============================================================ */
            <div className="space-y-4">
              {/* Chrome / Edge on Laptop / Desktop */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE] space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-sky-100 text-sky-800">
                    <Laptop className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-stone-900">
                      Chrome / Edge (Windows PC, Mac &amp; Chromebook)
                    </h4>
                    <p className="text-[11px] text-stone-500">Fast desktop window with dedicated icon</p>
                  </div>
                </div>
                <ol className="list-decimal list-inside text-xs text-stone-700 space-y-1.5 pl-1 pt-1 font-medium">
                  <li>
                    Look at the <strong>right side of your browser address bar</strong> (URL bar at the top).
                  </li>
                  <li>
                    Click the <strong>Install icon ⊕</strong> or <strong>computer icon</strong>.
                  </li>
                  <li>
                    Alternatively, click the <strong>3-dots menu (⋮)</strong> &gt; <strong>Save and share</strong> &gt; <strong>Install UPAHAR</strong>.
                  </li>
                  <li>
                    Or click <strong>&quot;Desktop File&quot;</strong> next to any app above to download a Windows <code>.url</code> shortcut!
                  </li>
                </ol>
              </div>

              {/* Android (Chrome) */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE] space-y-2">
                <div className="flex items-center gap-2 text-emerald-800">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-stone-900">
                      Android Phones &amp; Tablets (Chrome / Brave / Edge)
                    </h4>
                    <p className="text-[11px] text-stone-500">Installs directly to phone home screen launcher</p>
                  </div>
                </div>
                <ol className="list-decimal list-inside text-xs text-stone-700 space-y-1.5 pl-1 pt-1 font-medium">
                  <li>Open the specific panel URL in <strong>Google Chrome</strong>.</li>
                  <li>Tap the <strong>3-dots menu (⋮)</strong> in the top-right corner.</li>
                  <li>Tap <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.</li>
                  <li>Tap <strong>Install</strong>. The app will be placed on your phone launcher with its dedicated icon!</li>
                </ol>
              </div>

              {/* iPhone / iPad (Safari) */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EADBCE] space-y-2">
                <div className="flex items-center gap-2 text-purple-800">
                  <div className="p-2 rounded-xl bg-purple-100 text-purple-800">
                    <Apple className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-stone-900">
                      iPhone &amp; iPad (Apple Safari)
                    </h4>
                    <p className="text-[11px] text-stone-500">Native standalone iOS web app with Apple touch icon</p>
                  </div>
                </div>
                <ol className="list-decimal list-inside text-xs text-stone-700 space-y-1.5 pl-1 pt-1 font-medium">
                  <li>Open the panel in <strong>Safari</strong> (iOS requires Safari for home screen install).</li>
                  <li>Tap the <strong>Share button</strong> (the square with an upward arrow ⎋ at bottom of screen).</li>
                  <li>Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong> ➕.</li>
                  <li>Tap <strong>Add</strong> in the top right. The app will appear on your iOS home screen!</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#FAF7F2] border-t border-[#EADBCE] flex items-center justify-between gap-2 shrink-0">
          <Link
            href="/apps"
            onClick={handleClose}
            className="text-xs font-black text-[#580D1A] hover:underline flex items-center gap-1"
          >
            <span>Open Dedicated Web Apps Hub (/apps)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-stone-700 hover:bg-stone-200 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
