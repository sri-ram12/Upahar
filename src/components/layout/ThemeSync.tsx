"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getWebsiteTheme, type SessionType } from "@/lib/store-hours";

function isStaffRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/kitchen") ||
    pathname.startsWith("/delivery") ||
    pathname.startsWith("/portal") ||
    pathname.startsWith("/dev")
  );
}

/** Keeps <html data-upahar-theme> aligned by route/sub-website (NO automatic time theme flipping). */
export default function ThemeSync() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlTheme = searchParams.get("theme");

  useEffect(() => {
    let active = true;

    const applyTheme = (sessionType?: SessionType | null) => {
      if (!active) return;
      const resolved = isStaffRoute(pathname)
        ? "original-maroon"
        : getWebsiteTheme(sessionType, urlTheme, pathname);

      document.documentElement.setAttribute("data-upahar-theme", resolved);
      window.dispatchEvent(
        new CustomEvent("upahar-theme-change", {
          detail: { theme: resolved, urlTheme, pathname },
        })
      );
    };

    applyTheme(null);

    const syncFromApi = () => {
      fetch("/api/restaurant")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.storeStatus?.sessionType) {
            applyTheme(data.storeStatus.sessionType);
          }
        })
        .catch(() => {});
    };

    syncFromApi();
    const interval = window.setInterval(syncFromApi, 60000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [pathname, urlTheme]);

  return null;
}
