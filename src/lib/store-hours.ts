export type SessionType = "MORNING" | "EVENING" | "CLOSED";

export interface StoreStatus {
  isOpen: boolean;
  sessionType: SessionType;
  statusText: string;
  subText: string;
  currentSession: string;
  openingTime: string;
  closingTime: string;
}

// Category slugs available only during Afternoon & Evening Biryanis & Fast Food (12:00 PM - 10:30 PM IST)
export const EVENING_ONLY_CATEGORY_SLUGS = [
  "biryanis",
  "noodles",
  "fried-rice",
  "starters",
  "evening-specials",
];

export type WebsiteThemeMode = "morning-green" | "original-maroon";

/**
 * Resolves the active storefront theme based on operating session:
 * - Session 1 (6:00 AM – 10:30 AM IST): "morning-green" (Banana-leaf & ribbon green from logo)
 * - Session 2 (12:00 PM – 10:30 PM IST) & default: "original-maroon" (Upahar original maroon/gold theme)
 */
export function getWebsiteTheme(
  sessionType?: SessionType | string | null,
  themeOverride?: string | null
): WebsiteThemeMode {
  const normalizedOverride = themeOverride?.toLowerCase().trim();
  if (normalizedOverride === "morning" || normalizedOverride === "green") {
    return "morning-green";
  }
  if (normalizedOverride === "evening" || normalizedOverride === "maroon" || normalizedOverride === "original") {
    return "original-maroon";
  }
  return sessionType === "MORNING" ? "morning-green" : "original-maroon";
}

export function getEffectiveSessionType(
  liveSession: SessionType = "EVENING",
  themeOverride?: string | null
): SessionType {
  const normalized = themeOverride?.toLowerCase().trim();
  if (normalized === "morning" || normalized === "green") return "MORNING";
  if (normalized === "evening" || normalized === "maroon" || normalized === "original") return "EVENING";
  return liveSession;
}

export function getCategorySessionPriority(
  categorySlug: string | undefined | null,
  sessionType: SessionType
): number {
  const slug = (categorySlug || "").toLowerCase();
  if (sessionType === "MORNING") {
    const morningOrder: Record<string, number> = {
      tiffins: 0,
      dosa: 1,
      biryanis: 2,
      "fried-rice": 3,
      noodles: 4,
      starters: 5,
      "evening-specials": 6,
    };
    return morningOrder[slug] ?? 9;
  }
  // Afternoon & Evening Session: Biryanis & Fast Food come UPWARD FIRST
  const afternoonOrder: Record<string, number> = {
    biryanis: 0,
    "fried-rice": 1,
    noodles: 2,
    starters: 3,
    "evening-specials": 4,
    dosa: 5,
    tiffins: 6,
  };
  return afternoonOrder[slug] ?? 9;
}

export function getItemSessionAvailability(
  categorySlug: string | undefined | null,
  sessionType: SessionType,
  enforceStoreHours = true
): {
  isLocked: boolean;
  availableAtText: string | null;
  lockMessage: string | null;
} {
  if (!enforceStoreHours) {
    return { isLocked: false, availableAtText: null, lockMessage: null };
  }
  if (sessionType === "MORNING" && !isCategoryAvailableInSession(categorySlug, "MORNING")) {
    return {
      isLocked: true,
      availableAtText: "12:00 PM – 10:30 PM",
      lockMessage:
        "Available during Afternoon & Evening Session (12:00 PM – 10:30 PM IST). Only fresh Morning Tiffins & Dosas can be ordered right now (6:00 AM – 10:30 AM IST).",
    };
  }
  return { isLocked: false, availableAtText: null, lockMessage: null };
}

export function isCategoryAvailableInSession(
  categorySlug: string | undefined | null,
  sessionType: SessionType
): boolean {
  if (!categorySlug) return true;
  if (sessionType === "MORNING") {
    return !EVENING_ONLY_CATEGORY_SLUGS.includes(categorySlug.toLowerCase());
  }
  return true;
}

export function formatTimeString(time24: string): string {
  if (!time24 || !time24.includes(":")) return time24;
  const [hStr, mStr] = time24.split(":");
  let h = parseInt(hStr, 10);
  const m = mStr.padStart(2, "0");
  const period = h >= 12 ? "PM" : "AM";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${m} ${period}`;
}

export function getDiningSessions() {
  return [
    {
      name: "Upahar Tiffins",
      timeRange: "6:00 AM – 10:30 AM",
      startH: 6,
      startM: 0,
      endH: 10,
      endM: 30,
      description: "Fresh hot idlys, ghee karam dosas, medu wada, tatte idly & bonda.",
      badge: "Morning Session",
    },
    {
      name: "Upahar Biryanis & Fast Food",
      timeRange: "12:00 PM – 10:30 PM",
      startH: 12,
      startM: 0,
      endH: 22,
      endM: 30,
      description: "Hyderabadi Dum Biryanis, fry-piece biryanis, noodles, fried rice, Manchurian & dosas.",
      badge: "Afternoon & Evening",
    },
  ];
}

export function calculateStoreStatus(
  openingTime = "06:00",
  closingTime = "22:30",
  isEmergencyClosed = false
): StoreStatus {
  if (isEmergencyClosed) {
    return {
      isOpen: false,
      sessionType: "CLOSED",
      statusText: "TEMPORARILY CLOSED TODAY",
      subText: "We are currently closed for maintenance.",
      currentSession: "Closed",
      openingTime,
      closingTime,
    };
  }

  // Determine current time in IST (UTC+5:30)
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + now.getTimezoneOffset() * 60 * 1000 + istOffset);

  const currentHours = istDate.getHours();
  const currentMinutes = istDate.getMinutes();
  const currentTotalMinutes = currentHours * 60 + currentMinutes;

  // Exact Upahar Sessions:
  // Session 1: 6:00 AM (360 min) to 10:30 AM (630 min)
  // Session 2: 12:00 PM (720 min) to 10:30 PM (1350 min)
  const isMorning = currentTotalMinutes >= 360 && currentTotalMinutes < 630;
  const isEvening = currentTotalMinutes >= 720 && currentTotalMinutes < 1350;

  if (isMorning) {
    return {
      isOpen: true,
      sessionType: "MORNING",
      statusText: "OPEN NOW • UPAHAR TIFFINS",
      subText: "Serving hot morning tiffins • Biryanis & Fast Food open at 12:00 PM",
      currentSession: "Upahar Tiffins (6:00 AM – 10:30 AM)",
      openingTime: "06:00",
      closingTime: "10:30",
    };
  }

  if (isEvening) {
    return {
      isOpen: true,
      sessionType: "EVENING",
      statusText: "OPEN NOW • BIRYANIS & FAST FOOD",
      subText: "Serving Dum Biryanis, sizzling fast food & tiffins • Closes at 10:30 PM",
      currentSession: "Upahar Biryanis & Fast Food (12:00 PM – 10:30 PM)",
      openingTime: "12:00",
      closingTime: "22:30",
    };
  }

  // Between morning and afternoon (10:30 AM - 12:00 PM)
  if (currentTotalMinutes >= 630 && currentTotalMinutes < 720) {
    return {
      isOpen: false,
      sessionType: "CLOSED",
      statusText: "KITCHEN PREP BREAK",
      subText: "Reopens at 12:00 PM – 10:30 PM for Upahar Biryanis & Fast Food",
      currentSession: "Kitchen Prep Break (10:30 AM – 12:00 PM)",
      openingTime: "12:00",
      closingTime: "22:30",
    };
  }

  // Late night / early morning before 6 AM
  return {
    isOpen: false,
    sessionType: "CLOSED",
    statusText: "CLOSED NOW",
    subText: "Opens tomorrow morning 6:00 AM – 10:30 AM for fresh steaming tiffins",
    currentSession: "Closed for the night",
    openingTime: "06:00",
    closingTime: "10:30",
  };
}
