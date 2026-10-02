import React from 'react';
import { TRAVEL_ROUTES } from '../data/travelData';
import { TravelRoute } from '../types';
import { CityLogo } from './CityLogos';
import { AirlineLogo } from './AirlineLogos';
import {
  Train,
  ArrowRight,
  Calendar,
  Clock,
  Zap,
  Landmark,
  Sun,
  Heart,
  UtensilsCrossed,
  MountainSnow,
  Compass,
  Palette,
  Cpu,
  Building2,
  LucideIcon,
  Sparkles,
} from 'lucide-react';

interface TravelRoutesProps {
  onSelectRoute: (route: TravelRoute) => void;
}

// Dynamic Lucide icon lookup for destination cities
const CITY_LUCIDE_ICONS: Record<string, { icon: LucideIcon; bg: string; text: string; ring: string }> = {
  Landmark: {
    icon: Landmark,
    bg: 'bg-rose-50',
    text: 'text-rose-600',
    ring: 'border-rose-200/80 group-hover:bg-rose-600 group-hover:text-white',
  },
  Sun: {
    icon: Sun,
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    ring: 'border-amber-200/80 group-hover:bg-amber-500 group-hover:text-white',
  },
  Heart: {
    icon: Heart,
    bg: 'bg-pink-50',
    text: 'text-pink-600',
    ring: 'border-pink-200/80 group-hover:bg-pink-600 group-hover:text-white',
  },
  UtensilsCrossed: {
    icon: UtensilsCrossed,
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    ring: 'border-orange-200/80 group-hover:bg-orange-600 group-hover:text-white',
  },
  MountainSnow: {
    icon: MountainSnow,
    bg: 'bg-indigo-50',
    text: 'text-indigo-600',
    ring: 'border-indigo-200/80 group-hover:bg-indigo-600 group-hover:text-white',
  },
  Compass: {
    icon: Compass,
    bg: 'bg-cyan-50',
    text: 'text-cyan-700',
    ring: 'border-cyan-200/80 group-hover:bg-cyan-600 group-hover:text-white',
  },
  Palette: {
    icon: Palette,
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    ring: 'border-purple-200/80 group-hover:bg-purple-600 group-hover:text-white',
  },
  Cpu: {
    icon: Cpu,
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    ring: 'border-emerald-200/80 group-hover:bg-emerald-600 group-hover:text-white',
  },
};

export const TravelRoutes: React.FC<TravelRoutesProps> = ({ onSelectRoute }) => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md">
              High-Speed Intercity Rail & Flights
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900 tracking-tight">
            Travel to & from Milan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Connecting Milan Centrale & Garibaldi to Italy's landmark cultural hubs, coastlines, and alpine capitals.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Speeds up to 300 km/h · E-Tickets with QR validation</span>
        </div>
      </div>

      {/* Grid of Route Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {TRAVEL_ROUTES.map((route) => {
          // Dynamic Lucide Icon Resolution
          const iconConfig =
            CITY_LUCIDE_ICONS[route.cityIcon] || {
              icon: Building2,
              bg: 'bg-blue-50',
              text: 'text-blue-600',
              ring: 'border-blue-200 group-hover:bg-blue-600 group-hover:text-white',
            };
          const CityLucideIcon = iconConfig.icon;

          return (
            <div
              key={route.id}
              onClick={() => onSelectRoute(route)}
              className="group bg-white rounded-2xl p-4 border border-slate-200 hover:border-blue-400 hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden"
            >
              {/* Subtle accent line on hover */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div>
                {/* Top row: Destination Dynamic City Icon Badge + Operator Brand */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    {/* Dynamic Lucide City Icon */}
                    <div
                      className={`w-9 h-9 rounded-xl ${iconConfig.bg} ${iconConfig.text} border ${iconConfig.ring} flex items-center justify-center transition-all duration-300 shadow-xs shrink-0`}
                      title={`${route.toCity}: ${route.destinationTag}`}
                    >
                      <CityLucideIcon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                    </div>

                    {/* City Logos in compact strip */}
                    <div className="flex items-center gap-1.5">
                      <CityLogo city={route.fromCity} size="sm" />
                      <span className="text-slate-300 text-xs">→</span>
                      <CityLogo city={route.toCity} size="sm" />
                    </div>
                  </div>

                  {/* Operator badge with train icon */}
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 shrink-0">
                    <AirlineLogo airlineCode="TRAIN" size="sm" />
                    <span className="text-[10px] truncate max-w-[65px]">
                      {route.operator}
                    </span>
                  </div>
                </div>

                {/* Destination City Headline & Tagline */}
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-extrabold text-slate-800 text-sm">
                      {route.fromCity}
                    </span>
                    <span className="text-slate-400 text-xs">to</span>
                    <span className="font-black text-blue-600 text-base font-display group-hover:translate-x-0.5 transition-transform">
                      {route.toCity}
                    </span>
                  </div>

                  {/* Destination Tagline explaining the Lucide icon motif */}
                  <div className="text-[11px] font-medium text-slate-500 mt-1 flex items-center gap-1 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-500 transition-colors shrink-0" />
                    <span className="truncate">{route.destinationTag}</span>
                  </div>
                </div>

                {/* Train Speed & Frequency Badges */}
                <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-500">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 font-semibold text-slate-700 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-500 shrink-0" />
                    <span>{route.speedKmH} km/h</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    {route.departureFrequency}
                  </span>
                </div>

                {/* Date & Travel Duration */}
                <div className="mt-3 flex items-center gap-2.5 text-xs text-slate-500 pt-2.5 border-t border-slate-100">
                  <span className="flex items-center gap-1 font-medium">
                    <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{route.dateStr}</span>
                  </span>
                  <span className="text-slate-300" aria-hidden="true">·</span>
                  <span className="flex items-center gap-1 text-[11px] text-slate-500 truncate">
                    <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{route.duration.split('(')[0]}</span>
                  </span>
                </div>
              </div>

              {/* Price & Action Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Starting From
                  </span>
                  <div className="text-sm sm:text-base font-black text-slate-900 tabular-nums">
                    Rs {route.pricePKR.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-bold text-blue-600 group-hover:underline">
                    Book
                  </span>
                  <span className="w-7 h-7 rounded-full bg-blue-50 group-hover:bg-blue-600 group-hover:text-white text-blue-600 flex items-center justify-center transition-all shadow-xs group-hover:scale-105">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
