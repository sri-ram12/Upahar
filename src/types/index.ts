export type DivisionType = "tiffins" | "biryanis" | "fast-food" | "pickles";

export interface Category {
  id: string;
  name: string;
  slug: string;
  division?: DivisionType | string;
  image?: string | null;
  description?: string | null;
  icon?: string | null;
  displayOrder: number;
  isActive: boolean;
  items?: FoodItem[];
  _count?: { items: number };
}

export interface SubsiteTimeWindow {
  start: string;
  end: string;
}

export interface SubsiteConfigItem {
  id: DivisionType;
  title: string;
  shortTitle: string;
  tagline: string;
  quote: string;
  description: string;
  heroImage: string;
  theme: string;
  scheduleLabel: string;
  timeWindowsJson: string;
  alwaysOpen: boolean;
  isOpenOverride?: boolean | null;
  isActive: boolean;
  pausedMessage?: string | null;
  displayOrder: number;
  status?: {
    isOpen: boolean;
    isLocked: boolean;
    statusLabel: string;
    timingText: string;
    lockBanner: string | null;
  };
}

export interface FoodItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
  category?: Category;
  isVeg: boolean;
  isSpicy: boolean;
  isBestseller: boolean;
  isSignature: boolean;
  isAvailable: boolean;
  prepTime: string;
  portionSize?: string | null;
  ingredients?: string | null;
  displayOrder: number;
  isSessionLocked?: boolean;
  lockReason?: string | null;
  availableAtText?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface RestaurantSetting {
  id: string;
  restaurantName: string;
  tagline: string;
  heroHeadline: string;
  heroSubheadline: string;
  storyTitle: string;
  storyText: string;
  phone: string;
  email: string;
  whatsappNumber: string;
  address: string;
  landmark: string;
  googleMapsUrl: string;
  openingTime: string;
  closingTime: string;
  breakfastHours: string;
  lunchHours: string;
  eveningHours: string;
  dinnerHours: string;
  isEmergencyClosed: boolean;
  isEmergencyWebsiteStopped?: boolean;
  emergencyStopMessage?: string;
  isOnlineOrderingEnabled?: boolean;
  enforceStoreHours?: boolean;
  deliveryRadiusKm?: number;
  deliveryBaseFee?: number;
  minOrderFreeDelivery?: number;
  minDeliveryOrderAmount?: number;
  packagingFee?: number;
  upiId?: string;
  upiMerchantName?: string;
  paymentQrUrl?: string;
  fssaiNumber?: string | null;
  instagramUrl: string;
  pureVegPledge: string;
  updatedAt?: Date | string;
}

export interface CustomerAddress {
  id: string;
  customerId: string;
  label: string;
  address: string;
  landmark?: string | null;
  locality: string;
  lat?: number | null;
  lng?: number | null;
  distanceKm?: number | null;
  isDefault: boolean;
  createdAt?: string | Date;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: "FLAT" | "PERCENT";
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number | null;
  isActive: boolean;
  usageCount: number;
  createdAt?: string | Date;
}

export interface CustomerUser {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  emailVerified?: boolean;
  avatarUrl?: string | null;
  authProvider?: string;
  address?: string | null;
  landmark?: string | null;
  locality?: string | null;
  addresses?: CustomerAddress[];
  createdAt?: string | Date;
}

export interface DeliveryAgent {
  id: string;
  name: string;
  phone: string;
  vehicleNumber: string;
  status: "ACTIVE" | "ON_DELIVERY" | "OFFLINE" | "INACTIVE";
  approvalStatus?: "PENDING_APPROVAL" | "APPROVED" | "REJECTED";
  isActive: boolean;
  totalDeliveries: number;
  cashInHand: number;
  totalEarnings?: number;
  createdAt?: string | Date;
}

export interface CartItem {
  foodItem: FoodItem;
  quantity: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  foodItemId?: string | null;
  name: string;
  price: number;
  quantity: number;
  portionSize?: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string | null;
  customer?: CustomerUser | null;
  customerName: string;
  customerPhone: string;
  orderType: "DELIVERY" | "TAKEAWAY" | "DINE_IN";
  tableNumber?: string | null;
  deliveryAddress?: string | null;
  landmark?: string | null;
  locality?: string | null;
  lat?: number | null;
  lng?: number | null;
  distanceKm?: number | null;
  deliveryFee: number;
  packagingFee?: number;
  couponCode?: string | null;
  discountAmount?: number;
  subtotal: number;
  totalAmount: number;
  specialInstructions?: string | null;
  paymentMethod: "COD" | "UPI" | "QR_ON_DELIVERY";
  paymentStatus: "PENDING" | "VERIFICATION_PENDING" | "PAID";
  upiTransactionId?: string | null;
  paymentConfirmedBy?: string | null;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "PREPARING"
    | "FOOD_READY"
    | "OUT_FOR_DELIVERY"
    | "ARRIVED"
    | "DELIVERED"
    | "CANCELLED";
  deliveryOtp: string;
  deliveryAgentId?: string | null;
  deliveryAgent?: DeliveryAgent | null;
  riderLat?: number | null;
  riderLng?: number | null;
  riderLocationUpdatedAt?: string | Date | null;
  estimatedTime?: string | null;
  rejectionReason?: string | null;
  cancelledBy?: string | null;
  cancelledAt?: string | Date | null;
  rating?: number | null;
  deliveryRating?: number | null;
  reviewComment?: string | null;
  reviewedAt?: string | Date | null;
  paymentCollectedAt?: string | Date | null;
  deliveredAt?: string | Date | null;
  createdAt: string | Date;
  updatedAt?: string | Date;
  items: OrderItem[];
}

export interface GalleryImage {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  caption?: string | null;
  isAmbiance: boolean;
  displayOrder: number;
  createdAt?: Date | string;
}

export interface ContactMessage {
  id: string;
  name: string;
  contact: string;
  email?: string | null;
  subject?: string | null;
  message: string;
  isRead: boolean;
  createdAt: Date | string;
}

export interface DiningSession {
  name: string;
  timeRange: string;
  description: string;
  icon: string;
  isActiveNow?: boolean;
}
