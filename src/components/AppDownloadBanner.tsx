import React from 'react';
import { Smartphone, Star, Download, Users, Zap, CheckCircle2, QrCode } from 'lucide-react';

export const AppDownloadBanner: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative background circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Heading & Value props */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3 border border-blue-400/20">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Mobile Exclusive Savings</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display tracking-tight text-white mb-3">
              Your all-in-one travel app
            </h2>

            <p className="text-sm text-blue-200/80 mb-6 max-w-xl leading-relaxed">
              Unlock secret mobile deals, instant flight delay alerts, offline itinerary access, and direct WhatsApp customer support.
            </p>

            {/* Feature bullets */}
            <div className="flex flex-wrap items-center gap-6 mb-8 text-xs font-semibold text-white/90">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>App-only deals</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Easy trip planning</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Real-time gate updates</span>
              </div>
            </div>

            {/* Metrics Trust Strip */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 max-w-md">
              <div>
                <div className="text-2xl font-black text-white tabular-nums font-display">
                  1.8M+
                </div>
                <div className="text-xs text-blue-200/70 font-medium">Daily users</div>
              </div>

              <div>
                <div className="text-2xl font-black text-white tabular-nums font-display">
                  150K+
                </div>
                <div className="text-xs text-blue-200/70 font-medium">Daily downloads</div>
              </div>

              <div>
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-black text-white tabular-nums font-display">
                    4.7
                  </span>
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                </div>
                <div className="text-xs text-blue-200/70 font-medium">Rating (App Store)</div>
              </div>
            </div>
          </div>

          {/* Right Column: QR Codes for App Store & Google Play */}
          <div className="lg:col-span-5 flex flex-col sm:flex-row items-center justify-center gap-6 bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
            {/* App Store QR */}
            <div className="flex flex-col items-center text-center">
              <div className="w-28 h-28 bg-white p-2 rounded-xl shadow-lg flex items-center justify-center mb-2">
                {/* SVG QR Code Simulation */}
                <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900 fill-current">
                  <path d="M10,10 h30 v30 h-30 z M15,15 v20 h20 v-20 z M20,20 h10 v10 h-10 z" />
                  <path d="M60,10 h30 v30 h-30 z M65,15 v20 h20 v-20 z M70,20 h10 v10 h-10 z" />
                  <path d="M10,60 h30 v30 h-30 z M15,65 v20 h20 v-20 z M20,70 h10 v10 h-10 z" />
                  <rect x="45" y="15" width="8" height="15" />
                  <rect x="45" y="35" width="20" height="8" />
                  <rect x="55" y="50" width="10" height="20" />
                  <rect x="70" y="55" width="15" height="8" />
                  <rect x="45" y="75" width="15" height="15" />
                  <rect x="75" y="75" width="15" height="15" />
                  <circle cx="50" cy="50" r="4" fill="#2563EB" />
                </svg>
              </div>
              <span className="text-xs font-bold text-white">App Store</span>
              <span className="text-[10px] text-blue-200/60">iOS 16.0+</span>
            </div>

            {/* Google Play QR */}
            <div className="flex flex-col items-center text-center">
              <div className="w-28 h-28 bg-white p-2 rounded-xl shadow-lg flex items-center justify-center mb-2">
                <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900 fill-current">
                  <path d="M10,10 h30 v30 h-30 z M15,15 v20 h20 v-20 z M20,20 h10 v10 h-10 z" />
                  <path d="M60,10 h30 v30 h-30 z M65,15 v20 h20 v-20 z M70,20 h10 v10 h-10 z" />
                  <path d="M10,60 h30 v30 h-30 z M15,65 v20 h20 v-20 z M20,70 h10 v10 h-10 z" />
                  <rect x="45" y="10" width="8" height="25" />
                  <rect x="45" y="45" width="10" height="10" />
                  <rect x="65" y="45" width="20" height="8" />
                  <rect x="45" y="65" width="25" height="8" />
                  <rect x="75" y="70" width="15" height="20" />
                  <circle cx="50" cy="50" r="4" fill="#10B981" />
                </svg>
              </div>
              <span className="text-xs font-bold text-white">Google Play</span>
              <span className="text-[10px] text-blue-200/60">Android 9.0+</span>
            </div>
          </div>
        </div>

        {/* Scan instruction label */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs text-blue-200/70 font-medium">
          Scan the QR code to download the app or search "Fligh.com" in your app marketplace
        </div>
      </div>
    </section>
  );
};
