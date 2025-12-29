// ============================================
// V1 API Types - Search & Discovery
// ============================================

// Service Mode Types (To Salon / To Home)
export type ServiceMode = 'toSalon' | 'toHome' | 'both';

// Audience Types
export type AudienceType = 'men' | 'women' | 'kids' | 'unisex';

// Price Level (1-4)
export type PriceLevel = 1 | 2 | 3 | 4;

// Sort Options
export type SalonSortBy = 'distance' | 'rating' | 'price' | 'popular';
export type ServiceSortBy = 'price' | 'popular' | 'duration';
export type SortOrder = 'asc' | 'desc';

// ============================================
// User Types
// ============================================

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  role: 'customer' | 'provider' | 'admin';
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

// ============================================
// Location Types
// ============================================

export interface GeoLocation {
  type: 'Point';
  coordinates: [number, number]; // [lng, lat]
}

export interface GeoBounds {
  type: 'Polygon';
  coordinates: [number, number][][];
}

export interface City {
  id: string;
  name: string;
  slug?: string;
  state: string;
  country: string;
  geoBounds?: GeoBounds;
  salonCount?: number;
}

export interface Area {
  id: string;
  name: string;
  slug?: string;
  city: string | City;
  cityName?: string;
  pincode: string;
  geoBounds?: GeoBounds;
  salonCount?: number;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  city?: string;
  area?: string;
}

// ============================================
// Salon Types (V1 Enhanced)
// ============================================

export interface Salon {
  id: string;
  name: string;
  description?: string;
  // V1: Service mode support
  mode: ServiceMode;
  audience: AudienceType[];
  // Location
  area: Area;
  areaName?: string;
  cityName?: string;
  address: string;
  location?: GeoLocation;
  // Contact
  phone?: string;
  mobile?: string;
  email?: string;
  website?: string;
  // Operating hours
  openingTime: string;
  closingTime: string;
  isOpenSunday: boolean;
  // Media
  coverImage?: string;
  logo?: string;
  galleryImages?: { image: string; caption?: string }[];
  thumbnailUrl?: string;
  // Ratings & Price
  rating: number;
  averageRating?: number; // V1: precomputed rating
  totalReviews: number;
  priceLevel?: PriceLevel; // V1: price tier (1-4)
  // Status
  isActive: boolean;
  isVerified: boolean;
  // Features
  features?: {
    hasParking: boolean;
    hasWifi: boolean;
    hasAc: boolean;
    acceptsCards: boolean;
  };
  // Counts
  servicesCount?: number;
  providersCount?: number;
  // V1: Distance from user (only in geo-search results)
  distanceInMeters?: number;
  distance?: string; // formatted distance string
}

// V1: Enhanced salon search filters
export interface SalonFilters {
  // Text search
  q?: string;
  search?: string;
  // Location-based search
  lat?: number;
  lng?: number;
  radius?: number; // in meters, default 5000
  // City/Area based search
  cityId?: string;
  areaId?: string;
  city?: string; // legacy support
  area?: string; // legacy support
  // Mode & Audience filters
  mode?: ServiceMode;
  audience?: AudienceType;
  // Rating & Price filters
  minRating?: number;
  maxRating?: number;
  minPriceLevel?: PriceLevel;
  maxPriceLevel?: PriceLevel;
  // Feature filters (legacy)
  hasParking?: boolean;
  hasWifi?: boolean;
  hasAc?: boolean;
  // Pagination
  page?: number;
  limit?: number;
  // Sorting
  sortBy?: SalonSortBy;
  sortOrder?: SortOrder;
}

// V1: Salon list response with enhanced pagination
export interface SalonListResponse {
  data: Salon[];
  pagination: PaginationMeta;
}

// ============================================
// Service Types (V1 Enhanced)
// ============================================

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  serviceTypesCount?: number;
}

export interface ServiceType {
  id: string;
  name: string;
  slug: string;
  category: ServiceCategory;
  categoryName?: string;
  description?: string;
  icon?: string;
  image?: string;
}

export interface Service {
  id: string;
  salon: string | Salon;
  salonId?: string;
  salonName?: string;
  serviceType: string | ServiceType;
  serviceTypeName?: string;
  categoryName?: string;
  name: string;
  description?: string;
  // V1: Mode & Audience
  mode?: ServiceMode;
  audience?: AudienceType[];
  // Pricing
  price: number;
  basePrice?: number; // V1: base price
  discountedPrice?: number;
  finalPrice: number;
  // Duration
  durationMinutes: number;
  // Flags
  isPopular: boolean;
}

// V1: Enhanced service search filters
export interface ServiceFilters {
  // Text search
  q?: string;
  // Mode & Audience
  mode?: ServiceMode;
  audience?: AudienceType;
  // Salon
  salonId?: string;
  salon?: string; // legacy
  // Category
  categoryId?: string;
  typeId?: string;
  category?: string; // legacy
  // Price range
  minPrice?: number;
  maxPrice?: number;
  // Flags
  popular?: boolean;
  // Pagination
  page?: number;
  limit?: number;
  // Sorting
  sortBy?: ServiceSortBy;
  sortOrder?: SortOrder;
}

// V1: Service list response
export interface ServiceListResponse {
  data: Service[];
  pagination: PaginationMeta;
}

// ============================================
// Provider Types
// ============================================

export interface Provider {
  id: string;
  user: User;
  name?: string;
  salon?: Salon;
  salonName?: string;
  phone: string;
  avatar?: string;
  bio?: string;
  specialization: string;
  specializationDisplay?: string;
  experienceYears: number;
  certifications?: string;
  providesHomeService: boolean;
  homeServiceFee?: number;
  rating: number;
  totalReviews: number;
  isAvailable: boolean;
  isVerified: boolean;
  availability?: {
    day: string;
    dayNumber: number;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }[];
}

// ============================================
// Booking Types
// ============================================

export interface BookingService {
  service: Service | string;
  serviceName?: string;
  quantity: number;
  price: number;
  duration?: number;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  customer: User;
  salon: Salon;
  salonName?: string;
  provider?: Provider;
  providerName?: string;
  bookingType: 'salon' | 'home';
  bookingDate: string;
  bookingTime: string;
  services: BookingService[];
  servicesCount?: number;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  homeAddress?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  customerNotes?: string;
  salonNotes?: string;
  cancelledBy?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  createdAt: string;
}

export interface BookingCreateData {
  salon: string;
  provider?: string;
  bookingType: 'salon' | 'home';
  bookingDate: string;
  bookingTime: string;
  services: string[];
  homeAddress?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  customerNotes?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

// ============================================
// Review Types
// ============================================

export interface Review {
  id: string;
  salon?: Salon;
  provider?: Provider;
  customer: User;
  customerName?: string;
  booking?: string;
  rating: number;
  title?: string;
  comment: string;
  cleanlinessRating?: number;
  serviceRating?: number;
  valueRating?: number;
  isVerified: boolean;
  createdAt: string;
}

// ============================================
// Other Types
// ============================================

export interface Notification {
  id: string;
  title: string;
  message: string;
  notificationType: string;
  relatedBooking?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Favorite {
  id: string;
  salon: Salon;
  createdAt: string;
}

export interface PromoCode {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscount?: number;
  minBookingAmount: number;
  validFrom: string;
  validUntil: string;
}

// ============================================
// Pagination Types (V1 Enhanced)
// ============================================

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

// Legacy pagination response (backward compatible)
export interface PaginatedResponse<T> {
  salons?: T[];
  services?: T[];
  bookings?: T[];
  data?: T[];
  pagination: PaginationMeta;
}

// ============================================
// V1: Unified Search Types
// ============================================

export interface UnifiedSearchParams {
  q?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  mode?: ServiceMode;
  audience?: AudienceType;
  type?: 'salons' | 'services' | 'providers' | 'all';
}

export interface UnifiedSearchResponse {
  salons?: SalonListResponse;
  services?: ServiceListResponse;
  providers?: {
    data: Provider[];
    pagination: PaginationMeta;
  };
}

// ============================================
// Navigation Types
// ============================================

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  
  // Salon Flow
  ServiceListing: { 
    service?: string; 
    serviceName?: string; 
    mode?: ServiceMode;
  };
  SalonDetails: { salonId: string };
  SlotSelection: { 
    salon: Salon; 
    services: Service[];
    isHomeService?: boolean;
  };
  PaymentMethod: {
    salon: any;
    selectedService: any;
    selectedServices: any[];
    selectedDate: string;
    selectedSlot: string;
    totalAmount: number;
    isHomeService?: boolean;
    homeAddress?: string;
    notes?: string;
  };
  BookingConfirmation: { 
    booking?: Booking;
    salon?: any;
    selectedService?: any;
    selectedServices?: any[];
    selectedDate?: string;
    selectedSlot?: string;
    bookingId?: string;
    bookingNumber?: string;
    isHomeService?: boolean;
    paymentDetails?: {
      type: 'full' | 'advance';
      amount: number;
      totalAmount: number;
      paymentId: string;
      orderId: string;
    };
  };
  
  // Home Services Flow
  HomeServices: undefined;
  HomeProviderDetails: { provider: HomeProvider };
  AllProviders: undefined;
  
  // Other
  Profile: undefined;
  Notifications: undefined;
  Favorites: undefined;
  Settings: undefined;
};

// Home Provider Type (for navigation)
export interface HomeProvider {
  id: string;
  name: string;
  image: string;
  rating: number;
  reviews: number;
  distance: string;
  location: string;
  services: string[];
  experience: string;
  phone: string;
  verified: boolean;
}

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  OtpVerification: { email: string };
};

export type MainTabParamList = {
  Home: undefined;
  Search: { 
    category?: string; 
    mode?: ServiceMode;
    audience?: AudienceType;
    q?: string;
    lat?: number;
    lng?: number;
    promo?: string;
  } | undefined;
  Bookings: undefined;
  Shorts: undefined;
  Profile: undefined;
};
