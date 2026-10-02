import React, { useState } from 'react';
import { DESTINATION_CARDS, DestinationCard } from '../data/travelData';
import { CityLogo } from './CityLogos';
import { ArrowRight, Clock, Plane, Compass } from 'lucide-react';

interface TripInspirationProps {
  onSelectDestination: (dest: DestinationCard) => void;
}

export const TripInspiration: React.FC<TripInspirationProps> = ({
  onSelectDestination,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('Viewed');

  const categories = ['Viewed', 'Short haul', 'Medium haul', 'Long haul', 'Anywhere'];

  const filteredDestinations =
    activeCategory === 'Anywhere'
      ? DESTINATION_CARDS
      : DESTINATION_CARDS.filter((d) => d.category === activeCategory);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Section Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900 tracking-tight">
            Get inspired for your next trip
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Curated flight escapes tailored from Pakistan with live fare alerts and duration estimates.
          </p>
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === cat
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredDestinations.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectDestination(item)}
            className="group bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
          >
            {/* Image & Badges */}
            <div className="relative h-44 w-full overflow-hidden bg-slate-100">
              <img
                src={item.image}
                alt={item.city}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* City Logo Overlay Badge */}
              <div className="absolute top-3 left-3 flex items-center gap-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded-md shadow-xs">
                <CityLogo city={item.city} size="sm" />
                <span className="text-xs font-bold text-slate-900">{item.city}</span>
              </div>

              {item.badge && (
                <div className="absolute top-3 right-3 text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded shadow-xs">
                  {item.badge}
                </div>
              )}

              {/* Bottom flight metadata on image */}
              <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-white/90">
                <span className="flex items-center gap-1 font-medium drop-shadow-sm">
                  <Clock className="w-3 h-3 text-amber-300" /> {item.durationFromPak}
                </span>
                <span className="text-white/80 drop-shadow-sm font-medium">
                  {item.country}
                </span>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-3.5 flex flex-col justify-between flex-1">
              <div>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {item.highlight}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    From
                  </div>
                  <div className="text-sm font-black text-blue-600 tabular-nums">
                    Rs {item.priceStartingPKR.toLocaleString()}
                  </div>
                </div>

                <span className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-600 flex items-center justify-center transition-colors">
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
