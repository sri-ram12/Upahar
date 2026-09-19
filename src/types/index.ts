export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  displayOrder: number;
  isActive: boolean;
  items?: FoodItem[];
  _count?: { items: number };
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
  instagramUrl: string;
  pureVegPledge: string;
  updatedAt?: Date | string;
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
