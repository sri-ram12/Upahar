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

/** Keeps <html data-upahar-theme> aligned sitewide across sessions & routes. */
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
        : getWebsiteTheme(sessionType, urlTheme);

      document.documentElement.setAttribute("data-upahar-theme", resolved);
      window.dispatchEvent(
        new CustomEvent("upahar-theme-change", {
          detail: { theme: resolved, urlTheme },
        })
      );
    };

    // Instant client IST calculation while waiting for API refresh
    const now = new Date();
    const istDate = new Date(
      now.getTime() + now.getTimezoneOffset() * 60000 + 5.5 * 3600000
    );
    const mins = istDate.getHours() * 60 + istDate.getMinutes();
    const localSession: SessionType =
      mins >= 360 && mins < 630
        ? "MORNING"
        : mins >= 720 && mins < 1350
        ? "EVENING"
        : "CLOSED";
    applyTheme(localSession);

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

