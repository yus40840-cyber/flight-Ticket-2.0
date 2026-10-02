import React, { useState } from 'react';
import { TRIP_MOMENTS } from '../data/travelData';
import { MomentItem } from '../types';
import { Heart, Eye, MessageCircle, ChevronRight, Share2, Sparkles } from 'lucide-react';

interface TripMomentsProps {
  onSelectMoment: (moment: MomentItem) => void;
}

export const TripMoments: React.FC<TripMomentsProps> = ({ onSelectMoment }) => {
  const [showAll, setShowAll] = useState(false);
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});

  const displayedMoments = showAll ? TRIP_MOMENTS : TRIP_MOMENTS.slice(0, 5);

  const toggleLike = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setLikedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900 tracking-tight">
            Unforgettable trip moments in Milan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real itineraries, insider culinary spots, and photo walk discoveries shared by the community.
          </p>
        </div>

        <button
          onClick={() => setShowAll(!showAll)}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
        >
          <span>{showAll ? 'Show less' : 'More'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Grid of travel community moments */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {displayedMoments.map((moment) => {
          const isLiked = likedIds[moment.id];
          return (
            <div
              key={moment.id}
              onClick={() => onSelectMoment(moment)}
              className="group bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              {/* Cover thumbnail */}
              <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                <img
                  src={moment.coverImage}
                  alt={moment.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Like floating button */}
                <button
                  onClick={(e) => toggleLike(e, moment.id)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${
                      isLiked ? 'fill-red-500 text-red-500' : 'text-white'
                    }`}
                  />
                </button>

                {/* Location text bottom left */}
                <div className="absolute bottom-2 left-2 text-[10px] text-white/90 font-medium drop-shadow-sm">
                  {moment.location}
                </div>
              </div>

              {/* Story summary & author */}
              <div className="p-3 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="font-bold text-slate-900 text-xs line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
                    {moment.title}
                  </h3>

                  <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                    {moment.summary}
                  </p>
                </div>

                {/* Author & Stats (Zero-Pill discipline: unboxed text with dots) */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                      {moment.authorAvatar || moment.author.charAt(0)}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-700 truncate max-w-[80px]">
                      {moment.author}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span className="flex items-center gap-0.5">
                      <Heart className="w-3 h-3 text-rose-500" />
                      <span className="tabular-nums">{moment.likes + (isLiked ? 1 : 0)}</span>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-0.5">
                      <Eye className="w-3 h-3" />
                      <span className="tabular-nums">{moment.views}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
