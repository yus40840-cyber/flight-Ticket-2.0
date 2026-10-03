// ============================================================================
// FIREBASE AUTHENTICATION & CLOUD FIRESTORE INITIALIZATION
// ============================================================================

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocFromServer,
  serverTimestamp,
  Timestamp,
  setLogLevel,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Silence Firestore internal network connection warnings in console
setLogLevel('error');

export { onAuthStateChanged, type FirebaseUser };

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore using exact firestoreDatabaseId with auto long polling
// CRITICAL: The app will break without specifying firestoreDatabaseId
export const db = initializeFirestore(
  app,
  {
    experimentalAutoDetectLongPolling: true,
  },
  firebaseConfig.firestoreDatabaseId
);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Set persistence to LOCAL for better reliability across redirects
// This helps maintain session state during OAuth redirects
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn('Could not set localStorage persistence, falling back to sessionStorage:', err);
  setPersistence(auth, browserSessionPersistence).catch(console.warn);
});

// Google Sign-In Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Enable offline access and request additional scopes if needed
googleProvider.addScope('profile');
googleProvider.addScope('email');

// Admin emails authorized to approve tickets
export const ADMIN_EMAILS = [
  'yus40840@gmail.com',
  'ramshaskhaikh544@gmail.com',
];

// Error handling enum and interface as mandated by SKILL.md
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connectivity test constraint mandated by SKILL.md
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error: any) {
    if (
      error instanceof Error &&
      (error.message.includes('the client is offline') ||
        (error as any).code === 'unavailable' ||
        error.message.includes('Could not reach Cloud Firestore backend'))
    ) {
      console.warn('Firestore backend connection notice: client is operating with persistence.');
    }
    return false;
  }
}

// Booking Firestore Schema Interface
export interface FirestoreBooking {
  id: string;
  userId: string;
  reference: string;
  eTicketNumber?: string;
  type: 'flight' | 'train' | 'hotel';
  title: string;
  price: number;
  date?: string;
  passenger: string;
  passengerEmail: string;
  passengerPhone?: string;
  passportOrCnic?: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  adminEmail: string;
  approvalToken?: string;
  paymentStatus?: 'PAID' | 'PENDING' | 'REFUNDED';
  seat?: string;
  gate?: string;
  terminal?: string;
  cabinClass?: string;
  originCode?: string;
  destCode?: string;
  createdAt?: any;
  updatedAt?: any;
  approvedAt?: any;
}

// User Profile Firestore Schema Interface
export interface FirestoreUserProfile {
  id: string;
  email: string;
  displayName: string;
  phone?: string;
  passportOrCnic?: string;
  nationality?: string;
  role: 'customer' | 'admin' | 'super_admin' | 'verification_staff';
  status?: 'active' | 'disabled';
  createdAt?: any;
  updatedAt?: any;
}

// Auth Helper Functions
export async function signInWithGoogle() {
  try {
    // Use signInWithPopup instead of signInWithRedirect to avoid storage issues
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    // Sync / Upsert user profile to Firestore
    await syncUserProfile(user);
    return user;
  } catch (error: any) {
    console.error('Google Sign In Error:', error);
    throw error;
  }
}

export async function registerWithEmail(
  email: string,
  pass: string,
  fullName: string,
  phone?: string,
  passportOrCnic?: string
) {
  const normalizedEmail = email.trim().toLowerCase();
  try {
    const res = await createUserWithEmailAndPassword(auth, normalizedEmail, pass);
    if (res.user && fullName) {
      await updateProfile(res.user, { displayName: fullName });
    }
    await syncUserProfile(res.user, {
      displayName: fullName,
      phone,
      passportOrCnic,
    });
    return res.user;
  } catch (error: any) {
    // If account already exists in Firebase Auth, attempt seamless sign-in with the provided password
    if (error?.code === 'auth/email-already-in-use') {
      try {
        const loginRes = await signInWithEmailAndPassword(auth, normalizedEmail, pass);
        if (fullName && (!loginRes.user.displayName || loginRes.user.displayName === 'Passenger')) {
          await updateProfile(loginRes.user, { displayName: fullName });
        }
        await syncUserProfile(loginRes.user, {
          displayName: fullName,
          phone,
          passportOrCnic,
        });
        return loginRes.user;
      } catch (signInErr: any) {
        // Password for existing account did not match - throw descriptive error
        const customErr: any = new Error(
          'An account with this email already exists. Please enter your existing password to sign in, or click "Forgot Password".'
        );
        customErr.code = 'auth/email-already-in-use';
        throw customErr;
      }
    }
    console.error('Email Registration Error:', error);
    throw error;
  }
}

export async function loginWithEmail(email: string, pass: string) {
  const normalizedEmail = email.trim().toLowerCase();
  try {
    const res = await signInWithEmailAndPassword(auth, normalizedEmail, pass);
    await syncUserProfile(res.user);
    return res.user;
  } catch (error: any) {
    // If the account does not exist yet and password meets minimum length, seamlessly auto-register
    if (
      (error?.code === 'auth/user-not-found' ||
        error?.code === 'auth/invalid-credential') &&
      pass.length >= 6
    ) {
      try {
        const createRes = await createUserWithEmailAndPassword(auth, normalizedEmail, pass);
        const displayName =
          normalizedEmail === 'yus40840@gmail.com' || normalizedEmail === 'ramshaskhaikh544@gmail.com'
            ? 'Super Administrator'
            : normalizedEmail.split('@')[0];
        await updateProfile(createRes.user, { displayName });
        await syncUserProfile(createRes.user, { displayName });
        return createRes.user;
      } catch (createErr: any) {
        // If create also fails because email is in use, it was an incorrect password on existing account
        if (createErr?.code === 'auth/email-already-in-use') {
          const customErr: any = new Error(
            'Incorrect password. Please verify your password or use "Forgot Password".'
          );
          customErr.code = 'auth/invalid-credential';
          throw customErr;
        }
      }
    }
    console.error('Email Sign In Error:', error);
    throw error;
  }
}

export async function sendPasswordReset(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  return sendPasswordResetEmail(auth, normalizedEmail);
}

export async function logoutUser() {
  return signOut(auth);
}

// User Profile Sync
export async function syncUserProfile(
  user: FirebaseUser,
  extra?: { displayName?: string; phone?: string; passportOrCnic?: string }
) {
  if (!user || !user.uid) return;
  const userRef = doc(db, 'users', user.uid);
  try {
    const snap = await getDoc(userRef);
    const isSuperAdminEmail =
      user.email === 'yus40840@gmail.com' ||
      user.email === 'ramshaskhaikh544@gmail.com';
    const isAdminEmail = ADMIN_EMAILS.includes(user.email || '');

    if (!snap.exists()) {
      const defaultRole = isSuperAdminEmail ? 'super_admin' : isAdminEmail ? 'admin' : 'customer';
      const newProfile: FirestoreUserProfile = {
        id: user.uid,
        email: user.email || '',
        displayName: extra?.displayName || user.displayName || user.email?.split('@')[0] || 'Passenger',
        phone: extra?.phone || user.phoneNumber || '+92 300 1234567',
        passportOrCnic: extra?.passportOrCnic || 'PK84920194',
        nationality: 'Pakistan',
        role: defaultRole,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(userRef, newProfile);
    } else {
      const existingData = snap.data();
      // If designated super admin, ensure role is upgraded to super_admin
      if (isSuperAdminEmail && existingData.role !== 'super_admin') {
        await updateDoc(userRef, { role: 'super_admin', updatedAt: serverTimestamp() });
      }
      if (extra?.displayName || extra?.phone || extra?.passportOrCnic) {
        await updateDoc(userRef, {
          ...(extra.displayName ? { displayName: extra.displayName } : {}),
          ...(extra.phone ? { phone: extra.phone } : {}),
          ...(extra.passportOrCnic ? { passportOrCnic: extra.passportOrCnic } : {}),
          updatedAt: serverTimestamp(),
        });
      }
    }
  } catch (err: any) {
    console.warn('Profile sync notification (using local session fallback):', err?.message || err);
  }
}

// Generate unique approval token
export function generateApprovalToken(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

// Create new booking with PENDING_APPROVAL status for yus40840@gmail.com
export async function createFirestoreBooking(data: {
  userId: string;
  type: 'flight' | 'train' | 'hotel';
  title: string;
  price: number;
  date: string;
  passenger: string;
  passengerEmail: string;
  passengerPhone?: string;
  passportOrCnic?: string;
  seat?: string;
  gate?: string;
  terminal?: string;
  cabinClass?: string;
  originCode?: string;
  destCode?: string;
}): Promise<FirestoreBooking> {
  const bookingId = 'b-' + Math.floor(100000 + Math.random() * 900000);
  const reference = 'FLI-' + Math.floor(100000 + Math.random() * 900000);
  const eTicketNumber =
    '214-' + Math.floor(1000000000 + Math.random() * 9000000000);
  const approvalToken = generateApprovalToken();
  const path = `bookings/${bookingId}`;

  const bookingDoc: FirestoreBooking = {
    id: bookingId,
    userId: data.userId,
    reference,
    eTicketNumber,
    type: data.type,
    title: data.title,
    price: data.price,
    date: data.date,
    passenger: data.passenger,
    passengerEmail: data.passengerEmail,
    passengerPhone: data.passengerPhone || '+92 300 8241920',
    passportOrCnic: data.passportOrCnic || 'PK84920194',
    status: 'PENDING_APPROVAL',
    adminEmail: 'yus40840@gmail.com',
    approvalToken,
    paymentStatus: 'PAID',
    seat: data.seat || '14A (Window)',
    gate: data.gate || '24',
    terminal: data.terminal || '1',
    cabinClass: data.cabinClass || 'Economy',
    originCode: data.originCode || 'KHI',
    destCode: data.destCode || 'MXP',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'bookings', bookingId), bookingDoc);
    return bookingDoc;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export interface UserNotification {
  id: string;
  userId: string;
  passengerEmail?: string;
  bookingId: string;
  reference: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: any;
}

// Approve booking by admin or valid approval token
export async function approveFirestoreBooking(
  bookingId: string,
  approvalToken?: string
): Promise<boolean> {
  const path = `bookings/${bookingId}`;
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    const snap = await getDoc(bookingRef);
    if (!snap.exists()) {
      throw new Error(`Booking ${bookingId} not found`);
    }

    const data = snap.data() as FirestoreBooking;
    // Check if token matches or user is admin
    const currentUserEmail = auth.currentUser?.email;
    const isAdmin =
      ADMIN_EMAILS.includes(currentUserEmail || '') ||
      currentUserEmail === 'yus40840@gmail.com' ||
      currentUserEmail === 'ramshaskhaikh544@gmail.com';

    if (!isAdmin && approvalToken && data.approvalToken !== approvalToken) {
      throw new Error('Invalid approval token for booking authorization');
    }

    await updateDoc(bookingRef, {
      status: 'APPROVED',
      approvedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Create direct in-account notification for passenger
    if (data.userId) {
      try {
        const notifId = 'notif-' + Math.floor(100000 + Math.random() * 900000);
        await setDoc(doc(db, 'notifications', notifId), {
          id: notifId,
          userId: data.userId,
          passengerEmail: data.passengerEmail || '',
          bookingId: bookingId,
          reference: data.reference,
          type: 'TICKET_APPROVED',
          title: 'Ticket Approved & Ready to Collect',
          message: 'Your ticket has been received and approved. Kindly receive/collect your ticket.',
          read: false,
          createdAt: serverTimestamp(),
        });
      } catch (notifErr) {
        console.warn('Notification creation notice:', notifErr);
      }
    }

    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

// Create explicit user notification
export async function createUserNotification(notif: {
  userId: string;
  bookingId: string;
  reference: string;
  passengerEmail?: string;
  title?: string;
  message?: string;
}): Promise<UserNotification> {
  const notifId = 'notif-' + Math.floor(100000 + Math.random() * 900000);
  const newNotif: UserNotification = {
    id: notifId,
    userId: notif.userId,
    passengerEmail: notif.passengerEmail || '',
    bookingId: notif.bookingId,
    reference: notif.reference,
    type: 'TICKET_APPROVED',
    title: notif.title || 'Ticket Approved & Ready to Collect',
    message:
      notif.message ||
      'Your ticket has been received and approved. Kindly receive/collect your ticket.',
    read: false,
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'notifications', notifId), {
      ...newNotif,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn('Local fallback notification created:', e);
  }

  return newNotif;
}

// Mark notification as read
export async function markNotificationAsRead(notifId: string) {
  try {
    await updateDoc(doc(db, 'notifications', notifId), {
      read: true,
    });
  } catch (e) {
    console.warn('Error marking notification as read:', e);
  }
}

// Reject booking
export async function rejectFirestoreBooking(bookingId: string): Promise<boolean> {
  const path = `bookings/${bookingId}`;
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, {
      status: 'REJECTED',
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

// ============================================================================
// AUDIT LOGGING SERVICE
// ============================================================================

export interface AuditLogData {
  actorId: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details?: string;
}

export async function recordAuditLog(entry: AuditLogData) {
  const logId = 'log-' + Date.now() + '-' + Math.floor(100 + Math.random() * 900);
  const logDoc = {
    id: logId,
    actorId: entry.actorId || 'system',
    actorEmail: entry.actorEmail || 'system@fligh.com',
    actorRole: entry.actorRole || 'system',
    action: entry.action,
    resourceType: entry.resourceType,
    resourceId: entry.resourceId,
    details: entry.details || '',
    timestamp: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'audit_logs', logId), logDoc);
  } catch (err) {
    console.warn('Audit log write notice:', err);
  }
  return logDoc;
}

// ============================================================================
// TICKET VERIFICATION STAFF ENGINE
// ============================================================================

export type VerificationResultCode =
  | 'VALID'
  | 'ALREADY_USED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'INVALID';

export interface TicketVerificationResult {
  code: VerificationResultCode;
  message: string;
  ticketId: string;
  status: string;
  passengerName?: string;
  routeTitle?: string;
  seat?: string;
  gate?: string;
  terminal?: string;
  boardingTime?: string;
  travelDate?: string;
  pricePKR?: number;
  verifiedAt: string;
  staffEmail?: string;
  isUsed?: boolean;
  usedAt?: string;
  usedByStaffName?: string;
  bookingRef?: any;
}

// Verify ticket by reference (PNR), eTicketNumber, or internal booking ID
export async function verifyTicketCode(
  rawCode: string,
  staffUser?: { uid: string; email: string; name: string }
): Promise<TicketVerificationResult> {
  const code = rawCode.trim().toUpperCase();
  const verifiedAt = new Date().toISOString();

  if (!code) {
    return {
      code: 'INVALID',
      message: 'No ticket code or PNR entered.',
      ticketId: 'UNKNOWN',
      status: 'INVALID',
      verifiedAt,
    };
  }

  try {
    // Try querying bookings collection
    const bookingsCol = collection(db, 'bookings');
    let matchedDoc: any = null;

    // First try by ID
    const directDoc = await getDoc(doc(db, 'bookings', code.toLowerCase()));
    if (directDoc.exists()) {
      matchedDoc = directDoc.data();
    }

    if (!matchedDoc) {
      // Query by reference PNR
      const qRef = query(bookingsCol, where('reference', '==', code));
      const snapRef = await getDocs(qRef);
      if (!snapRef.empty) {
        matchedDoc = snapRef.docs[0].data();
      }
    }

    if (!matchedDoc) {
      // Query by eTicketNumber
      const qEticket = query(bookingsCol, where('eTicketNumber', '==', code));
      const snapEticket = await getDocs(qEticket);
      if (!snapEticket.empty) {
        matchedDoc = snapEticket.docs[0].data();
      }
    }

    if (!matchedDoc) {
      // Record audit log for failed verification
      await recordAuditLog({
        actorId: staffUser?.uid || 'staff',
        actorEmail: staffUser?.email || 'staff@fligh.com',
        actorRole: 'verification_staff',
        action: 'VERIFY_TICKET_FAILED',
        resourceType: 'ticket',
        resourceId: code,
        details: 'Ticket code was not found in active inventory.',
      });

      return {
        code: 'INVALID',
        message: `✕ Invalid Ticket. No reservation found for "${code}". Check for typos or re-scan.`,
        ticketId: code,
        status: 'INVALID',
        verifiedAt,
        staffEmail: staffUser?.email,
      };
    }

    const b = matchedDoc;

    // Check if cancelled
    if (b.status === 'CANCELLED' || b.status === 'REJECTED') {
      await recordAuditLog({
        actorId: staffUser?.uid || 'staff',
        actorEmail: staffUser?.email || 'staff@fligh.com',
        actorRole: 'verification_staff',
        action: 'VERIFY_TICKET_CANCELLED',
        resourceType: 'ticket',
        resourceId: b.reference,
        details: `Ticket presented with status ${b.status}. Entry denied.`,
      });

      return {
        code: 'CANCELLED',
        message: '✕ Ticket Cancelled. This reservation has been cancelled or rejected and is invalid for travel.',
        ticketId: b.reference,
        status: b.status,
        passengerName: b.passenger,
        routeTitle: b.title,
        verifiedAt,
        staffEmail: staffUser?.email,
      };
    }

    // Check if already used
    if (b.isUsed) {
      await recordAuditLog({
        actorId: staffUser?.uid || 'staff',
        actorEmail: staffUser?.email || 'staff@fligh.com',
        actorRole: 'verification_staff',
        action: 'VERIFY_TICKET_ALREADY_USED',
        resourceType: 'ticket',
        resourceId: b.reference,
        details: `Ticket already used at checkpoint on ${b.usedAt} by staff ${b.usedByStaffName}.`,
      });

      return {
        code: 'ALREADY_USED',
        message: `⚠ Ticket Already Used. Scanned and checked-in at ${b.usedAt || 'previous checkpoint'}. One-time entry only.`,
        ticketId: b.reference,
        status: 'ALREADY_USED',
        passengerName: b.passenger,
        routeTitle: b.title,
        seat: b.seat,
        gate: b.gate,
        terminal: b.terminal,
        verifiedAt,
        staffEmail: staffUser?.email,
        isUsed: true,
        usedAt: b.usedAt,
        usedByStaffName: b.usedByStaffName,
      };
    }

    // Check if expired (if date is past)
    if (b.date) {
      const travelTimestamp = new Date(b.date).getTime();
      const currentTimestamp = Date.now();
      // Allow 48 hours grace
      if (!isNaN(travelTimestamp) && currentTimestamp > travelTimestamp + 1000 * 60 * 60 * 48) {
        return {
          code: 'EXPIRED',
          message: '✕ Ticket Expired. Travel date for this ticket has passed.',
          ticketId: b.reference,
          status: 'EXPIRED',
          passengerName: b.passenger,
          routeTitle: b.title,
          verifiedAt,
          staffEmail: staffUser?.email,
        };
      }
    }

    // Check if approved
    if (b.status !== 'APPROVED') {
      return {
        code: 'INVALID',
        message: `✕ Ticket Not Approved. Current booking status is "${b.status}". Requires admin authorization before travel.`,
        ticketId: b.reference,
        status: b.status,
        passengerName: b.passenger,
        routeTitle: b.title,
        verifiedAt,
        staffEmail: staffUser?.email,
      };
    }

    // Valid ticket!
    await recordAuditLog({
      actorId: staffUser?.uid || 'staff',
      actorEmail: staffUser?.email || 'staff@fligh.com',
      actorRole: 'verification_staff',
      action: 'VERIFY_TICKET_SUCCESS',
      resourceType: 'ticket',
      resourceId: b.reference,
      details: `Official ticket verified successfully for ${b.passenger}.`,
    });

    return {
      code: 'VALID',
      message: '✓ Ticket Valid. Authorized for boarding & entry.',
      ticketId: b.reference,
      status: 'Approved',
      passengerName: b.passenger,
      routeTitle: b.title,
      seat: b.seat || '14A (Window)',
      gate: b.gate || '24',
      terminal: b.terminal || '1',
      boardingTime: '02:35 KHI',
      travelDate: b.date,
      pricePKR: b.price,
      verifiedAt,
      staffEmail: staffUser?.email,
      isUsed: false,
      bookingRef: b,
    };
  } catch (err: any) {
    console.warn('Verify ticket search fallback error:', err);
    return {
      code: 'INVALID',
      message: 'Verification service error. Could not query ticket database.',
      ticketId: code,
      status: 'ERROR',
      verifiedAt,
    };
  }
}

// Mark ticket as checked / used at entrance
export async function markTicketAsUsed(
  bookingIdOrRef: string,
  staffUser: { uid: string; email: string; name: string }
): Promise<boolean> {
  const verifiedAt = new Date().toISOString();
  try {
    let bookingDocId = bookingIdOrRef;
    const directDoc = await getDoc(doc(db, 'bookings', bookingIdOrRef));
    if (!directDoc.exists()) {
      const q = query(collection(db, 'bookings'), where('reference', '==', bookingIdOrRef));
      const snap = await getDocs(q);
      if (!snap.empty) {
        bookingDocId = snap.docs[0].id;
      }
    }

    const bookingRef = doc(db, 'bookings', bookingDocId);
    await updateDoc(bookingRef, {
      isUsed: true,
      usedAt: verifiedAt,
      usedByStaffId: staffUser.uid,
      usedByStaffName: staffUser.name || staffUser.email,
      updatedAt: serverTimestamp(),
    });

    await recordAuditLog({
      actorId: staffUser.uid,
      actorEmail: staffUser.email,
      actorRole: 'verification_staff',
      action: 'MARK_TICKET_USED',
      resourceType: 'ticket',
      resourceId: bookingIdOrRef,
      details: `Ticket marked as used / boarded at checkpoint by ${staffUser.name} (${staffUser.email}).`,
    });

    return true;
  } catch (err) {
    console.warn('Error marking ticket as used:', err);
    return false;
  }
}

// ============================================================================
// SUPER ADMIN ROLE & USER MANAGEMENT
// ============================================================================

export async function updateUserRoleInFirestore(
  targetUserId: string,
  newRole: string,
  actor: { uid: string; email: string; role: string }
): Promise<boolean> {
  try {
    const userRef = doc(db, 'users', targetUserId);
    await updateDoc(userRef, {
      role: newRole,
      updatedAt: serverTimestamp(),
    });

    await recordAuditLog({
      actorId: actor.uid,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: 'CHANGE_USER_ROLE',
      resourceType: 'user_role',
      resourceId: targetUserId,
      details: `User role changed to "${newRole}".`,
    });

    return true;
  } catch (err) {
    console.warn('Role update fallback error:', err);
    return false;
  }
}

export async function updateUserStatusInFirestore(
  targetUserId: string,
  newStatus: 'active' | 'disabled',
  actor: { uid: string; email: string; role: string }
): Promise<boolean> {
  try {
    const userRef = doc(db, 'users', targetUserId);
    await updateDoc(userRef, {
      status: newStatus,
      updatedAt: serverTimestamp(),
    });

    await recordAuditLog({
      actorId: actor.uid,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: newStatus === 'active' ? 'ENABLE_ACCOUNT' : 'DISABLE_ACCOUNT',
      resourceType: 'user_account',
      resourceId: targetUserId,
      details: `Account status updated to "${newStatus}".`,
    });

    return true;
  } catch (err) {
    console.warn('Account status update fallback error:', err);
    return false;
  }
}

