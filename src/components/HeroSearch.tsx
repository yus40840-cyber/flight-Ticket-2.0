import React, { useState } from 'react';
import {
  Plane,
  Building,
  Briefcase,
  Train,
  Car,
  Ticket,
  ArrowRightLeft,
  Calendar,
  Users,
  Search,
  Check,
  Award,
  ShieldCheck,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { CityOption, FlightSearchState, SearchTab } from '../types';
import { POPULAR_CITIES } from '../data/travelData';
import { CityLogo } from './CityLogos';
import { AirlineLogo } from './AirlineLogos';
import { CountryAirportPicker } from './CountryAirportPicker';
import milanDuomoHero from '../assets/images/milan_duomo_hero_1790962682658.jpg';

const getCountryFlag = (countryCode: string) => {
  const flags: Record<string, string> = {
    PK: '🇵🇰',
    IT: '🇮🇹',
    AE: '🇦🇪',
    SA: '🇸🇦',
    GB: '🇬🇧',
    TR: '🇹🇷',
    US: '🇺🇸',
    QA: '🇶🇦',
    TH: '🇹🇭',
    SG: '🇸🇬',
    DE: '🇩🇪',
    CA: '🇨🇦',
    AZ: '🇦🇿',
  };
  return flags[countryCode] || '🌐';
};

interface HeroSearchProps {
  onSearchFlights: (state: FlightSearchState) => void;
  onOpenHotelSearch: (city: string) => void;
  onOpenTrainSearch: (from: string, to: string) => void;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({
  onSearchFlights,
  onOpenHotelSearch,
  onOpenTrainSearch,
}) => {
  const [activeTab, setActiveTab] = useState<SearchTab>('flights');
  const [tripType, setTripType] = useState<'return' | 'oneway' | 'multicity'>('return');
  const [isDirectOnly, setIsDirectOnly] = useState(false);
  const [flightPlusHotel, setFlightPlusHotel] = useState(false);

  // Flight search inputs
  const [origin, setOrigin] = useState<CityOption>(POPULAR_CITIES[0]); // Karachi
  const [destination, setDestination] = useState<CityOption>(POPULAR_CITIES[1]); // Milan
  const [departDate, setDepartDate] = useState('2026-10-04');
  const [returnDate, setReturnDate] = useState('2026-10-06');
  const [adults, setAdults] = useState(1);
  const [cabin, setCabin] = useState<'Economy' | 'Premium Economy' | 'Business' | 'First'>('Economy');

  // UI Dropdown & Picker states
  const [originPickerOpen, setOriginPickerOpen] = useState(false);
  const [destPickerOpen, setDestPickerOpen] = useState(false);
  const [passengerDropdownOpen, setPassengerDropdownOpen] = useState(false);

  // Hotel search tab states
  const [hotelDestination, setHotelDestination] = useState('Milan, Italy');
  const [hotelCheckIn, setHotelCheckIn] = useState('2026-10-04');
  const [hotelCheckOut, setHotelCheckOut] = useState('2026-10-08');

  // Swap cities
  const handleSwapCities = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleSearchClick = () => {
    if (activeTab === 'flights' || activeTab === 'flight_hotel') {
      onSearchFlights({
        tripType,
        origin,
        destination,
        departDate,
        returnDate,
        passengers: { adults, children: 0, cabin },
        directOnly: isDirectOnly,
        flightPlusHotel: flightPlusHotel || activeTab === 'flight_hotel',
      });
    } else if (activeTab === 'hotels') {
      onOpenHotelSearch(hotelDestination);
    } else if (activeTab === 'trains') {
      onOpenTrainSearch(origin.name, destination.name);
    } else {
      // Default to flight search
      onSearchFlights({
        tripType,
        origin,
        destination,
        departDate,
        returnDate,
        passengers: { adults, children: 0, cabin },
        directOnly: isDirectOnly,
        flightPlusHotel,
      });
    }
  };

  const tabs = [
    { id: 'hotels', label: 'Hotels & Homes', icon: Building },
    { id: 'flights', label: 'Flights', icon: Plane },
    { id: 'flight_hotel', label: 'Flight + Hotel', icon: Briefcase },
    { id: 'trains', label: 'Trains', icon: Train },
    { id: 'cars', label: 'Cars', icon: Car },
    { id: 'attractions', label: 'Attractions & Tours', icon: Ticket },
  ];

  return (
    <div className="relative bg-gradient-to-b from-blue-900 via-slate-900 to-slate-950 text-white pt-8 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background imagery with subtle dark scrim */}
      <div className="absolute inset-0 z-0 opacity-25 mix-blend-luminosity">
        <img
          src={milanDuomoHero}
          alt="Milan Cathedral Scenic"
          className="w-full h-full object-cover object-center"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-blue-950/70" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Hero Headline & Trust Stats */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-white mb-3">
            Your next take-off awaits
          </h1>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-blue-200/90 font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Join 300M+ travelers</span>
            </div>
            <span className="text-blue-400/40">·</span>
            <div className="flex items-center gap-1.5">
              <Plane className="w-3.5 h-3.5 text-blue-400" />
              <span>Search 600+ airlines</span>
            </div>
            <span className="text-blue-400/40">·</span>
            <div className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Award-winning service</span>
            </div>
          </div>
        </div>

        {/* Search Widget Container */}
        <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 text-slate-800 border border-slate-100">
          {/* Main Booking Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-4 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as SearchTab)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sub-controls for Flights / Flight+Hotel */}
          {(activeTab === 'flights' || activeTab === 'flight_hotel') && (
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-xs font-medium text-slate-600">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="tripType"
                    checked={tripType === 'return'}
                    onChange={() => setTripType('return')}
                    className="text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                  />
                  <span>Return</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="tripType"
                    checked={tripType === 'oneway'}
                    onChange={() => setTripType('oneway')}
                    className="text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                  />
                  <span>One-way</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="tripType"
                    checked={tripType === 'multicity'}
                    onChange={() => setTripType('multicity')}
                    className="text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                  />
                  <span>Multi-city</span>
                </label>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDirectOnly}
                    onChange={(e) => setIsDirectOnly(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                  />
                  <span>Direct only</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={flightPlusHotel || activeTab === 'flight_hotel'}
                    onChange={(e) => setFlightPlusHotel(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                  />
                  <span className="text-blue-600 font-semibold">Flight + Hotel save up to 25%</span>
                </label>
              </div>
            </div>
          )}

          {/* Country & Airport Route Distinction Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Selected Sector:
              </span>
              <div className="inline-flex items-center gap-1.5 font-bold text-slate-800">
                <span className="text-sm">{getCountryFlag(origin.countryCode)}</span>
                <span>{origin.country}</span>
                <span className="text-blue-600 font-mono font-black">({origin.code})</span>
              </div>
              <span className="text-slate-400 font-bold">➔</span>
              <div className="inline-flex items-center gap-1.5 font-bold text-slate-800">
                <span className="text-sm">{getCountryFlag(destination.countryCode)}</span>
                <span>{destination.country}</span>
                <span className="text-emerald-600 font-mono font-black">({destination.code})</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                  origin.country === destination.country
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-blue-100 text-blue-800 border border-blue-300'
                }`}
              >
                {origin.country === destination.country
                  ? '🇵🇰 Domestic Pakistan Flight'
                  : `🌐 International Sector (${origin.country} ➔ ${destination.country})`}
              </span>
            </div>
          </div>

          {/* Search Inputs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Origin with Country & Airport Distinction */}
            <div className="relative md:col-span-3">
              <div
                onClick={() => setOriginPickerOpen(true)}
                className="p-3 border-2 border-blue-500/20 hover:border-blue-500 rounded-2xl bg-white hover:bg-blue-50/20 cursor-pointer transition-all flex items-center justify-between shadow-2xs group"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-mono font-black text-sm flex flex-col items-center justify-center shrink-0 shadow-xs">
                    <span>{origin.code}</span>
                    <span className="text-[8px] opacity-75">{origin.countryCode}</span>
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase font-extrabold tracking-wider text-blue-600">
                      <span>FROM · DEPARTURE</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-500 font-medium">
                        {getCountryFlag(origin.countryCode)} {origin.country}
                      </span>
                    </div>
                    <div className="font-extrabold text-slate-900 text-sm truncate group-hover:text-blue-600 transition-colors">
                      {origin.name}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {origin.airportName}
                    </div>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1 group-hover:text-blue-600" />
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center md:col-span-1 -my-2 md:my-0">
              <button
                onClick={handleSwapCities}
                title="Swap Departure and Arrival Airports"
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-blue-600 hover:text-white border border-slate-200 text-slate-600 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-90"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Destination with Country & Airport Distinction */}
            <div className="relative md:col-span-3">
              <div
                onClick={() => setDestPickerOpen(true)}
                className="p-3 border-2 border-emerald-500/20 hover:border-emerald-500 rounded-2xl bg-white hover:bg-emerald-50/20 cursor-pointer transition-all flex items-center justify-between shadow-2xs group"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-mono font-black text-sm flex flex-col items-center justify-center shrink-0 shadow-xs">
                    <span>{destination.code}</span>
                    <span className="text-[8px] opacity-75">{destination.countryCode}</span>
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase font-extrabold tracking-wider text-emerald-600">
                      <span>TO · ARRIVAL</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-500 font-medium">
                        {getCountryFlag(destination.countryCode)} {destination.country}
                      </span>
                    </div>
                    <div className="font-extrabold text-slate-900 text-sm truncate group-hover:text-emerald-600 transition-colors">
                      {destination.name}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {destination.airportName}
                    </div>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1 group-hover:text-emerald-600" />
              </div>
            </div>

            {/* Dates (Depart - Return) */}
            <div className="md:col-span-3 grid grid-cols-2 gap-2">
              <div className="p-3 border border-slate-200 rounded-xl bg-slate-50/50">
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Depart
                </div>
                <input
                  type="date"
                  value={departDate}
                  onChange={(e) => setDepartDate(e.target.value)}
                  className="w-full text-xs font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer pt-0.5"
                />
                <div className="text-[10px] text-slate-500">Sun, Oct 4</div>
              </div>

              <div
                className={`p-3 border border-slate-200 rounded-xl bg-slate-50/50 ${
                  tripType === 'oneway' ? 'opacity-40 pointer-events-none' : ''
                }`}
              >
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Return
                </div>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full text-xs font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer pt-0.5"
                />
                <div className="text-[10px] text-slate-500">Tue, Oct 6</div>
              </div>
            </div>

            {/* Passengers & Cabin Class */}
            <div className="relative md:col-span-2">
              <div
                onClick={() => setPassengerDropdownOpen(!passengerDropdownOpen)}
                className="p-3 border border-slate-200 rounded-xl hover:border-blue-400 bg-slate-50/50 cursor-pointer transition-all"
              >
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Travelers
                </div>
                <div className="font-bold text-slate-900 text-xs truncate pt-0.5">
                  {adults} adult · {cabin}
                </div>
                <div className="text-[10px] text-slate-500">Cabin Class</div>
              </div>

              {passengerDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 z-50">
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span>Adults (12+ yrs)</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setAdults(Math.max(1, adults - 1))}
                          className="w-6 h-6 rounded bg-slate-100 font-bold hover:bg-slate-200"
                        >
                          -
                        </button>
                        <span className="w-4 text-center font-bold">{adults}</span>
                        <button
                          onClick={() => setAdults(Math.min(9, adults + 1))}
                          className="w-6 h-6 rounded bg-slate-100 font-bold hover:bg-slate-200"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Cabin Class
                    </div>
                    {(['Economy', 'Premium Economy', 'Business', 'First'] as const).map((cls) => (
                      <button
                        key={cls}
                        onClick={() => {
                          setCabin(cls);
                          setPassengerDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2 py-1.5 text-xs rounded-md transition-colors flex items-center justify-between ${
                          cabin === cls ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-slate-50'
                        }`}
                      >
                        <span>{cls}</span>
                        {cabin === cls && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search Button & Airline trust strip */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 overflow-x-auto text-[11px] text-slate-500 font-medium">
              <span className="shrink-0 text-slate-400 font-semibold">Supported Airlines:</span>
              <div className="flex items-center gap-2 shrink-0">
                <AirlineLogo airlineCode="PK" size="sm" />
                <AirlineLogo airlineCode="EK" size="sm" />
                <AirlineLogo airlineCode="QR" size="sm" />
                <AirlineLogo airlineCode="TK" size="sm" />
                <AirlineLogo airlineCode="SV" size="sm" />
                <AirlineLogo airlineCode="AZ" size="sm" />
                <AirlineLogo airlineCode="FZ" size="sm" />
              </div>
            </div>

            <button
              onClick={handleSearchClick}
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Search className="w-4 h-4" />
              <span>Search Flights</span>
            </button>
          </div>
        </div>
      </div>

      {/* Country-Grouped Airport Picker for Departure (FROM) */}
      <CountryAirportPicker
        mode="from"
        isOpen={originPickerOpen}
        onClose={() => setOriginPickerOpen(false)}
        selectedAirport={origin}
        otherAirport={destination}
        onSelectAirport={(apt) => setOrigin(apt)}
      />

      {/* Country-Grouped Airport Picker for Arrival (TO) */}
      <CountryAirportPicker
        mode="to"
        isOpen={destPickerOpen}
        onClose={() => setDestPickerOpen(false)}
        selectedAirport={destination}
        otherAirport={origin}
        onSelectAirport={(apt) => setDestination(apt)}
      />
    </div>
  );
};
