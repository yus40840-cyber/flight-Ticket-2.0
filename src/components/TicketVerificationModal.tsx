import React, { useState } from 'react';
import {
  QrCode,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ShieldCheck,
  User,
  Plane,
  X,
  Camera,
  RefreshCw,
  FileCheck2,
  History,
  Lock,
} from 'lucide-react';
import { verifyTicketCode, markTicketAsUsed, TicketVerificationResult } from '../firebase';
import { BookingRecord } from './FindBookingsModal';

interface TicketVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffUser: { uid: string; name: string; email: string; role?: string } | null;
  bookings: BookingRecord[];
}

export const TicketVerificationModal: React.FC<TicketVerificationModalProps> = ({
  isOpen,
  onClose,
  staffUser,
  bookings,
}) => {
  const [codeInput, setCodeInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<TicketVerificationResult | null>(null);
  const [recentVerifications, setRecentVerifications] = useState<TicketVerificationResult[]>([]);
  const [markingUsed, setMarkingUsed] = useState(false);
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);
  const [mockScannerActive, setMockScannerActive] = useState(false);

  if (!isOpen) return null;

  const handleVerify = async (codeToVerify?: string) => {
    const code = (codeToVerify || codeInput).trim();
    if (!code) return;

    setIsVerifying(true);
    setActionSuccessNotice(null);

    const staffIdentity = {
      uid: staffUser?.uid || 'staff-101',
      name: staffUser?.name || 'Checkpoint Officer',
      email: staffUser?.email || 'staff@fligh.com',
    };

    try {
      // First try backend verifyTicketCode
      let verification = await verifyTicketCode(code, staffIdentity);

      // If invalid via remote query, check local bookings state
      if (verification.code === 'INVALID') {
        const localMatch = bookings.find(
          (b) =>
            b.reference.toUpperCase() === code.toUpperCase() ||
            b.eTicketNumber?.toUpperCase() === code.toUpperCase() ||
            b.id?.toUpperCase() === code.toUpperCase()
        );

        if (localMatch) {
          if (localMatch.status === 'CANCELLED' || localMatch.status === 'REJECTED') {
            verification = {
              code: 'CANCELLED',
              message: '✕ Ticket Cancelled. This reservation has been cancelled or rejected.',
              ticketId: localMatch.reference,
              status: localMatch.status,
              passengerName: localMatch.passenger,
              routeTitle: localMatch.title,
              verifiedAt: new Date().toISOString(),
              staffEmail: staffIdentity.email,
            };
          } else if ((localMatch as any).isUsed) {
            verification = {
              code: 'ALREADY_USED',
              message: `⚠ Ticket Already Used. Scanned and checked-in at ${(localMatch as any).usedAt || 'previous checkpoint'}.`,
              ticketId: localMatch.reference,
              status: 'ALREADY_USED',
              passengerName: localMatch.passenger,
              routeTitle: localMatch.title,
              seat: localMatch.ticketData?.seat || '14A (Window)',
              gate: localMatch.ticketData?.gate || '24',
              terminal: localMatch.ticketData?.terminal || '1',
              verifiedAt: new Date().toISOString(),
              staffEmail: staffIdentity.email,
              isUsed: true,
              usedAt: (localMatch as any).usedAt,
            };
          } else if (localMatch.status === 'APPROVED') {
            verification = {
              code: 'VALID',
              message: '✓ Ticket Valid. Authorized for boarding & entry.',
              ticketId: localMatch.reference,
              status: 'Approved',
              passengerName: localMatch.passenger,
              routeTitle: localMatch.title,
              seat: localMatch.ticketData?.seat || '14A (Window)',
              gate: localMatch.ticketData?.gate || '24',
              terminal: localMatch.ticketData?.terminal || '1',
              boardingTime: '02:35 KHI',
              travelDate: localMatch.date,
              pricePKR: localMatch.price,
              verifiedAt: new Date().toISOString(),
              staffEmail: staffIdentity.email,
              isUsed: false,
              bookingRef: localMatch,
            };
          } else {
            verification = {
              code: 'INVALID',
              message: `✕ Ticket Not Approved. Status: ${localMatch.status}. Requires admin authorization.`,
              ticketId: localMatch.reference,
              status: localMatch.status,
              passengerName: localMatch.passenger,
              verifiedAt: new Date().toISOString(),
              staffEmail: staffIdentity.email,
            };
          }
        }
      }

      setResult(verification);
      setRecentVerifications((prev) => [verification, ...prev.slice(0, 7)]);
    } catch (e: any) {
      console.warn('Verification exception:', e);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleMarkAsChecked = async () => {
    if (!result || result.code !== 'VALID') return;
    setMarkingUsed(true);

    const staffIdentity = {
      uid: staffUser?.uid || 'staff-101',
      name: staffUser?.name || 'Checkpoint Officer',
      email: staffUser?.email || 'staff@fligh.com',
    };

    try {
      await markTicketAsUsed(result.ticketId, staffIdentity);
      const updatedResult: TicketVerificationResult = {
        ...result,
        code: 'ALREADY_USED',
        isUsed: true,
        usedAt: new Date().toLocaleTimeString(),
        usedByStaffName: staffIdentity.name,
        message: `✓ Passenger Checked-In. Ticket marked as USED at ${new Date().toLocaleTimeString()}.`,
      };
      setResult(updatedResult);
      setActionSuccessNotice(
        `Passenger ${result.passengerName || 'Traveler'} successfully boarded & ticket punched!`
      );
    } catch (e) {
      console.warn('Mark as used notice:', e);
    } finally {
      setMarkingUsed(false);
    }
  };

  const approvedBookings = bookings.filter((b) => b.status === 'APPROVED');
  const samplePnr = approvedBookings[0]?.reference || 'FLI-749210';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-950 text-white p-5 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-sm text-white">
                  Ticket Verification Station
                </h3>
                <span className="text-[10px] bg-indigo-900/80 text-indigo-300 font-bold px-2 py-0.5 rounded-full border border-indigo-700">
                  Checkpoint Staff RBAC
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Scan QR or lookup Ticket ID / PNR for boarding gate validation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Staff Duty Info Banner */}
        <div className="bg-indigo-50/60 px-5 py-2.5 border-b border-indigo-100 flex items-center justify-between text-xs text-indigo-950">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>
              Staff on Duty: <strong>{staffUser?.name || 'Gate Officer'}</strong> (
              {staffUser?.email || 'staff@fligh.com'})
            </span>
          </div>
          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded uppercase">
            Role: {staffUser?.role || 'verification_staff'}
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {/* Lookup Input Form */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <label className="block text-xs font-bold text-slate-700">
              Scan QR Code or Enter Ticket ID / PNR Reference
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="e.g. FLI-749210 or 214-8930194821"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl font-mono font-bold text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase tracking-wider"
                />
              </div>

              <button
                type="button"
                onClick={() => handleVerify()}
                disabled={isVerifying || !codeInput.trim()}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isVerifying ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <FileCheck2 className="w-4 h-4" />
                )}
                <span>Verify Ticket</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMockScannerActive(!mockScannerActive);
                  if (!mockScannerActive) {
                    setCodeInput(samplePnr);
                    handleVerify(samplePnr);
                  }
                }}
                className="px-3 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Simulate Optical Camera QR Scan"
              >
                <Camera className="w-4 h-4 text-slate-500" />
                <span className="hidden sm:inline">Camera Scan</span>
              </button>
            </div>

            {/* Quick Demo Pre-sets for Testing Specification Results */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-slate-500">
              <span className="font-semibold text-slate-400">Quick Test:</span>
              <button
                type="button"
                onClick={() => {
                  setCodeInput(samplePnr);
                  handleVerify(samplePnr);
                }}
                className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-mono font-bold hover:bg-emerald-100 cursor-pointer"
              >
                Valid: {samplePnr}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCodeInput('FLI-USED99');
                  handleVerify('FLI-USED99');
                }}
                className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded font-mono font-bold hover:bg-amber-100 cursor-pointer"
              >
                Simulate: Already Used
              </button>
              <button
                type="button"
                onClick={() => {
                  setCodeInput('FLI-CANCEL01');
                  handleVerify('FLI-CANCEL01');
                }}
                className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded font-mono font-bold hover:bg-red-100 cursor-pointer"
              >
                Simulate: Cancelled
              </button>
              <button
                type="button"
                onClick={() => {
                  setCodeInput('INVALID-999');
                  handleVerify('INVALID-999');
                }}
                className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded font-mono font-bold hover:bg-slate-200 cursor-pointer"
              >
                Simulate: Invalid
              </button>
            </div>
          </div>

          {/* Action Success Toast */}
          {actionSuccessNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-800 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionSuccessNotice}</span>
            </div>
          )}

          {/* Verification Results Panel (Exact specification formats) */}
          {result && (
            <div className="space-y-4 animate-in zoom-in-95 duration-200">
              {/* VALID Result */}
              {result.code === 'VALID' && (
                <div className="p-5 bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-400 rounded-2xl shadow-sm space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                        <CheckCircle2 className="w-7 h-7" />
                      </div>
                      <div>
                        <div className="text-lg font-black text-emerald-950 font-display flex items-center gap-2">
                          <span>✓ Ticket Valid</span>
                          <span className="text-xs font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
                            STATUS: APPROVED
                          </span>
                        </div>
                        <div className="text-xs text-emerald-800 font-mono font-bold mt-0.5">
                          Ticket ID: {result.ticketId}
                        </div>
                      </div>
                    </div>

                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-lg">
                      Ready for Boarding
                    </span>
                  </div>

                  {/* Flight & Passenger Details */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-200/80 text-xs">
                    <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                        Passenger
                      </span>
                      <strong className="text-slate-900 truncate block">
                        {result.passengerName || 'Muhammad Usman'}
                      </strong>
                    </div>
                    <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                        Seat Assignment
                      </span>
                      <strong className="text-blue-700 font-mono">
                        {result.seat || '14A (Window)'}
                      </strong>
                    </div>
                    <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                        Gate / Terminal
                      </span>
                      <strong className="text-slate-900">
                        Gate {result.gate || '24'} (T{result.terminal || '1'})
                      </strong>
                    </div>
                    <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                        Boarding Time
                      </span>
                      <strong className="text-emerald-700 font-mono">
                        {result.boardingTime || '02:35 KHI'}
                      </strong>
                    </div>
                  </div>

                  {/* One-time entry check-in CTA */}
                  <div className="pt-2 flex items-center justify-between gap-3">
                    <div className="text-[11px] text-emerald-800">
                      Click below to validate single entry and record checkpoint timestamp.
                    </div>
                    <button
                      type="button"
                      onClick={handleMarkAsChecked}
                      disabled={markingUsed}
                      className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
                    >
                      {markingUsed ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <FileCheck2 className="w-3.5 h-3.5" />
                      )}
                      <span>Mark Ticket as Checked / Used</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ALREADY USED Result */}
              {result.code === 'ALREADY_USED' && (
                <div className="p-5 bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-50 border-2 border-amber-400 rounded-2xl shadow-sm space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shrink-0">
                      <AlertTriangle className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="text-lg font-black text-amber-950 font-display">
                        ⚠ Ticket Already Used
                      </div>
                      <div className="text-xs text-amber-800 font-mono font-bold mt-0.5">
                        Ticket ID: {result.ticketId}
                      </div>
                      <p className="text-xs text-amber-900 font-semibold mt-1">
                        Verified At: {result.usedAt || result.verifiedAt}
                      </p>
                      <div className="text-[11px] text-amber-700 mt-0.5">
                        Passenger {result.passengerName} has already scanned this ticket for single-entry. Duplicate entry prohibited.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CANCELLED Result */}
              {result.code === 'CANCELLED' && (
                <div className="p-5 bg-gradient-to-br from-red-50 via-rose-50 to-red-50 border-2 border-red-400 rounded-2xl shadow-sm space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md shrink-0">
                      <XCircle className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="text-lg font-black text-red-950 font-display">
                        ✕ Ticket Cancelled
                      </div>
                      <div className="text-xs text-red-800 font-mono font-bold mt-0.5">
                        Ticket ID: {result.ticketId}
                      </div>
                      <p className="text-xs text-red-900 mt-1">
                        {result.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* EXPIRED Result */}
              {result.code === 'EXPIRED' && (
                <div className="p-5 bg-gradient-to-br from-red-50 via-rose-50 to-red-50 border-2 border-red-400 rounded-2xl shadow-sm space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md shrink-0">
                      <Clock className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="text-lg font-black text-red-950 font-display">
                        ✕ Ticket Expired
                      </div>
                      <div className="text-xs text-red-800 font-mono font-bold mt-0.5">
                        Ticket ID: {result.ticketId}
                      </div>
                      <p className="text-xs text-red-900 mt-1">
                        {result.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* INVALID Result */}
              {result.code === 'INVALID' && (
                <div className="p-5 bg-gradient-to-br from-slate-100 via-red-50 to-slate-100 border-2 border-slate-300 rounded-2xl shadow-sm space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-700 text-white flex items-center justify-center shadow-md shrink-0">
                      <XCircle className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="text-lg font-black text-slate-900 font-display">
                        ✕ Invalid Ticket
                      </div>
                      <div className="text-xs text-slate-600 font-mono font-bold mt-0.5">
                        Searched Code: {result.ticketId}
                      </div>
                      <p className="text-xs text-slate-700 mt-1">
                        {result.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recent Verifications History for Current Staff Session */}
          <div className="pt-2">
            <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5 mb-2.5">
              <History className="w-3.5 h-3.5" />
              <span>Recent Checkpoint Scans</span>
            </h4>

            {recentVerifications.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-400">
                No tickets scanned yet this shift. Enter a PNR above or use Quick Test.
              </div>
            ) : (
              <div className="space-y-1.5">
                {recentVerifications.map((v, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-between text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {v.code === 'VALID' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : v.code === 'ALREADY_USED' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                      )}
                      <div>
                        <span className="font-mono font-bold text-slate-900">{v.ticketId}</span>
                        {v.passengerName && (
                          <span className="text-slate-500 ml-1.5">· {v.passengerName}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          v.code === 'VALID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : v.code === 'ALREADY_USED'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {v.code}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Least Privilege: Verification Staff cannot approve bookings or modify pricing.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close Station
          </button>
        </div>
      </div>
    </div>
  );
};
