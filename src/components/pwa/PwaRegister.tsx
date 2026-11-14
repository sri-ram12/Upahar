"use client";

import React, { useEffect, useState, createContext, useContext } from "react";
import Image from "next/image";
import { Download, CheckCircle2, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PwaContextType {
  deferredPrompt: BeforeInstallPromptEvent | null;
  isInstalled: boolean;
  installApp: () => Promise<boolean>;
}

const PwaContext = createContext<PwaContextType>({
  deferredPrompt: null,
  isInstalled: false,
  installApp: async () => false,
});

export function usePwa() {
  return useContext(PwaContext);
}

export function PwaRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Check if already running in standalone display mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    // 2. Register Service Worker
    if ("serviceWorker" in navigator && process.env.NODE_ENV !== "development") {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("UPAHAR PWA Service Worker registered:", reg.scope);
        })
        .catch((err) => {
          console.warn("UPAHAR PWA Service Worker registration failed:", err);
        });
    }

    // 3. Listen for browser install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const installApp = async (): Promise<boolean> => {
    if (!deferredPrompt) {
      // Fallback instructions if native prompt is not available
      alert(
        "To install this app on your device:\n\n• On Chrome/Android/Edge: Click the three dots (menu) and tap 'Install App' or 'Add to Home Screen'.\n• On iPhone/Safari: Tap the Share button (square with arrow) and tap 'Add to Home Screen'."
      );
      return false;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setIsInstalled(true);
      return true;
    }
    return false;
  };

  return (
    <PwaContext.Provider value={{ deferredPrompt, isInstalled, installApp }}>
      {/* Invisible listener component mounted at root */}
    </PwaContext.Provider>
  );
}

export interface PwaInstallPillProps {
  appName: string;
  iconSrc: string;
  badge?: string;
  className?: string;
}

export function PwaInstallPill({
  appName,
  iconSrc,
  badge = "PWA Web App",
  className = "",
}: PwaInstallPillProps) {
  const { deferredPrompt, isInstalled, installApp } = usePwa();
  const [dismissed, setDismissed] = useState(false);

  if (isInstalled || dismissed) return null;

  return (
    <div
      className={`flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-2xl bg-white/95 dark:bg-stone-900/95 border border-amber-500/30 shadow-lg backdrop-blur-md transition-all ${className}`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="relative w-9 h-9 rounded-xl overflow-hidden shrink-0 border border-stone-200 dark:border-stone-700 shadow-xs bg-white">
          <Image src={iconSrc} alt={appName} fill className="object-cover" sizes="36px" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-stone-900 dark:text-white truncate">
              {appName}
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              {badge}
            </span>
          </div>
          <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
            Install on phone or desktop for instant 1-tap access
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={installApp}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#A0CB2A] via-[#65B741] to-[#2E8B57] text-white text-[11px] font-black flex items-center gap-1.5 hover:brightness-110 active:scale-95 transition cursor-pointer shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install</span>
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
