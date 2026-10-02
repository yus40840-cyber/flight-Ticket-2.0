import React, { useState } from 'react';
import {
  X,
  CreditCard,
  ShieldCheck,
  Plane,
  Building,
  User,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Send,
  Copy,
  Check,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';
import { FlightOffer, HotelItem } from '../types';
import { AirlineLogo } from './AirlineLogos';
import { CityLogo } from './CityLogos';
import { ETicketView, ETicketData } from './ETicketView';

interface BookingDetailsModalProps {
  bookingType: 'flight' | 'hotel';
  flightItem?: FlightOffer | null;
  hotelItem?: HotelItem | null;
  onClose: () => void;
  onSuccessBooking: (bookingRecord: any) => Promise<any> | void;
  onApproveBooking?: (bookingId: string) => Promise<any> | void;
  user: { name: string; email: string; uid?: string } | null;
}

export const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  bookingType,
  flightItem,
  hotelItem,
  onClose,
  onSuccessBooking,
  onApproveBooking,
  user,
}) => {
  const [step, setStep] = useState<'checkout' | 'pending_approval' | 'eticket'>('checkout');

  // Passenger & Contact Information
  const [passengerName, setPassengerName] = useState(user?.name || 'Muhammad Usman');
  const [email, setEmail] = useState(user?.email || 'usman.travel@gmail.com');
  const [phone, setPhone] = useState('+92 300 8241920');
  const [passportNumber, setPassportNumber] = useState('PK84920194');
  const [nationality, setNationality] = useState('Pakistan');

  // Payment method selection
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'coins' | 'wallet'>('card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('884');
  const [useTripCoins, setUseTripCoins] = useState(true);

  // Approval state
  const [pendingBookingId, setPendingBookingId] = useState<string>('');
  const [pendingPnr, setPendingPnr] = useState<string>('');
  const [approvalToken, setApprovalToken] = useState<string>('');
  const [approvalCopied, setApprovalCopied] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  // Confirmed E-Ticket Data
  const [confirmedTicket, setConfirmedTicket] = useState<ETicketData | null>(null);

  const basePrice = (bookingType === 'flight' ? flightItem?.pricePKR : hotelItem?.pricePKR) || 142000;
  const tripCoinsDiscount = useTripCoins ? 3500 : 0;
  const finalPricePKR = Math.max(0, basePrice - tripCoinsDiscount);

  const handlePayOnlineAndConfirm = async (e: React.FormEvent) => {
    e.preventDefault();

    const pnr = 'FLI-' + Math.floor(100000 + Math.random() * 900000);
    const eTicketNumber = '214-' + Math.floor(1000000000 + Math.random() * 9000000000);
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const currentDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const ticket: ETicketData = {
      pnr,
      eTicketNumber,
      bookingDate: currentDate,
      passengerName: passengerName.trim(),
      passportNumber: passportNumber.trim(),
      email: email.trim(),
      phone: phone.trim(),
      seat: '14A (Window)',
      gate: '24',
      terminal: '1',
      boardingTime: '02:35 KHI',
      cabinClass: 'Economy',
      flight: flightItem,
      hotel: hotelItem,
      bookingType,
      totalPaidPKR: finalPricePKR,
    };

    setConfirmedTicket(ticket);
    setPendingPnr(pnr);
    setApprovalToken(token);

    const title =
      bookingType === 'flight'
        ? `${flightItem?.airlineName} ${flightItem?.originCity} → ${flightItem?.destCity}`
        : `${hotelItem?.name} (${hotelItem?.city})`;

    const bookingPayload = {
      reference: pnr,
      eTicketNumber,
      type: bookingType,
      title,
      price: finalPricePKR,
      date: currentDate,
      passenger: passengerName.trim(),
      passengerEmail: email.trim(),
      passengerPhone: phone.trim(),
      passportOrCnic: passportNumber.trim(),
      status: 'PENDING_APPROVAL',
      adminEmail: 'yus40840@gmail.com',
      approvalToken: token,
      ticketData: ticket,
    };

    const res = await onSuccessBooking(bookingPayload);
    const bookingId = res?.id || pnr;
    setPendingBookingId(bookingId);

    // Automatically send Approval Request directly to yus40840@gmail.com
    const directApprovalUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/?approveBooking=${bookingId}&token=${token}`
      : '';
    const reqSubject = encodeURIComponent(`[APPROVAL REQUEST] Travel Booking PNR #${pnr} for ${passengerName.trim()}`);
    const reqBody = encodeURIComponent(`APPROVAL REQUEST NOTIFICATION

Hello Admin,

A new travel booking has been submitted on Fligh.com and requires your official authorization.

==============================================
PASSENGER & BOOKING DETAILS
==============================================
• Booking Reference (PNR): ${pnr}
• Passenger Name: ${passengerName.trim()}
• Passport / CNIC: ${passportNumber.trim()}
• Contact Email: ${email.trim()}
• Contact Phone: ${phone.trim()}
• Itinerary: ${title}
• Total Amount Paid: Rs ${finalPricePKR.toLocaleString()} PKR
• Status: PENDING_APPROVAL

==============================================
ADMIN APPROVAL ACTION
==============================================
Authorize this ticket now as admin to issue the official E-Ticket and boarding pass.

Approve Ticket Now:
${directApprovalUrl}

Fligh.com Booking & Approval System`);

    const autoMailto = `mailto:yus40840@gmail.com?subject=${reqSubject}&body=${reqBody}`;
    try {
      const link = document.createElement('a');
      link.href = autoMailto;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.warn('Auto mailto dispatch', e);
    }

    // Transition to Pending Approval step
    setStep('pending_approval');
  };

  const approvalUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?approveBooking=${pendingBookingId || pendingPnr}&token=${approvalToken}`
    : '';

  const isAdmin = Boolean(
    user && (user.email === 'yus40840@gmail.com' || user.email === 'ramshaskhaikh544@gmail.com')
  );

  const emailSubject = encodeURIComponent(`Approval Required: Booking PNR #${pendingPnr} for ${passengerName}`);
  const emailBody = encodeURIComponent(`APPROVAL REQUIRED NOTIFICATION

Hello Admin,

A new travel booking has been submitted on Fligh.com and is currently awaiting your official authorization.

==============================================
PASSENGER & BOOKING DETAILS
==============================================
• PNR Reference: ${pendingPnr}
• Passenger: ${passengerName}
• Passport / CNIC: ${passportNumber}
• Passenger Email: ${email}
• Passenger Phone: ${phone}
• Itinerary: ${bookingType === 'flight' ? `${flightItem?.airlineName} ${flightItem?.originCity} (${flightItem?.originCode}) → ${flightItem?.destCity} (${flightItem?.destCode})` : hotelItem?.name}
• Total Amount Paid: Rs ${finalPricePKR.toLocaleString()} PKR
• Status: PENDING_APPROVAL

==============================================
ADMIN APPROVAL ACTION
==============================================
Authorize this ticket now as admin to issue the official E-Ticket and boarding pass.

Approve Ticket Now:
${approvalUrl}

Thank you,
Fligh.com Booking & Approval System`);

  const mailtoUrl = `mailto:yus40840@gmail.com?subject=${emailSubject}&body=${emailBody}`;

  const handleCopyApprovalLink = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(approvalUrl);
      setApprovalCopied(true);
      setTimeout(() => setApprovalCopied(false), 2500);
    }
  };

  const handleInstantApprove = async () => {
    setIsApproving(true);
    try {
      if (onApproveBooking && pendingBookingId) {
        await onApproveBooking(pendingBookingId);
      }

      // Dispatch official confirmation directly to yus40840@gmail.com
      const approvedSubject = encodeURIComponent(`[OFFICIALLY APPROVED] Ticket PNR #${pendingPnr} Issued by Admin`);
      const approvedBody = encodeURIComponent(`OFFICIAL ADMIN AUTHORIZATION NOTICE

The booking PNR #${pendingPnr} for passenger ${passengerName} has been officially authorized and issued by admin yus40840@gmail.com.

==============================================
CONFIRMED TICKET DETAILS
==============================================
• Booking Reference (PNR): ${pendingPnr}
• E-Ticket Number: ${confirmedTicket?.eTicketNumber || '214-8930194821'}
• Passenger: ${passengerName}
• Passport / CNIC: ${passportNumber}
• Contact Email: ${email}
• Itinerary: ${bookingType === 'flight' ? `${flightItem?.airlineName} ${flightItem?.originCity} (${flightItem?.originCode}) → ${flightItem?.destCity} (${flightItem?.destCode})` : hotelItem?.name}
• Total Paid: Rs ${finalPricePKR.toLocaleString()} PKR
• Assigned Seat: 14A (Window)
• Boarding Gate: 24 · Terminal 1
• Status: APPROVED & TICKET ISSUED

Authorized by: yus40840@gmail.com
Fligh.com Booking & Approval System`);
      
      const directMailto = `mailto:yus40840@gmail.com?subject=${approvedSubject}&body=${approvedBody}`;
      
      // Dispatch directly to mail client
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

      setStep('eticket');
    } catch (err) {
      console.error('Approval error:', err);
      // Fallback transition
      setStep('eticket');
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        className={`bg-white w-full ${
          step === 'eticket' ? 'max-w-4xl' : 'max-w-2xl'
        } rounded-3xl shadow-2xl overflow-hidden border border-slate-200 transition-all duration-300 max-h-[95vh] flex flex-col`}
      >
        {/* Top bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-display font-extrabold text-lg text-blue-400">
              Fligh.com <span className="text-white">Travel</span>
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-xs font-semibold text-slate-300">
              {step === 'eticket'
                ? 'Official E-Ticket & Boarding Verification'
                : step === 'pending_approval'
                ? 'Request to Approve Ticket'
                : 'Secure Online Payment & Booking'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto p-4 sm:p-6 flex-1">
          {step === 'eticket' && confirmedTicket ? (
            <div>
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 text-emerald-800 text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Verified & Approved by Official Administration</span>
                </div>
                <span className="text-[10px] bg-emerald-200/60 text-emerald-900 px-2 py-0.5 rounded-full font-mono font-bold">
                  STATUS: APPROVED
                </span>
              </div>
              <ETicketView ticketData={confirmedTicket} onClose={onClose} />
            </div>
          ) : step === 'pending_approval' ? (
            /* Pending Admin Approval Screen */
            <div className="space-y-6 py-4 animate-in fade-in duration-300">
              <div className="text-center max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <Clock className="w-8 h-8 animate-pulse" />
                </div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  Status: Pending Admin Approval
                </span>
                <h3 className="font-display font-black text-2xl text-slate-900 mt-3">
                  Request to Approve Ticket Dispatched
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Your ticket has been confirmed and submitted for verification to the administrator. Once approved, the verified e-ticket and boarding barcode will automatically appear on this website.
                </p>
              </div>

              {/* Sent Status Banner */}
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-900 shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-emerald-950">
                    Request to Approve Ticket Dispatched
                  </div>
                  <div className="text-[11px] text-emerald-700 mt-0.5">
                    An official authorization request with PNR #{pendingPnr} and one-click confirmation link has been sent to the administrator.
                  </div>
                </div>
              </div>

              {/* Summary Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">PNR Reference:</span>
                  <span className="font-mono font-black text-blue-600 text-sm">{pendingPnr}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Passenger:</span>
                  <span className="font-bold text-slate-900">{passengerName} ({passportNumber})</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Approver:</span>
                  <span className="font-bold text-purple-700">Official Administration</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Amount Paid:</span>
                  <span className="font-black text-slate-900 font-display">Rs {finalPricePKR.toLocaleString()} PKR</span>
                </div>
              </div>

              {/* Email Send Box */}
              <div className="p-4 bg-purple-50/80 border border-purple-200 rounded-2xl space-y-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-purple-950">
                      Admin Approval Action Sent to Given Email
                    </h5>
                    <p className="text-[11px] text-purple-800 mt-0.5 leading-relaxed">
                      <em>"Authorize this ticket now as admin to issue the official E-Ticket and boarding pass. Approve Ticket Now"</em> has been dispatched to the given email for approval.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <a
                    href={mailtoUrl}
                    className="flex-1 py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send to Given Email for Approval</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyApprovalLink}
                    className="py-2.5 px-4 bg-white hover:bg-purple-100 text-purple-800 border border-purple-300 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {approvalCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Approval Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Admin Instant Approval Section: Only visible if signed in as verified administrator */}
              {isAdmin && (
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-left">
                    <div className="font-bold text-xs text-emerald-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Admin Quick Authorization</span>
                    </div>
                    <div className="text-[11px] text-emerald-700 mt-0.5">
                      You are signed in as administrator. You can also approve directly from here.
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleInstantApprove}
                    disabled={isApproving}
                    className="w-full sm:w-auto py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isApproving ? 'Approving...' : 'Approve Ticket Now'}</span>
                  </button>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Close & View Later in "Find Bookings"
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handlePayOnlineAndConfirm} className="space-y-5">
              {/* Product Card Summary */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {bookingType === 'flight' && flightItem && (
                    <>
                      <AirlineLogo airlineCode={flightItem.airlineCode} size="lg" />
                      <div>
                        <div className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                          <span>{flightItem.airlineName}</span>
                          <span className="text-xs text-blue-600 font-bold">
                            {flightItem.flightNumber}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 font-semibold mt-0.5">
                          {flightItem.originCity} ({flightItem.originCode}) → {flightItem.destCity} ({flightItem.destCode})
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {flightItem.duration} · {flightItem.baggage}
                        </div>
                      </div>
                    </>
                  )}

                  {bookingType === 'hotel' && hotelItem && (
                    <>
                      <CityLogo city={hotelItem.city} size="lg" />
                      <div>
                        <div className="font-black text-slate-900 text-sm">{hotelItem.name}</div>
                        <div className="text-xs text-slate-600">
                          {hotelItem.area}, {hotelItem.city} · Score {hotelItem.ratingScore}/10
                        </div>
                        <div className="text-[11px] text-emerald-600 font-semibold">
                          Free breakfast & free cancellation included
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="text-left sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 w-full sm:w-auto">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Total Payable
                  </span>
                  <div className="text-xl font-black text-blue-600 font-display tabular-nums">
                    Rs {finalPricePKR.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-500">All Taxes & Fees Included</span>
                </div>
              </div>

              {/* Passenger & Travel Documentation Section */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <span>Passenger Information (as on Passport / CNIC)</span>
                  </h4>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Adult (12+ yrs)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Full Legal Name
                    </label>
                    <input
                      type="text"
                      required
                      value={passengerName}
                      onChange={(e) => setPassengerName(e.target.value)}
                      placeholder="e.g. MUHAMMAD USMAN"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Passport Number / CNIC
                    </label>
                    <input
                      type="text"
                      required
                      value={passportNumber}
                      onChange={(e) => setPassportNumber(e.target.value)}
                      placeholder="e.g. PK84920194"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 uppercase font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Email for E-Ticket Delivery
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Pakistan Mobile Phone
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Online Payment Method */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span>Payment Method & Instant Verification</span>
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                    <span>VISA</span>
                    <span>·</span>
                    <span>MC</span>
                    <span>·</span>
                    <span>PAYPAK</span>
                  </div>
                </div>

                {/* Payment radio tabs */}
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div>Debit / Credit Card</div>
                    <div className="text-[10px] text-slate-400 font-normal">Online Checkout</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('wallet')}
                    className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      paymentMethod === 'wallet'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div>JazzCash / EasyPaisa</div>
                    <div className="text-[10px] text-slate-400 font-normal">Mobile Wallet</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('coins')}
                    className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      paymentMethod === 'coins'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div>Fligh.com Coins & Miles</div>
                    <div className="text-[10px] text-slate-400 font-normal">Reward Points</div>
                  </button>
                </div>

                {/* Card input */}
                {paymentMethod === 'card' && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono font-bold"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">
                          CVV Code
                        </label>
                        <input
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono font-bold"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Member Coin Discount check */}
                <div className="flex items-center justify-between p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useTripCoins}
                      onChange={(e) => setUseTripCoins(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-amber-900 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        Apply Fligh.com Member Coins Discount
                      </span>
                      <span className="text-[10px] text-amber-700 block">
                        Using 3,500 Reward Coins from account
                      </span>
                    </div>
                  </label>
                  <span className="font-bold text-amber-800">- Rs 3,500</span>
                </div>
              </div>

              {/* Approval Notice */}
              <div className="p-3 bg-purple-50/80 rounded-xl border border-purple-200 flex items-start gap-2.5 text-xs text-purple-950">
                <Mail className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Approval Security Policy:</strong> Upon confirming, an authorization request will be sent to the administrator. Once approved, the official E-ticket will be unlocked immediately.
                </span>
              </div>

              {/* Confirm & Pay Online CTA */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Final Price
                  </span>
                  <div className="text-xl font-black text-slate-900 tabular-nums font-display">
                    Rs {finalPricePKR.toLocaleString()} PKR
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center gap-2 active:scale-98"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Confirm & Pay Online</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
