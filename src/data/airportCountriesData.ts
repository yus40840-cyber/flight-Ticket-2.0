// ============================================================================
// COUNTRY-GROUPED AIRPORTS REGISTRY FOR FLIGH.COM
// Distinguishes Departure (From) and Arrival (To) according to Countries & Airports
// ============================================================================

import { CityOption } from '../types';

export interface CountryAirportGroup {
  countryName: string;
  countryCode: string;
  flag: string;
  region: 'Domestic Pakistan' | 'Middle East' | 'Europe' | 'North America' | 'Asia';
  isDomestic: boolean;
  airports: CityOption[];
}

export const COUNTRIES_AIRPORTS_DATA: CountryAirportGroup[] = [
  // --------------------------------------------------------------------------
  // 1. PAKISTAN (PRIMARY DEPARTURE & DOMESTIC NETWORK)
  // --------------------------------------------------------------------------
  {
    countryName: 'Pakistan',
    countryCode: 'PK',
    flag: '🇵🇰',
    region: 'Domestic Pakistan',
    isDomestic: true,
    airports: [
      {
        id: 'khi',
        name: 'Karachi',
        code: 'KHI',
        airportName: 'Jinnah International Airport',
        country: 'Pakistan',
        countryCode: 'PK',
      },
      {
        id: 'lhe',
        name: 'Lahore',
        code: 'LHE',
        airportName: 'Allama Iqbal International Airport',
        country: 'Pakistan',
        countryCode: 'PK',
      },
      {
        id: 'isb',
        name: 'Islamabad',
        code: 'ISB',
        airportName: 'Islamabad International Airport',
        country: 'Pakistan',
        countryCode: 'PK',
      },
      {
        id: 'pew',
        name: 'Peshawar',
        code: 'PEW',
        airportName: 'Bacha Khan International Airport',
        country: 'Pakistan',
        countryCode: 'PK',
      },
      {
        id: 'skt',
        name: 'Sialkot',
        code: 'SKT',
        airportName: 'Sialkot International Airport',
        country: 'Pakistan',
        countryCode: 'PK',
      },
      {
        id: 'mux',
        name: 'Multan',
        code: 'MUX',
        airportName: 'Multan International Airport',
        country: 'Pakistan',
        countryCode: 'PK',
      },
      {
        id: 'lyp',
        name: 'Faisalabad',
        code: 'LYP',
        airportName: 'Faisalabad International Airport',
        country: 'Pakistan',
        countryCode: 'PK',
      },
      {
        id: 'uet',
        name: 'Quetta',
        code: 'UET',
        airportName: 'Quetta International Airport',
        country: 'Pakistan',
        countryCode: 'PK',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 2. ITALY
  // --------------------------------------------------------------------------
  {
    countryName: 'Italy',
    countryCode: 'IT',
    flag: '🇮🇹',
    region: 'Europe',
    isDomestic: false,
    airports: [
      {
        id: 'mil',
        name: 'Milan',
        code: 'MIL',
        airportName: 'Milan Malpensa & Linate (MXP/LIN)',
        country: 'Italy',
        countryCode: 'IT',
      },
      {
        id: 'rom',
        name: 'Rome',
        code: 'ROM',
        airportName: 'Leonardo da Vinci Fiumicino (FCO)',
        country: 'Italy',
        countryCode: 'IT',
      },
      {
        id: 'vce',
        name: 'Venice',
        code: 'VCE',
        airportName: 'Venice Marco Polo Airport',
        country: 'Italy',
        countryCode: 'IT',
      },
      {
        id: 'flr',
        name: 'Florence',
        code: 'FLR',
        airportName: 'Florence Amerigo Vespucci (FLR)',
        country: 'Italy',
        countryCode: 'IT',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 3. UNITED ARAB EMIRATES
  // --------------------------------------------------------------------------
  {
    countryName: 'United Arab Emirates',
    countryCode: 'AE',
    flag: '🇦🇪',
    region: 'Middle East',
    isDomestic: false,
    airports: [
      {
        id: 'dxb',
        name: 'Dubai',
        code: 'DXB',
        airportName: 'Dubai International Airport',
        country: 'United Arab Emirates',
        countryCode: 'AE',
      },
      {
        id: 'auh',
        name: 'Abu Dhabi',
        code: 'AUH',
        airportName: 'Zayed International Airport',
        country: 'United Arab Emirates',
        countryCode: 'AE',
      },
      {
        id: 'shj',
        name: 'Sharjah',
        code: 'SHJ',
        airportName: 'Sharjah International Airport',
        country: 'United Arab Emirates',
        countryCode: 'AE',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 4. SAUDI ARABIA
  // --------------------------------------------------------------------------
  {
    countryName: 'Saudi Arabia',
    countryCode: 'SA',
    flag: '🇸🇦',
    region: 'Middle East',
    isDomestic: false,
    airports: [
      {
        id: 'jed',
        name: 'Jeddah',
        code: 'JED',
        airportName: 'King Abdulaziz International Airport (Hajj Terminal)',
        country: 'Saudi Arabia',
        countryCode: 'SA',
      },
      {
        id: 'ruh',
        name: 'Riyadh',
        code: 'RUH',
        airportName: 'King Khalid International Airport',
        country: 'Saudi Arabia',
        countryCode: 'SA',
      },
      {
        id: 'med',
        name: 'Madinah',
        code: 'MED',
        airportName: 'Prince Mohammad Bin Abdulaziz Airport',
        country: 'Saudi Arabia',
        countryCode: 'SA',
      },
      {
        id: 'dmm',
        name: 'Dammam',
        code: 'DMM',
        airportName: 'King Fahd International Airport',
        country: 'Saudi Arabia',
        countryCode: 'SA',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 5. UNITED KINGDOM
  // --------------------------------------------------------------------------
  {
    countryName: 'United Kingdom',
    countryCode: 'GB',
    flag: '🇬🇧',
    region: 'Europe',
    isDomestic: false,
    airports: [
      {
        id: 'lhr',
        name: 'London',
        code: 'LHR',
        airportName: 'London Heathrow Airport (All Terminals)',
        country: 'United Kingdom',
        countryCode: 'GB',
      },
      {
        id: 'lgw',
        name: 'London Gatwick',
        code: 'LGW',
        airportName: 'London Gatwick Airport',
        country: 'United Kingdom',
        countryCode: 'GB',
      },
      {
        id: 'man',
        name: 'Manchester',
        code: 'MAN',
        airportName: 'Manchester International Airport',
        country: 'United Kingdom',
        countryCode: 'GB',
      },
      {
        id: 'bhx',
        name: 'Birmingham',
        code: 'BHX',
        airportName: 'Birmingham Airport',
        country: 'United Kingdom',
        countryCode: 'GB',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 6. TURKEY
  // --------------------------------------------------------------------------
  {
    countryName: 'Turkey',
    countryCode: 'TR',
    flag: '🇹🇷',
    region: 'Europe',
    isDomestic: false,
    airports: [
      {
        id: 'ist',
        name: 'Istanbul',
        code: 'IST',
        airportName: 'Istanbul Grand Airport (IST)',
        country: 'Turkey',
        countryCode: 'TR',
      },
      {
        id: 'saw',
        name: 'Istanbul Sabiha',
        code: 'SAW',
        airportName: 'Sabiha Gökçen International Airport',
        country: 'Turkey',
        countryCode: 'TR',
      },
      {
        id: 'ayt',
        name: 'Antalya',
        code: 'AYT',
        airportName: 'Antalya International Airport',
        country: 'Turkey',
        countryCode: 'TR',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 7. UNITED STATES
  // --------------------------------------------------------------------------
  {
    countryName: 'United States',
    countryCode: 'US',
    flag: '🇺🇸',
    region: 'North America',
    isDomestic: false,
    airports: [
      {
        id: 'jfk',
        name: 'New York',
        code: 'JFK',
        airportName: 'John F. Kennedy International Airport',
        country: 'United States',
        countryCode: 'US',
      },
      {
        id: 'lax',
        name: 'Los Angeles',
        code: 'LAX',
        airportName: 'Los Angeles International Airport',
        country: 'United States',
        countryCode: 'US',
      },
      {
        id: 'ord',
        name: 'Chicago',
        code: 'ORD',
        airportName: 'O’Hare International Airport',
        country: 'United States',
        countryCode: 'US',
      },
      {
        id: 'sfo',
        name: 'San Francisco',
        code: 'SFO',
        airportName: 'San Francisco International Airport',
        country: 'United States',
        countryCode: 'US',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 8. QATAR
  // --------------------------------------------------------------------------
  {
    countryName: 'Qatar',
    countryCode: 'QA',
    flag: '🇶🇦',
    region: 'Middle East',
    isDomestic: false,
    airports: [
      {
        id: 'doh',
        name: 'Doha',
        code: 'DOH',
        airportName: 'Hamad International Airport',
        country: 'Qatar',
        countryCode: 'QA',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 9. THAILAND
  // --------------------------------------------------------------------------
  {
    countryName: 'Thailand',
    countryCode: 'TH',
    flag: '🇹🇭',
    region: 'Asia',
    isDomestic: false,
    airports: [
      {
        id: 'bkk',
        name: 'Bangkok',
        code: 'BKK',
        airportName: 'Suvarnabhumi Airport',
        country: 'Thailand',
        countryCode: 'TH',
      },
      {
        id: 'hkt',
        name: 'Phuket',
        code: 'HKT',
        airportName: 'Phuket International Airport',
        country: 'Thailand',
        countryCode: 'TH',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 10. SINGAPORE
  // --------------------------------------------------------------------------
  {
    countryName: 'Singapore',
    countryCode: 'SG',
    flag: '🇸🇬',
    region: 'Asia',
    isDomestic: false,
    airports: [
      {
        id: 'sin',
        name: 'Singapore',
        code: 'SIN',
        airportName: 'Singapore Changi Airport',
        country: 'Singapore',
        countryCode: 'SG',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 11. GERMANY
  // --------------------------------------------------------------------------
  {
    countryName: 'Germany',
    countryCode: 'DE',
    flag: '🇩🇪',
    region: 'Europe',
    isDomestic: false,
    airports: [
      {
        id: 'fra',
        name: 'Frankfurt',
        code: 'FRA',
        airportName: 'Frankfurt International Airport',
        country: 'Germany',
        countryCode: 'DE',
      },
      {
        id: 'muc',
        name: 'Munich',
        code: 'MUC',
        airportName: 'Munich International Airport',
        country: 'Germany',
        countryCode: 'DE',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 12. CANADA
  // --------------------------------------------------------------------------
  {
    countryName: 'Canada',
    countryCode: 'CA',
    flag: '🇨🇦',
    region: 'North America',
    isDomestic: false,
    airports: [
      {
        id: 'yyz',
        name: 'Toronto',
        code: 'YYZ',
        airportName: 'Toronto Pearson International Airport',
        country: 'Canada',
        countryCode: 'CA',
      },
      {
        id: 'yvr',
        name: 'Vancouver',
        code: 'YVR',
        airportName: 'Vancouver International Airport',
        country: 'Canada',
        countryCode: 'CA',
      },
    ],
  },
];

// Helper: Flat list of all airports
export const ALL_COUNTRY_AIRPORTS: CityOption[] = COUNTRIES_AIRPORTS_DATA.flatMap(
  (group) => group.airports
);
