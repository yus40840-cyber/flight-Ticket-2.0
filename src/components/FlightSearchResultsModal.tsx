import React, { useState } from 'react';
import {
  X,
  Plane,
  ArrowRight,
  Filter,
  Clock,
  Luggage,
  Coffee,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ShieldCheck,
} from 'lucide-react';
import { FlightOffer, FlightSearchState } from '../types';
import { FLIGHT_SEARCH_RESULTS } from '../data/travelData';
import { AirlineLogo } from './AirlineLogos';
import { CityLogo } from './CityLogos';

interface FlightSearchResultsModalProps {
  searchState: FlightSearchState;
  onClose: () => void;
  onBookFlight: (flight: FlightOffer) => void;
}

export const FlightSearchResultsModal: React.FC<FlightSearchResultsModalProps> = ({
  searchState,
  onClose,
  onBookFlight,
}) => {
  const [selectedAirlineFilter, setSelectedAirlineFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'cheapest' | 'fastest' | 'recommended'>('cheapest');
  const [selectedStops, setSelectedStops] = useState<string>('all');

  // Filter flights
  const filteredFlights = FLIGHT_SEARCH_RESULTS.filter((f) => {
    if (selectedAirlineFilter !== 'all' && f.airlineCode !== selectedAirlineFilter) {
      return false;
    }
    if (selectedStops === 'direct' && f.stops > 0) return false;
    if (selectedStops === '1stop' && f.stops !== 1) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'cheapest') return a.pricePKR - b.pricePKR;
    if (sortBy === 'fastest') {
      const durA = parseInt(a.duration);
      const durB = parseInt(b.duration);
      return durA - durB;
    }
    return 0;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-50 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CityLogo city={searchState.origin.name} size="sm" />
                <span className="font-extrabold text-base sm:text-lg">
                  {searchState.origin.name} ({searchState.origin.code})
                </span>
                <span className="text-slate-400">→</span>
                <CityLogo city={searchState.destination.name} size="sm" />
                <span className="font-extrabold text-base sm:text-lg">
                  {searchState.destination.name} ({searchState.destination.code})
                </span>
              </div>
              <div className="text-xs text-slate-300 mt-0.5 flex items-center gap-2">
                <span>{searchState.departDate}</span>
                {searchState.tripType === 'return' && (
                  <span>- {searchState.returnDate}</span>
                )}
                <span>·</span>
                <span>
                  {searchState.passengers.adults} Adult · {searchState.passengers.cabin}
                </span>
                <span>·</span>
                <span className="text-emerald-400 font-semibold">
                  {filteredFlights.length} Flights Available
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Sort Bar */}
        <div className="bg-white border-b border-slate-200 p-3 sm:px-6 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Airline quick filter tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
            <span className="text-slate-400 font-semibold mr-1 shrink-0">Airline:</span>
            <button
              onClick={() => setSelectedAirlineFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                selectedAirlineFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Airlines
            </button>
            <button
              onClick={() => setSelectedAirlineFilter('PK')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                selectedAirlineFilter === 'PK'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <AirlineLogo airlineCode="PK" size="sm" />
              <span>PIA</span>
            </button>
            <button
              onClick={() => setSelectedAirlineFilter('EK')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                selectedAirlineFilter === 'EK'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <AirlineLogo airlineCode="EK" size="sm" />
              <span>Emirates</span>
            </button>
            <button
              onClick={() => setSelectedAirlineFilter('QR')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                selectedAirlineFilter === 'QR'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <AirlineLogo airlineCode="QR" size="sm" />
              <span>Qatar</span>
            </button>
            <button
              onClick={() => setSelectedAirlineFilter('TK')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                selectedAirlineFilter === 'TK'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <AirlineLogo airlineCode="TK" size="sm" />
              <span>Turkish</span>
            </button>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-semibold">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="cheapest">Cheapest First</option>
              <option value="fastest">Fastest Duration</option>
              <option value="recommended">Best Recommended</option>
            </select>
          </div>
        </div>

        {/* Flight Results Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {filteredFlights.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
              <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <div className="font-bold text-slate-700">No flights found matching criteria</div>
              <p className="text-xs text-slate-400 mt-1">
                Try switching airline filters or selecting alternate stopover options.
              </p>
              <button
                onClick={() => setSelectedAirlineFilter('all')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredFlights.map((flight) => (
              <div
                key={flight.id}
                className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 group"
              >
                {/* Left: Airline Branding & Flight Info */}
                <div className="flex-1">
                  <div className="flex items-center justify-between sm:justify-start gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <AirlineLogo airlineCode={flight.airlineCode} size="md" />
                      <div>
                        <div className="font-bold text-slate-900 text-sm">
                          {flight.airlineName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {flight.flightNumber} · {flight.aircraft}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {flight.seatsRemaining <= 3 && (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                          Only {flight.seatsRemaining} seats left
                        </span>
                      )}
                      {flight.refundable ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          Refundable
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          Non-refundable
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Flight Timeline */}
                  <div className="flex items-center gap-4 sm:gap-8 my-3">
                    {/* Origin Departure */}
                    <div>
                      <div className="text-lg sm:text-xl font-black text-slate-900 font-display">
                        {flight.departureTime.split(' ')[0]}
                      </div>
                      <div className="text-xs font-bold text-slate-600">
                        {flight.originCity} ({flight.originCode})
                      </div>
                    </div>

                    {/* Flight Path Graphic */}
                    <div className="flex-1 max-w-[200px] flex flex-col items-center">
                      <span className="text-[10px] text-slate-400 font-medium">
                        {flight.duration.split('(')[0]}
                      </span>
                      <div className="w-full flex items-center my-1">
                        <div className="h-0.5 flex-1 bg-slate-200" />
                        <Plane className="w-3.5 h-3.5 text-blue-600 rotate-90 mx-1 shrink-0" />
                        <div className="h-0.5 flex-1 bg-slate-200" />
                      </div>
                      <span className="text-[10px] font-semibold text-blue-600">
                        {flight.stops === 0 ? 'Direct' : `1 Stop ${flight.stopDetails || ''}`}
                      </span>
                    </div>

                    {/* Destination Arrival */}
                    <div>
                      <div className="text-lg sm:text-xl font-black text-slate-900 font-display">
                        {flight.arrivalTime.split(' ')[0]}
                      </div>
                      <div className="text-xs font-bold text-slate-600">
                        {flight.destCity} ({flight.destCode})
                      </div>
                    </div>
                  </div>

                  {/* Amenities Badges (Zero-Pill: subtle text separated by dots) */}
                  <div className="flex items-center gap-3 text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Luggage className="w-3.5 h-3.5 text-slate-400" />
                      <span>{flight.baggage}</span>
                    </span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="flex items-center gap-1">
                      <Coffee className="w-3.5 h-3.5 text-slate-400" />
                      <span>{flight.meal}</span>
                    </span>
                  </div>
                </div>

                {/* Right: Pricing & Select CTA */}
                <div className="md:pl-6 md:border-l md:border-slate-100 flex md:flex-col items-center md:items-end justify-between shrink-0">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Total per passenger
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl sm:text-2xl font-black text-blue-600 font-display tabular-nums">
                        Rs {flight.pricePKR.toLocaleString()}
                      </span>
                      {flight.originalPricePKR && (
                        <span className="text-xs text-slate-400 line-through tabular-nums">
                          Rs {flight.originalPricePKR.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 block">
                      Taxes & fees included
                    </span>
                  </div>

                  <button
                    onClick={() => onBookFlight(flight)}
                    className="mt-3 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Select Flight</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
