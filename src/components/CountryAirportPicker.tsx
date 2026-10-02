import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  PlaneTakeoff,
  PlaneLanding,
  X,
  Check,
  Globe2,
  Building2,
  ArrowRight,
} from 'lucide-react';
import { CityOption } from '../types';
import {
  COUNTRIES_AIRPORTS_DATA,
  CountryAirportGroup,
} from '../data/airportCountriesData';

interface CountryAirportPickerProps {
  mode: 'from' | 'to';
  isOpen: boolean;
  onClose: () => void;
  selectedAirport: CityOption;
  otherAirport?: CityOption;
  onSelectAirport: (airport: CityOption) => void;
}

export const CountryAirportPicker: React.FC<CountryAirportPickerProps> = ({
  mode,
  isOpen,
  onClose,
  selectedAirport,
  otherAirport,
  onSelectAirport,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountryFilter, setSelectedCountryFilter] = useState<string>('All');
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus search input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setSearchQuery('');
      setSelectedCountryFilter('All');
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Order countries: for 'from', Pakistan is first; for 'to', international destination countries (Italy, UAE, Saudi Arabia, UK) come first
  const orderedCountryGroups = useMemo(() => {
    if (mode === 'from') {
      return COUNTRIES_AIRPORTS_DATA;
    } else {
      // For 'to', place top international destinations first, then Pakistan
      const pakistan = COUNTRIES_AIRPORTS_DATA.find((c) => c.countryCode === 'PK');
      const others = COUNTRIES_AIRPORTS_DATA.filter((c) => c.countryCode !== 'PK');
      return pakistan ? [...others, pakistan] : COUNTRIES_AIRPORTS_DATA;
    }
  }, [mode]);

  // Filter country groups and their airports by search and country chip
  const filteredGroups = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return orderedCountryGroups
      .map((group) => {
        // If a country filter is selected
        if (selectedCountryFilter !== 'All' && group.countryName !== selectedCountryFilter) {
          return null;
        }

        // Filter airports inside this country
        const matchedAirports = group.airports.filter((airport) => {
          if (!q) return true;
          return (
            airport.code.toLowerCase().includes(q) ||
            airport.name.toLowerCase().includes(q) ||
            airport.airportName.toLowerCase().includes(q) ||
            airport.country.toLowerCase().includes(q)
          );
        });

        if (matchedAirports.length === 0) return null;

        return {
          ...group,
          airports: matchedAirports,
        };
      })
      .filter((g): g is CountryAirportGroup => g !== null);
  }, [orderedCountryGroups, searchQuery, selectedCountryFilter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden text-slate-900 animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-md ${
                mode === 'from' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
              }`}
            >
              {mode === 'from' ? (
                <PlaneTakeoff className="w-5 h-5" />
              ) : (
                <PlaneLanding className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-base sm:text-lg tracking-tight">
                  {mode === 'from'
                    ? 'Select Departure Airport (FROM)'
                    : 'Select Arrival Destination (TO)'}
                </h3>
                <span
                  className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full ${
                    mode === 'from'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                  }`}
                >
                  {mode === 'from' ? 'Origin' : 'Destination'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {mode === 'from'
                  ? 'Organized by country · Domestic Pakistan hubs & worldwide departures'
                  : 'Organized by country · Italy, UAE, Saudi Arabia, UK, USA & global hubs'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar Input */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                mode === 'from'
                  ? 'Search departure: Karachi, Lahore, Islamabad, KHI, LHE, Pakistan...'
                  : 'Search destination: Milan, Dubai, London, Rome, Jeddah, MXP, DXB, Italy...'
              }
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-2xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-slate-400 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Country Quick Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-1 scrollbar-none text-xs">
            <span className="text-[11px] font-bold text-slate-400 mr-1 shrink-0 uppercase tracking-wider">
              Country:
            </span>
            <button
              onClick={() => setSelectedCountryFilter('All')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCountryFilter === 'All'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              All Countries
            </button>
            {COUNTRIES_AIRPORTS_DATA.map((group) => (
              <button
                key={group.countryCode}
                onClick={() => setSelectedCountryFilter(group.countryName)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  selectedCountryFilter === group.countryName
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{group.flag}</span>
                <span>{group.countryName}</span>
                <span className="text-[10px] opacity-75 font-mono">({group.airports.length})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Airport Lists grouped according to Countries */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-5 space-y-6">
          {filteredGroups.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Building2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-bold text-sm text-slate-700">No airports found</p>
              <p className="text-xs text-slate-500 mt-1">
                Try searching with another airport code, city name, or clear the country filter.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCountryFilter('All');
                }}
                className="mt-3 px-4 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold"
              >
                Reset Search
              </button>
            </div>
          ) : (
            filteredGroups.map((group) => (
              <div key={group.countryCode} className="space-y-2.5">
                {/* Country Category Header */}
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="text-xl leading-none">{group.flag}</span>
                    <h4 className="font-extrabold text-sm text-slate-900 tracking-tight">
                      {group.countryName}
                    </h4>
                    <span className="text-[11px] font-bold text-slate-400">
                      ({group.airports.length} {group.airports.length === 1 ? 'Airport' : 'Airports'})
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                      group.isDomestic
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {group.region}
                  </span>
                </div>

                {/* Country's Airports Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {group.airports.map((airport) => {
                    const isSelected = selectedAirport.code === airport.code;
                    const isOther = otherAirport?.code === airport.code;

                    return (
                      <button
                        key={`${mode}-${airport.code}`}
                        onClick={() => {
                          onSelectAirport(airport);
                          onClose();
                        }}
                        className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between group cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20'
                            : isOther
                            ? 'bg-slate-50 border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-300'
                            : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-xs'
                        }`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          {/* IATA Code Box */}
                          <div
                            className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-mono font-black text-sm shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-800 group-hover:bg-blue-100 group-hover:text-blue-700'
                            }`}
                          >
                            <span>{airport.code}</span>
                            <span className="text-[9px] font-sans font-medium uppercase opacity-75">
                              {airport.countryCode}
                            </span>
                          </div>

                          {/* City & Airport Info */}
                          <div className="truncate">
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-sm text-slate-900 group-hover:text-blue-700 truncate">
                                {airport.name}
                              </span>
                              {isOther && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded">
                                  {mode === 'from' ? 'Current To' : 'Current From'}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate mt-0.5">
                              {airport.airportName}
                            </div>
                          </div>
                        </div>

                        {/* Selected Indicator */}
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 ml-2 shadow-2xs">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer with Active Pair Preview */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Current Route:</span>
            <span className="font-semibold text-blue-700">
              {mode === 'from' ? selectedAirport.name : otherAirport?.name} ({mode === 'from' ? selectedAirport.code : otherAirport?.code})
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-emerald-700">
              {mode === 'to' ? selectedAirport.name : otherAirport?.name} ({mode === 'to' ? selectedAirport.code : otherAirport?.code})
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
