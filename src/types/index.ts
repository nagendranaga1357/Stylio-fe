// User Types
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

// Location Types
export interface City {
  id: string;
  name: string;
  state: string;
  country: string;
  salonCount?: number;
}

export interface Area {
  id: string;
  name: string;
  city: string | City;
  cityName?: string;
  pincode: string;
  salonCount?: number;
}

// Salon Types
export interface Salon {
  id: string;
  name: string;
  description?: string;
  area: Area;
  areaName?: string;
  cityName?: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  openingTime: string;
  closingTime: string;
  isOpenSunday: boolean;
  coverImage?: string;
  logo?: string;
  galleryImages?: { image: string; caption?: string }[];
  rating: number;
  totalReviews: number;
  isActive: boolean;
  isVerified: boolean;
  features?: {
    hasParking: boolean;
    hasWifi: boolean;
    hasAc: boolean;
    acceptsCards: boolean;
  };
  servicesCount?: number;
  providersCount?: number;
  distance?: string;
}

export interface SalonFilters {
  city?: string;
  area?: string;
  minRating?: number;
  hasParking?: boolean;
  hasWifi?: boolean;
  hasAc?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

// Service Types
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
  salonName?: string;
  serviceType: string | ServiceType;
  serviceTypeName?: string;
  categoryName?: string;
  name: string;
  description?: string;
  price: number;
  discountedPrice?: number;
  finalPrice: number;
  durationMinutes: number;
  isPopular: boolean;
}

// Provider Types
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

// Booking Types
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

// Review Types
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

// Other Types
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

// Pagination
export interface PaginatedResponse<T> {
  salons?: T[];
  bookings?: T[];
  data?: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  SalonDetails: { salonId: string };
  BookingFlow: { salon: Salon; services: Service[] };
  SlotSelection: { salon: Salon; services: Service[] };
  BookingConfirmation: { booking: Booking };
  Profile: undefined;
  Notifications: undefined;
  Favorites: undefined;
  Settings: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  OtpVerification: { email: string };
};

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Bookings: undefined;
  Shorts: undefined;
  Profile: undefined;
};

