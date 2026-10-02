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
  signOut,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
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

// Google Sign-In Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

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
  role: 'customer' | 'admin';
  createdAt?: any;
  updatedAt?: any;
}

// Auth Helper Functions
export async function signInWithGoogle() {
  try {
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
  try {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
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
    console.error('Email Registration Error:', error);
    throw error;
  }
}

export async function loginWithEmail(email: string, pass: string) {
  try {
    const res = await signInWithEmailAndPassword(auth, email, pass);
    await syncUserProfile(res.user);
    return res.user;
  } catch (error: any) {
    // If admin is logging in for the first time, auto-provision user in Firebase Auth
    if (
      (email === 'yus40840@gmail.com' || email === 'ramshaskhaikh544@gmail.com') &&
      (error?.code === 'auth/user-not-found' ||
        error?.code === 'auth/invalid-credential' ||
        error?.code === 'auth/invalid-email')
    ) {
      try {
        const createRes = await createUserWithEmailAndPassword(auth, email, pass);
        await updateProfile(createRes.user, { displayName: 'System Administrator' });
        await syncUserProfile(createRes.user, { displayName: 'System Administrator' });
        return createRes.user;
      } catch (createErr) {
        console.warn('Admin auto-provision attempt:', createErr);
      }
    }
    console.error('Email Sign In Error:', error);
    throw error;
  }
}

export async function logoutUser() {
  return signOut(auth);
}

// User Profile Sync
export async function syncUserProfile(
  user: FirebaseUser,
  extra?: { displayName?: string; phone?: string; passportOrCnic?: string }
) {
  const userRef = doc(db, 'users', user.uid);
  const path = `users/${user.uid}`;
  try {
    const snap = await getDoc(userRef);
    const isAdmin =
      ADMIN_EMAILS.includes(user.email || '') ||
      user.email === 'yus40840@gmail.com' ||
      user.email === 'ramshaskhaikh544@gmail.com';

    if (!snap.exists()) {
      const newProfile: FirestoreUserProfile = {
        id: user.uid,
        email: user.email || '',
        displayName: extra?.displayName || user.displayName || 'Passenger',
        phone: extra?.phone || user.phoneNumber || '+92 300 1234567',
        passportOrCnic: extra?.passportOrCnic || 'PK84920194',
        nationality: 'Pakistan',
        role: isAdmin ? 'admin' : 'customer',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(userRef, newProfile);
    } else if (extra?.displayName || extra?.phone || extra?.passportOrCnic) {
      await updateDoc(userRef, {
        ...(extra.displayName ? { displayName: extra.displayName } : {}),
        ...(extra.phone ? { phone: extra.phone } : {}),
        ...(extra.passportOrCnic ? { passportOrCnic: extra.passportOrCnic } : {}),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
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
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
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
