// Upahar Tiffins & Fast Food - Delivery Zone Configuration (Tagarapuvalasa / Sangivalasa)

export const UPAHAR_COORDINATES = {
  lat: 17.9254,
  lng: 83.4246,
  address: "1-1, Sangivalasa, ANITS College Road, beside SBI, Tagarapuvalasa",
};

export const MAX_DELIVERY_RADIUS_KM = 7.0;

export interface PopularLocality {
  id: string;
  name: string;
  area: string;
  distanceKm: number;
  deliveryFee: number;
  freeAbove: number;
  lat: number;
  lng: number;
}

export const TAGARAPUVALASA_LOCALITIES: PopularLocality[] = [
  {
    id: "sangivalasa-anits",
    name: "ANITS Campus & Hostels",
    area: "Sangivalasa",
    distanceKm: 0.6,
    deliveryFee: 15,
    freeAbove: 149,
    lat: 17.9218,
    lng: 83.4256,
  },
  {
    id: "sangivalasa-sbi",
    name: "Sangivalasa Main Road / Beside SBI",
    area: "Sangivalasa",
    distanceKm: 0.3,
    deliveryFee: 15,
    freeAbove: 149,
    lat: 17.9248,
    lng: 83.4239,
  },
  {
    id: "nri-hospital",
    name: "NRI Hospital & Medical College",
    area: "Sangivalasa / Tagarapuvalasa",
    distanceKm: 1.8,
    deliveryFee: 20,
    freeAbove: 199,
    lat: 17.9345,
    lng: 83.4182,
  },
  {
    id: "tagarapuvalasa-junction",
    name: "Tagarapuvalasa RTC Bus Stand & Main Junction",
    area: "Tagarapuvalasa Town",
    distanceKm: 2.2,
    deliveryFee: 25,
    freeAbove: 199,
    lat: 17.9389,
    lng: 83.4138,
  },
  {
    id: "chittivalasa-colony",
    name: "Chittivalasa & Jute Mill Area",
    area: "Chittivalasa",
    distanceKm: 3.4,
    deliveryFee: 30,
    freeAbove: 249,
    lat: 17.9491,
    lng: 83.4092,
  },
  {
    id: "bheemili-crossroad",
    name: "Bheemunipatnam Cross Roads / Beach Road stretch",
    area: "Tagarapuvalasa East",
    distanceKm: 3.1,
    deliveryFee: 30,
    freeAbove: 249,
    lat: 17.9212,
    lng: 83.4495,
  },
  {
    id: "avanthi-colleges",
    name: "Avanthi Engineering College / Cherukupalli",
    area: "NH-16 Stretch",
    distanceKm: 3.8,
    deliveryFee: 35,
    freeAbove: 299,
    lat: 17.9022,
    lng: 83.4018,
  },
  {
    id: "custom-location",
    name: "Other Location (GPS or Custom Address within 7km)",
    area: "Tagarapuvalasa Area",
    distanceKm: 2.5,
    deliveryFee: 25,
    freeAbove: 199,
    lat: 17.933,
    lng: 83.417,
  },
];

/**
 * Calculate distance between two coordinates in Kilometers (Haversine Formula)
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Calculate delivery fee based on distance, order subtotal, and optional live restaurant settings
 */
export function getDeliveryFee(
  distanceKm: number,
  subtotal: number,
  config?: {
    maxRadiusKm?: number;
    baseFee?: number;
    freeAbove?: number;
  }
): {
  fee: number;
  isFree: boolean;
  isEligible: boolean;
  freeThreshold: number;
  reason?: string;
} {
  const maxRadius = config?.maxRadiusKm ?? MAX_DELIVERY_RADIUS_KM;

  if (distanceKm > maxRadius) {
    return {
      fee: 0,
      isFree: false,
      isEligible: false,
      freeThreshold: config?.freeAbove ?? 199,
      reason: `Location is ${distanceKm}km away. We deliver within ${maxRadius}km of Tagarapuvalasa.`,
    };
  }

  let baseFee = config?.baseFee ?? 25;
  let freeThreshold = config?.freeAbove ?? 199;

  if (config?.baseFee === undefined) {
    if (distanceKm <= 1.5) {
      baseFee = 15;
      freeThreshold = config?.freeAbove ?? 149;
    } else if (distanceKm <= 3.5) {
      baseFee = 25;
      freeThreshold = config?.freeAbove ?? 199;
    } else {
      baseFee = 35;
      freeThreshold = config?.freeAbove ?? 249;
    }
  } else {
    // Scale gracefully around configured baseFee for farther distances
    if (distanceKm <= 1.5) {
      baseFee = Math.max(10, Math.round(config.baseFee * 0.6));
    } else if (distanceKm > 3.5) {
      baseFee = Math.round(config.baseFee * 1.4);
    }
  }

  if (subtotal >= freeThreshold) {
    return { fee: 0, isFree: true, isEligible: true, freeThreshold };
  }

  return { fee: baseFee, isFree: false, isEligible: true, freeThreshold };
}

