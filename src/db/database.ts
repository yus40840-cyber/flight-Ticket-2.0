// ============================================================================
// FLIGH.COM CLIENT DATABASE ENGINE (PERSISTENT REPOSITORY & STORAGE LAYER)
// ============================================================================

import {
  BookingRecord,
  FlightRecord,
  HotelRecord,
  CouponRecord,
  UserRecord,
} from './types';
import { FLIGHT_SEARCH_RESULTS, SELECTED_HOTELS, INITIAL_COUPONS } from '../data/travelData';

const STORAGE_KEYS = {
  BOOKINGS: 'fligh_db_bookings_v2',
  USER: 'fligh_db_user_v2',
  COUPONS: 'fligh_db_coupons_v2',
  CUSTOM_FLIGHTS: 'fligh_db_custom_flights_v2',
};

// Default initial seeded booking
const DEFAULT_INITIAL_BOOKINGS: BookingRecord[] = [
  {
    id: 'b-749210',
    reference: 'FLI-749210',
    eTicketNumber: '214-8930194821',
    type: 'flight',
    title: 'Emirates EK 607: Karachi (KHI) → Milan (MXP)',
    price: 168450,
    date: '04 Oct 2026',
    passenger: 'Muhammad Usman',
    passengerEmail: 'usman.travel@fligh.com',
    passengerPhone: '+92 300 8241920',
    passportOrCnic: 'PK84920194',
    status: 'Confirmed & Ticket Issued',
    paymentStatus: 'PAID',
    createdAt: new Date().toISOString(),
    ticketData: {
      pnr: 'FLI-749210',
      eTicketNumber: '214-8930194821',
      bookingDate: '02 Oct 2026',
      passengerName: 'Muhammad Usman',
      passportNumber: 'PK84920194',
      email: 'usman.travel@fligh.com',
      phone: '+92 300 8241920',
      seat: '14A (Window)',
      gate: '24',
      terminal: '1',
      boardingTime: '02:35 KHI',
      cabinClass: 'Economy',
      flight: FLIGHT_SEARCH_RESULTS[0],
      bookingType: 'flight',
      totalPaidPKR: 168450,
    },
  },
];

class FlighDatabase {
  private cacheBookings: BookingRecord[] | null = null;

  // Safe localStorage helper with in-memory fallback
  private getStorageItem<T>(key: string, defaultVal: T): T {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return defaultVal;
      const data = window.localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultVal;
    } catch (e) {
      console.warn(`[Database] Read error for key ${key}:`, e);
      return defaultVal;
    }
  }

  private setStorageItem<T>(key: string, value: T): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (e) {
      console.warn(`[Database] Write error for key ${key}:`, e);
    }
  }

  // --------------------------------------------------------------------------
  // BOOKINGS TABLE OPERATIONS
  // --------------------------------------------------------------------------
  public bookings = {
    getAll: (): BookingRecord[] => {
      if (this.cacheBookings) return this.cacheBookings;
      const records = this.getStorageItem<BookingRecord[]>(
        STORAGE_KEYS.BOOKINGS,
        DEFAULT_INITIAL_BOOKINGS
      );
      this.cacheBookings = records;
      return records;
    },

    getByPnr: (pnr: string): BookingRecord | undefined => {
      const all = this.bookings.getAll();
      return all.find((b) => b.reference.toUpperCase() === pnr.toUpperCase());
    },

    getByEmail: (email: string): BookingRecord[] => {
      const all = this.bookings.getAll();
      return all.filter(
        (b) => b.passengerEmail.toLowerCase() === email.toLowerCase()
      );
    },

    create: (booking: Omit<BookingRecord, 'id' | 'createdAt'>): BookingRecord => {
      const all = this.bookings.getAll();
      const newRecord: BookingRecord = {
        ...booking,
        id: 'b-' + Math.floor(100000 + Math.random() * 900000),
        createdAt: new Date().toISOString(),
      };

      const updated = [newRecord, ...all];
      this.cacheBookings = updated;
      this.setStorageItem(STORAGE_KEYS.BOOKINGS, updated);
      return newRecord;
    },

    cancel: (pnr: string): boolean => {
      const all = this.bookings.getAll();
      const index = all.findIndex((b) => b.reference.toUpperCase() === pnr.toUpperCase());
      if (index === -1) return false;

      all[index].status = 'Cancelled & Refund Processed';
      all[index].paymentStatus = 'REFUNDED';
      this.cacheBookings = [...all];
      this.setStorageItem(STORAGE_KEYS.BOOKINGS, all);
      return true;
    },
  };

  // --------------------------------------------------------------------------
  // FLIGHTS TABLE OPERATIONS
  // --------------------------------------------------------------------------
  public flights = {
    getAll: (): typeof FLIGHT_SEARCH_RESULTS => {
      return FLIGHT_SEARCH_RESULTS;
    },

    search: (
      originCity: string,
      destCity: string,
      cabin: string = 'Economy'
    ) => {
      return FLIGHT_SEARCH_RESULTS.filter((f) => {
        const matchOrigin =
          !originCity ||
          f.originCity.toLowerCase().includes(originCity.toLowerCase()) ||
          f.originCode.toLowerCase() === originCity.toLowerCase();
        const matchDest =
          !destCity ||
          f.destCity.toLowerCase().includes(destCity.toLowerCase()) ||
          f.destCode.toLowerCase() === destCity.toLowerCase();
        return matchOrigin && matchDest;
      });
    },

    getById: (flightId: string) => {
      return FLIGHT_SEARCH_RESULTS.find((f) => f.id === flightId);
    },
  };

  // --------------------------------------------------------------------------
  // HOTELS TABLE OPERATIONS
  // --------------------------------------------------------------------------
  public hotels = {
    getAll: (): typeof SELECTED_HOTELS => {
      return SELECTED_HOTELS;
    },

    search: (city: string, minRating: number = 0) => {
      return SELECTED_HOTELS.filter((h) => {
        const matchCity = !city || h.city.toLowerCase().includes(city.toLowerCase());
        const matchRating = h.ratingScore >= minRating;
        return matchCity && matchRating;
      });
    },

    getById: (hotelId: string) => {
      return SELECTED_HOTELS.find((h) => h.id === hotelId);
    },
  };

  // --------------------------------------------------------------------------
  // COUPONS TABLE OPERATIONS
  // --------------------------------------------------------------------------
  public coupons = {
    getAll: (): typeof INITIAL_COUPONS => {
      return this.getStorageItem(STORAGE_KEYS.COUPONS, INITIAL_COUPONS);
    },

    claim: (code: string): boolean => {
      const list = this.coupons.getAll();
      const item = list.find((c) => c.code.toUpperCase() === code.toUpperCase());
      if (!item || item.claimed) return false;

      item.claimed = true;
      this.setStorageItem(STORAGE_KEYS.COUPONS, list);
      return true;
    },
  };

  // --------------------------------------------------------------------------
  // USER PROFILES & WALLET COINS
  // --------------------------------------------------------------------------
  public users = {
    getCurrentUser: (): UserRecord => {
      return this.getStorageItem<UserRecord>(STORAGE_KEYS.USER, {
        id: 'usr_default_usman',
        fullName: 'Muhammad Usman',
        email: 'usman.travel@fligh.com',
        phone: '+92 300 8241920',
        passportOrCnic: 'PK84920194',
        nationality: 'Pakistan',
        coinsBalance: 3500,
        createdAt: '2026-01-15T08:00:00Z',
      });
    },

    updateUser: (user: Partial<UserRecord>): UserRecord => {
      const current = this.users.getCurrentUser();
      const updated = { ...current, ...user, updated_at: new Date().toISOString() };
      this.setStorageItem(STORAGE_KEYS.USER, updated);
      return updated;
    },

    addCoins: (amount: number): number => {
      const current = this.users.getCurrentUser();
      const newBalance = Math.max(0, current.coinsBalance + amount);
      this.users.updateUser({ coinsBalance: newBalance });
      return newBalance;
    },
  };
}

// Export singleton database instance
export const db = new FlighDatabase();
