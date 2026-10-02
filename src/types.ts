export type SearchTab = 'hotels' | 'flights' | 'flight_hotel' | 'trains' | 'cars' | 'attractions';

export type FlightTripType = 'return' | 'oneway' | 'multicity';

export interface CityOption {
  id: string;
  name: string;
  code: string;
  airportName: string;
  country: string;
  countryCode: string;
}

export interface FlightSearchState {
  tripType: FlightTripType;
  origin: CityOption;
  destination: CityOption;
  departDate: string;
  returnDate: string;
  passengers: {
    adults: number;
    children: number;
    cabin: 'Economy' | 'Premium Economy' | 'Business' | 'First';
  };
  directOnly: boolean;
  flightPlusHotel: boolean;
}

export interface FlightOffer {
  id: string;
  airlineCode: 'EK' | 'QR' | 'TK' | 'PK' | 'SV' | 'AZ' | 'FZ';
  airlineName: string;
  flightNumber: string;
  aircraft: string;
  departureTime: string;
  arrivalTime: string;
  originCode: string;
  originCity: string;
  destCode: string;
  destCity: string;
  duration: string;
  stops: number;
  stopDetails?: string;
  pricePKR: number;
  originalPricePKR?: number;
  seatsRemaining: number;
  baggage: string;
  meal: string;
  refundable: boolean;
}

export interface HotelItem {
  id: string;
  name: string;
  area: string;
  city: string;
  ratingScore: number;
  reviewCount: number;
  pricePKR: number;
  originalPricePKR?: number;
  stars: number;
  image: string;
  tags: string[];
  features: string[];
  distanceToCenter: string;
}

export interface SightItem {
  id: string;
  title: string;
  city: string;
  rankScore: number; // e.g. 10, 9.7, 8.8
  rating: number; // 4.7
  reviewCount: number;
  category: string;
  priceEstimatePKR?: number;
  openingHours: string;
  image: string;
  description: string;
  mustSeeHighlights: string[];
}

export interface MomentItem {
  id: string;
  title: string;
  author: string;
  authorAvatar?: string;
  likes: number;
  views: number;
  tags: string[];
  summary: string;
  fullStory: string;
  location: string;
  date: string;
  coverImage: string;
}

export interface TravelRoute {
  id: string;
  fromCity: string;
  fromCode: string;
  toCity: string;
  toCode: string;
  dateStr: string;
  pricePKR: number;
  transportType: 'train' | 'flight';
  operator: string;
  duration: string;
  cityIcon: string;
  destinationTag: string;
  departureFrequency: string;
  speedKmH?: number;
  accentColor: string;
}

export interface CouponItem {
  id: string;
  category: string;
  discountTitle: string;
  discountDesc: string;
  code: string;
  expiresIn: string;
  claimed: boolean;
}
