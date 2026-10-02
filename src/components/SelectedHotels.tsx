import React, { useState } from 'react';
import { SELECTED_HOTELS } from '../data/travelData';
import { HotelItem } from '../types';
import { Star, ChevronRight, MapPin, Check, Wifi, Coffee } from 'lucide-react';
import { CityLogo } from './CityLogos';

interface SelectedHotelsProps {
  onSelectHotel: (hotel: HotelItem) => void;
}

export const SelectedHotels: React.FC<SelectedHotelsProps> = ({ onSelectHotel }) => {
  const [showAll, setShowAll] = useState(false);

  const displayedHotels = showAll ? SELECTED_HOTELS : SELECTED_HOTELS.slice(0, 5);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CityLogo city="Milan" size="md" />
          <div>
            <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900 tracking-tight">
              Unwind in our selected hotels in Milan
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Top reviewed properties offering guaranteed check-in, flexible cancellation, and member savings.
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

      {/* Grid of Hotels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {displayedHotels.map((hotel) => (
          <div
            key={hotel.id}
            onClick={() => onSelectHotel(hotel)}
            className="group bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
          >
            {/* Hotel Thumbnail */}
            <div className="relative h-40 w-full bg-slate-100 overflow-hidden">
              <img
                src={hotel.image}
                alt={hotel.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

              {/* Area tag */}
              <div className="absolute top-2 left-2 text-[10px] font-bold bg-white/90 backdrop-blur-xs text-slate-800 px-2 py-0.5 rounded shadow-xs">
                {hotel.area}
              </div>

              {/* Star rating icons */}
              <div className="absolute top-2 right-2 flex items-center gap-0.5 text-amber-400">
                {Array.from({ length: hotel.stars }).map((_, i) => (
                  <Star key={i} className="w-2.5 h-2.5 fill-current" />
                ))}
              </div>

              {/* Distance from center */}
              <div className="absolute bottom-2 left-2 text-[10px] text-white/90 font-medium drop-shadow-sm flex items-center gap-1">
                <MapPin className="w-3 h-3 text-white/80" />
                <span>{hotel.distanceToCenter}</span>
              </div>
            </div>

            {/* Hotel Details */}
            <div className="p-3.5 flex flex-col justify-between flex-1">
              <div>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {hotel.name}
                </h3>

                {/* Score & Reviews */}
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="font-extrabold text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded">
                    {hotel.ratingScore.toFixed(1)}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-700">/10</span>
                  <span className="text-slate-300" aria-hidden="true">·</span>
                  <span className="text-[11px] text-slate-500 tabular-nums">
                    {hotel.reviewCount} reviews
                  </span>
                </div>

                {/* Feature bullet list */}
                <div className="mt-2 space-y-1">
                  {hotel.features.slice(0, 2).map((feat, idx) => (
                    <div
                      key={idx}
                      className="text-[10px] text-slate-500 flex items-center gap-1 truncate"
                    >
                      <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing & Booking CTA */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-end justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    From
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm sm:text-base font-black text-slate-900 tabular-nums">
                      Rs {hotel.pricePKR.toLocaleString()}
                    </span>
                    {hotel.originalPricePKR && (
                      <span className="text-[10px] text-slate-400 line-through tabular-nums">
                        Rs {hotel.originalPricePKR.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <button className="text-xs font-bold text-blue-600 hover:text-blue-700 group-hover:underline cursor-pointer">
                  Book &gt;
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
