import React, { useState } from 'react';
import { MILAN_SIGHTS } from '../data/travelData';
import { SightItem } from '../types';
import { Star, ChevronRight, MapPin, Ticket, Clock } from 'lucide-react';
import { CityLogo } from './CityLogos';

interface TopSightsProps {
  onSelectSight: (sight: SightItem) => void;
}

export const TopSights: React.FC<TopSightsProps> = ({ onSelectSight }) => {
  const [showAll, setShowAll] = useState(false);

  const displayedSights = showAll ? MILAN_SIGHTS : MILAN_SIGHTS.slice(0, 5);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CityLogo city="Milan" size="md" />
          <div>
            <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900 tracking-tight">
              Top sights you can't miss in Milan
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranked by traveler verification scores, skip-the-line tickets, and visitor ratings.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAll(!showAll)}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
        >
          <span>{showAll ? 'Show less' : 'More'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Sights Horizontal Carousel / Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {displayedSights.map((sight) => (
          <div
            key={sight.id}
            onClick={() => onSelectSight(sight)}
            className="group bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            {/* Sight Image */}
            <div className="relative h-36 w-full bg-slate-100 overflow-hidden">
              <img
                src={sight.image}
                alt={sight.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

              {/* City Tag & Rank Score Badge */}
              <div className="absolute top-2 left-2 flex items-center gap-1.5">
                <span className="text-[10px] font-bold bg-white/90 backdrop-blur-xs text-slate-800 px-1.5 py-0.5 rounded">
                  {sight.city}
                </span>
                <span className="text-[10px] font-black bg-blue-600 text-white px-1.5 py-0.5 rounded">
                  {sight.rankScore.toFixed(1)}
                </span>
              </div>

              {/* Category bottom left */}
              <div className="absolute bottom-2 left-2 text-[10px] text-white/90 drop-shadow-sm font-medium">
                {sight.category}
              </div>
            </div>

            {/* Body */}
            <div className="p-3 flex flex-col justify-between flex-1">
              <div>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {sight.title}
                </h3>

                {/* Rating & Review Count (Zero-Pill: Clean unboxed metadata) */}
                <div className="flex items-center gap-1.5 text-xs mt-1.5 text-slate-500">
                  <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{sight.rating}/5</span>
                  </span>
                  <span className="text-slate-300" aria-hidden="true">·</span>
                  <span className="text-[11px] tabular-nums">
                    {sight.reviewCount.toLocaleString()} reviews
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                  {sight.description}
                </p>
              </div>

              {/* Footer with Price / Fast Track Action */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">From</span>
                  <span className="font-bold text-slate-900 tabular-nums">
                    {sight.priceEstimatePKR && sight.priceEstimatePKR > 0
                      ? `Rs ${sight.priceEstimatePKR.toLocaleString()}`
                      : 'Free Entry'}
                  </span>
                </div>

                <span className="text-[11px] font-semibold text-blue-600 group-hover:underline">
                  Tickets &gt;
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
