import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSearch } from './components/HeroSearch';
import { NewUserDiscounts } from './components/NewUserDiscounts';
import { TripInspiration } from './components/TripInspiration';
import { TopSights } from './components/TopSights';
import { TripMoments } from './components/TripMoments';
import { SelectedHotels } from './components/SelectedHotels';
import { TravelRoutes } from './components/TravelRoutes';
import { AppDownloadBanner } from './components/AppDownloadBanner';
import { Footer } from './components/Footer';

// Modals
import { FlightSearchResultsModal } from './components/FlightSearchResultsModal';
import { BookingDetailsModal } from './components/BookingDetailsModal';
import { SightDetailsModal } from './components/SightDetailsModal';
import { MomentDetailsModal } from './components/MomentDetailsModal';
import { AuthModal } from './components/AuthModal';
import { FindBookingsModal, BookingRecord } from './components/FindBookingsModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { TicketVerificationModal } from './components/TicketVerificationModal';
import { AirlinesAndAirportsSection } from './components/AirlinesAndAirportsSection';
import { WorldwideAirport, WorldwideAirline } from './data/worldwideAviationData';

import {
  CityOption,
  FlightSearchState,
  FlightOffer,
  HotelItem,
  SightItem,
  MomentItem,
  TravelRoute,
  CouponItem,
} from './types';
import {
  INITIAL_COUPONS,
  POPULAR_CITIES,
  FLIGHT_SEARCH_RESULTS,
  DestinationCard,
} from './data/travelData';
import { db as localDb } from './db';
import {
  auth,
  db as firestoreDb,
  onAuthStateChanged,
  FirebaseUser,
  logoutUser,
  testFirestoreConnection,
  createFirestoreBooking,
  approveFirestoreBooking,
  syncUserProfile,
  ADMIN_EMAILS,
  handleFirestoreError,
  OperationType,
  UserNotification,
  createUserNotification,
  markNotificationAsRead,
} from './firebase';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { CheckCircle2, Sparkles, Ticket, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('flights');
  const [currency, setCurrency] = useState('PKR');
  const [coupons, setCoupons] = useState<CouponItem[]>(INITIAL_COUPONS);
  const [user, setUser] = useState<{ uid: string; name: string; email: string; role?: string } | null>(null);

  // Live Bookings state
  const [bookings, setBookings] = useState<BookingRecord[]>(() => localDb.bookings.getAll());
  const [approvalToast, setApprovalToast] = useState<string | null>(null);

  // Direct Account Notifications State
  const [userNotifications, setUserNotifications] = useState<UserNotification[]>([]);
  const [approvedTicketAlert, setApprovedTicketAlert] = useState<{
    reference: string;
    title: string;
    message: string;
  } | null>(null);
  const [selectedBookingRefForModal, setSelectedBookingRefForModal] = useState<string | undefined>(
    undefined
  );

  // Search State
  const [flightSearchState, setFlightSearchState] = useState<FlightSearchState>({
    tripType: 'return',
    origin: POPULAR_CITIES[0], // Karachi
    destination: POPULAR_CITIES[1], // Milan
    departDate: '2026-10-04',
    returnDate: '2026-10-06',
    passengers: { adults: 1, children: 0, cabin: 'Economy' },
    directOnly: false,
    flightPlusHotel: false,
  });

  // Modal Visibility States
  const [flightModalOpen, setFlightModalOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingType, setBookingType] = useState<'flight' | 'hotel'>('flight');
  const [selectedFlight, setSelectedFlight] = useState<FlightOffer | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<HotelItem | null>(null);

  const [sightModalOpen, setSightModalOpen] = useState(false);
  const [selectedSight, setSelectedSight] = useState<SightItem | null>(null);

  const [momentModalOpen, setMomentModalOpen] = useState(false);
  const [selectedMoment, setSelectedMoment] = useState<MomentItem | null>(null);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [findBookingsModalOpen, setFindBookingsModalOpen] = useState(false);
  const [adminDashboardOpen, setAdminDashboardOpen] = useState(false);
  const [verificationStationOpen, setVerificationStationOpen] = useState(false);

  // Test Firestore Connection on Boot (SKILL.md constraint)
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const isSuperAdminEmail =
          firebaseUser.email?.toLowerCase() === 'yus40840@gmail.com' ||
          firebaseUser.email?.toLowerCase() === 'ramshaskhaikh544@gmail.com';
        const u = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Traveler',
          email: firebaseUser.email || '',
          role: isSuperAdminEmail ? 'super_admin' : 'customer',
        };
        setUser(u);
        syncUserProfile(firebaseUser);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // URL One-Click Email Approval Handler
  useEffect(() => {
    const handleUrlApproval = async () => {
      if (typeof window === 'undefined') return;
      const params = new URLSearchParams(window.location.search);
      const approveId = params.get('approveBooking');
      const token = params.get('token');

      if (approveId) {
        try {
          await approveFirestoreBooking(approveId, token || undefined);
          setApprovalToast(
            `✅ Booking #${approveId} successfully approved! Official E-Ticket is issued.`
          );
          // Also update local list if present
          setBookings((prev) =>
            prev.map((b) =>
              (b.id === approveId || b.reference === approveId)
                ? { ...b, status: 'APPROVED' }
                : b
            )
          );
          // Clean URL without refresh
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        } catch (err: any) {
          console.error('URL approval error:', err);
          setApprovalToast(`Approval note: Booking #${approveId} status updated.`);
        }
      }
    };

    handleUrlApproval();
  }, []);

  // Real-time Firestore Bookings Listener
  useEffect(() => {
    if (!user) return;

    const isAdmin =
      ADMIN_EMAILS.includes(user.email) ||
      user.email === 'yus40840@gmail.com' ||
      user.email === 'ramshaskhaikh544@gmail.com';

    const bookingsCol = collection(firestoreDb, 'bookings');
    const q = isAdmin
      ? query(bookingsCol)
      : query(bookingsCol, where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const firestoreList: BookingRecord[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          firestoreList.push({
            id: doc.id,
            reference: data.reference || doc.id,
            eTicketNumber: data.eTicketNumber,
            type: data.type || 'flight',
            title: data.title || 'Travel Booking',
            price: data.price || 0,
            date: data.date || '04 Oct 2026',
            passenger: data.passenger || user.name,
            passengerEmail: data.passengerEmail || user.email,
            passengerPhone: data.passengerPhone,
            passportOrCnic: data.passportOrCnic,
            status: data.status || 'PENDING_APPROVAL',
            adminEmail: data.adminEmail || 'yus40840@gmail.com',
            approvalToken: data.approvalToken,
            ticketData: data.ticketData,
          });
        });

        if (firestoreList.length > 0) {
          // Merge with local seeded bookings if distinct
          setBookings(firestoreList);
        }
      },
      (error) => {
        if (
          error.code === 'permission-denied' ||
          error.message?.includes('insufficient permissions')
        ) {
          handleFirestoreError(error, OperationType.GET, 'bookings');
        } else {
          console.warn('Firestore snapshot connection notice:', error.message);
        }
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Real-time User Notifications Listener
  useEffect(() => {
    if (!user?.uid) {
      setUserNotifications([]);
      return;
    }

    const notifCol = collection(firestoreDb, 'notifications');
    const q = query(notifCol, where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: UserNotification[] = [];
        snapshot.forEach((doc) => {
          const d = doc.data();
          list.push({
            id: doc.id,
            userId: d.userId,
            passengerEmail: d.passengerEmail,
            bookingId: d.bookingId,
            reference: d.reference,
            type: d.type || 'TICKET_APPROVED',
            title: d.title || 'Ticket Approved & Ready to Collect',
            message:
              d.message ||
              'Your ticket has been received and approved. Kindly receive/collect your ticket.',
            read: Boolean(d.read),
            createdAt: d.createdAt,
          });
        });

        setUserNotifications(list);

        // Check if there is an unread approval notification
        const unreadApproval = list.find((n) => !n.read && n.type === 'TICKET_APPROVED');
        if (unreadApproval) {
          setApprovedTicketAlert({
            reference: unreadApproval.reference,
            title: 'Fligh.com Official Ticket Issuance',
            message: unreadApproval.message,
          });
        }
      },
      (err) => {
        console.warn('Notifications real-time listener notice:', err);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  // Compute pending approvals count
  const pendingApprovalsCount = bookings.filter(
    (b) => b.status === 'PENDING_APPROVAL' || b.status?.includes('Pending')
  ).length;

  // Handlers
  const handleSearchFlights = (state: FlightSearchState) => {
    setFlightSearchState(state);
    setFlightModalOpen(true);
  };

  const handleOpenHotelSearch = () => {
    const el = document.getElementById('selected-hotels-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOpenTrainSearch = () => {
    const el = document.getElementById('travel-routes-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectFlightToBook = (flight: FlightOffer) => {
    setSelectedFlight(flight);
    setBookingType('flight');
    setFlightModalOpen(false);
    setBookingModalOpen(true);
  };

  const handleSelectHotelToBook = (hotel: HotelItem) => {
    setSelectedHotel(hotel);
    setBookingType('hotel');
    setBookingModalOpen(true);
  };

  const handleSelectDestinationCard = (dest: DestinationCard) => {
    const foundDest = POPULAR_CITIES.find(
      (c) => c.name.toLowerCase() === dest.city.toLowerCase()
    ) || {
      id: dest.id,
      name: dest.city,
      code: dest.city.substring(0, 3).toUpperCase(),
      airportName: `${dest.city} International`,
      country: dest.country,
      countryCode: 'IT',
    };

    setFlightSearchState((prev) => ({
      ...prev,
      destination: foundDest,
    }));
    setFlightModalOpen(true);
  };

  const handleSelectAirportFromDirectory = (airport: WorldwideAirport) => {
    const destCity: CityOption = {
      id: airport.iata.toLowerCase(),
      name: airport.city,
      code: airport.iata,
      airportName: airport.name,
      country: airport.country,
      countryCode: airport.country.substring(0, 2).toUpperCase(),
    };
    setFlightSearchState((prev) => ({
      ...prev,
      destination: destCity,
    }));
    setFlightModalOpen(true);
  };

  const handleSelectAirlineFromDirectory = (airline: WorldwideAirline) => {
    const destCity: CityOption = {
      id: airline.hubIata.toLowerCase(),
      name: airline.hubAirport.split('(')[0].trim(),
      code: airline.hubIata,
      airportName: airline.hubAirport,
      country: airline.country,
      countryCode: airline.iata,
    };
    setFlightSearchState((prev) => ({
      ...prev,
      destination: destCity,
    }));
    setFlightModalOpen(true);
  };

  const handleSelectSight = (sight: SightItem) => {
    setSelectedSight(sight);
    setSightModalOpen(true);
  };

  const handleSelectMoment = (moment: MomentItem) => {
    setSelectedMoment(moment);
    setMomentModalOpen(true);
  };

  const handleSelectRoute = async (route: TravelRoute) => {
    const pnr = 'FLI-' + Math.floor(100000 + Math.random() * 900000);
    const eTicket = '214-' + Math.floor(1000000000 + Math.random() * 9000000000);
    const currentDate = route.dateStr || '04 Oct 2026';

    const newRecord: BookingRecord = {
      reference: pnr,
      eTicketNumber: eTicket,
      type: 'train',
      title: `${route.operator}: ${route.fromCity} → ${route.toCity}`,
      price: route.pricePKR,
      date: currentDate,
      passenger: user?.name || 'Muhammad Usman',
      passengerEmail: user?.email || 'yus40840@gmail.com',
      passengerPhone: '+92 300 8241920',
      passportOrCnic: 'PK84920194',
      status: 'PENDING_APPROVAL',
      adminEmail: 'yus40840@gmail.com',
    };

    if (user?.uid) {
      try {
        await createFirestoreBooking({
          userId: user.uid,
          type: 'train',
          title: newRecord.title,
          price: newRecord.price,
          date: newRecord.date,
          passenger: newRecord.passenger,
          passengerEmail: newRecord.passengerEmail || user.email,
          passengerPhone: newRecord.passengerPhone,
          passportOrCnic: newRecord.passportOrCnic,
        });
      } catch (err) {
        console.warn('Firestore booking created locally fallback');
      }
    }

    localDb.bookings.create(newRecord as any);
    setBookings((prev) => [newRecord, ...prev]);
    setFindBookingsModalOpen(true);
  };

  const handleClaimAll = () => {
    setCoupons((prev) => prev.map((c) => ({ ...c, claimed: true })));
  };

  const handleClaimSingle = (id: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, claimed: true } : c))
    );
  };

  const handleSuccessBooking = async (bookingData: any) => {
    // Persist to Firestore if user logged in
    let docId = bookingData.reference;
    if (user?.uid) {
      try {
        const created = await createFirestoreBooking({
          userId: user.uid,
          type: bookingData.type || 'flight',
          title: bookingData.title,
          price: bookingData.price,
          date: bookingData.date,
          passenger: bookingData.passenger,
          passengerEmail: bookingData.passengerEmail || user.email,
          passengerPhone: bookingData.passengerPhone,
          passportOrCnic: bookingData.passportOrCnic,
          seat: bookingData.ticketData?.seat,
          gate: bookingData.ticketData?.gate,
          terminal: bookingData.ticketData?.terminal,
          cabinClass: bookingData.ticketData?.cabinClass,
        });
        if (created?.id) docId = created.id;
      } catch (err) {
        console.error('Error creating Firestore booking:', err);
      }
    }

    // Also update local DB
    localDb.bookings.create(bookingData);
    setBookings((prev) => [
      { ...bookingData, id: docId, status: 'PENDING_APPROVAL', adminEmail: 'yus40840@gmail.com' },
      ...prev,
    ]);

    return { id: docId };
  };

  const handleApproveBooking = async (bookingId: string) => {
    try {
      await approveFirestoreBooking(bookingId);
      const targetBooking = bookings.find((b) => b.id === bookingId || b.reference === bookingId);

      if (targetBooking?.userId) {
        await createUserNotification({
          userId: targetBooking.userId,
          bookingId: targetBooking.id || bookingId,
          reference: targetBooking.reference,
          passengerEmail: targetBooking.passengerEmail,
          title: 'Ticket Approved & Ready to Collect',
          message: 'Your ticket has been received and approved. Kindly receive/collect your ticket.',
        });
      }

      setApprovalToast(`✅ Booking #${bookingId} has been successfully APPROVED! Official E-Ticket is issued.`);
      setBookings((prev) =>
        prev.map((b) =>
          (b.id === bookingId || b.reference === bookingId)
            ? { ...b, status: 'APPROVED' }
            : b
        )
      );

      // Trigger direct account notification for the user
      if (
        user &&
        targetBooking &&
        (targetBooking.userId === user.uid || targetBooking.passengerEmail === user.email)
      ) {
        setApprovedTicketAlert({
          reference: targetBooking.reference,
          title: 'Ticket Received & Approved!',
          message: 'Your ticket has been received and approved. Kindly receive/collect your ticket.',
        });
      }
    } catch (err) {
      // Local fallback approval
      const targetBooking = bookings.find((b) => b.id === bookingId || b.reference === bookingId);
      setBookings((prev) =>
        prev.map((b) =>
          (b.id === bookingId || b.reference === bookingId)
            ? { ...b, status: 'APPROVED' }
            : b
        )
      );
      setApprovalToast(`✅ Booking #${bookingId} status updated to APPROVED.`);
      if (
        user &&
        targetBooking &&
        (targetBooking.userId === user.uid || targetBooking.passengerEmail === user.email)
      ) {
        setApprovedTicketAlert({
          reference: targetBooking.reference,
          title: 'Ticket Received & Approved!',
          message: 'Your ticket has been received and approved. Kindly receive/collect your ticket.',
        });
      }
    }
  };

  const handleCollectTicket = (bookingRef: string) => {
    setApprovedTicketAlert(null);
    setSelectedBookingRefForModal(bookingRef);
    setFindBookingsModalOpen(true);
  };

  const handleBookTickets = (sight: SightItem) => {
    setSightModalOpen(false);
    setSelectedFlight(FLIGHT_SEARCH_RESULTS[0]);
    setBookingType('flight');
    setBookingModalOpen(true);
  };

  const handleSignOut = async () => {
    try {
      await logoutUser();
      setUser(null);
    } catch (e) {
      setUser(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA] font-sans antialiased text-slate-800">
      {/* Toast Notification */}
      {approvalToast && (
        <div className="fixed top-16 right-4 z-50 max-w-md bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 flex items-center justify-between gap-3 animate-in slide-in-from-top-4 duration-300">
          <div className="text-xs font-semibold">{approvalToast}</div>
          <button
            onClick={() => setApprovalToast(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Global Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'hotels') {
            document.getElementById('selected-hotels-section')?.scrollIntoView({ behavior: 'smooth' });
          } else if (tab === 'attractions') {
            document.getElementById('top-sights-section')?.scrollIntoView({ behavior: 'smooth' });
          } else if (tab === 'inspiration') {
            document.getElementById('inspiration-section')?.scrollIntoView({ behavior: 'smooth' });
          } else if (tab === 'aviation') {
            document.getElementById('worldwide-directory')?.scrollIntoView({ behavior: 'smooth' });
          } else if (tab === 'flights') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenBookings={() => setFindBookingsModalOpen(true)}
        onOpenAdminDashboard={() => setAdminDashboardOpen(true)}
        onOpenVerificationStation={() => setVerificationStationOpen(true)}
        onOpenAppQR={() => {
          document.getElementById('app-download-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
        pendingApprovalsCount={pendingApprovalsCount}
        currency={currency}
        onCurrencyChange={setCurrency}
        user={user}
        onSignOut={handleSignOut}
        notifications={userNotifications}
        onCollectTicket={handleCollectTicket}
        onMarkNotificationAsRead={(notifId) => markNotificationAsRead(notifId)}
      />

      {/* Floating Direct Account Notification Banner */}
      {approvedTicketAlert && (
        <aside
          aria-label="Approved Ticket Notification"
          className="fixed bottom-5 right-4 sm:right-6 z-50 max-w-md w-full bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white p-5 rounded-2xl shadow-2xl border-2 border-emerald-500/90 animate-in slide-in-from-bottom-5 duration-300"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Direct Account Notification
                </span>
                <button
                  onClick={() => setApprovedTicketAlert(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                  aria-label="Dismiss alert"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <h4 className="font-display font-black text-sm text-white mt-1.5">
                Ticket Received & Approved!
              </h4>
              <p className="text-xs text-emerald-300 font-semibold mt-1 leading-snug">
                “{approvedTicketAlert.message}”
              </p>
              <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-2">
                <span>
                  PNR Reference:{' '}
                  <strong className="font-mono text-white font-bold">
                    {approvedTicketAlert.reference}
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-800">
                <button
                  onClick={() => handleCollectTicket(approvedTicketAlert.reference)}
                  className="flex-1 py-2 px-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Receive / Collect Ticket</span>
                </button>
                <button
                  onClick={() => setApprovedTicketAlert(null)}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Hero Flight & Travel Search Section */}
      <main className="flex-1">
        <HeroSearch
          onSearchFlights={handleSearchFlights}
          onOpenHotelSearch={handleOpenHotelSearch}
          onOpenTrainSearch={handleOpenTrainSearch}
        />

        {/* New user exclusive promotional discounts banner */}
        <NewUserDiscounts
          coupons={coupons}
          onClaimAll={handleClaimAll}
          onClaimSingle={handleClaimSingle}
          onOpenAuth={() => setAuthModalOpen(true)}
          isLoggedIn={!!user}
        />

        {/* Travel Destination Inspiration */}
        <div id="inspiration-section">
          <TripInspiration onSelectDestination={handleSelectDestinationCard} />
        </div>

        {/* Top Sights You Can't Miss in Milan */}
        <div id="top-sights-section">
          <TopSights onSelectSight={handleSelectSight} />
        </div>

        {/* Unforgettable Trip Moments in Milan */}
        <TripMoments onSelectMoment={handleSelectMoment} />

        {/* Selected Hotels in Milan */}
        <div id="selected-hotels-section">
          <SelectedHotels onSelectHotel={handleSelectHotelToBook} />
        </div>

        {/* Travel to & from Milan */}
        <div id="travel-routes-section">
          <TravelRoutes onSelectRoute={handleSelectRoute} />
        </div>

        {/* Worldwide Main Airports & Airlines Directory */}
        <AirlinesAndAirportsSection
          onSelectAirportToSearch={handleSelectAirportFromDirectory}
          onSelectAirlineToSearch={handleSelectAirlineFromDirectory}
        />

        {/* Mobile App Download QR Section */}
        <div id="app-download-section">
          <AppDownloadBanner />
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      {flightModalOpen && (
        <FlightSearchResultsModal
          searchState={flightSearchState}
          onClose={() => setFlightModalOpen(false)}
          onBookFlight={handleSelectFlightToBook}
        />
      )}

      {bookingModalOpen && (
        <BookingDetailsModal
          bookingType={bookingType}
          flightItem={selectedFlight}
          hotelItem={selectedHotel}
          onClose={() => setBookingModalOpen(false)}
          onSuccessBooking={handleSuccessBooking}
          onApproveBooking={handleApproveBooking}
          user={user}
        />
      )}

      {sightModalOpen && (
        <SightDetailsModal
          sight={selectedSight}
          onClose={() => setSightModalOpen(false)}
          onBookTickets={handleBookTickets}
        />
      )}

      {momentModalOpen && (
        <MomentDetailsModal
          moment={selectedMoment}
          onClose={() => setMomentModalOpen(false)}
        />
      )}

      {authModalOpen && (
        <AuthModal
          onClose={() => setAuthModalOpen(false)}
          onSuccess={(u) => setUser(u)}
        />
      )}

      {findBookingsModalOpen && (
        <FindBookingsModal
          bookings={bookings}
          onClose={() => {
            setFindBookingsModalOpen(false);
            setSelectedBookingRefForModal(undefined);
          }}
          onApproveBooking={handleApproveBooking}
          userEmail={user?.email}
          initialSelectedRef={selectedBookingRefForModal}
        />
      )}

      {adminDashboardOpen && (
        <AdminDashboardModal
          isOpen={adminDashboardOpen}
          onClose={() => setAdminDashboardOpen(false)}
          currentUser={user}
          bookings={bookings}
          onApproveBooking={handleApproveBooking}
          onRejectBooking={async (bookingId) => {
            setBookings((prev) =>
              prev.map((b) =>
                (b.id === bookingId || b.reference === bookingId)
                  ? { ...b, status: 'REJECTED' }
                  : b
              )
            );
          }}
          onAdminLoginSuccess={(adminUser) => {
            setUser(adminUser);
          }}
        />
      )}

      {verificationStationOpen && (
        <TicketVerificationModal
          isOpen={verificationStationOpen}
          onClose={() => setVerificationStationOpen(false)}
          staffUser={
            user
              ? {
                  uid: user.uid,
                  name: user.name,
                  email: user.email,
                  role: user.role || 'verification_staff',
                }
              : {
                  uid: 'staff-101',
                  name: 'Checkpoint Officer',
                  email: 'checkpoint.staff@fligh.com',
                  role: 'verification_staff',
                }
          }
          bookings={bookings}
        />
      )}
    </div>
  );
}
