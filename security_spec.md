# Fligh.com Security Specification & Hardened Rules TDD

## 1. Data Invariants
1. **User Identity Invariant**: A user document at `/users/{userId}` can only be read or written by the authenticated user whose `request.auth.uid == userId` or an authorized administrator (`ramshaskhaikh544@gmail.com` or `yus40840@gmail.com`).
2. **Role Elevation Protection**: A standard user cannot self-assign `role: "admin"` during user creation or updates.
3. **Booking Author Identity**: A booking at `/bookings/{bookingId}` must have `userId == request.auth.uid`. A user cannot forge another user's `userId`.
4. **Approval State Gating**: Initial bookings created by users must have `status: 'PENDING_APPROVAL'`. A standard user cannot create a pre-approved ticket (`status: 'APPROVED'`).
5. **Approval Authority**: Status transitions to `APPROVED` or `REJECTED` are strictly reserved for admins (`yus40840@gmail.com`, `ramshaskhaikh544@gmail.com`) or approval token matching.
6. **Immutability of Audit Trails**: `userId`, `createdAt`, `reference`, and `eTicketNumber` can never be modified once created.
7. **Temporal Integrity**: `createdAt` and `updatedAt` must be valid timestamps (`request.time`).
8. **Volumetric Boundaries**: String fields like `passenger`, `title`, `passportOrCnic` must respect bounds (max lengths).

---

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Payload 1 (Self-Assigned Admin)**: User creates `/users/user123` with `{ "id": "user123", "role": "admin" }` to escalate privilege.
2. **Payload 2 (Ghost Field Injection)**: User injects unvalidated `{ "isSystemSuperuser": true }` into user document.
3. **Payload 3 (Impersonated Booking Author)**: User `userA` attempts to submit a booking document with `userId: "userB"`.
4. **Payload 4 (Auto-Approved Ticket Bypass)**: Standard user submits a new booking with `status: "APPROVED"` to bypass admin approval.
5. **Payload 5 (Unapproved Status Mutation)**: Standard passenger attempts to change their own booking status from `PENDING_APPROVAL` to `APPROVED`.
6. **Payload 6 (Oversized Denial-of-Wallet Payload)**: Attacker sends a 500KB string in `title` or `passenger` to cause storage exhaustion.
7. **Payload 7 (Path Traversal / Malformed Document ID)**: Attacker uses document ID `../../../etc/passwd` or non-alphanumeric junk.
8. **Payload 8 (Unauthorized Booking Modification)**: Passenger `userA` attempts to delete or overwrite `userB`'s confirmed booking.
9. **Payload 9 (Unauthenticated Booking Write)**: Unauthenticated visitor attempts to write to `/bookings/`.
10. **Payload 10 (Timestamp Backdating)**: Attacker passes a backdated timestamp `createdAt: "1999-01-01T00:00:00Z"` instead of `request.time`.
11. **Payload 11 (Price Tampering on Update)**: Passenger attempts to reduce `price` from 168000 to 0 on an existing booking.
12. **Payload 12 (Admin PII Snooping)**: Non-admin user attempts a blanket list query across all user profiles without filtering to their own UID.

---

## 3. Test Runner Definition (`firestore.rules.test.ts`)
The test runner validates that each of the Dirty Dozen payloads triggers `PERMISSION_DENIED` and that legitimate user actions succeed.
