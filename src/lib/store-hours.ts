export interface StoreStatus {
  isOpen: boolean;
  statusText: string;
  subText: string;
  currentSession: string;
  openingTime: string;
  closingTime: string;
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
      name: "Morning Tiffins",
      timeRange: "6:00 AM – 10:00 AM",
      startH: 6,
      startM: 0,
      endH: 10,
      endM: 0,
      description: "Fresh hot idlys, ghee karam dosas, medu wada, tatte idly & bonda.",
      badge: "Morning Session",
    },
    {
      name: "Evening Fast Food & Tiffins",
      timeRange: "6:00 PM – 10:30 PM",
      startH: 18,
      startM: 0,
      endH: 22,
      endM: 30,
      description: "Veg & Non-Veg noodles, fried rice, crispy Manchurian, dosas, chapati & paratha.",
      badge: "Evening Session",
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
  const istDate = new Date(now.getTime() + (now.getTimezoneOffset() * 60 * 1000) + istOffset);

  const currentHours = istDate.getHours();
  const currentMinutes = istDate.getMinutes();
  const currentTotalMinutes = currentHours * 60 + currentMinutes;

  // Exact Upahar Sessions:
  // Session 1: 6:00 AM (360 min) to 10:00 AM (600 min)
  // Session 2: 6:00 PM (1080 min) to 10:30 PM (1350 min)
  const isMorning = currentTotalMinutes >= 360 && currentTotalMinutes < 600;
  const isEvening = currentTotalMinutes >= 1080 && currentTotalMinutes < 1350;

  if (isMorning) {
    return {
      isOpen: true,
      statusText: "OPEN NOW • MORNING TIFFINS",
      subText: "Serving hot breakfast • Closes at 10:00 AM",
      currentSession: "Morning Tiffins (6:00 AM – 10:00 AM)",
      openingTime: "06:00",
      closingTime: "10:00",
    };
  }

  if (isEvening) {
    return {
      isOpen: true,
      statusText: "OPEN NOW • EVENING FAST FOOD",
      subText: "Serving hot tiffins & Chinese • Closes at 10:30 PM",
      currentSession: "Evening Fast Food & Tiffins (6:00 PM – 10:30 PM)",
      openingTime: "18:00",
      closingTime: "22:30",
    };
  }

  // If between morning and evening (10:00 AM - 6:00 PM)
  if (currentTotalMinutes >= 600 && currentTotalMinutes < 1080) {
    return {
      isOpen: false,
      statusText: "AFTERNOON BREAK",
      subText: "Reopens this evening at 6:00 PM for Fast Food & Tiffins",
      currentSession: "Afternoon Prep Break",
      openingTime: "18:00",
      closingTime: "22:30",
    };
  }

  // Late night / early morning before 6 AM
  return {
    isOpen: false,
    statusText: "CLOSED NOW",
    subText: "Opens morning at 6:00 AM for fresh steaming tiffins",
    currentSession: "Closed for the night",
    openingTime: "06:00",
    closingTime: "10:00",
  };
}
