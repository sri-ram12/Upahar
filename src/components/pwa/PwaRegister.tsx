"use client";

import React, { useEffect, useState, createContext, useContext } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Download, Smartphone, X, Sparkles, CheckCircle2 } from "lucide-react";
import PwaInstallModal from "./PwaInstallModal";

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export interface PwaAppDefinition {
  id: string;
  name: string;
  shortName: string;
  role: string;
  scope: string;
  startUrl: string;
  manifestUrl: string;
  iconSrc: string;
  themeColor: string;
  accentBg: string;
  description: string;
}

export const UPAHAR_PWA_APPS: PwaAppDefinition[] = [
  {
    id: "customer",
    name: "UPAHAR Food & Pickles",
    shortName: "UPAHAR Food",
    role: "Customer Ordering Portal",
    scope: "/",
    startUrl: "/",
    manifestUrl: "/manifest.json",
    iconSrc: "/icons/customer-192.png",
    themeColor: "#580D1A",
    accentBg: "from-amber-600 to-red-800",
    description: "Browse authentic South Indian tiffins, Andhra homemade pickles & royal biryanis with live GPS delivery tracking.",
  },
  {
    id: "admin",
    name: "UPAHAR Admin Panel",
    shortName: "UPAHAR Admin",
    role: "Admin & Operations",
    scope: "/admin",
    startUrl: "/admin",
    manifestUrl: "/manifest-admin.json",
    iconSrc: "/icons/admin-192.png",
    themeColor: "#1E293B",
    accentBg: "from-sky-700 to-indigo-900",
    description: "Live order queue, real-time analytics, rider allocations, menu pricing, and customer support switchboard.",
  },
  {
    id: "kitchen",
    name: "UPAHAR Kitchen Display",
    shortName: "UPAHAR Kitchen",
    role: "Kitchen KDS",
    scope: "/kitchen",
    startUrl: "/kitchen",
    manifestUrl: "/manifest-kitchen.json",
    iconSrc: "/icons/kitchen-192.png",
    themeColor: "#EA580C",
    accentBg: "from-orange-600 to-amber-800",
    description: "Chef order tickets, preparation timer, real-time sound chimes, and 1-tap food ready dispatch.",
  },
  {
    id: "rider",
    name: "UPAHAR Delivery Rider",
    shortName: "UPAHAR Rider",
    role: "Rider Logistics",
    scope: "/delivery",
    startUrl: "/delivery",
    manifestUrl: "/manifest-rider.json",
    iconSrc: "/icons/rider-192.png",
    themeColor: "#DC2626",
    accentBg: "from-red-600 to-rose-900",
    description: "Order pickup alerts, customer doorstep GPS navigation, customer phone connect, and delivery OTP confirmation.",
  },
  {
    id: "portal",
    name: "UPAHAR Developer Console",
    shortName: "UPAHAR Dev",
    role: "Developer Master Hub",
    scope: "/portal",
    startUrl: "/portal",
    manifestUrl: "/manifest-dev.json",
    iconSrc: "/icons/dev-192.png",
    themeColor: "#1E1B4B",
    accentBg: "from-indigo-700 to-purple-950",
    description: "Master multi-panel switcher, SSE realtime event stream inspector, and end-to-end automated order test simulator.",
  },
];

export function getActivePwaApp(pathname: string | null): PwaAppDefinition {
  const p = (pathname || "/").toLowerCase();
  if (p.startsWith("/admin")) return UPAHAR_PWA_APPS[1];
  if (p.startsWith("/kitchen")) return UPAHAR_PWA_APPS[2];
  if (p.startsWith("/delivery")) return UPAHAR_PWA_APPS[3];
  if (p.startsWith("/portal") || p.startsWith("/dev")) return UPAHAR_PWA_APPS[4];
  return UPAHAR_PWA_APPS[0];
}

export function downloadWebShortcut(appName: string, urlPath: string, iconPath?: string) {
  if (typeof window === "undefined") return;
  const fullUrl = `${window.location.origin}${urlPath}`;
  const iconUrl = iconPath ? `${window.location.origin}${iconPath}` : undefined;
  const content = `[InternetShortcut]\r\nURL=${fullUrl}\r\nIconIndex=0\r\n${iconUrl ? `IconFile=${iconUrl}\r\n` : ""}`;
  const blob = new Blob([content], { type: "application/internet-shortcut" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${appName.replace(/[^a-zA-Z0-9_-]/g, "_")}.url`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function downloadAllPwaShortcuts() {
  UPAHAR_PWA_APPS.forEach((app, index) => {
    setTimeout(() => {
      downloadWebShortcut(app.name, app.startUrl, app.iconSrc);
    }, index * 250);
  });
}

interface PwaContextType {
  deferredPrompt: BeforeInstallPromptEvent | null;
  isInstalled: boolean;
  activeApp: PwaAppDefinition;
  isInstallModalOpen: boolean;
  setIsInstallModalOpen: (open: boolean) => void;
  installCurrentApp: () => Promise<boolean>;
  installApp: () => Promise<boolean>;
  openAppHub: () => void;
}

const PwaContext = createContext<PwaContextType>({
  deferredPrompt: null,
  isInstalled: false,
  activeApp: UPAHAR_PWA_APPS[0],
  isInstallModalOpen: false,
  setIsInstallModalOpen: () => {},
  installCurrentApp: async () => false,
  installApp: async () => false,
  openAppHub: () => {},
});

export function usePwa() {
  return useContext(PwaContext);
}

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  const activeApp = getActivePwaApp(pathname);

  // 1. Dynamic Manifest Synchronization in Document Head
  // Re-creates the manifest link element so Chromium's manifest parser re-reads the new panel manifest
  useEffect(() => {
    if (typeof document === "undefined") return;

    const existing = document.querySelector('link[rel="manifest"]') as HTMLLinkElement | null;
    if (existing && existing.getAttribute("href") === activeApp.manifestUrl) {
      // already pointing to current active manifest
    } else {
      if (existing) existing.remove();
      const link = document.createElement("link");
      link.rel = "manifest";
      link.href = activeApp.manifestUrl;
      document.head.appendChild(link);
    }

    // Update theme-color meta tag
    let themeMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
    if (!themeMeta) {
      themeMeta = document.createElement("meta");
      themeMeta.name = "theme-color";
      document.head.appendChild(themeMeta);
    }
    themeMeta.content = activeApp.themeColor;
  }, [activeApp]);

  // 2. Service Worker Registration & Install Prompt Capture
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check standalone display mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    // Register Multi-Panel Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => {
          console.log("UPAHAR Multi-PWA Service Worker registered:", reg.scope);
        })
        .catch((err) => {
          console.warn("UPAHAR PWA Service Worker registration warning:", err);
        });
    }

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

  // 3. Auto-Trigger Install Prompt if URL has ?pwa=install or ?install=1
  useEffect(() => {
    if (!searchParams) return;
    const shouldInstall = searchParams.get("pwa") === "install" || searchParams.get("install") === "1";
    if (shouldInstall) {
      const timer = setTimeout(() => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
        } else {
          setIsInstallModalOpen(true);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchParams, deferredPrompt]);

  const installCurrentApp = async (): Promise<boolean> => {
    if (!deferredPrompt) {
      setIsInstallModalOpen(true);
      return false;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setIsInstalled(true);
        return true;
      }
    } catch (err) {
      console.warn("Install prompt error:", err);
      setIsInstallModalOpen(true);
    }
    return false;
  };

  const openAppHub = () => {
    setIsInstallModalOpen(true);
  };

  return (
    <PwaContext.Provider
      value={{
        deferredPrompt,
        isInstalled,
        activeApp,
        isInstallModalOpen,
        setIsInstallModalOpen,
        installCurrentApp,
        installApp: installCurrentApp,
        openAppHub,
      }}
    >
      {children}
      <PwaInstallModal />
    </PwaContext.Provider>
  );
}

// Backward-compatible component for layouts that render <PwaRegister /> directly
export function PwaRegister() {
  return null;
}

export interface PwaPanelBannerProps {
  className?: string;
  variant?: "floating" | "banner";
}

export function PwaPanelBanner({ className = "", variant = "floating" }: PwaPanelBannerProps) {
  const { activeApp, deferredPrompt, installCurrentApp, openAppHub, isInstalled } = usePwa();
  const [dismissed, setDismissed] = useState(false);

  if (isInstalled || dismissed) return null;

  const handleInstallClick = () => {
    if (deferredPrompt) {
      installCurrentApp();
    } else {
      openAppHub();
    }
  };

  if (variant === "banner") {
    return (
      <div className={`p-3 bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border-b border-amber-500/30 flex items-center justify-between gap-3 text-xs ${className}`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative w-8 h-8 rounded-xl overflow-hidden shrink-0 border border-stone-300 shadow-xs bg-white">
            <Image src={activeApp.iconSrc} alt={activeApp.name} fill className="object-cover" sizes="32px" />
          </div>
          <div className="min-w-0">
            <span className="font-black text-stone-900 truncate block">Install {activeApp.name} App</span>
            <span className="text-[10px] text-stone-600 truncate block">Add to Home Screen for fast 1-tap offline access</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleInstallClick}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#A0CB2A] via-[#65B741] to-[#2E8B57] text-white text-[11px] font-black flex items-center gap-1 hover:brightness-110 cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
          <button
            type="button"
            onClick={openAppHub}
            className="text-[11px] font-bold text-stone-600 hover:text-stone-900 underline cursor-pointer"
          >
            All 5 Apps
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="p-1 rounded text-stone-400 hover:text-stone-600 cursor-pointer"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`fixed bottom-4 right-4 z-40 max-w-sm p-3 rounded-2xl bg-white/95 dark:bg-stone-900/95 border border-[#D4AF37]/50 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-300 ${className}`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-stone-200 dark:border-stone-700 shadow-xs bg-white">
          <Image src={activeApp.iconSrc} alt={activeApp.name} fill className="object-cover" sizes="40px" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-stone-900 dark:text-white truncate">
              {activeApp.name}
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              PWA
            </span>
          </div>
          <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
            Install on phone or desktop for instant access
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={handleInstallClick}
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

export function PwaInstallPill(props: { appName?: string; iconSrc?: string; badge?: string; className?: string }) {
  return <PwaPanelBanner className={props.className} />;
}
