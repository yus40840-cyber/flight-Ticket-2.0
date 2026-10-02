import React, { useState } from 'react';
import {
  X,
  Search,
  Ticket,
  Plane,
  Building,
  Calendar,
  CheckCircle2,
  FileText,
  Clock,
  Send,
  ShieldCheck,
  Check,
  Copy,
  AlertCircle,
} from 'lucide-react';
import { ETicketView, ETicketData } from './ETicketView';
import { FLIGHT_SEARCH_RESULTS } from '../data/travelData';

export interface BookingRecord {
  id?: string;
  reference: string;
  eTicketNumber?: string;
  type: 'flight' | 'hotel' | 'train' | 'sight';
  title: string;
  price: number;
  date: string;
  passenger: string;
  passengerEmail?: string;
  passengerPhone?: string;
  passportOrCnic?: string;
  status: string;
  adminEmail?: string;
  approvalToken?: string;
  ticketData?: ETicketData;
}

interface FindBookingsModalProps {
  bookings: BookingRecord[];
  onClose: () => void;
  onApproveBooking?: (bookingId: string) => Promise<any> | void;
  userEmail?: string;
}

export const FindBookingsModal: React.FC<FindBookingsModalProps> = ({
  bookings,
  onClose,
  onApproveBooking,
  userEmail,
}) => {
  const [searchRef, setSearchRef] = useState('');
  const [viewingTicket, setViewingTicket] = useState<ETicketData | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const displayBookings = searchRef.trim()
    ? bookings.filter(
        (b) =>
          b.reference.toLowerCase().includes(searchRef.toLowerCase()) ||
          b.title.toLowerCase().includes(searchRef.toLowerCase()) ||
          b.passenger.toLowerCase().includes(searchRef.toLowerCase())
      )
    : bookings;

  const handleOpenTicket = (booking: BookingRecord) => {
    if (booking.ticketData) {
      setViewingTicket(booking.ticketData);
    } else {
      const sampleTicket: ETicketData = {
        pnr: booking.reference,
        eTicketNumber: booking.eTicketNumber || '214-8930194821',
        bookingDate: booking.date,
        passengerName: booking.passenger,
        passportNumber: booking.passportOrCnic || 'PK84920194',
        email: booking.passengerEmail || userEmail || 'passenger@fligh.com',
        phone: booking.passengerPhone || '+92 300 8241920',
        seat: '14A (Window)',
        gate: '24',
        terminal: '1',
        boardingTime: '02:35 KHI',
        cabinClass: 'Economy',
        flight: FLIGHT_SEARCH_RESULTS[0],
        bookingType: booking.type === 'hotel' ? 'hotel' : 'flight',
        totalPaidPKR: booking.price,
      };
      setViewingTicket(sampleTicket);
    }
  };

  const handleApprove = async (booking: BookingRecord) => {
    const id = booking.id || booking.reference;
    setApprovingId(id);
    try {
      if (onApproveBooking) {
        await onApproveBooking(id);
      }

      // Dispatch confirmation directly to yus40840@gmail.com
      const approvedSubject = encodeURIComponent(`[OFFICIALLY APPROVED] Ticket PNR #${booking.reference} Authorized by Admin`);
      const approvedBody = encodeURIComponent(`OFFICIAL ADMIN AUTHORIZATION NOTICE

The booking PNR #${booking.reference} for passenger ${booking.passenger} has been officially authorized and issued by admin yus40840@gmail.com.

==============================================
CONFIRMED TICKET DETAILS
==============================================
• Booking Reference (PNR): ${booking.reference}
• E-Ticket Number: ${booking.eTicketNumber || '214-8930194821'}
• Passenger: ${booking.passenger}
• Passport / CNIC: ${booking.passportOrCnic || 'PK84920194'}
• Itinerary: ${booking.title}
• Total Price: Rs ${booking.price.toLocaleString()} PKR
• Status: APPROVED & CONFIRMED

Authorized by: yus40840@gmail.com
Fligh.com Booking & Approval System`);
      
      const directMailto = `mailto:yus40840@gmail.com?subject=${approvedSubject}&body=${approvedBody}`;
      try {
        const mailLink = document.createElement('a');
        mailLink.href = directMailto;
        mailLink.target = '_blank';
        document.body.appendChild(mailLink);
        mailLink.click();
        document.body.removeChild(mailLink);
      } catch (e) {
        console.warn('Mail dispatch fallback', e);
      }
    } catch (err) {
      console.error('Approval failed:', err);
    } finally {
      setApprovingId(null);
    }
  };

  const handleCopyLink = (booking: BookingRecord) => {
    const id = booking.id || booking.reference;
    const url = `${window.location.origin}/?approveBooking=${id}&token=${booking.approvalToken || 'token'}`;
    navigator.clipboard?.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const getMailtoLink = (booking: BookingRecord) => {
    const id = booking.id || booking.reference;
    const approvalUrl = `${window.location.origin}/?approveBooking=${id}&token=${booking.approvalToken || 'token'}`;
    const subject = encodeURIComponent(`Approval Required: Booking PNR #${booking.reference} for ${booking.passenger}`);
    const body = encodeURIComponent(`APPROVAL REQUIRED NOTIFICATION

Hello Admin,

A travel booking requires your official authorization.

==============================================
BOOKING DETAILS
==============================================
• Booking Reference (PNR): ${booking.reference}
• Passenger: ${booking.passenger}
• Route / Itinerary: ${booking.title}
• Total Amount: Rs ${booking.price.toLocaleString()} PKR
• Current Status: PENDING_APPROVAL

==============================================
ADMIN APPROVAL ACTION
==============================================
Authorize this ticket now as admin to issue the official E-Ticket and boarding pass.

Approve Ticket Now:
${approvalUrl}

Thank you,
Fligh.com Booking & Approval Service`);
    return `mailto:yus40840@gmail.com?subject=${subject}&body=${body}`;
  };

  const isAdmin = userEmail === 'yus40840@gmail.com' || userEmail === 'ramshaskhaikh544@gmail.com';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        className={`bg-white w-full ${
          viewingTicket ? 'max-w-4xl' : 'max-w-3xl'
        } rounded-3xl shadow-2xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col transition-all`}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-blue-400">
                Fligh.com <span className="text-white">Travel</span>
              </span>
              <span className="text-slate-500">·</span>
              <h3 className="font-bold text-sm text-white">
                {viewingTicket ? 'Verified Boarding Pass & E-Ticket' : 'Booking Management & Approvals'}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {viewingTicket
                ? 'Export to PDF or Image with security Barcode & QR Code'
                : 'Real-time status of passenger bookings, email approval workflow, and issued e-tickets.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {viewingTicket && (
              <button
                onClick={() => setViewingTicket(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Back to Bookings
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        {viewingTicket ? (
          <div className="p-4 sm:p-6 overflow-y-auto flex-1">
            <ETicketView ticketData={viewingTicket} onClose={onClose} />
          </div>
        ) : (
          <>
            {/* Search Filter Bar */}
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter by PNR (e.g. FLI-749210), Passenger, or Route..."
                  value={searchRef}
                  onChange={(e) => setSearchRef(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Bookings list */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3">
              {displayBookings.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <Ticket className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <div className="font-bold text-slate-600 text-xs">No bookings found</div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Bookings confirmed on the platform will be tracked here in real-time.
                  </p>
                </div>
              ) : (
                displayBookings.map((b) => {
                  const isPending = b.status === 'PENDING_APPROVAL' || b.status?.includes('Pending');
                  const isApproved = !isPending && (b.status === 'APPROVED' || b.status?.includes('Confirmed'));
                  const bookingId = b.id || b.reference;

                  return (
                    <div
                      key={b.reference}
                      className={`p-4 bg-white border rounded-2xl transition-all shadow-xs space-y-3 ${
                        isPending ? 'border-amber-200 hover:border-amber-300' : 'border-slate-200 hover:border-blue-400'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              isPending
                                ? 'bg-amber-100 text-amber-600'
                                : 'bg-blue-100 text-blue-600'
                            }`}
                          >
                            {b.type === 'flight' ? (
                              <Plane className="w-5 h-5" />
                            ) : (
                              <Building className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-xs sm:text-sm">{b.title}</div>
                            <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2 mt-0.5">
                              <span className="font-mono font-bold text-blue-600">{b.reference}</span>
                              <span>·</span>
                              <span>Passenger: <strong>{b.passenger}</strong></span>
                              <span>·</span>
                              <span>{b.date}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-left sm:text-right shrink-0">
                          <div className="text-xs font-black text-slate-900 tabular-nums">
                            Rs {b.price.toLocaleString()} PKR
                          </div>
                          {isPending ? (
                            <div className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md flex items-center gap-1 mt-1 border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                              <span>Pending Admin Approval</span>
                            </div>
                          ) : (
                            <div className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1 mt-1 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Approved & Issued</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Approval Actions Bar */}
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                        {isPending ? (
                          <>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                              <span>Awaiting confirmation from administrator.</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <a
                                href={getMailtoLink(b)}
                                className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Send className="w-3 h-3" />
                                <span>Send to Given Email for Approval</span>
                              </a>

                              <button
                                onClick={() => handleCopyLink(b)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                              >
                                {copiedId === bookingId ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-600" />
                                    <span className="text-emerald-700">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy Link</span>
                                  </>
                                )}
                              </button>

                              {isAdmin && (
                                <button
                                  onClick={() => handleApprove(b)}
                                  disabled={approvingId === bookingId}
                                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs disabled:opacity-50"
                                  title="Authorize this ticket now as admin to issue the official E-Ticket and boarding pass."
                                >
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  <span>{approvingId === bookingId ? 'Approving...' : 'Approve Ticket Now'}</span>
                                </button>
                              )}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Verified E-Ticket with Barcode & Boarding Gate ready for travel.</span>
                            </div>

                            <button
                              onClick={() => handleOpenTicket(b)}
                              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ml-auto"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>View & Download E-Ticket</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
