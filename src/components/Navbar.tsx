import React, { useState } from 'react';
import {
  Globe,
  PhoneCall,
  Search,
  User,
  Smartphone,
  ChevronDown,
  Sparkles,
  MapPin,
  Calendar,
  Compass,
  X,
  Check,
  ShieldCheck,
  Lock,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenAuth: () => void;
  onOpenBookings: () => void;
  onOpenAppQR: () => void;
  onOpenAdminDashboard: () => void;
  pendingApprovalsCount?: number;
  currency: string;
  onCurrencyChange: (curr: string) => void;
  user: { name: string; email: string; uid?: string } | null;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenAuth,
  onOpenBookings,
  onOpenAppQR,
  onOpenAdminDashboard,
  pendingApprovalsCount = 0,
  currency,
  onCurrencyChange,
  user,
  onSignOut,
}) => {
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [supportDropdownOpen, setSupportDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isAdmin = Boolean(
    user && (user.email === 'yus40840@gmail.com' || user.email === 'ramshaskhaikh544@gmail.com')
  );

  const navItems = [
    { id: 'hotels', label: 'Hotels & Homes' },
    { id: 'flights', label: 'Flights' },
    { id: 'flight_hotel', label: 'Flight + Hotel' },
    { id: 'cars', label: 'Cars' },
    { id: 'attractions', label: 'Attractions & Tours' },
    { id: 'privatetours', label: 'Private Tours' },
    { id: 'grouptours', label: 'Group Tours' },
    { id: 'cruises', label: 'Cruises' },
    { id: 'tripplanner', label: 'Trip.Planner', badge: 'New' },
    { id: 'aviation', label: 'Airports & Airlines', badge: 'Global' },
    { id: 'inspiration', label: 'Travel Inspiration' },
    { id: 'map', label: 'Map' },
    { id: 'rewards', label: 'Fligh.com Rewards' },
  ];

  const currencies = [
    { code: 'PKR', symbol: 'Rs', name: 'Pakistani Rupee' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'AED', symbol: 'AED', name: 'UAE Dirham' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal' },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      {/* Top utility row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand Wordmark & Official Logo */}
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="flex items-center gap-2.5 group"
            >
              <img
                src="/src/assets/images/fligh_official_logo_1790967504892.jpg"
                alt="Fligh.com Official Logo"
                className="w-9 h-9 rounded-xl object-cover shadow-xs border border-blue-100 group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
              <div className="font-display font-black text-2xl text-blue-600 tracking-tight flex items-baseline gap-1">
                <span>Fligh.com</span>
                <span className="text-slate-400 font-normal text-xs">PK</span>
              </div>
            </a>

            {/* Global quick search hint */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-xs text-slate-500 hover:bg-slate-200/70 transition-colors cursor-pointer" onClick={() => onTabChange('flights')}>
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search flights, hotels & tours in Pakistan and abroad</span>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-4 text-xs font-medium text-slate-700">
            {/* Mobile App trigger */}
            <button
              onClick={onOpenAppQR}
              className="hidden sm:flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-pointer py-1 px-2 rounded-md hover:bg-slate-50"
            >
              <Smartphone className="w-4 h-4 text-blue-600" />
              <span>App</span>
            </button>

            {/* Currency Selector */}
            <div className="relative">
              <button
                onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                className="flex items-center gap-1 hover:text-blue-600 transition-colors py-1 px-2 rounded-md hover:bg-slate-50 cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-semibold">{currency}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {currencyDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-100 py-1 z-50">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Select Currency
                  </div>
                  {currencies.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => {
                        onCurrencyChange(c.code);
                        setCurrencyDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-blue-50 transition-colors"
                    >
                      <span className="font-medium text-slate-800">
                        {c.code} ({c.symbol})
                      </span>
                      <span className="text-[11px] text-slate-400">{c.name}</span>
                      {currency === c.code && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Customer Support */}
            <div className="relative">
              <button
                onClick={() => setSupportDropdownOpen(!supportDropdownOpen)}
                className="hidden md:flex items-center gap-1 hover:text-blue-600 transition-colors py-1 px-2 rounded-md hover:bg-slate-50 cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5 text-slate-500" />
                <span>Customer support</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {supportDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-slate-100 p-3 z-50">
                  <div className="text-xs font-bold text-slate-900 mb-1">
                    24/7 Dedicated Support
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">
                    Multilingual customer service for flight bookings, hotel modifications, and instant refunds.
                  </p>
                  <div className="p-2 bg-slate-50 rounded-md text-[11px] text-slate-700 flex items-center justify-between mb-2">
                    <span>Pakistan Hotline:</span>
                    <a href="tel:+923000358949" className="font-semibold text-blue-600 hover:underline">
                      +92 3000358949
                    </a>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-md text-[11px] text-slate-700 flex items-center justify-between">
                    <span>Italy & EU Assist:</span>
                    <span className="font-semibold text-blue-600">+39 02 8990 1420</span>
                  </div>
                </div>
              )}
            </div>

            {/* Find bookings */}
            <button
              onClick={onOpenBookings}
              className="hover:text-blue-600 transition-colors py-1 px-2 rounded-md hover:bg-slate-50 cursor-pointer"
            >
              Find bookings
            </button>

            {/* Admin Portal / Admin Dashboard trigger */}
            {isAdmin ? (
              <button
                onClick={onOpenAdminDashboard}
                className="flex items-center gap-1.5 py-1 px-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer"
                title="Open Centralized Administrator Approval Dashboard"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Dashboard</span>
                {pendingApprovalsCount > 0 && (
                  <span className="w-4 h-4 bg-amber-400 text-slate-900 rounded-full text-[10px] font-black flex items-center justify-center animate-pulse">
                    {pendingApprovalsCount}
                  </span>
                )}
              </button>
            ) : (
              <button
                onClick={onOpenAdminDashboard}
                className="hidden sm:flex items-center gap-1 text-slate-500 hover:text-indigo-600 transition-colors py-1 px-2 rounded-md hover:bg-slate-50 cursor-pointer text-xs"
                title="Administrator Login & Approval Console"
              >
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Admin Portal</span>
              </button>
            )}

            {/* Sign in / Register */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100 transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                    {user.name.charAt(0)}
                  </div>
                  <span className="truncate max-w-[90px]">{user.name}</span>
                </button>
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-100 py-1.5 z-50">
                    <div className="px-3 py-1 border-b border-slate-100">
                      <div className="font-semibold text-slate-900 truncate">{user.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                    </div>
                    <button
                      onClick={onOpenBookings}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
                    >
                      My Itineraries & Bookings
                    </button>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenAdminDashboard();
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-indigo-700 hover:bg-indigo-50 font-semibold flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Admin Approval Console</span>
                    </button>
                    <button
                      onClick={onSignOut}
                      className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition-colors cursor-pointer shadow-xs"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign in/register</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main product navigation strip */}
      <div className="bg-slate-50/70 border-t border-slate-100 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1 py-1 text-xs whitespace-nowrap min-w-max">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`px-3 py-2 rounded-md font-medium transition-all relative flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-white'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] uppercase px-1 py-0.2 bg-amber-400 text-amber-950 font-bold rounded">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
