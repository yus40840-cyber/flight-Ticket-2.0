import React, { useState } from 'react';
import { X, Star, Clock, Ticket, Check, MapPin, ShieldCheck, Heart } from 'lucide-react';
import { SightItem } from '../types';
import { CityLogo } from './CityLogos';

interface SightDetailsModalProps {
  sight: SightItem | null;
  onClose: () => void;
  onBookTickets: (sight: SightItem, count: number, total: number) => void;
}

export const SightDetailsModal: React.FC<SightDetailsModalProps> = ({
  sight,
  onClose,
  onBookTickets,
}) => {
  const [ticketCount, setTicketCount] = useState(2);
  const [selectedPass, setSelectedPass] = useState<'standard' | 'fast_track' | 'audio'>('fast_track');
  const [booked, setBooked] = useState(false);

  if (!sight) return null;

  const basePrice = sight.priceEstimatePKR || 4500;
  const passMultiplier = selectedPass === 'fast_track' ? 1.4 : selectedPass === 'audio' ? 1.6 : 1.0;
  const unitPrice = Math.round(basePrice * passMultiplier);
  const totalPKR = unitPrice * ticketCount;

  const handleConfirm = () => {
    setBooked(true);
    onBookTickets(sight, ticketCount, totalPKR);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Cover image & close */}
        <div className="relative h-60 w-full bg-slate-100 overflow-hidden">
          <img
            src={sight.image}
            alt={sight.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center gap-2 mb-1">
              <CityLogo city={sight.city} size="sm" />
              <span className="text-xs font-bold text-amber-300">
                Score {sight.rankScore.toFixed(1)}/10 Must-Visit
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight leading-tight">
              {sight.title}
            </h2>
            <div className="flex items-center gap-2 text-xs text-white/80 mt-1">
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <Star className="w-3.5 h-3.5 fill-current" />
                {sight.rating}/5
              </span>
              <span>·</span>
              <span>{sight.reviewCount.toLocaleString()} traveler reviews</span>
              <span>·</span>
              <span>{sight.category}</span>
            </div>
          </div>
        </div>

        {/* Modal content */}
        <div className="p-6 space-y-5">
          {/* Timing & description */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Opening Hours: {sight.openingHours}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {sight.description}
            </p>
          </div>

          {/* Must see highlights */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Must-See Highlights
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
              {sight.mustSeeHighlights.map((highlight, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ticket pass selection */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Select Entry Pass
            </h4>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                onClick={() => setSelectedPass('standard')}
                className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                  selectedPass === 'standard'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-semibold'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="font-bold text-slate-900">Standard Entry</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Fixed time slot</div>
              </button>
              <button
                onClick={() => setSelectedPass('fast_track')}
                className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                  selectedPass === 'fast_track'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-semibold'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="font-bold text-slate-900">Skip-the-Line</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Fast-track gate</div>
              </button>
              <button
                onClick={() => setSelectedPass('audio')}
                className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                  selectedPass === 'audio'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-semibold'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="font-bold text-slate-900">Guided + Audio</div>
                <div className="text-[10px] text-slate-500 mt-0.5">English commentary</div>
              </button>
            </div>
          </div>

          {/* Bottom ticket quantity and instant booking */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-700">Tickets:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center cursor-pointer"
                >
                  -
                </button>
                <span className="w-6 text-center font-bold text-sm tabular-nums">
                  {ticketCount}
                </span>
                <button
                  onClick={() => setTicketCount(Math.min(10, ticketCount + 1))}
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Total
                </span>
                <span className="text-lg font-black text-blue-600 tabular-nums">
                  Rs {totalPKR.toLocaleString()}
                </span>
              </div>

              {booked ? (
                <div className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> E-Voucher Issued
                </div>
              ) : (
                <button
                  onClick={handleConfirm}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Book Tickets Now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
