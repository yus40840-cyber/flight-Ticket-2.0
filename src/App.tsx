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
} from './firebase';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';

export default function App() {
  const [activeTab, setActiveTab] = useState('flights');
  const [currency, setCurrency] = useState('PKR');
  const [coupons, setCoupons] = useState<CouponItem[]>(INITIAL_COUPONS);
  const [user, setUser] = useState<{ uid: string; name: string; email: string } | null>(null);

  // Live Bookings state
  const [bookings, setBookings] = useState<BookingRecord[]>(() => localDb.bookings.getAll());
  const [approvalToast, setApprovalToast] = useState<string | null>(null);

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

  // Test Firestore Connection on Boot (SKILL.md constraint)
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const u = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Traveler',
          email: firebaseUser.email || '',
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
      setApprovalToast(`✅ Booking #${bookingId} has been successfully APPROVED! Official E-Ticket is issued.`);
      setBookings((prev) =>
        prev.map((b) =>
          (b.id === bookingId || b.reference === bookingId)
            ? { ...b, status: 'APPROVED' }
            : b
        )
      );
    } catch (err) {
      // Local fallback approval
      setBookings((prev) =>
        prev.map((b) =>
          (b.id === bookingId || b.reference === bookingId)
            ? { ...b, status: 'APPROVED' }
            : b
        )
      );
      setApprovalToast(`✅ Booking #${bookingId} status updated to APPROVED.`);
    }
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
        onOpenAppQR={() => {
          document.getElementById('app-download-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
        pendingApprovalsCount={pendingApprovalsCount}
        currency={currency}
        onCurrencyChange={setCurrency}
        user={user}
        onSignOut={handleSignOut}
      />

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
          onClose={() => setFindBookingsModalOpen(false)}
          onApproveBooking={handleApproveBooking}
          userEmail={user?.email}
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
    </div>
  );
}
