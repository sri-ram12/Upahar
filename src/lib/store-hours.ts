export type SessionType = "MORNING" | "EVENING" | "CLOSED";

export type DivisionKey = "tiffins" | "biryanis" | "fast-food" | "pickles";

export interface TimeWindow {
  start: string; // "HH:MM" 24h IST
  end: string;   // "HH:MM" 24h IST
}

export interface StoreStatus {
  isOpen: boolean;
  sessionType: SessionType;
  statusText: string;
  subText: string;
  currentSession: string;
  openingTime: string;
  closingTime: string;
  isEmergencyClosed?: boolean;
}

export const PICKLE_CATEGORY_SLUGS = ["pickles"];

export const MORNING_ONLY_CATEGORY_SLUGS = ["tiffins", "dosa"];

export const BIRYANI_CATEGORY_SLUGS = ["biryanis"];

export const FAST_FOOD_CATEGORY_SLUGS = [
  "roti-curries",
  "noodles",
  "veg-noodles",
  "nonveg-noodles",
  "fried-rice",
  "veg-rice",
  "nonveg-rice",
  "starters",
  "veg-starters",
  "nonveg-starters",
  "evening-specials",
  "fast-food",
];

// Category slugs served during Afternoon & Evening
export const EVENING_ONLY_CATEGORY_SLUGS = [
  ...BIRYANI_CATEGORY_SLUGS,
  ...FAST_FOOD_CATEGORY_SLUGS,
];

export type WebsiteThemeMode =
  | "light-hub"
  | "dark-hub"
  | "tiffins-green"
  | "biryanis-maroon"
  | "fastfood-gold"
  | "pickles-red"
  | "original-maroon"
  | "morning-green";

export type HubThemePreference = "light" | "dark";

export const HUB_THEME_STORAGE_KEY = "upahar_hub_theme_v1";

/** Reads persisted Light/Dark preference for the main home page. */
export function readStoredHubTheme(): HubThemePreference {
  if (typeof window === "undefined") return "light";
  try {
    return window.localStorage.getItem(HUB_THEME_STORAGE_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

/** Saves and broadcasts the main home page Light/Dark preference immediately. */
export function setHubThemePreference(mode: HubThemePreference): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(HUB_THEME_STORAGE_KEY, mode);
  } catch {}
  const resolved: WebsiteThemeMode = mode === "dark" ? "dark-hub" : "light-hub";
  document.documentElement.setAttribute("data-upahar-theme", resolved);
  window.dispatchEvent(
    new CustomEvent("upahar-theme-change", {
      detail: { theme: resolved, hubTheme: mode, pathname: window.location.pathname },
    })
  );
}

export interface UpaharDivisionConfig {
  key: DivisionKey;
  route: string;
  number: string;
  title: string;
  shortTitle: string;
  badgeName: string;
  tagline: string;
  timingText: string;
  shortTiming: string;
  timeWindows: TimeWindow[];
  quote: string;
  description: string;
  heroImage: string;
  theme: WebsiteThemeMode;
  categorySlugs: string[];
  accentHex: string;
  surfaceHex: string;
  alwaysOpen?: boolean;
  openSessions: SessionType[];
}

export interface SubsiteDbConfigLike {
  id: string;
  title?: string | null;
  shortTitle?: string | null;
  tagline?: string | null;
  quote?: string | null;
  description?: string | null;
  heroImage?: string | null;
  theme?: string | null;
  scheduleLabel?: string | null;
  timeWindowsJson?: string | null;
  alwaysOpen?: boolean | null;
  isOpenOverride?: boolean | null;
  isActive?: boolean | null;
  pausedMessage?: string | null;
}

export const UPAHAR_DIVISIONS: Record<DivisionKey, UpaharDivisionConfig> = {
  tiffins: {
    key: "tiffins",
    route: "/tiffins",
    number: "01",
    title: "UPAHAR TIFFINS",
    shortTitle: "Upahar Tiffins",
    badgeName: "UPAHAR TIFFINS",
    tagline: "Morning & Evening Hot Tiffins",
    timingText: "6:00 AM – 10:30 AM & 5:00 PM – 10:30 PM",
    shortTiming: "6–10:30 AM & 5–10:30 PM",
    timeWindows: [
      { start: "06:00", end: "10:30" },
      { start: "17:00", end: "22:30" },
    ],
    quote:
      "Sunrise & twilight call for steaming soft idlys, golden ghee karam dosas, and crisp medu wadas ladled hot straight off the iron tawa.",
    description:
      "Hand-fermented coastal Andhra batter, pure cow ghee, roasted peanut-coconut chutneys & sizzling dosa classics served fresh morning & evening.",
    heroImage: "/ghee-karam-dosa.jpg",
    theme: "tiffins-green",
    categorySlugs: ["tiffins", "dosa"],
    accentHex: "#153B10",
    surfaceHex: "#F4F8F2",
    alwaysOpen: false,
    openSessions: ["MORNING", "EVENING"],
  },
  biryanis: {
    key: "biryanis",
    route: "/biryanis",
    number: "02",
    title: "UPAHAR BIRYANIS",
    shortTitle: "Upahar Biryanis",
    badgeName: "UPAHAR BIRYANIS",
    tagline: "Royal Copper Handi Dum Biryanis",
    timingText: "12:00 PM – 10:30 PM",
    shortTiming: "12:00 PM – 10:30 PM",
    timeWindows: [{ start: "12:00", end: "22:30" }],
    quote:
      "Aged saffron basmati layered with hand-pounded coastal spices, slow-sealed on aromatic dum until every grain glistens.",
    description:
      "Signature Hyderabadi Chicken Dum Biryani, fiery Andhra Fry-Piece Biryani & aromatic egg dum handis prepared fresh from 12:00 PM – 10:30 PM.",
    heroImage: "/images/biryani-hero.jpg",
    theme: "biryanis-maroon",
    categorySlugs: ["biryanis"],
    accentHex: "#580D1A",
    surfaceHex: "#FAF7F2",
    alwaysOpen: false,
    openSessions: ["EVENING"],
  },
  "fast-food": {
    key: "fast-food",
    route: "/fast-food",
    number: "03",
    title: "UPAHAR FAST FOODS",
    shortTitle: "Upahar Fast Foods",
    badgeName: "UPAHAR FAST FOODS",
    tagline: "High-Flame Wok Noodles, Fried Rice & Starters",
    timingText: "5:00 PM – 10:30 PM",
    shortTiming: "5:00 PM – 10:30 PM",
    timeWindows: [{ start: "17:00", end: "22:30" }],
    quote:
      "Roaring high-flame wok noodles, smoky basmati fried rice, flaky layered parottas & crispy Manchurian tossed fresh every evening.",
    description:
      "Sizzling Street-Style Schezwan Noodles, Chicken & Paneer Fried Rice, Crispy Manchurian Starters & Hot Parottas served fresh 5:00 PM – 10:30 PM.",
    heroImage: "/chicken-fried-rice.jpg",
    theme: "fastfood-gold",
    categorySlugs: FAST_FOOD_CATEGORY_SLUGS,
    accentHex: "#D97706",
    surfaceHex: "#FFFBEB",
    alwaysOpen: false,
    openSessions: ["EVENING"],
  },
  pickles: {
    key: "pickles",
    route: "/pickles",
    number: "04",
    title: "UPAHAR PICKLES",
    shortTitle: "Upahar Pickles",
    badgeName: "UPAHAR PICKLES",
    tagline: "Authentic Andhra Homemade Pickle Jars",
    timingText: "Open 24×7 Anytime",
    shortTiming: "24×7 Anytime",
    timeWindows: [{ start: "00:00", end: "24:00" }],
    quote:
      "Sun-matured Guntur red chilli, raw farm mangoes & cold-pressed gingelly oil blended in earthen barnis — authentic Andhra spice in every spoon.",
    description:
      "Authentic homemade Avakaya Mango, Gongura Red Chilli, Tomato Nilva, Garlic Karam & Andhra Chicken Pickle jars — available to order 24×7 anytime!",
    heroImage: "/images/dishes/pickles-hero.jpg",
    theme: "pickles-red",
    categorySlugs: ["pickles"],
    accentHex: "#E10000",
    surfaceHex: "#FFF5F5",
    alwaysOpen: true,
    openSessions: ["MORNING", "EVENING", "CLOSED"],
  },
};

export const UPAHAR_DIVISION_LIST: UpaharDivisionConfig[] = [
  UPAHAR_DIVISIONS.tiffins,
  UPAHAR_DIVISIONS.biryanis,
  UPAHAR_DIVISIONS["fast-food"],
  UPAHAR_DIVISIONS.pickles,
];

export function isValidDivisionKey(val: unknown): val is DivisionKey {
  return val === "tiffins" || val === "biryanis" || val === "fast-food" || val === "pickles";
}

export function getDivisionForCategorySlug(categorySlug: string | undefined | null): DivisionKey {
  const slug = (categorySlug || "").toLowerCase().trim();
  if (PICKLE_CATEGORY_SLUGS.includes(slug) || slug.includes("pickle")) return "pickles";
  if (MORNING_ONLY_CATEGORY_SLUGS.includes(slug) || slug.includes("tiffin") || slug.includes("dosa") || slug.includes("idly")) {
    return "tiffins";
  }
  if (BIRYANI_CATEGORY_SLUGS.includes(slug) || slug.includes("biryani")) return "biryanis";
  return "fast-food";
}

export function getDivisionForCategory(
  category?: { slug?: string | null; division?: string | null } | string | null
): DivisionKey {
  if (!category) return "fast-food";
  if (typeof category === "string") {
    return isValidDivisionKey(category) ? category : getDivisionForCategorySlug(category);
  }
  if (isValidDivisionKey(category.division)) {
    return category.division;
  }
  return getDivisionForCategorySlug(category.slug);
}

export function getCurrentIstMinutes(now: Date = new Date()): number {
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + now.getTimezoneOffset() * 60 * 1000 + istOffset);
  return istDate.getHours() * 60 + istDate.getMinutes();
}

export function parseTimeToMinutes(hhmm: string): number {
  const parts = (hhmm || "").split(":");
  const h = parseInt(parts[0] || "0", 10);
  const m = parseInt(parts[1] || "0", 10);
  return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
}

export function parseTimeWindows(
  raw?: string | TimeWindow[] | null,
  fallback: TimeWindow[] = []
): TimeWindow[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter((w) => w && typeof w.start === "string" && typeof w.end === "string");
      }
    } catch {}
  }
  return fallback;
}

export function formatTimeString(time24: string): string {
  if (!time24 || !time24.includes(":")) return time24;
  const [hStr, mStr] = time24.split(":");
  let h = parseInt(hStr, 10);
  const m = mStr.padStart(2, "0");
  if (h === 24 && m === "00") return "12:00 AM";
  const period = h >= 12 && h < 24 ? "PM" : "AM";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${m} ${period}`;
}

export function formatTimeWindowsLabel(windows: TimeWindow[], alwaysOpen = false): string {
  if (alwaysOpen) return "Open 24×7 Anytime";
  if (!windows || windows.length === 0) return "Scheduled Hours";
  return windows
    .map((w) => `${formatTimeString(w.start)} – ${formatTimeString(w.end)}`)
    .join(" & ");
}

export function isWithinTimeWindows(windows: TimeWindow[], istMinutes: number): boolean {
  if (!windows || windows.length === 0) return false;
  return windows.some((w) => {
    const startMins = parseTimeToMinutes(w.start);
    const endMins = parseTimeToMinutes(w.end);
    if (endMins <= startMins) {
      // Overnight window e.g. 22:00 -> 02:00
      return istMinutes >= startMins || istMinutes < endMins;
    }
    return istMinutes >= startMins && istMinutes < endMins;
  });
}

export function mergeDivisionConfig(
  divisionKey: DivisionKey,
  dbConfig?: SubsiteDbConfigLike | null
): UpaharDivisionConfig & {
  isActive: boolean;
  isOpenOverride: boolean | null;
  pausedMessage: string | null;
} {
  const base = UPAHAR_DIVISIONS[divisionKey];
  const timeWindows = parseTimeWindows(dbConfig?.timeWindowsJson, base.timeWindows);
  const alwaysOpen = dbConfig?.alwaysOpen ?? Boolean(base.alwaysOpen);
  const timingText =
    dbConfig?.scheduleLabel?.trim() ||
    (alwaysOpen ? "Open 24×7 Anytime" : formatTimeWindowsLabel(timeWindows, alwaysOpen));

  return {
    ...base,
    title: dbConfig?.title?.trim() || base.title,
    shortTitle: dbConfig?.shortTitle?.trim() || base.shortTitle,
    tagline: dbConfig?.tagline?.trim() || base.tagline,
    quote: dbConfig?.quote?.trim() || base.quote,
    description: dbConfig?.description?.trim() || base.description,
    heroImage: dbConfig?.heroImage?.trim() || base.heroImage,
    timeWindows,
    alwaysOpen,
    timingText,
    shortTiming: alwaysOpen ? "24×7 Anytime" : timingText,
    isActive: dbConfig?.isActive !== false,
    isOpenOverride:
      dbConfig?.isOpenOverride === true
        ? true
        : dbConfig?.isOpenOverride === false
        ? false
        : null,
    pausedMessage: dbConfig?.pausedMessage || null,
  };
}

export function evaluateDivisionStatus(
  divisionKey: DivisionKey,
  options: {
    isEmergencyClosed?: boolean;
    enforceStoreHours?: boolean;
    previewUnlocked?: boolean;
    dbConfig?: SubsiteDbConfigLike | null;
    istMinutes?: number;
  } = {}
): {
  isOpen: boolean;
  isLocked: boolean;
  statusLabel: string;
  timingText: string;
  lockBanner: string | null;
} {
  const merged = mergeDivisionConfig(divisionKey, options.dbConfig);
  const istMinutes = options.istMinutes ?? getCurrentIstMinutes();
  const enforceStoreHours = options.enforceStoreHours !== false;

  if (options.isEmergencyClosed) {
    return {
      isOpen: false,
      isLocked: true,
      statusLabel: "CLOSED TODAY",
      timingText: merged.timingText,
      lockBanner: "Restaurant is temporarily closed today. Please check back soon.",
    };
  }

  if (!merged.isActive) {
    return {
      isOpen: false,
      isLocked: true,
      statusLabel: "PAUSED BY ADMIN",
      timingText: merged.timingText,
      lockBanner:
        merged.pausedMessage ||
        `${merged.title} is temporarily paused by restaurant management. Check back soon or explore our other open Upahar kitchens!`,
    };
  }

  if (merged.isOpenOverride === false) {
    return {
      isOpen: false,
      isLocked: true,
      statusLabel: "CLOSED BY ADMIN",
      timingText: merged.timingText,
      lockBanner:
        merged.pausedMessage ||
        `${merged.title} is currently closed by restaurant management. Normal hours: ${merged.timingText}.`,
    };
  }

  if (merged.isOpenOverride === true || merged.alwaysOpen || options.previewUnlocked || !enforceStoreHours) {
    return {
      isOpen: true,
      isLocked: false,
      statusLabel: merged.alwaysOpen ? "OPEN 24×7" : "OPEN NOW",
      timingText: merged.timingText,
      lockBanner: null,
    };
  }

  const openNow = isWithinTimeWindows(merged.timeWindows, istMinutes);
  if (openNow) {
    return {
      isOpen: true,
      isLocked: false,
      statusLabel: "OPEN NOW",
      timingText: merged.timingText,
      lockBanner: null,
    };
  }

  return {
    isOpen: false,
    isLocked: true,
    statusLabel: `OPENS ${merged.shortTiming}`,
    timingText: merged.timingText,
    lockBanner: `${merged.title} is currently closed. Ordering is open strictly during ${merged.timingText} IST. Upahar Pickles is open 24×7 anytime!`,
  };
}

export function getDivisionStatus(
  divisionKey: DivisionKey,
  storeStatus: StoreStatus,
  enforceStoreHours = true,
  previewUnlocked = false,
  dbConfig?: SubsiteDbConfigLike | null
) {
  return evaluateDivisionStatus(divisionKey, {
    isEmergencyClosed: storeStatus.isEmergencyClosed,
    enforceStoreHours,
    previewUnlocked,
    dbConfig,
  });
}

export function getSubsiteThemeFromPath(
  pathname: string | null | undefined,
  themeOverride?: string | null,
  hubPreference?: HubThemePreference | null
): WebsiteThemeMode {
  const path = (pathname || "/").toLowerCase();

  // Internal staff panels preserve their executive maroon studio palette
  if (
    path.startsWith("/admin") ||
    path.startsWith("/kitchen") ||
    path.startsWith("/delivery") ||
    path.startsWith("/portal") ||
    path.startsWith("/dev")
  ) {
    return "original-maroon";
  }

  if (path.startsWith("/tiffins")) return "tiffins-green";
  if (path.startsWith("/biryanis")) return "biryanis-maroon";
  if (path.startsWith("/fast-food")) return "fastfood-gold";
  if (path.startsWith("/pickles")) return "pickles-red";

  const override = themeOverride?.toLowerCase().trim();
  if (override === "tiffins" || override === "green" || override === "morning") return "tiffins-green";
  if (override === "biryanis" || override === "maroon") return "biryanis-maroon";
  if (override === "fast-food" || override === "gold" || override === "yellow") return "fastfood-gold";
  if (override === "pickles" || override === "red") return "pickles-red";
  if (path === "/" || path === "") {
    if (override === "dark") return "dark-hub";
    if (override === "light") return "light-hub";
    if (hubPreference === "dark") return "dark-hub";
  }

  // Main Hub Website & shared pages default to Light Colour
  return "light-hub";
}

export function getWebsiteTheme(
  _sessionType?: SessionType | string | null,
  themeOverride?: string | null,
  pathname?: string | null,
  hubPreference?: HubThemePreference | null
): WebsiteThemeMode {
  return getSubsiteThemeFromPath(pathname, themeOverride, hubPreference);
}

export function getEffectiveSessionType(
  liveSession: SessionType = "EVENING",
  themeOverride?: string | null
): SessionType {
  const normalized = themeOverride?.toLowerCase().trim();
  if (normalized === "morning" || normalized === "green" || normalized === "tiffins") return "MORNING";
  if (
    normalized === "evening" ||
    normalized === "maroon" ||
    normalized === "biryanis" ||
    normalized === "fast-food" ||
    normalized === "gold"
  ) {
    return "EVENING";
  }
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
      pickles: 2,
      biryanis: 3,
      "roti-curries": 4,
      "fried-rice": 5,
      noodles: 6,
      starters: 7,
      "evening-specials": 8,
    };
    return morningOrder[slug] ?? 9;
  }
  const afternoonOrder: Record<string, number> = {
    biryanis: 0,
    "roti-curries": 1,
    "fried-rice": 2,
    noodles: 3,
    starters: 4,
    "evening-specials": 5,
    pickles: 6,
    dosa: 7,
    tiffins: 8,
  };
  return afternoonOrder[slug] ?? 9;
}

export function getItemSessionAvailability(
  categorySlug: string | undefined | null,
  _sessionType: SessionType,
  enforceStoreHours = true,
  categoryDivision?: string | null,
  subsiteMap?: Partial<Record<DivisionKey, SubsiteDbConfigLike | null>>,
  isEmergencyClosed = false
): {
  isLocked: boolean;
  availableAtText: string | null;
  lockMessage: string | null;
} {
  const divKey = getDivisionForCategory({ slug: categorySlug, division: categoryDivision });
  const evalResult = evaluateDivisionStatus(divKey, {
    isEmergencyClosed,
    enforceStoreHours,
    dbConfig: subsiteMap?.[divKey],
  });

  if (!evalResult.isLocked) {
    return {
      isLocked: false,
      availableAtText: divKey === "pickles" ? "Open 24×7 Anytime" : null,
      lockMessage: null,
    };
  }

  return {
    isLocked: true,
    availableAtText: evalResult.timingText,
    lockMessage: evalResult.lockBanner,
  };
}

export function isCategoryAvailableInSession(
  categorySlug: string | undefined | null,
  _sessionType: SessionType,
  categoryDivision?: string | null
): boolean {
  if (!categorySlug && !categoryDivision) return true;
  const divKey = getDivisionForCategory({ slug: categorySlug, division: categoryDivision });
  const evalResult = evaluateDivisionStatus(divKey, { enforceStoreHours: true });
  return evalResult.isOpen;
}

export function getDiningSessions() {
  return [
    {
      name: "Upahar Tiffins",
      timeRange: "6:00 AM – 10:30 AM & 5:00 PM – 10:30 PM",
      startH: 6,
      startM: 0,
      endH: 10,
      endM: 30,
      description: "Fresh hot idlys, ghee karam dosas, medu wada, tatte idly & bonda.",
      badge: "Tiffins Green",
    },
    {
      name: "Upahar Biryanis",
      timeRange: "12:00 PM – 10:30 PM",
      startH: 12,
      startM: 0,
      endH: 22,
      endM: 30,
      description: "Hyderabadi Chicken Dum Biryani, Fry Piece Biryani & Egg Dum Handi.",
      badge: "Biryanis Maroon",
    },
    {
      name: "Upahar Fast Foods",
      timeRange: "5:00 PM – 10:30 PM",
      startH: 17,
      startM: 0,
      endH: 22,
      endM: 30,
      description: "Roaring high-flame wok noodles, fried rice, Manchurian & parottas.",
      badge: "Fast Foods Gold",
    },
    {
      name: "Upahar Pickles",
      timeRange: "Open 24×7 Anytime",
      startH: 0,
      startM: 0,
      endH: 24,
      endM: 0,
      description: "Authentic Andhra Avakaya Mango, Gongura, Tomato & Chicken pickle jars.",
      badge: "Always Open Red",
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
      isEmergencyClosed: true,
    };
  }

  const currentTotalMinutes = getCurrentIstMinutes();

  const tiffinsMorning = currentTotalMinutes >= 360 && currentTotalMinutes < 630;
  const biryanisOpen = currentTotalMinutes >= 720 && currentTotalMinutes < 1350;
  const eveningAllOpen = currentTotalMinutes >= 1020 && currentTotalMinutes < 1350;

  if (tiffinsMorning) {
    return {
      isOpen: true,
      sessionType: "MORNING",
      statusText: "OPEN NOW • UPAHAR TIFFINS & PICKLES",
      subText: "Tiffins (6–10:30 AM) & Pickles (24×7) open • Biryanis at 12 PM • Fast Foods at 5 PM",
      currentSession: "Upahar Tiffins (6:00 AM – 10:30 AM)",
      openingTime: "06:00",
      closingTime: "10:30",
      isEmergencyClosed: false,
    };
  }

  if (eveningAllOpen) {
    return {
      isOpen: true,
      sessionType: "EVENING",
      statusText: "ALL 4 WEBSITES OPEN NOW",
      subText: "Tiffins, Biryanis, Fast Foods (till 10:30 PM) & Pickles (24×7) accepting orders!",
      currentSession: "Evening Peak (5:00 PM – 10:30 PM)",
      openingTime: "17:00",
      closingTime: "22:30",
      isEmergencyClosed: false,
    };
  }

  if (biryanisOpen) {
    return {
      isOpen: true,
      sessionType: "EVENING",
      statusText: "OPEN NOW • UPAHAR BIRYANIS & PICKLES",
      subText: "Biryanis (12–10:30 PM) & Pickles (24×7) open • Tiffins & Fast Foods open at 5:00 PM",
      currentSession: "Afternoon Biryanis (12:00 PM – 5:00 PM)",
      openingTime: "12:00",
      closingTime: "22:30",
      isEmergencyClosed: false,
    };
  }

  if (currentTotalMinutes >= 630 && currentTotalMinutes < 720) {
    return {
      isOpen: false,
      sessionType: "CLOSED",
      statusText: "KITCHEN PREP BREAK • PICKLES OPEN 24×7",
      subText: "Biryanis open 12:00 PM • Tiffins & Fast Foods open 5:00 PM • Upahar Pickles 24×7!",
      currentSession: "Kitchen Prep Break (10:30 AM – 12:00 PM)",
      openingTime: "12:00",
      closingTime: "22:30",
      isEmergencyClosed: false,
    };
  }

  return {
    isOpen: false,
    sessionType: "CLOSED",
    statusText: "HOT KITCHENS CLOSED • PICKLES OPEN 24×7",
    subText: "Tiffins 6–10:30 AM & 5–10:30 PM • Biryanis 12–10:30 PM • Fast Foods 5–10:30 PM • Pickles 24×7",
    currentSession: "Overnight • Pickles Open 24×7",
    openingTime: "06:00",
    closingTime: "10:30",
    isEmergencyClosed: false,
  };
}
