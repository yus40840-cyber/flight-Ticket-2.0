import React from 'react';

interface CityLogoProps {
  city: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  className?: string;
}

export const CityLogo: React.FC<CityLogoProps> = ({
  city,
  size = 'md',
  showLabel = false,
  className = '',
}) => {
  const normCity = city.toLowerCase().trim();

  const dimensions = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
  }[size];

  // Render SVG insignia based on city
  const renderIcon = () => {
    switch (true) {
      case normCity.includes('karachi'):
        // Quaid's Mausoleum & coastal star crescent seal (Pakistan emerald & white/gold)
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <rect width="48" height="48" rx="10" fill="#01411C" />
            {/* Dome arch of Mazar-e-Quaid */}
            <path
              d="M16 34V24C16 19.58 19.58 16 24 16C28.42 16 32 19.58 32 24V34H16Z"
              fill="#FFFFFF"
            />
            {/* White marble arch opening */}
            <path
              d="M21 34V27C21 25.34 22.34 24 24 24C25.66 24 27 25.34 27 27V34H21Z"
              fill="#01411C"
            />
            {/* Crescent & Star above dome */}
            <circle cx="24" cy="11" r="3" fill="#E5C158" />
            <path
              d="M24.8 9.5C23.6 9.7 22.8 10.7 23 12C23.2 13.2 24.3 14 25.5 13.7C24.5 14.2 23.2 13.8 22.7 12.8C22.2 11.8 22.6 10.5 23.6 10C24 9.8 24.4 9.6 24.8 9.5Z"
              fill="#01411C"
            />
            {/* Coastal wave at base */}
            <path d="M12 36C18 34.5 30 37.5 36 36" stroke="#52B788" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );

      case normCity.includes('milan') || normCity.includes('milano'):
        // Historic Milan St. Ambrose Red Cross Shield & Duomo spire silhouette
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <rect width="48" height="48" rx="10" fill="#B91C1C" />
            {/* White shield background */}
            <path
              d="M12 12H36V28C36 34.6 24 38 24 38C24 38 12 34.6 12 28V12Z"
              fill="#FFFFFF"
            />
            {/* Red St. Ambrose Cross */}
            <rect x="22" y="14" width="4" height="22" fill="#DC2626" />
            <rect x="14" y="21" width="20" height="4" fill="#DC2626" />
            {/* Duomo top spires crown */}
            <path d="M18 10L24 6L30 10L24 8Z" fill="#FBBF24" />
          </svg>
        );

      case normCity.includes('rome') || normCity.includes('roma'):
        // Roman Colosseum archways & imperial gold/crimson
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <rect width="48" height="48" rx="10" fill="#7F1D1D" />
            {/* Colosseum silhouette */}
            <path
              d="M10 32C10 24 16 18 24 18C32 18 38 24 38 32H10Z"
              fill="#F59E0B"
            />
            {/* Arches */}
            <rect x="14" y="26" width="3" height="6" rx="1.5" fill="#7F1D1D" />
            <rect x="20" y="24" width="3.5" height="8" rx="1.5" fill="#7F1D1D" />
            <rect x="26.5" y="24" width="3.5" height="8" rx="1.5" fill="#7F1D1D" />
            <rect x="33" y="26" width="3" height="6" rx="1.5" fill="#7F1D1D" />
            <circle cx="24" cy="12" r="3" fill="#FCD34D" />
          </svg>
        );

      case normCity.includes('dubai'):
        // Burj Khalifa needle silhouette & desert gold
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <rect width="48" height="48" rx="10" fill="#0F172A" />
            {/* Tower tiers */}
            <path d="M23.5 6L24.5 6L24.5 14L23.5 14Z" fill="#38BDF8" />
            <path d="M22 14H26L25.5 24H22.5Z" fill="#0284C7" />
            <path d="M20 24H28L27 34H21Z" fill="#0369A1" />
            <path d="M18 34H30V38H18Z" fill="#075985" />
            <circle cx="34" cy="14" r="3" fill="#F59E0B" />
          </svg>
        );

      case normCity.includes('baku'):
        // Flame Towers emblem of Azerbaijan
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <rect width="48" height="48" rx="10" fill="#0C4A6E" />
            {/* Three Flame towers */}
            <path
              d="M17 36C15 28 17 21 21 16C21 23 23 27 22 36H17Z"
              fill="#F97316"
            />
            <path
              d="M22 36C22 24 25 15 27 10C29 18 31 25 29 36H22Z"
              fill="#EF4444"
            />
            <path
              d="M29 36C30 28 32 24 35 20C34 26 35 30 33 36H29Z"
              fill="#FBBF24"
            />
          </svg>
        );

      case normCity.includes('shanghai'):
        // Oriental Pearl Tower spheres
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <rect width="48" height="48" rx="10" fill="#1E1B4B" />
            <rect x="23" y="6" width="2" height="34" fill="#E2E8F0" />
            <circle cx="24" cy="14" r="3.5" fill="#EC4899" />
            <circle cx="24" cy="24" r="6" fill="#F43F5E" />
            <path d="M18 36L24 28L30 36H18Z" fill="#9333EA" />
          </svg>
        );

      case normCity.includes('multan'):
        // Tomb of Shah Rukn-e-Alam blue tile octagonal dome
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <rect width="48" height="48" rx="10" fill="#0284C7" />
            {/* White/Turquoise tiled dome */}
            <path
              d="M16 28C16 20 20 15 24 13C28 15 32 20 32 28H16Z"
              fill="#F0FDFA"
            />
            <path d="M24 10V13" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
            <rect x="18" y="28" width="12" height="8" fill="#CCFBF1" />
            <rect x="22" y="31" width="4" height="5" fill="#0284C7" />
            {/* Geometric star */}
            <circle cx="24" cy="21" r="2" fill="#0F766E" />
          </svg>
        );

      case normCity.includes('islamabad'):
        // Faisal Mosque iconic triangular bedouin tent spires
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <rect width="48" height="48" rx="10" fill="#065F46" />
            {/* 4 Minarets (Turkish slim spires) */}
            <line x1="13" y1="10" x2="13" y2="36" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="35" y1="10" x2="35" y2="36" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
            {/* Triangular tent roof */}
            <polygon points="24,14 16,33 32,33" fill="#F0FDF4" />
            <polygon points="24,14 20,33 28,33" fill="#D1FAE5" />
            <circle cx="24" cy="11" r="1.5" fill="#FBBF24" />
          </svg>
        );

      case normCity.includes('florence') || normCity.includes('firenze'):
        // Giglio Fiorentino (Florentine Iris Lily)
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <rect width="48" height="48" rx="10" fill="#991B1B" />
            <path
              d="M24 10C24 16 21 20 21 24H27C27 20 24 16 24 10Z"
              fill="#FFFFFF"
            />
            <path
              d="M17 18C20 20 21 23 21 26H15C13 22 14 19 17 18Z"
              fill="#FFFFFF"
            />
            <path
              d="M31 18C28 20 27 23 27 26H33C35 22 34 19 31 18Z"
              fill="#FFFFFF"
            />
            <rect x="22" y="27" width="4" height="9" fill="#FFFFFF" />
            <path d="M19 36H29L24 39L19 36Z" fill="#FFFFFF" />
          </svg>
        );

      case normCity.includes('venice') || normCity.includes('venezia'):
        // Winged Lion of Saint Mark / Gondola prow
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <rect width="48" height="48" rx="10" fill="#1E3A8A" />
            <path
              d="M14 32C22 35 30 32 35 27L37 28C31 34 21 38 13 34L14 32Z"
              fill="#F59E0B"
            />
            {/* Gondola Ferro metallic prow blade */}
            <path
              d="M14 14C17 19 15 27 13 33L11 32C13 26 15 19 12 15L14 14Z"
              fill="#E2E8F0"
            />
            <rect x="14" y="20" width="5" height="1.5" fill="#E2E8F0" />
            <rect x="13.5" y="23" width="5" height="1.5" fill="#E2E8F0" />
            <rect x="13" y="26" width="5" height="1.5" fill="#E2E8F0" />
          </svg>
        );

      case normCity.includes('naples') || normCity.includes('napoli'):
        // Mount Vesuvius & Gulf bay
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <rect width="48" height="48" rx="10" fill="#0369A1" />
            {/* Vesuvius double peak */}
            <polygon points="12,33 21,20 27,24 36,33" fill="#D97706" />
            <polygon points="19,23 21,20 25,23" fill="#FEF3C7" />
            <path d="M10 35C20 33 28 36 38 35" stroke="#38BDF8" strokeWidth="2.5" />
          </svg>
        );

      case normCity.includes('toronto'):
        // CN tower & maple leaf crest
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <rect width="48" height="48" rx="10" fill="#DC2626" />
            <line x1="24" y1="7" x2="24" y2="39" stroke="#FFFFFF" strokeWidth="2" />
            <ellipse cx="24" cy="20" rx="6" ry="2.5" fill="#FFFFFF" />
            <ellipse cx="24" cy="18" rx="4" ry="1.5" fill="#DC2626" />
          </svg>
        );

      default:
        // Universal elegant travel destination monogram pin
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <rect width="48" height="48" rx="10" fill="#2563EB" />
            <path
              d="M24 12C19.58 12 16 15.58 16 20C16 25.5 24 34 24 34C24 34 32 25.5 32 20C32 15.58 28.42 12 24 12Z"
              fill="#FFFFFF"
            />
            <circle cx="24" cy="20" r="3.5" fill="#2563EB" />
          </svg>
        );
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className={`shrink-0 overflow-hidden shadow-xs ${dimensions}`}>
        {renderIcon()}
      </div>
      {showLabel && (
        <span className="font-semibold text-slate-900 leading-tight">
          {city}
        </span>
      )}
    </div>
  );
};
