# Fligh.com Serverless Firebase Cloud Functions

Serverless event-driven functions that automatically send email notifications directly to **`yus40840@gmail.com`** on Firestore database events.

---

## 1. Triggers Implemented

### `onBookingCreated`
- **Event**: Fires on `onDocumentCreated` for `bookings/{bookingId}` in Firestore database `ai-studio-flightfinder-2f58eb91-4f56-4af9-a559-be002f9e2f22`.
- **Recipient**: `yus40840@gmail.com`.
- **Action**: Generates and sends a rich HTML and plaintext email containing:
  - 6-character PNR reference & booking ID
  - Passenger full name & CNIC / Passport number
  - Contact email and phone number
  - Flight route / itinerary and total price in PKR
  - Direct 1-click Admin Authorization Link with secure token.
- **Audit**: Writes execution status to `/email_notifications` in Firestore.

### `onBookingStatusChanged`
- **Event**: Fires on `onDocumentUpdated` for `bookings/{bookingId}` whenever `before.data().status !== after.data().status`.
- **Recipient**: `yus40840@gmail.com`.
- **Action**: Sends a status change notification (`[PENDING_APPROVAL -> APPROVED]`, `[CANCELLED]`, etc.).
  - When approved: includes the issued 13-digit IATA E-Ticket number and confirms boarding barcode issuance.

### `sendBookingNotificationWebhook`
- **Event**: HTTPS onRequest callable endpoint for manual or API-driven email dispatch.

---

## 2. Configuration & Environment Variables

The function uses sensible defaults and automatically supports custom SMTP or Gmail App Passwords:

```bash
ADMIN_EMAIL=yus40840@gmail.com
APP_BASE_URL=https://ais-pre-4oruh77ctauurwmvhpwxku-415584177799.asia-southeast1.run.app
FIRESTORE_DATABASE_ID=ai-studio-flightfinder-2f58eb91-4f56-4af9-a559-be002f9e2f22

# Optional Production SMTP (e.g. SendGrid, Mailgun, Amazon SES, or Gmail):
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

---

## 3. Build & Deployment

To build:
```bash
npm --prefix functions run build
```

To deploy to Firebase:
```bash
firebase deploy --only functions
```
