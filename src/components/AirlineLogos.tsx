import React from 'react';

interface AirlineLogoProps {
  airlineCode?: string;
  airlineName?: string;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
}

export const AirlineLogo: React.FC<AirlineLogoProps> = ({
  airlineCode = 'EK',
  airlineName,
  size = 'md',
  showName = false,
  className = '',
}) => {
  const code = (airlineCode || '').toUpperCase();
  const name = (airlineName || '').toLowerCase();

  const dimensions = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  }[size];

  const renderAirlineIcon = () => {
    // PIA - Pakistan International Airlines
    if (code === 'PK' || name.includes('pia') || name.includes('pakistan')) {
      return (
        <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
          <rect width="40" height="40" rx="8" fill="#024731" />
          {/* PIA Tail wing swoosh in gold */}
          <path
            d="M8 28C14 26 22 20 28 10L32 10C28 20 18 28 8 30Z"
            fill="#C5A059"
          />
          {/* Crescent & Star */}
          <path
            d="M17 14C15.8 14.8 15.5 16.5 16.3 17.7C17.1 18.9 18.8 19.2 20 18.4C19 19.2 17.5 19 16.7 18C15.9 17 16.1 15.5 17 14Z"
            fill="#FFFFFF"
          />
          <polygon points="19.5,14 20,15.5 21.5,15.5 20.3,16.5 20.7,18 19.5,17.2 18.3,18 18.7,16.5 17.5,15.5 19,15.5" fill="#FFFFFF" />
          <text x="20" y="35" textAnchor="middle" fill="#FFFFFF" fontSize="6.5" fontWeight="900" letterSpacing="1">PIA</text>
        </svg>
      );
    }

    // Emirates
    if (code === 'EK' || name.includes('emirates')) {
      return (
        <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
          <rect width="40" height="40" rx="8" fill="#D71921" />
          {/* Emirates Calligraphy gold motif */}
          <path
            d="M11 26C11 18 17 13 23 13C25.5 13 27 14 28 15.5L25.8 17C25.1 16 24.2 15.4 22.8 15.4C18.6 15.4 14.5 19.2 14.5 24.5C14.5 25.8 15.3 26.5 16.5 26.5C18.5 26.5 21 24.5 22 22.5L24.5 24C23 26.8 19.8 29 16.2 29C13 29 11 27.8 11 26Z"
            fill="#FFFFFF"
          />
          <circle cx="28.5" cy="18.5" r="2.2" fill="#E5B942" />
          <path d="M12 11H15V13H12Z" fill="#E5B942" />
        </svg>
      );
    }

    // Qatar Airways
    if (code === 'QR' || name.includes('qatar')) {
      return (
        <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
          <rect width="40" height="40" rx="8" fill="#5C0632" />
          {/* Oryx head silhouette */}
          <path
            d="M21 9L23 15L29 18C27 21 24 23 20 23L16 28L15 26L18 22C16 20 15 17 16 13L21 9Z"
            fill="#FFFFFF"
          />
          {/* Long Oryx horns */}
          <path d="M21 9L18 4M23 9L21 3" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="18" cy="15" r="1.2" fill="#5C0632" />
        </svg>
      );
    }

    // Turkish Airlines
    if (code === 'TK' || name.includes('turkish')) {
      return (
        <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
          <rect width="40" height="40" rx="8" fill="#C8102E" />
          <circle cx="20" cy="20" r="14" fill="#E30613" stroke="#FFFFFF" strokeWidth="1.5" />
          {/* Flying Wild Goose / Swan in circle */}
          <path
            d="M13 21C16 20 20 17 23 13L24 14C22 18 19 22 17 24C21 23 25 21 28 17L29 18C25 23 20 26 15 27L13 21Z"
            fill="#FFFFFF"
          />
        </svg>
      );
    }

    // Saudia
    if (code === 'SV' || name.includes('saudia')) {
      return (
        <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
          <rect width="40" height="40" rx="8" fill="#006A4E" />
          {/* Crossed swords & Palm tree */}
          <circle cx="20" cy="14" r="3" fill="#C5A059" />
          <path d="M20 14V22" stroke="#C5A059" strokeWidth="2" strokeLinecap="round" />
          <path d="M14 26L26 26" stroke="#C5A059" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M15 28L25 24" stroke="#FFFFFF" strokeWidth="1.2" />
          <path d="M15 24L25 28" stroke="#FFFFFF" strokeWidth="1.2" />
        </svg>
      );
    }

    // ITA Airways (Italy Flag & Blue Azzurro)
    if (code === 'AZ' || name.includes('ita') || name.includes('alitalia')) {
      return (
        <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
          <rect width="40" height="40" rx="8" fill="#0055A5" />
          {/* Italian tricolor wing */}
          <path d="M10 24L20 12L24 12L15 27H10Z" fill="#009246" />
          <path d="M16 24L24 13L27 13L19 27H16Z" fill="#FFFFFF" />
          <path d="M21 24L28 14L31 14L23 27H21Z" fill="#CE2B37" />
          <text x="20" y="35" textAnchor="middle" fill="#FFFFFF" fontSize="6.5" fontWeight="900">ITA</text>
        </svg>
      );
    }

    // Flydubai
    if (code === 'FZ' || name.includes('flydubai')) {
      return (
        <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
          <rect width="40" height="40" rx="8" fill="#003580" />
          {/* Orange & Blue swoosh */}
          <path d="M9 25C15 23 23 18 31 11L33 13C24 21 16 27 9 29V25Z" fill="#FF7900" />
          <path d="M12 28C18 26 25 22 31 16L32 18C25 25 18 30 12 32V28Z" fill="#00A3E0" />
        </svg>
      );
    }

    // High Speed Train / Frecciarossa
    if (code === 'TRAIN' || name.includes('train') || name.includes('freccia')) {
      return (
        <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
          <rect width="40" height="40" rx="8" fill="#B91C1C" />
          {/* Aerodynamic high speed locomotive */}
          <path
            d="M9 26L16 14C19 14 28 14 31 18C33 21 33 26 33 26H9Z"
            fill="#FFFFFF"
          />
          <path d="M18 17H25L24 21H16L18 17Z" fill="#1E293B" />
          <line x1="7" y1="28" x2="33" y2="28" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    }

    // Generic flight wing
    return (
      <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
        <rect width="40" height="40" rx="8" fill="#1D4ED8" />
        <path
          d="M12 24L20 12L24 13L19 22L27 23L30 20L31 21L28 26L19 25L14 28L12 28L13 25L12 24Z"
          fill="#FFFFFF"
        />
      </svg>
    );
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className={`shrink-0 overflow-hidden shadow-xs ${dimensions}`}>
        {renderAirlineIcon()}
      </div>
      {showName && (
        <div className="flex flex-col">
          <span className="font-semibold text-xs text-slate-900 leading-tight">
            {airlineName || code}
          </span>
          <span className="text-[10px] text-slate-500">{code}</span>
        </div>
      )}
    </div>
  );
};
