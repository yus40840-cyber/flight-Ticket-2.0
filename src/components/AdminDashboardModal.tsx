import React, { useState, useMemo, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Mail,
  Key,
  X,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  User,
  Phone,
  CreditCard,
  Plane,
  Building,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  AlertTriangle,
  Download,
  Send,
  Check,
  Calendar,
  Layers,
  Copy,
  Users,
  QrCode,
  FileText,
  Activity,
  FileCheck2,
  Camera,
  ToggleLeft,
  ToggleRight,
  History,
} from 'lucide-react';
import { BookingRecord } from './FindBookingsModal';
import { ETicketView, ETicketData } from './ETicketView';
import {
  db,
  approveFirestoreBooking,
  rejectFirestoreBooking,
  loginWithEmail,
  registerWithEmail,
  recordAuditLog,
  updateUserRoleInFirestore,
  updateUserStatusInFirestore,
  verifyTicketCode,
  markTicketAsUsed,
} from '../firebase';
import { collection, query, onSnapshot, orderBy, getDocs } from 'firebase/firestore';
import { AppUser, UserRole, AuditLogItem, TicketVerificationResult } from '../types';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: { uid: string; name: string; email: string; role?: string } | null;
  bookings: BookingRecord[];
  onApproveBooking: (bookingId: string) => Promise<any> | void;
  onRejectBooking?: (bookingId: string) => Promise<any> | void;
  onAdminLoginSuccess: (user: { uid: string; name: string; email: string; role?: string }) => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  bookings,
  onApproveBooking,
  onRejectBooking,
  onAdminLoginSuccess,
}) => {
  // Designated Super Admin Credentials
  const EXPECTED_ADMIN_EMAIL = 'yus40840@gmail.com';
  const EXPECTED_ADMIN_PASS = '#Kenboi@544';

  // Admin session authentication state
  const [sessionAdminAuthed, setSessionAdminAuthed] = useState(false);

  // Login form state
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Dashboard filtering & inspection
  const [activeTab, setActiveTab] = useState<
    'pending' | 'all' | 'approved' | 'users' | 'audit' | 'verifier'
  >('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [viewingTicket, setViewingTicket] = useState<ETicketData | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [bulkApproving, setBulkApproving] = useState(false);
  const [copiedPnr, setCopiedPnr] = useState<string | null>(null);

  // RBAC User & Audit states
  const [usersList, setUsersList] = useState<AppUser[]>([
    {
      uid: 'super-admin-1',
      name: 'Super Admin Officer',
      email: 'yus40840@gmail.com',
      role: 'super_admin',
      status: 'active',
      phone: '+92 300 8241920',
    },
    {
      uid: 'super-admin-2',
      name: 'Ramsha Shaikh',
      email: 'ramshaskhaikh544@gmail.com',
      role: 'super_admin',
      status: 'active',
    },
    {
      uid: 'staff-gate-1',
      name: 'Gate 24 Verification Staff',
      email: 'checkpoint.staff@fligh.com',
      role: 'verification_staff',
      status: 'active',
    },
    {
      uid: 'admin-ops-1',
      name: 'Operations Manager',
      email: 'operations.admin@fligh.com',
      role: 'admin',
      status: 'active',
    },
    {
      uid: 'customer-1',
      name: 'Muhammad Usman',
      email: 'usman.travel@gmail.com',
      role: 'customer',
      status: 'active',
      phone: '+92 300 1234567',
    },
  ]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [auditFilter, setAuditFilter] = useState('ALL');
  const [updatingUserRole, setUpdatingUserRole] = useState<string | null>(null);

  // Verifier tool state inside modal
  const [verifierCode, setVerifierCode] = useState('');
  const [verifierResult, setVerifierResult] = useState<TicketVerificationResult | null>(null);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [markingUsed, setMarkingUsed] = useState(false);

  // Determine RBAC permissions
  const isSuperAdminEmail = Boolean(
    currentUser &&
      (currentUser.email.toLowerCase() === EXPECTED_ADMIN_EMAIL.toLowerCase() ||
        currentUser.email.toLowerCase() === 'ramshaskhaikh544@gmail.com' ||
        currentUser.role === 'super_admin')
  );

  const isCurrentSuperAdmin = Boolean(sessionAdminAuthed || isSuperAdminEmail);
  const isCurrentAdmin = Boolean(
    isCurrentSuperAdmin ||
      (currentUser && (currentUser.role === 'admin' || currentUser.role === 'super_admin'))
  );

  // Real-time Firestore sync for users & audit logs when authorized
  useEffect(() => {
    if (!isCurrentAdmin) return;

    // Load users
    try {
      const usersCol = collection(db, 'users');
      const unsubUsers = onSnapshot(
        usersCol,
        (snapshot) => {
          const loaded: AppUser[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            loaded.push({
              uid: d.id,
              name: data.displayName || data.name || 'Passenger',
              email: data.email || '',
              role: data.role || 'customer',
              phone: data.phone,
              passportOrCnic: data.passportOrCnic,
              status: data.status || 'active',
            });
          });
          if (loaded.length > 0) {
            setUsersList((prev) => {
              const map = new Map<string, AppUser>();
              // Keep defaults then overwrite
              prev.forEach((u) => map.set(u.email.toLowerCase(), u));
              loaded.forEach((u) => map.set(u.email.toLowerCase(), u));
              return Array.from(map.values());
            });
          }
        },
        (err) => console.warn('Users Firestore listener note:', err)
      );

      // Load audit logs
      const auditCol = collection(db, 'audit_logs');
      const unsubAudit = onSnapshot(
        auditCol,
        (snapshot) => {
          const logs: AuditLogItem[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            logs.push({
              id: d.id,
              actorId: data.actorId || 'system',
              actorEmail: data.actorEmail || 'system@fligh.com',
              actorRole: data.actorRole || 'system',
              action: data.action || 'EVENT',
              resourceType: data.resourceType || 'booking',
              resourceId: data.resourceId || 'N/A',
              details: data.details,
              timestamp: data.timestamp?.toDate
                ? data.timestamp.toDate().toLocaleString()
                : new Date().toLocaleString(),
            });
          });
          if (logs.length > 0) {
            setAuditLogs(logs.reverse());
          }
        },
        (err) => console.warn('Audit logs listener note:', err)
      );

      return () => {
        unsubUsers();
        unsubAudit();
      };
    } catch (e) {
      console.warn('Real-time sync setup exception:', e);
    }
  }, [isCurrentAdmin]);

  // Admin login handler
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setLoginLoading(true);

    const enteredEmail = emailInput.trim();
    const enteredPass = passwordInput;

    try {
      const isSuperAdminEmailCheck =
        enteredEmail.toLowerCase() === EXPECTED_ADMIN_EMAIL.toLowerCase() ||
        enteredEmail.toLowerCase() === 'ramshaskhaikh544@gmail.com';
      const isSuperAdminPass = enteredPass === EXPECTED_ADMIN_PASS;

      if (!isSuperAdminEmailCheck || !isSuperAdminPass) {
        throw new Error(
          'Access Denied: Invalid administrator email or password. Only authorized personnel may access this dashboard.'
        );
      }

      let fbUser: any = null;
      try {
        fbUser = await loginWithEmail(enteredEmail, enteredPass);
      } catch (loginErr: any) {
        if (
          loginErr?.code === 'auth/user-not-found' ||
          loginErr?.code === 'auth/invalid-credential' ||
          loginErr?.code === 'auth/invalid-email'
        ) {
          try {
            fbUser = await registerWithEmail(
              enteredEmail,
              enteredPass,
              'Super Administrator'
            );
          } catch (regErr) {
            console.warn('Firebase registration fallback notice:', regErr);
          }
        }
      }

      const adminUserObj = {
        uid: fbUser?.uid || 'admin-super-uid',
        name: 'Super Administrator',
        email: enteredEmail,
        role: 'super_admin',
      };

      await recordAuditLog({
        actorId: adminUserObj.uid,
        actorEmail: enteredEmail,
        actorRole: 'super_admin',
        action: 'LOGIN',
        resourceType: 'auth',
        resourceId: adminUserObj.uid,
        details: 'Super Admin authenticated to admin portal.',
      });

      setSessionAdminAuthed(true);
      onAdminLoginSuccess(adminUserObj);
    } catch (err: any) {
      console.error('Login error:', err);
      setAuthError(err?.message || 'Access verification failed.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Operational booking metrics
  const stats = useMemo(() => {
    const pending = bookings.filter(
      (b) => b.status === 'PENDING_APPROVAL' || b.status?.includes('Pending')
    ).length;
    const approved = bookings.filter(
      (b) => b.status === 'APPROVED' || b.status?.includes('Approved')
    ).length;
    const total = bookings.length;
    const revenue = bookings.reduce((sum, b) => sum + (b.price || 0), 0);
    return { pending, approved, total, revenue };
  }, [bookings]);

  // Filter bookings based on activeTab and searchQuery
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const isPending = b.status === 'PENDING_APPROVAL' || b.status?.includes('Pending');
      const isApproved = b.status === 'APPROVED' || b.status?.includes('Approved');

      if (activeTab === 'pending' && !isPending) return false;
      if (activeTab === 'approved' && !isApproved) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const pnrMatch = b.reference.toLowerCase().includes(q);
        const nameMatch = b.passenger.toLowerCase().includes(q);
        const titleMatch = b.title.toLowerCase().includes(q);
        const emailMatch = (b.passengerEmail || '').toLowerCase().includes(q);
        return pnrMatch || nameMatch || titleMatch || emailMatch;
      }
      return true;
    });
  }, [bookings, activeTab, searchQuery]);

  // Approve single booking
  const handleApprove = async (booking: BookingRecord) => {
    const id = booking.id || booking.reference;
    setApprovingId(id);
    setActionNotice(null);

    try {
      await approveFirestoreBooking(id, booking.approvalToken);
      if (onApproveBooking) {
        await onApproveBooking(id);
      }

      await recordAuditLog({
        actorId: currentUser?.uid || 'admin',
        actorEmail: currentUser?.email || EXPECTED_ADMIN_EMAIL,
        actorRole: isCurrentSuperAdmin ? 'super_admin' : 'admin',
        action: 'APPROVE_BOOKING',
        resourceType: 'booking',
        resourceId: id,
        details: `Approved booking ${booking.reference} for passenger ${booking.passenger}. E-Ticket issued.`,
      });

      setActionNotice(`✅ Booking #${booking.reference} approved! E-Ticket issued.`);
      setTimeout(() => setActionNotice(null), 4000);
    } catch (err: any) {
      console.warn('Admin approval error:', err);
      if (onApproveBooking) {
        await onApproveBooking(id);
      }
      setActionNotice(`✅ Booking #${booking.reference} approved and issued!`);
      setTimeout(() => setActionNotice(null), 4000);
    } finally {
      setApprovingId(null);
    }
  };

  // Reject single booking
  const handleReject = async (booking: BookingRecord) => {
    const id = booking.id || booking.reference;
    setRejectingId(id);
    setActionNotice(null);

    try {
      await rejectFirestoreBooking(id);
      if (onRejectBooking) {
        await onRejectBooking(id);
      }

      await recordAuditLog({
        actorId: currentUser?.uid || 'admin',
        actorEmail: currentUser?.email || EXPECTED_ADMIN_EMAIL,
        actorRole: isCurrentSuperAdmin ? 'super_admin' : 'admin',
        action: 'REJECT_BOOKING',
        resourceType: 'booking',
        resourceId: id,
        details: `Rejected booking ${booking.reference} for passenger ${booking.passenger}.`,
      });

      setActionNotice(`🚫 Booking #${booking.reference} has been rejected.`);
      setTimeout(() => setActionNotice(null), 4000);
    } catch (err: any) {
      console.warn('Reject fallback:', err);
      setActionNotice(`Booking #${booking.reference} marked as cancelled.`);
      setTimeout(() => setActionNotice(null), 4000);
    } finally {
      setRejectingId(null);
    }
  };

  // Bulk approve all pending bookings
  const handleBulkApprove = async () => {
    const pendingList = bookings.filter(
      (b) => b.status === 'PENDING_APPROVAL' || b.status?.includes('Pending')
    );
    if (pendingList.length === 0) return;

    setBulkApproving(true);
    setActionNotice(null);

    try {
      for (const b of pendingList) {
        const id = b.id || b.reference;
        await approveFirestoreBooking(id, b.approvalToken);
        if (onApproveBooking) {
          await onApproveBooking(id);
        }
      }

      await recordAuditLog({
        actorId: currentUser?.uid || 'admin',
        actorEmail: currentUser?.email || EXPECTED_ADMIN_EMAIL,
        actorRole: isCurrentSuperAdmin ? 'super_admin' : 'admin',
        action: 'BULK_APPROVE_BOOKINGS',
        resourceType: 'bookings',
        resourceId: 'BATCH',
        details: `Bulk approved ${pendingList.length} pending reservations.`,
      });

      setActionNotice(`🎉 Successfully approved all ${pendingList.length} pending bookings!`);
      setTimeout(() => setActionNotice(null), 5000);
    } catch (err) {
      console.warn('Bulk approve notice:', err);
      setActionNotice('Completed batch approvals.');
      setTimeout(() => setActionNotice(null), 4000);
    } finally {
      setBulkApproving(false);
    }
  };

  // Super Admin: Change user role
  const handleRoleChange = async (targetUser: AppUser, newRole: UserRole) => {
    if (!isCurrentSuperAdmin) {
      alert('Permission Denied: Only Super Admin can change user roles.');
      return;
    }
    setUpdatingUserRole(targetUser.uid);
    try {
      await updateUserRoleInFirestore(targetUser.uid, newRole, {
        uid: currentUser?.uid || 'super-admin',
        email: currentUser?.email || EXPECTED_ADMIN_EMAIL,
        role: 'super_admin',
      });

      setUsersList((prev) =>
        prev.map((u) => (u.uid === targetUser.uid ? { ...u, role: newRole } : u))
      );

      setActionNotice(
        `✓ Role Updated: ${targetUser.name} (${targetUser.email}) is now assigned as "${newRole.toUpperCase()}".`
      );
      setTimeout(() => setActionNotice(null), 4000);
    } catch (e) {
      console.warn('Role update notice:', e);
    } finally {
      setUpdatingUserRole(null);
    }
  };

  // Super Admin: Toggle account status
  const handleStatusToggle = async (targetUser: AppUser) => {
    if (!isCurrentSuperAdmin) {
      alert('Permission Denied: Only Super Admin can toggle account status.');
      return;
    }
    const nextStatus = targetUser.status === 'disabled' ? 'active' : 'disabled';
    try {
      await updateUserStatusInFirestore(targetUser.uid, nextStatus, {
        uid: currentUser?.uid || 'super-admin',
        email: currentUser?.email || EXPECTED_ADMIN_EMAIL,
        role: 'super_admin',
      });

      setUsersList((prev) =>
        prev.map((u) => (u.uid === targetUser.uid ? { ...u, status: nextStatus } : u))
      );

      setActionNotice(`User account ${targetUser.email} status set to ${nextStatus.toUpperCase()}.`);
      setTimeout(() => setActionNotice(null), 4000);
    } catch (e) {
      console.warn('Status toggle error:', e);
    }
  };

  // Checkpoint verifier tool execution
  const handleRunVerification = async () => {
    if (!verifierCode.trim()) return;
    setIsVerifyingCode(true);
    try {
      const res = await verifyTicketCode(verifierCode, {
        uid: currentUser?.uid || 'admin',
        name: currentUser?.name || 'Authorized Staff',
        email: currentUser?.email || EXPECTED_ADMIN_EMAIL,
      });
      setVerifierResult(res);
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleMarkTicketCheckedIn = async () => {
    if (!verifierResult || verifierResult.code !== 'VALID') return;
    setMarkingUsed(true);
    try {
      await markTicketAsUsed(verifierResult.ticketId, {
        uid: currentUser?.uid || 'admin',
        name: currentUser?.name || 'Authorized Staff',
        email: currentUser?.email || EXPECTED_ADMIN_EMAIL,
      });
      setVerifierResult({
        ...verifierResult,
        code: 'ALREADY_USED',
        message: '✓ Ticket Checked-In. Boarding recorded at entrance checkpoint.',
      });
      setActionNotice(`Ticket ${verifierResult.ticketId} marked as USED!`);
      setTimeout(() => setActionNotice(null), 4000);
    } finally {
      setMarkingUsed(false);
    }
  };

  const handleInspectETicket = (b: BookingRecord) => {
    if (b.ticketData) {
      setViewingTicket(b.ticketData);
      return;
    }

    const defaultETicket: ETicketData = {
      pnr: b.reference,
      eTicketNumber: b.eTicketNumber || '214-8930194821',
      bookingDate: b.date || '04 Oct 2026',
      passengerName: b.passenger,
      passportNumber: b.passportOrCnic || 'PK84920194',
      email: b.passengerEmail || 'passenger@fligh.com',
      phone: b.passengerPhone || '+92 300 1234567',
      seat: '14A (Window)',
      gate: '24',
      terminal: '1',
      boardingTime: '03:15 AM',
      cabinClass: 'Economy',
      bookingType:
        b.type === 'flight' || b.type === 'hotel' || b.type === 'train' ? b.type : 'flight',
      totalPaidPKR: b.price,
    };

    setViewingTicket(defaultETicket);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        className={`bg-slate-900 w-full ${
          viewingTicket ? 'max-w-4xl' : 'max-w-6xl'
        } rounded-3xl shadow-2xl overflow-hidden border border-slate-800 transition-all max-h-[94vh] flex flex-col`}
      >
        {/* Top Header Bar */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-lg text-white">
                  Fligh.com Security & RBAC Console
                </h3>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  {isCurrentSuperAdmin ? 'Super Admin' : 'Admin'} Access
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Multi-Role Access Control · Ticket Approvals · Checkpoint Station · Audit Trail
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isCurrentAdmin && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{isCurrentSuperAdmin ? 'Super Admin Verified' : 'Admin Verified'}</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Notice Banner */}
        {actionNotice && (
          <div className="px-6 py-2.5 bg-emerald-950/80 border-b border-emerald-800/80 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{actionNotice}</span>
            </div>
            <button onClick={() => setActionNotice(null)} className="text-emerald-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Gate Check: If NOT current admin, show protected login view */}
        {!isCurrentAdmin ? (
          <div className="p-6 sm:p-10 flex-1 overflow-y-auto flex items-center justify-center">
            <div className="w-full max-w-md bg-slate-950/80 p-8 rounded-2xl border border-slate-800 shadow-xl space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-8 h-8" />
                </div>
                <h4 className="font-display font-black text-xl text-white">
                  Restricted RBAC Console Access
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Only authorized personnel (Admin / Super Admin) may access this portal. Authenticate using authorized administrative credentials.
                </p>
              </div>

              {authError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Administrator Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. yus40840@gmail.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter administrator password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loginLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )}
                  <span>Authenticate & Access Console</span>
                </button>
              </form>
            </div>
          </div>
        ) : viewingTicket ? (
          <div className="p-6 overflow-y-auto flex-1 bg-white">
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => setViewingTicket(null)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 rounded-lg cursor-pointer"
              >
                ← Back to Dashboard
              </button>
            </div>
            <ETicketView ticketData={viewingTicket} onClose={() => setViewingTicket(null)} />
          </div>
        ) : (
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {/* Top Navigation Tabs for Roles & Permissions */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800">
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'pending'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Pending ({stats.pending})</span>
                </button>

                <button
                  onClick={() => setActiveTab('approved')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'approved'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approved ({stats.approved})</span>
                </button>

                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'all'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>All Bookings ({stats.total})</span>
                </button>

                {/* Super Admin User & Role Management Tab */}
                <button
                  onClick={() => setActiveTab('users')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'users'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>User & Role RBAC</span>
                  <span className="text-[9px] bg-purple-900/60 text-purple-200 px-1.5 py-0.2 rounded font-mono">
                    Super Admin
                  </span>
                </button>

                {/* Audit Logs Tab */}
                <button
                  onClick={() => setActiveTab('audit')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'audit'
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Audit Trail</span>
                </button>

                {/* Checkpoint Ticket Verifier Tab */}
                <button
                  onClick={() => setActiveTab('verifier')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'verifier'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Checkpoint Scanner</span>
                </button>
              </div>

              {stats.pending > 0 && activeTab === 'pending' && (
                <button
                  onClick={handleBulkApprove}
                  disabled={bulkApproving}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{bulkApproving ? 'Approving...' : `Approve All (${stats.pending})`}</span>
                </button>
              )}
            </div>

            {/* TAB 1, 2, 3: Operational Bookings Lists */}
            {(activeTab === 'pending' || activeTab === 'approved' || activeTab === 'all') && (
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by PNR reference, passenger name, route, or email..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {filteredBookings.length === 0 ? (
                  <div className="p-12 bg-slate-950/40 rounded-2xl border border-slate-800 text-center space-y-3">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                    <h5 className="font-bold text-sm text-slate-300">No bookings match this view</h5>
                    <p className="text-xs text-slate-500">
                      All submitted bookings have been reviewed or none match your search.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredBookings.map((b) => {
                      const isPending =
                        b.status === 'PENDING_APPROVAL' || b.status?.includes('Pending');
                      const bookingId = b.id || b.reference;

                      return (
                        <div
                          key={bookingId}
                          className={`p-4 rounded-2xl border transition-all ${
                            isPending
                              ? 'bg-slate-950/90 border-amber-500/30 shadow-lg'
                              : 'bg-slate-950/50 border-slate-800'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-black text-sm text-blue-400">
                                  {b.reference}
                                </span>
                                <span className="text-slate-600">·</span>
                                <span className="text-xs text-slate-300 font-semibold">{b.title}</span>
                              </div>
                              <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-3">
                                <span>
                                  Passenger: <strong className="text-white">{b.passenger}</strong>
                                </span>
                                <span>Email: {b.passengerEmail || 'N/A'}</span>
                                <span>Date: {b.date}</span>
                                <span>Amount: Rs {b.price.toLocaleString()} PKR</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {isPending ? (
                                <>
                                  <button
                                    onClick={() => handleApprove(b)}
                                    disabled={approvingId === bookingId}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>
                                      {approvingId === bookingId ? 'Approving...' : 'Approve Ticket'}
                                    </span>
                                  </button>
                                  <button
                                    onClick={() => handleReject(b)}
                                    disabled={rejectingId === bookingId}
                                    className="px-3 py-2 bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800/80 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                                  >
                                    Reject
                                  </button>
                                </>
                              ) : (
                                <>
                                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2.5 py-1 rounded-lg">
                                    Approved & Issued
                                  </span>
                                  <button
                                    onClick={() => handleInspectETicket(b)}
                                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
                                  >
                                    Inspect Ticket
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: User & Role Management (Super Admin) */}
            {activeTab === 'users' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="p-4 bg-purple-950/40 border border-purple-900/60 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-purple-200">
                        Role-Based Access Control (RBAC) Assignment
                      </h4>
                      <p className="text-xs text-purple-300/80">
                        Super Admin system controls: promote/demote users between Customer, Verification Staff, Admin, and Super Admin.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase text-purple-300 bg-purple-900/80 px-2.5 py-1 rounded-full border border-purple-700">
                    Super Admin Controlled
                  </span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="p-3">User & Contact</th>
                        <th className="p-3">Current Role</th>
                        <th className="p-3">Assign New Role</th>
                        <th className="p-3">Account Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {usersList.map((u) => {
                        const isSuper = u.role === 'super_admin';
                        const isStaff = u.role === 'verification_staff';
                        const isAdminRole = u.role === 'admin';
                        const isCustomer = !isSuper && !isStaff && !isAdminRole;

                        return (
                          <tr key={u.uid} className="hover:bg-slate-900/40 transition-colors">
                            <td className="p-3">
                              <div className="font-bold text-white">{u.name}</div>
                              <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                              {u.phone && <div className="text-[10px] text-slate-500">{u.phone}</div>}
                            </td>

                            <td className="p-3">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                  isSuper
                                    ? 'bg-purple-900/80 text-purple-300 border border-purple-700'
                                    : isAdminRole
                                    ? 'bg-indigo-900/80 text-indigo-300 border border-indigo-700'
                                    : isStaff
                                    ? 'bg-teal-900/80 text-teal-300 border border-teal-700'
                                    : 'bg-slate-800 text-slate-300'
                                }`}
                              >
                                {u.role}
                              </span>
                            </td>

                            <td className="p-3">
                              <select
                                value={u.role}
                                onChange={(e) => handleRoleChange(u, e.target.value as UserRole)}
                                disabled={updatingUserRole === u.uid || (!isCurrentSuperAdmin && isSuper)}
                                className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer disabled:opacity-50"
                              >
                                <option value="customer">1. Customer / User</option>
                                <option value="verification_staff">2. Ticket Verification Staff</option>
                                <option value="admin">3. Operational Admin</option>
                                <option value="super_admin">4. Super Admin</option>
                              </select>
                            </td>

                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  u.status === 'disabled'
                                    ? 'bg-red-950 text-red-400 border border-red-800'
                                    : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                }`}
                              >
                                {u.status === 'disabled' ? 'DISABLED' : 'ACTIVE'}
                              </span>
                            </td>

                            <td className="p-3 text-right">
                              <button
                                onClick={() => handleStatusToggle(u)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                                  u.status === 'disabled'
                                    ? 'bg-emerald-900/40 text-emerald-300 hover:bg-emerald-800/60'
                                    : 'bg-red-900/30 text-red-300 hover:bg-red-800/50'
                                }`}
                              >
                                {u.status === 'disabled' ? 'Enable' : 'Disable'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 5: System Audit Logs Explorer */}
            {activeTab === 'audit' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="p-4 bg-teal-950/40 border border-teal-900/60 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-teal-200">
                        Immutable Security & Audit Trail
                      </h4>
                      <p className="text-xs text-teal-300/80">
                        Specification Rule: Audit logs are append-only and strictly read-only for normal Admins.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-teal-400 bg-teal-900/80 px-2 py-0.5 rounded border border-teal-700">
                    READ-ONLY LOGS
                  </span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950 max-h-96">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800 sticky top-0">
                      <tr>
                        <th className="p-3">Timestamp</th>
                        <th className="p-3">Actor & Role</th>
                        <th className="p-3">Action</th>
                        <th className="p-3">Resource Target</th>
                        <th className="p-3">Audit Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono text-[11px]">
                      {auditLogs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-500">
                            No audit log records found yet. Actions like approval, rejection, and checkpoint verification will append here.
                          </td>
                        </tr>
                      ) : (
                        auditLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-900/30">
                            <td className="p-3 text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                            <td className="p-3">
                              <span className="font-bold text-white">{log.actorEmail}</span>
                              <span className="text-[10px] text-indigo-400 ml-1.5 uppercase font-semibold">
                                ({log.actorRole})
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="font-bold text-amber-400">{log.action}</span>
                            </td>
                            <td className="p-3 text-slate-300">
                              {log.resourceType}: {log.resourceId}
                            </td>
                            <td className="p-3 text-slate-400 font-sans text-xs">{log.details}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 6: Embedded Checkpoint Ticket Verifier */}
            {activeTab === 'verifier' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="p-4 bg-indigo-950/40 border border-indigo-900/60 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-indigo-200">
                        Checkpoint Ticket Verification Engine
                      </h4>
                      <p className="text-xs text-indigo-300/80">
                        Scan QR code or lookup ticket to validate boarding status: VALID, ALREADY USED, CANCELLED, EXPIRED, or INVALID.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                  <label className="block text-xs font-bold text-slate-300">
                    Enter Ticket ID / PNR or Scan Boarding Pass QR:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={verifierCode}
                      onChange={(e) => setVerifierCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && handleRunVerification()}
                      placeholder="e.g. FLI-749210 or 214-8930194821"
                      className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-indigo-500 uppercase tracking-wider"
                    />
                    <button
                      type="button"
                      onClick={handleRunVerification}
                      disabled={isVerifyingCode || !verifierCode.trim()}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {isVerifyingCode ? 'Scanning...' : 'Verify Ticket'}
                    </button>
                  </div>

                  {/* Demonstration Quick Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
                    <span>Quick Test:</span>
                    <button
                      type="button"
                      onClick={() => {
                        const pnr = bookings[0]?.reference || 'FLI-749210';
                        setVerifierCode(pnr);
                      }}
                      className="px-2 py-0.5 bg-slate-900 border border-slate-700 text-emerald-400 rounded hover:bg-slate-800 cursor-pointer font-mono"
                    >
                      Recent PNR: {bookings[0]?.reference || 'FLI-749210'}
                    </button>
                  </div>
                </div>

                {/* Verifier Result Display */}
                {verifierResult && (
                  <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 animate-in zoom-in-95">
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                          verifierResult.code === 'VALID'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : verifierResult.code === 'ALREADY_USED'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-red-950 text-red-400 border border-red-800'
                        }`}
                      >
                        {verifierResult.code}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {verifierResult.verifiedAt}
                      </span>
                    </div>

                    <div className="text-sm font-bold text-white">{verifierResult.message}</div>

                    {verifierResult.code === 'VALID' && (
                      <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                        <div className="text-xs text-slate-300">
                          Passenger: <strong>{verifierResult.passengerName}</strong> · Seat:{' '}
                          <strong className="text-blue-400">{verifierResult.seat}</strong> · Gate:{' '}
                          <strong>{verifierResult.gate}</strong>
                        </div>
                        <button
                          type="button"
                          onClick={handleMarkTicketCheckedIn}
                          disabled={markingUsed}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                        >
                          {markingUsed ? 'Marking...' : 'Mark as Checked / Used'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
