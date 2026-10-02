import React, { useState, useMemo } from 'react';
import {
  Plane,
  Building2,
  Search,
  Globe2,
  ShieldCheck,
  Star,
  Users,
  Compass,
  ArrowRight,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import {
  WORLDWIDE_MAIN_AIRPORTS,
  WORLDWIDE_MAIN_AIRLINES,
  WorldwideAirport,
  WorldwideAirline,
} from '../data/worldwideAviationData';
import { CityOption } from '../types';

interface AirlinesAndAirportsSectionProps {
  onSelectAirportToSearch?: (airport: WorldwideAirport) => void;
  onSelectAirlineToSearch?: (airline: WorldwideAirline) => void;
}

export const AirlinesAndAirportsSection: React.FC<AirlinesAndAirportsSectionProps> = ({
  onSelectAirportToSearch,
  onSelectAirlineToSearch,
}) => {
  const [activeTab, setActiveTab] = useState<'airports' | 'airlines'>('airports');
  const [regionFilter, setRegionFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const regions = ['All', 'Asia & Middle East', 'Europe', 'North America'];

  // Filtered Airports
  const filteredAirports = useMemo(() => {
    return WORLDWIDE_MAIN_AIRPORTS.filter((airport) => {
      const matchRegion = regionFilter === 'All' || airport.region === regionFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        airport.iata.toLowerCase().includes(q) ||
        airport.name.toLowerCase().includes(q) ||
        airport.city.toLowerCase().includes(q) ||
        airport.country.toLowerCase().includes(q) ||
        airport.hubAirlines.some((a) => a.toLowerCase().includes(q));
      return matchRegion && matchSearch;
    });
  }, [regionFilter, searchQuery]);

  // Filtered Airlines
  const filteredAirlines = useMemo(() => {
    return WORLDWIDE_MAIN_AIRLINES.filter((airline) => {
      const matchRegion = regionFilter === 'All' || airline.region === regionFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        airline.iata.toLowerCase().includes(q) ||
        airline.name.toLowerCase().includes(q) ||
        airline.country.toLowerCase().includes(q) ||
        airline.hubAirport.toLowerCase().includes(q) ||
        airline.alliance.toLowerCase().includes(q);
      return matchRegion && matchSearch;
    });
  }, [regionFilter, searchQuery]);

  return (
    <section id="worldwide-directory" className="py-12 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-xs font-bold tracking-wide uppercase mb-3">
              <Globe2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Worldwide Aviation Directory · Fligh.com</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-black text-slate-900 tracking-tight">
              Worldwide Main Airports & Global Airlines
            </h2>
            <p className="text-slate-500 text-sm mt-1 max-w-2xl">
              Explore primary international flight hubs, terminal facilities, IATA codes, and world-class airlines connecting Pakistan to Europe, North America, and beyond.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
            <div className="text-center px-3 border-r border-slate-200">
              <div className="font-extrabold text-blue-600 text-base">20+</div>
              <div className="text-slate-500 text-[11px]">Major Hubs</div>
            </div>
            <div className="text-center px-3 border-r border-slate-200">
              <div className="font-extrabold text-indigo-600 text-base">15+</div>
              <div className="text-slate-500 text-[11px]">Global Airlines</div>
            </div>
            <div className="text-center px-3">
              <div className="font-extrabold text-emerald-600 text-base">IATA</div>
              <div className="text-slate-500 text-[11px]">Verified Data</div>
            </div>
          </div>
        </div>

        {/* Tab Selection & Search Row */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-6">
          {/* Main Tab Toggle */}
          <div className="inline-flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shrink-0">
            <button
              onClick={() => setActiveTab('airports')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === 'airports'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Worldwide Main Airports</span>
              <span
                className={`ml-1 text-[11px] px-2 py-0.5 rounded-full ${
                  activeTab === 'airports' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {WORLDWIDE_MAIN_AIRPORTS.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('airlines')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === 'airlines'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Plane className="w-4 h-4" />
              <span>Worldwide Airlines</span>
              <span
                className={`ml-1 text-[11px] px-2 py-0.5 rounded-full ${
                  activeTab === 'airlines' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {WORLDWIDE_MAIN_AIRLINES.length}
              </span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === 'airports'
                  ? 'Search airport, IATA code (DXB, MXP, LHR), city...'
                  : 'Search airline, code (EK, QR, TK), hub, alliance...'
              }
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Region Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          <span className="text-xs font-semibold text-slate-400 mr-2 shrink-0">Region:</span>
          {regions.map((region) => (
            <button
              key={region}
              onClick={() => setRegionFilter(region)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                regionFilter === region
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {region}
            </button>
          ))}
        </div>

        {/* Featured Visual Spotlight Card */}
        {activeTab === 'airports' ? (
          <div className="relative rounded-3xl overflow-hidden mb-8 border border-slate-200 shadow-md group">
            <div className="h-44 sm:h-56 w-full relative">
              <img
                src="/src/assets/images/world_airports_banner_1790967542504.jpg"
                alt="Worldwide International Airports"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/50 to-transparent flex flex-col justify-end p-6">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <span className="inline-block px-2.5 py-1 bg-blue-500/80 backdrop-blur-md text-white text-[11px] font-bold rounded-lg mb-2">
                      Premier International Hubs
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      Connecting Pakistan to Europe, Americas & The Gulf
                    </h3>
                    <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
                      Real-time terminal gates, transit clearance, duty-free shopping, and direct flights from Karachi (KHI), Lahore (LHE), and Islamabad (ISB).
                    </p>
                  </div>
                  <div className="hidden md:flex items-center gap-3 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 shrink-0">
                    <img
                      src="/src/assets/images/dubai_hub_airport_1790967531267.jpg"
                      alt="Dubai Concourse"
                      className="w-16 h-12 rounded-xl object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="text-left pr-2 text-white">
                      <div className="text-xs font-bold">DXB & DOH Concourse</div>
                      <div className="text-[10px] text-slate-300">24/7 Modern Transit</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative rounded-3xl overflow-hidden mb-8 border border-slate-200 shadow-md group">
            <div className="h-44 sm:h-56 w-full relative">
              <img
                src="/src/assets/images/aviation_fleet_hero_1790967519579.jpg"
                alt="Global Commercial Fleet"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/50 to-transparent flex flex-col justify-end p-6">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <span className="inline-block px-2.5 py-1 bg-indigo-500/80 backdrop-blur-md text-white text-[11px] font-bold rounded-lg mb-2">
                      Official Airline Partners
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      Leading Commercial Fleets & Global Alliances
                    </h3>
                    <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
                      Fly with Emirates, Qatar Airways, Turkish Airlines, PIA, British Airways, and Star Alliance carriers with certified Halal meals and flexible baggage.
                    </p>
                  </div>
                  <div className="hidden md:flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/20 text-white shrink-0">
                    <Plane className="w-5 h-5 text-amber-400" />
                    <div>
                      <div className="text-xs font-bold">5-Star Skytrax Carriers</div>
                      <div className="text-[10px] text-slate-300">A350 · B787 · A380 Fleets</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* AIRPORTS GRID */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'airports' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAirports.map((airport) => (
              <div
                key={airport.iata}
                className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all p-5 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar with IATA Code badge & Region */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-mono font-black text-lg flex items-center justify-center shadow-xs">
                        {airport.iata}
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 font-mono">ICAO: {airport.icao}</div>
                        <div className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-1">
                          {airport.city}
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md shrink-0">
                      {airport.region}
                    </span>
                  </div>

                  {/* Airport Full Name */}
                  <h3 className="font-bold text-slate-800 text-sm mb-1 leading-snug">
                    {airport.name}
                  </h3>
                  <div className="text-xs text-slate-500 mb-3 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>{airport.country}</span>
                  </div>

                  {/* Key Stats Row */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] mb-3">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Annual Traffic</span>
                      <span className="font-bold text-slate-800">{airport.annualPassengers}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Terminals</span>
                      <span className="font-bold text-slate-800">{airport.terminals} Terminals</span>
                    </div>
                  </div>

                  {/* Hub Airlines */}
                  <div className="mb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Main Hub Carriers
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {airport.hubAirlines.map((airline) => (
                        <span
                          key={airline}
                          className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-semibold"
                        >
                          {airline}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="space-y-1 mb-4">
                    {airport.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-slate-600 text-xs">
                        <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                        <span className="truncate">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {airport.directFromPakistan ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      Direct from Pakistan
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">1-Stop Connection</span>
                  )}

                  <button
                    onClick={() => {
                      if (onSelectAirportToSearch) {
                        onSelectAirportToSearch(airport);
                      } else {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer group-hover:bg-blue-700"
                  >
                    <span>Search Flights</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* AIRLINES GRID */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'airlines' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAirlines.map((airline) => (
              <div
                key={airline.iata}
                className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all p-5 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar with Airline Code and Alliance badge */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        style={{ backgroundColor: airline.logoColor }}
                        className="w-12 h-12 rounded-xl text-white font-mono font-black text-lg flex items-center justify-center shadow-xs shrink-0"
                      >
                        {airline.iata}
                      </div>
                      <div>
                        <div className="font-extrabold text-slate-900 text-base leading-snug">
                          {airline.name}
                        </div>
                        <div className="text-xs text-slate-500">{airline.country}</div>
                      </div>
                    </div>

                    {/* Skytrax Rating */}
                    <div className="flex items-center gap-0.5 px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md text-[11px] font-bold border border-amber-200 shrink-0">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{airline.skytraxRating}-Star</span>
                    </div>
                  </div>

                  {/* Alliance & Hub Tag */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-3 text-[11px]">
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold ${
                        airline.alliance === 'Star Alliance'
                          ? 'bg-slate-900 text-white'
                          : airline.alliance === 'oneworld'
                          ? 'bg-indigo-600 text-white'
                          : airline.alliance === 'SkyTeam'
                          ? 'bg-sky-600 text-white'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {airline.alliance}
                    </span>

                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-medium">
                      Hub: {airline.hubIata}
                    </span>
                  </div>

                  {/* Fleet & Aircraft details */}
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] mb-3 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Fleet Size:</span>
                      <span className="font-bold text-slate-800">{airline.fleetSize} Active Aircraft</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Flagship Jets:</span>
                      <span className="font-semibold text-slate-700 truncate max-w-[170px]">
                        {airline.featuredAircraft}
                      </span>
                    </div>
                  </div>

                  {/* In-Flight Amenities */}
                  <div className="mb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Onboard Experience
                    </span>
                    <div className="space-y-1">
                      {airline.amenities.slice(0, 2).map((amenity, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-slate-600 text-xs">
                          <Sparkles className="w-3 h-3 text-blue-500 shrink-0" />
                          <span className="line-clamp-1">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Popular Routes */}
                  <div className="mb-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Top Routes
                    </span>
                    <div className="text-[11px] text-slate-500 truncate">
                      {airline.popularRoutes.join(' · ')}
                    </div>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="text-xs font-semibold text-slate-700">
                    Hub: {airline.hubAirport}
                  </div>

                  <button
                    onClick={() => {
                      if (onSelectAirlineToSearch) {
                        onSelectAirlineToSearch(airline);
                      } else {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer group-hover:bg-blue-700 shrink-0"
                  >
                    <span>View Deals</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {((activeTab === 'airports' && filteredAirports.length === 0) ||
          (activeTab === 'airlines' && filteredAirlines.length === 0)) && (
          <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
            <Search className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h3 className="font-bold text-slate-700 text-sm">No matches found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try searching by city, airport code (e.g. DXB, MXP), or airline name.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setRegionFilter('All');
              }}
              className="mt-3 px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
