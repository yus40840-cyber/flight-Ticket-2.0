import React from 'react';
import { Tag, Sparkles, Check, Gift } from 'lucide-react';
import { CouponItem } from '../types';

interface NewUserDiscountsProps {
  coupons: CouponItem[];
  onClaimAll: () => void;
  onClaimSingle: (id: string) => void;
  onOpenAuth: () => void;
  isLoggedIn: boolean;
}

export const NewUserDiscounts: React.FC<NewUserDiscountsProps> = ({
  coupons,
  onClaimAll,
  onClaimSingle,
  onOpenAuth,
  isLoggedIn,
}) => {
  const allClaimed = coupons.every((c) => c.claimed);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gradient-to-r from-amber-50 via-orange-50/60 to-blue-50/50 rounded-2xl p-5 sm:p-6 border border-orange-100/80 shadow-xs">
        {/* Banner Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-xs">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 font-display">
                  New user exclusive
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-orange-100 text-orange-700 rounded-md">
                  Welcome Bonus
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                New users get more discounts on travel! Save instantly on flights, hotels and tours.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-stretch sm:self-auto">
            {!isLoggedIn ? (
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shadow-xs"
              >
                Sign in & claim all
              </button>
            ) : (
              <button
                onClick={onClaimAll}
                disabled={allClaimed}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer shadow-xs ${
                  allClaimed
                    ? 'bg-emerald-600 text-white cursor-default'
                    : 'bg-orange-600 hover:bg-orange-700 text-white active:scale-98'
                }`}
              >
                {allClaimed ? (
                  <span className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" /> All Claimed
                  </span>
                ) : (
                  'Claim all'
                )}
              </button>
            )}
          </div>
        </div>

        {/* Coupons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="bg-white rounded-xl p-4 border border-orange-100 hover:border-orange-300 transition-all flex flex-col justify-between shadow-xs relative overflow-hidden group"
            >
              {/* Decorative dashed ticket line */}
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-orange-50 border-r border-orange-100" />
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-orange-50 border-l border-orange-100" />

              <div>
                <div className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-1">
                  {coupon.category}
                </div>
                <div className="text-2xl font-black text-slate-900 tracking-tight font-display">
                  {coupon.discountTitle}
                </div>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {coupon.discountDesc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-medium">
                  {coupon.claimed ? `Code: ${coupon.code}` : coupon.expiresIn}
                </span>

                <button
                  onClick={() => onClaimSingle(coupon.id)}
                  disabled={coupon.claimed}
                  className={`text-xs font-bold px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                    coupon.claimed
                      ? 'bg-emerald-50 text-emerald-700 cursor-default'
                      : 'bg-orange-50 text-orange-700 hover:bg-orange-100 active:scale-95'
                  }`}
                >
                  {coupon.claimed ? 'Claimed' : 'Claim'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
