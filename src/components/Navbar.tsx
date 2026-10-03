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
  MoreVertical,
  Bell,
  CheckCircle2,
  Ticket,
  QrCode,
} from 'lucide-react';
import { UserNotification } from '../firebase';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenAuth: () => void;
  onOpenBookings: () => void;
  onOpenAppQR: () => void;
  onOpenAdminDashboard: () => void;
  onOpenVerificationStation?: () => void;
  pendingApprovalsCount?: number;
  currency: string;
  onCurrencyChange: (curr: string) => void;
  user: { name: string; email: string; uid?: string } | null;
  onSignOut: () => void;
  notifications?: UserNotification[];
  onCollectTicket?: (bookingRef: string) => void;
  onMarkNotificationAsRead?: (notifId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenAuth,
  onOpenBookings,
  onOpenAppQR,
  onOpenAdminDashboard,
  onOpenVerificationStation,
  pendingApprovalsCount = 0,
  currency,
  onCurrencyChange,
  user,
  onSignOut,
  notifications = [],
  onCollectTicket,
  onMarkNotificationAsRead,
}) => {
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [supportDropdownOpen, setSupportDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

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

          {/* Top Actions - Desktop view (hidden on mobile) */}
          <div className="hidden md:flex items-center gap-4 text-xs font-medium text-slate-700">
            {/* Mobile App trigger */}
            <button
              onClick={onOpenAppQR}
              className="hidden lg:flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-pointer py-1 px-2 rounded-md hover:bg-slate-50"
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
                className="flex items-center gap-1 hover:text-blue-600 transition-colors py-1 px-2 rounded-md hover:bg-slate-50 cursor-pointer"
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

            {/* Ticket Verifier Checkpoint trigger for staff */}
            <button
              onClick={onOpenVerificationStation}
              className="flex items-center gap-1.5 py-1 px-2.5 text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-md transition-colors text-xs font-semibold shrink-0 cursor-pointer"
              title="Ticket Verification Staff Checkpoint Station"
            >
              <QrCode className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden lg:inline">Ticket Verifier</span>
            </button>

            {/* Admin Portal / Admin Dashboard trigger */}
            {isAdmin ? (
              <button
                onClick={onOpenAdminDashboard}
                className="flex items-center gap-1.5 py-1 px-2.5 sm:px-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
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
                className="flex items-center gap-1 text-slate-600 hover:text-indigo-600 transition-colors py-1 px-2 rounded-md hover:bg-slate-50 cursor-pointer text-xs shrink-0"
                title="Administrator Login & Approval Console"
              >
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Admin Portal</span>
              </button>
            )}

            {/* Direct Account Notifications Bell */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-1.5 rounded-full hover:bg-slate-100 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
                  title="Account Notifications"
                  aria-label="Direct Account Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotifsCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white rounded-full text-[10px] font-black flex items-center justify-center animate-pulse shadow-xs">
                      {unreadNotifsCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wide">
                          Account Notifications
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {notifications.length} {notifications.length === 1 ? 'alert' : 'alerts'}
                      </span>
                    </div>

                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {notifications.length === 0 ? (
                        <div className="text-center py-6 text-slate-400 text-xs">
                          No notifications yet. You will be notified here once your tickets are approved!
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className="p-3 bg-gradient-to-r from-emerald-50/80 to-teal-50/50 border border-emerald-200/80 rounded-xl space-y-2 shadow-2xs"
                          >
                            <div className="flex items-start gap-2.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-bold text-emerald-950 flex items-center justify-between">
                                  <span>{n.title}</span>
                                  <span className="text-[10px] text-emerald-700 font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-emerald-200">
                                    {n.reference}
                                  </span>
                                </div>
                                <p className="text-xs text-emerald-900 mt-1 font-medium leading-relaxed">
                                  “{n.message}”
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setNotificationsOpen(false);
                                onMarkNotificationAsRead?.(n.id);
                                onCollectTicket?.(n.reference || n.bookingId);
                              }}
                              className="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Ticket className="w-3.5 h-3.5" />
                              <span>Receive / Collect Ticket</span>
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
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
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      My Itineraries & Bookings
                    </button>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenAdminDashboard();
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-indigo-700 hover:bg-indigo-50 font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Admin Approval Console</span>
                    </button>
                    <button
                      onClick={onSignOut}
                      className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 cursor-pointer"
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

          {/* Mobile View: 3-Dots Navigation Trigger Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="relative p-2 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer border border-slate-200 shadow-2xs"
              aria-label="Navigation Menu"
              title="All Top Bar Navigation"
            >
              <MoreVertical className="w-5 h-5 text-slate-700" />
              {pendingApprovalsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full animate-pulse border-2 border-white" />
              )}
            </button>
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
      {/* Mobile 3-Dots Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content Panel */}
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-2xl z-50 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div>
              {/* Drawer Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src="/src/assets/images/fligh_official_logo_1790967504892.jpg"
                    alt="Fligh.com"
                    className="w-7 h-7 rounded-lg object-cover"
                  />
                  <span className="font-display font-black text-lg text-blue-600">
                    Fligh.com <span className="text-xs font-normal text-slate-400">PK</span>
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* User / Sign In Card */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/60">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-sm text-slate-900 truncate">{user.name}</div>
                        <div className="text-xs text-slate-500 truncate">{user.email}</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onOpenBookings();
                        }}
                        className="flex-1 py-2 px-3 bg-white border border-slate-200 hover:border-blue-500 rounded-xl text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors shadow-2xs text-center cursor-pointer"
                      >
                        My Bookings
                      </button>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onSignOut();
                        }}
                        className="py-2 px-3 bg-white border border-red-200 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors shadow-2xs cursor-pointer"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth();
                    }}
                    className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <User className="w-4 h-4" />
                    <span>Sign In or Register</span>
                  </button>
                )}
              </div>

              {/* Mobile Account Notifications Card */}
              {user && notifications.length > 0 && (
                <div className="p-3 border-b border-slate-100 bg-emerald-50/70">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-black uppercase text-emerald-900 tracking-wider flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-emerald-600" />
                      Direct Account Notification
                    </span>
                    {unreadNotifsCount > 0 && (
                      <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-full">
                        {unreadNotifsCount} New
                      </span>
                    )}
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-emerald-200 shadow-2xs space-y-2">
                    <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Ticket Received & Approved!</span>
                    </div>
                    <p className="text-xs text-emerald-900 font-medium leading-relaxed">
                      “Your ticket has been received and approved. Kindly receive/collect your ticket.”
                    </p>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        const firstNotif = notifications[0];
                        if (firstNotif) {
                          onMarkNotificationAsRead?.(firstNotif.id);
                          onCollectTicket?.(firstNotif.reference || firstNotif.bookingId);
                        } else {
                          onOpenBookings();
                        }
                      }}
                      className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>Receive / Collect Ticket</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Navigation Options List */}
              <div className="p-3 space-y-1">
                {/* Admin Portal Button */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdminDashboard();
                  }}
                  className="w-full p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 hover:border-indigo-300 transition-all flex items-center justify-between text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-indigo-950 group-hover:text-indigo-600 transition-colors">
                        Admin Approval Console
                      </div>
                      <div className="text-[11px] text-indigo-700/70">
                        Review & issue E-tickets
                      </div>
                    </div>
                  </div>
                  {pendingApprovalsCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black animate-pulse shadow-xs shrink-0">
                      {pendingApprovalsCount} Pending
                    </span>
                  ) : (
                    <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-100/60 px-2 py-0.5 rounded-full shrink-0">
                      Admin
                    </span>
                  )}
                </button>

                {/* Ticket Verification Station for Staff */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenVerificationStation?.();
                  }}
                  className="w-full p-3 rounded-xl bg-gradient-to-r from-teal-50 to-indigo-50 border border-teal-100 hover:border-teal-300 transition-all flex items-center justify-between text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-xs shrink-0">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-teal-950 group-hover:text-teal-600 transition-colors">
                        Ticket Verification Station
                      </div>
                      <div className="text-[11px] text-teal-700/70">
                        Scan QR & checkpoint boarding
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-teal-700 font-bold bg-teal-100/70 px-2 py-0.5 rounded-full">
                    Staff
                  </span>
                </button>

                {/* Find Bookings */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenBookings();
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-3 text-left cursor-pointer text-slate-700 hover:text-blue-600"
                >
                  <Search className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-semibold">Find Bookings (PNR Search)</span>
                </button>

                {/* Mobile App Download */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAppQR();
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-3 text-left cursor-pointer text-slate-700 hover:text-blue-600"
                >
                  <Smartphone className="w-4 h-4 text-blue-600" />
                  <div className="flex-1">
                    <span className="text-xs font-semibold block">Download Fligh App</span>
                    <span className="text-[10px] text-slate-400">iOS & Android QR Scanner</span>
                  </div>
                </button>

                {/* Currency Selector */}
                <div className="border-t border-slate-100 my-2 pt-2">
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Currency ({currency})
                  </div>
                  <div className="grid grid-cols-3 gap-1 px-1">
                    {currencies.map((c) => (
                      <button
                        key={c.code}
                        onClick={() => onCurrencyChange(c.code)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold text-center transition-all cursor-pointer ${
                          currency === c.code
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {c.code}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 24/7 Support */}
                <div className="border-t border-slate-100 my-2 pt-2">
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    24/7 Customer Support
                  </div>
                  <div className="space-y-1.5 px-2.5 pt-1">
                    <a
                      href="tel:+923000358949"
                      className="flex items-center justify-between text-xs text-slate-600 hover:text-blue-600 p-2 rounded-lg bg-slate-50"
                    >
                      <span>Pakistan Hotline:</span>
                      <span className="font-bold text-blue-600">+92 3000358949</span>
                    </a>
                    <a
                      href="tel:+390289901420"
                      className="flex items-center justify-between text-xs text-slate-600 hover:text-blue-600 p-2 rounded-lg bg-slate-50"
                    >
                      <span>Italy & EU Assist:</span>
                      <span className="font-bold text-blue-600">+39 02 8990 1420</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Footer Notice in Mobile Drawer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-400 text-center">
              Fligh.com Travel Services · IATA CAA Approved
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
