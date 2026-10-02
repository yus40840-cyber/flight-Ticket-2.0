// ============================================================================
// FLIGH.COM DATABASE MODELS & TYPE DEFINITIONS
// ============================================================================

export type BookingStatus =
  | 'CONFIRMED'
  | 'PENDING_PAYMENT'
  | 'CANCELLED'
  | 'CHECKED_IN'
  | 'COMPLETED';

export type PaymentStatus = 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED';
export type CabinClass = 'Economy' | 'Premium Economy' | 'Business' | 'First';

export interface UserRecord {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  passportOrCnic: string;
  nationality: string;
  coinsBalance: number;
  createdAt: string;
  updated_at?: string;
}

export interface AirlineRecord {
  code: string;
  name: string;
  country: string;
  logoColor: string;
}

export interface AirportRecord {
  iataCode: string;
  name: string;
  city: string;
  country: string;
  terminals: number;
}

export interface FlightRecord {
  id: string;
  flightNumber: string;
  airlineCode: string;
  airlineName: string;
  originCode: string;
  originCity: string;
  destCode: string;
  destCity: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  stopDetails?: string;
  aircraft: string;
  cabinClass: CabinClass;
  pricePKR: number;
  baggage: string;
  meal: string;
  availableSeats: number;
}

export interface HotelRecord {
  id: string;
  name: string;
  city: string;
  area: string;
  address?: string;
  ratingScore: number;
  reviewCount: number;
  pricePKR: number;
  stars: number;
  freeBreakfast: boolean;
  freeCancellation: boolean;
  amenities: string[];
}

export interface ETicketRecord {
  id: string;
  bookingId: string;
  ticketNumber: string;
  pnr: string;
  seat: string;
  gate: string;
  terminal: string;
  boardingTime: string;
  cabinClass: string;
  barcodeData: string;
  qrSecurityHash: string;
  issueDate: string;
}

export interface BookingRecord {
  id: string;
  reference: string; // PNR e.g. FLI-829104
  eTicketNumber: string;
  type: 'flight' | 'hotel' | 'train' | 'sight';
  title: string;
  price: number;
  date: string;
  passenger: string;
  passengerEmail: string;
  passengerPhone: string;
  passportOrCnic: string;
  status: string; // 'Confirmed & Ticket Issued', 'Cancelled'
  paymentStatus: PaymentStatus;
  ticketData?: any;
  createdAt: string;
}

export interface CouponRecord {
  code: string;
  category: string;
  discountTitle: string;
  discountDesc: string;
  minSpendPKR: number;
  expiresIn: string;
  claimed: boolean;
}
