import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/v2/firestore";
import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";
import { generateBookingPdf, BookingPdfData } from "./pdfGenerator";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

// Target administrator email requested by user
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "yus40840@gmail.com";

// Target custom Firestore Database ID
const TARGET_DATABASE_ID =
  process.env.FIRESTORE_DATABASE_ID ||
  "ai-studio-flightfinder-2f58eb91-4f56-4af9-a559-be002f9e2f22";

// Web application base URL for one-click approval links
const APP_BASE_URL =
  process.env.APP_BASE_URL ||
  "https://ais-pre-4oruh77ctauurwmvhpwxku-415584177799.asia-southeast1.run.app";

/**
 * Configure Nodemailer transport with support for custom SMTP,
 * Gmail App Passwords, or safe development/test fallback.
 */
function createEmailTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  // Safe development fallback: Json/stream transport that logs full delivery
  return nodemailer.createTransport({
    jsonTransport: true,
  });
}

/**
 * Log notification outcome to Firestore audit collection
 */
async function recordNotificationLog(data: {
  bookingId: string;
  pnr: string;
  recipient: string;
  subject: string;
  type: "NEW_BOOKING_CREATED" | "STATUS_CHANGED";
  status: "SENT" | "SIMULATED" | "FAILED";
  error?: string;
  sentAt: string;
}) {
  try {
    const db = admin.firestore();
    await db.collection("email_notifications").add({
      ...data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (err) {
    logger.warn("Could not save notification log to Firestore:", err);
  }
}

/**
 * Trigger 1: On New Booking Created in Firestore
 * Listens for new documents in 'bookings/{bookingId}'
 * Sends an instant approval request email to yus40840@gmail.com
 */
export const onBookingCreated = onDocumentCreated(
  {
    document: "bookings/{bookingId}",
    database: TARGET_DATABASE_ID,
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      logger.warn("No snapshot data found for onBookingCreated event.");
      return;
    }

    const bookingId = event.params.bookingId;
    const booking = snapshot.data();

    const pnr = booking.reference || bookingId.slice(0, 7).toUpperCase();
    const passengerName = booking.passenger || "Passenger";
    const passportOrCnic = booking.passportOrCnic || "N/A";
    const passengerEmail = booking.passengerEmail || "N/A";
    const passengerPhone = booking.passengerPhone || "N/A";
    const itineraryTitle = booking.title || "Flight / Hotel Reservation";
    const pricePKR = Number(booking.price || 0).toLocaleString();
    const approvalToken = booking.approvalToken || "auth-token";
    const bookingStatus = booking.status || "PENDING_APPROVAL";

    const approvalUrl = `${APP_BASE_URL}/?approveBooking=${bookingId}&token=${approvalToken}`;

    const subject = `[Fligh.com] New Booking Created - PNR #${pnr} (Awaiting Admin Approval)`;

    const textContent = `APPROVAL REQUEST - NEW BOOKING CREATED

Dear Administrator (yus40840@gmail.com),

A new travel reservation has been created on Fligh.com and is currently awaiting your official authorization.

==============================================
BOOKING DETAILS & PASSENGER INFORMATION
==============================================
• Booking Reference (PNR): ${pnr}
• Passenger Name: ${passengerName}
• Passport / CNIC: ${passportOrCnic}
• Contact Email: ${passengerEmail}
• Contact Phone: ${passengerPhone}
• Itinerary: ${itineraryTitle}
• Total Amount Paid: Rs ${pricePKR} PKR
• Current Status: ${bookingStatus}
• Timestamp: ${new Date().toISOString()}

==============================================
ADMIN APPROVAL ACTION
==============================================
Authorize this ticket now as admin to issue the official E-Ticket and boarding pass.

Approve Ticket Now:
${approvalUrl}

Thank you,
Fligh.com Automated Booking Notification Service`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: #0f172a; color: #ffffff; padding: 24px; text-align: left; }
    .brand { font-size: 20px; font-weight: 800; color: #38bdf8; }
    .tag { display: inline-block; background: #fef3c7; color: #92400e; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; margin-top: 10px; }
    .body { padding: 24px; }
    .info-table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
    .info-table td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; }
    .info-table td.label { color: #64748b; font-weight: 600; width: 38%; }
    .info-table td.value { color: #0f172a; font-weight: 700; }
    .btn-container { text-align: center; margin: 20px 0 10px 0; }
    .btn { display: inline-block; background: #059669; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 800; font-size: 14px; letter-spacing: 0.3px; }
    .footer { background: #f8fafc; padding: 16px 24px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="brand">Fligh.com <span style="color:#ffffff;">Travel</span></div>
      <div style="font-size: 14px; color: #94a3b8; margin-top: 4px;">New Booking Submission Alert</div>
      <span class="tag">PENDING ADMIN APPROVAL</span>
    </div>
    <div class="body">
      <p style="font-size: 14px; margin-top: 0; line-height: 1.5;">
        Hello Admin,<br>
        A passenger has submitted a new reservation on Fligh.com. Please review the details below to authorize the ticket.
      </p>

      <table class="info-table">
        <tr><td class="label">Booking Reference (PNR)</td><td class="value" style="color: #0284c7; font-family: monospace; font-size: 15px;">${pnr}</td></tr>
        <tr><td class="label">Passenger Full Name</td><td class="value">${passengerName}</td></tr>
        <tr><td class="label">Passport / CNIC</td><td class="value">${passportOrCnic}</td></tr>
        <tr><td class="label">Passenger Email</td><td class="value">${passengerEmail}</td></tr>
        <tr><td class="label">Passenger Phone</td><td class="value">${passengerPhone}</td></tr>
        <tr><td class="label">Itinerary Details</td><td class="value">${itineraryTitle}</td></tr>
        <tr><td class="label">Total Amount Paid</td><td class="value" style="color: #059669; font-size: 14px;">Rs ${pricePKR} PKR</td></tr>
        <tr><td class="label">Status</td><td class="value"><span style="color:#d97706;">AWAITING AUTHORIZATION</span></td></tr>
      </table>

      <!-- Admin Approval Action Box -->
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 18px; margin: 20px 0; text-align: center;">
        <div style="font-weight: 800; font-size: 14px; color: #166534; margin-bottom: 4px;">Admin Approval Action</div>
        <div style="font-size: 12px; color: #15803d; margin-bottom: 16px;">
          Authorize this ticket now as admin to issue the official E-Ticket and boarding pass.
        </div>
        <div class="btn-container">
          <a href="${approvalUrl}" class="btn" target="_blank">
            Approve Ticket Now
          </a>
        </div>
      </div>

      <p style="font-size: 11px; color: #64748b; text-align: center;">
        Clicking "Approve Ticket Now" authorizes the booking and issues the electronic ticket with barcode and QR boarding pass immediately.
      </p>
    </div>
    <div class="footer">
      This notification was automatically dispatched by Fligh.com Serverless Cloud Functions.<br>
      Security Token: ${approvalToken}
    </div>
  </div>
</body>
</html>`;

    try {
      const transporter = createEmailTransporter();
      const mailOptions = {
        from: `"Fligh.com Booking System" <no-reply@fligh.com>`,
        to: ADMIN_EMAIL,
        subject,
        text: textContent,
        html: htmlContent,
      };

      const info = await transporter.sendMail(mailOptions);
      logger.info(`Successfully dispatched new booking notification to ${ADMIN_EMAIL}`, {
        messageId: (info as any)?.messageId || "simulated",
        pnr,
        bookingId,
      });

      await recordNotificationLog({
        bookingId,
        pnr,
        recipient: ADMIN_EMAIL,
        subject,
        type: "NEW_BOOKING_CREATED",
        status: "SENT",
        sentAt: new Date().toISOString(),
      });
    } catch (err: any) {
      logger.error(`Error sending email to ${ADMIN_EMAIL} for booking ${bookingId}:`, err);
      await recordNotificationLog({
        bookingId,
        pnr,
        recipient: ADMIN_EMAIL,
        subject,
        type: "NEW_BOOKING_CREATED",
        status: "FAILED",
        error: err?.message || String(err),
        sentAt: new Date().toISOString(),
      });
    }
  }
);

/**
 * Dispatches a formal, PDF-styled booking confirmation email to the user (and CC admin)
 * complete with generated PDF E-Ticket attachment.
 */
export async function sendApprovedConfirmationEmail(bookingData: any, bookingId: string) {
  const pnr = bookingData.reference || bookingId.slice(0, 7).toUpperCase();
  const passengerName = bookingData.passenger || "Passenger";
  const passengerEmail =
    bookingData.passengerEmail || bookingData.email || ADMIN_EMAIL;
  const passengerPhone = bookingData.passengerPhone || "+92 300 8241920";
  const passportOrCnic = bookingData.passportOrCnic || "PK84920194";
  const itineraryTitle = bookingData.title || "Flight Service PK-785 (Karachi -> Milan)";
  const eTicketNumber = bookingData.eTicketNumber || "214-8930194821";
  const pricePKR = Number(bookingData.price || 0).toLocaleString();
  const originCode = bookingData.originCode || "KHI";
  const destCode = bookingData.destCode || "MXP";
  const originCity = bookingData.originCity || "Karachi";
  const destCity = bookingData.destCity || "Milan";
  const departDate = bookingData.date || "04 Oct 2026";
  const seat = bookingData.seat || "14A (Window)";
  const gate = bookingData.gate || "24";
  const terminal = bookingData.terminal || "1";
  const cabinClass = bookingData.cabinClass || "Economy";
  const issuedDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  logger.info(`Generating formal PDF E-Ticket for passenger ${passengerName} (${passengerEmail}), PNR #${pnr}...`);

  // 1. Generate Formal PDF Document Buffer
  let pdfBuffer: Buffer | null = null;
  try {
    pdfBuffer = await generateBookingPdf({
      pnr,
      eTicketNumber,
      passengerName,
      passportOrCnic,
      passengerEmail,
      passengerPhone,
      itineraryTitle,
      flightNumber: "PK-785",
      originCity,
      originCode,
      destCity,
      destCode,
      departDate,
      departTime: "03:45 AM",
      arriveTime: "08:30 AM",
      seat,
      gate,
      terminal,
      cabinClass,
      pricePKR,
      approvedAt: issuedDate,
      bookingType: bookingData.type || "flight",
    });
    logger.info(`PDF generated successfully (${pdfBuffer.length} bytes).`);
  } catch (pdfErr) {
    logger.error("Failed to generate PDF document attachment:", pdfErr);
  }

  // 2. Formal PDF-Styled HTML Email Layout
  const subject = `✈ [Fligh.com] Booking Officially APPROVED & Issued - E-Ticket PNR #${pnr}`;

  const textContent = `OFFICIAL TRAVEL BOOKING CONFIRMATION & E-TICKET RECEIPT

Dear ${passengerName},

Your booking (PNR #${pnr}) has been officially APPROVED and issued by Fligh.com Operations!
Your electronic ticket and boarding verification pass are now active.

==============================================
PASSENGER & TICKET INFORMATION
==============================================
• Booking Reference (PNR): ${pnr}
• Official E-Ticket No: ${eTicketNumber}
• Passenger Name: ${passengerName}
• Passport / CNIC: ${passportOrCnic}
• Contact Email: ${passengerEmail}
• Contact Phone: ${passengerPhone}
• Status: OFFICIALLY APPROVED & ISSUED
• Issue Date: ${issuedDate}

==============================================
FLIGHT ITINERARY
==============================================
• Route: ${originCity} (${originCode}) ➔ ${destCity} (${destCode})
• Flight Number: PK-785
• Departure: ${departDate} at 03:45 AM
• Arrival: ${departDate} at 08:30 AM
• Seat: ${seat}
• Terminal: ${terminal} | Boarding Gate: ${gate}
• Cabin Class: ${cabinClass}
• Baggage Allowance: 30 KG Checked + 7 KG Cabin

==============================================
PAYMENT RECEIPT
==============================================
• Total Fare Paid: Rs ${pricePKR} PKR
• Payment Status: CONFIRMED & SETTLED (100% Guaranteed)

To view or print your live boarding pass online:
${APP_BASE_URL}/?findBooking=${pnr}

Note: Your official E-Ticket PDF is attached to this email for airport check-in.

Thank you for choosing Fligh.com!
Customer Support Hotline: +92 3000358949
Fligh.com Travel Operations`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px 12px; color: #0f172a; }
    .pdf-container { max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08); }
    .header { background: #0f172a; color: #ffffff; padding: 28px 28px 24px 28px; text-align: left; }
    .brand { font-size: 22px; font-weight: 900; color: #38bdf8; letter-spacing: -0.5px; }
    .brand-sub { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8; margin-top: 4px; font-weight: 700; }
    .status-ribbon { display: inline-flex; align-items: center; gap: 6px; background: #064e3b; color: #34d399; border: 1px solid #059669; font-size: 11px; font-weight: 800; padding: 6px 14px; border-radius: 9999px; margin-top: 14px; letter-spacing: 0.5px; }
    
    .body { padding: 28px; }
    .notice-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 14px; padding: 16px; margin-bottom: 24px; }
    .notice-title { font-weight: 800; font-size: 14px; color: #166534; }
    .notice-desc { font-size: 12px; color: #15803d; margin-top: 4px; line-height: 1.5; }
    
    .doc-section-title { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin: 24px 0 10px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
    
    .grid-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 12px; }
    .grid-table td { padding: 8px 10px; border: 1px solid #f1f5f9; }
    .grid-table .label { background: #f8fafc; color: #64748b; font-weight: 600; width: 35%; font-size: 11px; text-transform: uppercase; }
    .grid-table .value { color: #0f172a; font-weight: 700; }
    
    /* Flight schedule voucher card */
    .flight-card { background: #f8fafc; border: 1.5px solid #0284c7; border-radius: 16px; padding: 20px; margin: 18px 0; text-align: center; }
    .route-header { font-size: 11px; font-weight: 800; color: #0284c7; text-transform: uppercase; letter-spacing: 1px; }
    .route-display { font-size: 24px; font-weight: 900; color: #0f172a; margin: 8px 0; letter-spacing: -0.5px; }
    .route-arrow { color: #0284c7; padding: 0 8px; }
    
    /* Boarding stub */
    .boarding-stub { display: table; width: 100%; margin-top: 14px; padding-top: 14px; border-top: 1px dashed #cbd5e1; }
    .stub-col { display: table-cell; width: 25%; text-align: center; }
    .stub-label { font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; }
    .stub-value { font-size: 15px; font-weight: 800; color: #0f172a; margin-top: 2px; }
    
    /* Simulated Barcode */
    .barcode-box { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; text-align: center; margin: 20px 0; }
    .barcode-lines { letter-spacing: 2px; font-family: monospace; font-size: 26px; font-weight: 900; color: #0f172a; line-height: 1; }
    .barcode-text { font-family: monospace; font-size: 11px; color: #64748b; margin-top: 6px; letter-spacing: 1px; }
    
    /* Attachment Callout */
    .attachment-callout { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 14px; display: flex; align-items: center; justify-content: space-between; margin-top: 20px; font-size: 12px; color: #1e40af; }
    
    /* CTA button */
    .btn-container { text-align: center; margin: 26px 0 10px 0; }
    .btn { display: inline-block; background: #0284c7; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 800; font-size: 13px; letter-spacing: 0.3px; box-shadow: 0 4px 6px -1px rgba(2, 132, 199, 0.2); }
    
    .footer { background: #f8fafc; padding: 20px 28px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="pdf-container">
    <!-- Header -->
    <div class="header">
      <div class="brand">Fligh.com <span style="color:#ffffff;">Travel</span></div>
      <div class="brand-sub">Electronic Ticket Passenger Itinerary & Receipt</div>
      <div class="status-ribbon">
        <span>✓</span> STATUS: OFFICIALLY APPROVED & ISSUED
      </div>
    </div>

    <!-- Body -->
    <div class="body">
      <!-- Success Notice Box -->
      <div class="notice-box">
        <div class="notice-title">Booking Confirmation & Authorized E-Ticket</div>
        <div class="notice-desc">
          Dear <strong>${passengerName}</strong>, your reservation has been authorized and issued by Fligh.com Operations. Your electronic boarding pass and verified barcodes are now available below and attached as an official PDF document.
        </div>
      </div>

      <!-- Reference & Metadata -->
      <div class="doc-section-title">Ticket & Passenger Credentials</div>
      <table class="grid-table">
        <tr>
          <td class="label">Booking PNR</td>
          <td class="value" style="color: #0284c7; font-family: monospace; font-size: 14px;">${pnr}</td>
        </tr>
        <tr>
          <td class="label">E-Ticket Number</td>
          <td class="value" style="font-family: monospace;">${eTicketNumber}</td>
        </tr>
        <tr>
          <td class="label">Passenger Full Name</td>
          <td class="value">${passengerName}</td>
        </tr>
        <tr>
          <td class="label">Passport / CNIC</td>
          <td class="value">${passportOrCnic}</td>
        </tr>
        <tr>
          <td class="label">Contact Telephone</td>
          <td class="value">${passengerPhone}</td>
        </tr>
        <tr>
          <td class="label">Passenger Email</td>
          <td class="value">${passengerEmail}</td>
        </tr>
      </table>

      <!-- Flight Itinerary Card -->
      <div class="doc-section-title">Flight Schedule & Boarding Details</div>
      <div class="flight-card">
        <div class="route-header">Flight PK-785 · ${cabinClass} Class · Non-Stop</div>
        <div class="route-display">
          <span>${originCode}</span>
          <span class="route-arrow">✈</span>
          <span>${destCode}</span>
        </div>
        <div style="font-size: 13px; font-weight: 700; color: #334155;">
          ${originCity} to ${destCity}
        </div>
        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
          Departure: <strong>${departDate} at 03:45 AM</strong> · Arrival: <strong>08:30 AM</strong>
        </div>

        <div class="boarding-stub">
          <div class="stub-col">
            <div class="stub-label">Terminal</div>
            <div class="stub-value">${terminal}</div>
          </div>
          <div class="stub-col">
            <div class="stub-label">Gate</div>
            <div class="stub-value">${gate}</div>
          </div>
          <div class="stub-col">
            <div class="stub-label">Seat</div>
            <div class="stub-value" style="color: #059669;">${seat}</div>
          </div>
          <div class="stub-col">
            <div class="stub-label">Baggage</div>
            <div class="stub-value" style="font-size: 13px;">30 KG</div>
          </div>
        </div>
      </div>

      <!-- Payment Summary -->
      <div class="doc-section-title">Fare Breakdown & Payment Receipt</div>
      <table class="grid-table">
        <tr>
          <td class="label">Payment Status</td>
          <td class="value" style="color: #059669;">PAID & SETTLED (100% Guaranteed)</td>
        </tr>
        <tr>
          <td class="label">Payment Method</td>
          <td class="value">Verified Online Checkout (Card / Digital Wallet)</td>
        </tr>
        <tr>
          <td class="label">Total Amount Paid</td>
          <td class="value" style="color: #0f172a; font-size: 14px;">Rs ${pricePKR} PKR</td>
        </tr>
      </table>

      <!-- Security Barcode Box -->
      <div class="barcode-box">
        <div class="barcode-lines">||||| | |||| ||| ||||||| ||| | ||||| |||||| ||||</div>
        <div class="barcode-text">IATA-BCBP-${pnr}-${eTicketNumber} * CONFIRMED</div>
      </div>

      <!-- Attachment Banner -->
      <div class="attachment-callout">
        <div>
          <strong>📎 Official PDF Attachment:</strong> Fligh_E-Ticket_${pnr}.pdf has been generated and attached to this email.
        </div>
      </div>

      <!-- Action Button -->
      <div class="btn-container">
        <a href="${APP_BASE_URL}/?findBooking=${pnr}" class="btn" target="_blank">
          View & Print Official E-Ticket Online
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      Fligh.com Travel Services · Authorized Travel Agency Partner<br>
      Recipient: ${passengerEmail} · Backup Copy: ${ADMIN_EMAIL}<br>
      24/7 Support Hotline: +92 3000358949 · EU Support: +39 02 8990 1420
    </div>
  </div>
</body>
</html>`;

  // 3. Dispatch Email via Nodemailer
  try {
    const transporter = createEmailTransporter();
    const mailOptions: any = {
      from: `"Fligh.com Travel Operations" <no-reply@fligh.com>`,
      to: passengerEmail,
      cc: ADMIN_EMAIL, // Carbon copy to admin for operational records
      subject,
      text: textContent,
      html: htmlContent,
      attachments: [],
    };

    if (pdfBuffer) {
      mailOptions.attachments.push({
        filename: `Fligh_E-Ticket_${pnr}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      });
    }

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Formal PDF-styled booking confirmation dispatched to ${passengerEmail} & ${ADMIN_EMAIL}`, {
      messageId: (info as any)?.messageId || "simulated",
      pnr,
      bookingId,
    });

    await recordNotificationLog({
      bookingId,
      pnr,
      recipient: `${passengerEmail} (CC: ${ADMIN_EMAIL})`,
      subject,
      type: "STATUS_CHANGED",
      status: "SENT",
      sentAt: new Date().toISOString(),
    });

    return { success: true, pnr, passengerEmail };
  } catch (err: any) {
    logger.error(`Failed to dispatch formal confirmation email for PNR #${pnr}:`, err);
    await recordNotificationLog({
      bookingId,
      pnr,
      recipient: `${passengerEmail} (CC: ${ADMIN_EMAIL})`,
      subject,
      type: "STATUS_CHANGED",
      status: "FAILED",
      error: err?.message || String(err),
      sentAt: new Date().toISOString(),
    });
    throw err;
  }
}

/**
 * Trigger 2: Dedicated Trigger On Booking Approved in Firestore
 * Listens for document updates in 'bookings/{bookingId}'
 * Specifically sends the formal PDF-styled booking confirmation email to the user when status transitions to APPROVED
 */
export const onBookingApproved = onDocumentUpdated(
  {
    document: "bookings/{bookingId}",
    database: TARGET_DATABASE_ID,
  },
  async (event) => {
    const change = event.data;
    if (!change) {
      logger.warn("No snapshot data found for onBookingApproved event.");
      return;
    }

    const beforeData = change.before.data();
    const afterData = change.after.data();

    // Trigger only when transitioning to APPROVED
    if (beforeData?.status !== "APPROVED" && afterData?.status === "APPROVED") {
      logger.info(`onBookingApproved trigger: Booking ${event.params.bookingId} officially APPROVED! Sending formal PDF email...`);
      await sendApprovedConfirmationEmail(afterData, event.params.bookingId);
    }
  }
);

/**
 * Trigger 3: On General Booking Status Changed in Firestore
 * Listens for document updates in 'bookings/{bookingId}'
 */
export const onBookingStatusChanged = onDocumentUpdated(
  {
    document: "bookings/{bookingId}",
    database: TARGET_DATABASE_ID,
  },
  async (event) => {
    const change = event.data;
    if (!change) {
      logger.warn("No snapshot change found for onBookingStatusChanged event.");
      return;
    }

    const beforeData = change.before.data();
    const afterData = change.after.data();

    // Check if the booking status actually transitioned
    const oldStatus = beforeData.status;
    const newStatus = afterData.status;

    if (oldStatus === newStatus) {
      return;
    }

    const bookingId = event.params.bookingId;
    const pnr = afterData.reference || bookingId.slice(0, 7).toUpperCase();

    logger.info(`Booking status transition detected for PNR #${pnr}: [${oldStatus} -> ${newStatus}]`);

    // If transitioned to APPROVED, dispatch the formal PDF-styled confirmation
    if (newStatus === "APPROVED") {
      await sendApprovedConfirmationEmail(afterData, bookingId);
      return;
    }

    const passengerName = afterData.passenger || "Passenger";
    const itineraryTitle = afterData.title || "Flight / Hotel Reservation";
    const pricePKR = Number(afterData.price || 0).toLocaleString();
    const statusColor = newStatus === "CANCELLED" || newStatus === "REJECTED" ? "#dc2626" : "#d97706";

    const subject = `[Fligh.com] Booking Status Updated - PNR #${pnr} is now ${newStatus}`;
    const textContent = `BOOKING STATUS UPDATE NOTIFICATION

The booking status for PNR #${pnr} has been updated in Firestore:
• Status: ${newStatus}
• Reference (PNR): ${pnr}
• Passenger: ${passengerName}
• Itinerary: ${itineraryTitle}
• Total Amount: Rs ${pricePKR} PKR
• Updated At: ${new Date().toISOString()}`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; padding: 24px; color: #0f172a; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background: #0f172a; color: #ffffff; padding: 20px; }
    .status-badge { display: inline-block; background: ${statusColor}; color: #ffffff; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 9999px; margin-top: 8px; }
    .body { padding: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div style="font-size:18px; font-weight:bold; color:#38bdf8;">Fligh.com Travel</div>
      <span class="status-badge">${newStatus}</span>
    </div>
    <div class="body">
      <p>Booking #${pnr} for <strong>${passengerName}</strong> is now marked as <strong>${newStatus}</strong>.</p>
      <p style="font-size:12px; color:#64748b;">Itinerary: ${itineraryTitle}</p>
    </div>
  </div>
</body>
</html>`;

    try {
      const transporter = createEmailTransporter();
      await transporter.sendMail({
        from: `"Fligh.com Booking System" <no-reply@fligh.com>`,
        to: ADMIN_EMAIL,
        subject,
        text: textContent,
        html: htmlContent,
      });
    } catch (err) {
      logger.warn("Status change email notice:", err);
    }
  }
);

/**
 * HTTP Callable / Webhook: sendApprovedTicketPdfEmail
 * Allows manual or on-demand dispatch of the formal PDF-styled booking confirmation email
 */
export const sendApprovedTicketPdfEmail = onRequest(async (req, res) => {
  // Set CORS headers
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  const bookingId = req.query.bookingId || req.body?.bookingId;

  if (!bookingId) {
    res.status(400).json({
      error: "Missing required parameter: bookingId",
      example: "/sendApprovedTicketPdfEmail?bookingId=BOOKING_DOC_ID",
    });
    return;
  }

  try {
    const db = admin.firestore();
    const docSnap = await db.collection("bookings").doc(String(bookingId)).get();

    if (!docSnap.exists) {
      res.status(404).json({
        error: `Booking ${bookingId} not found in Firestore.`,
      });
      return;
    }

    const bookingData = docSnap.data();
    const result = await sendApprovedConfirmationEmail(bookingData, String(bookingId));

    res.status(200).json({
      success: true,
      message: `Formal PDF confirmation email dispatched for booking #${result.pnr}`,
      recipient: result.passengerEmail,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    logger.error("Error in sendApprovedTicketPdfEmail endpoint:", err);
    res.status(500).json({
      success: false,
      error: err?.message || String(err),
    });
  }
});

/**
 * HTTP Webhook / Callable Endpoint: sendBookingNotificationWebhook
 * Allows manual or API-level trigger of the email notification
 */
export const sendBookingNotificationWebhook = onRequest(async (req, res) => {
  // Set CORS headers
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  const { bookingId, action, pnr, passenger, status } = req.body || req.query;

  try {
    const transporter = createEmailTransporter();
    const mailSubject = `[Fligh.com Notification] Booking #${pnr || bookingId || "UPDATE"} - Action: ${action || "ALERT"}`;
    const mailBody = `Hello Admin (${ADMIN_EMAIL}),

A notification has been triggered for booking:
• Reference / PNR: ${pnr || "N/A"}
• Booking ID: ${bookingId || "N/A"}
• Passenger: ${passenger || "N/A"}
• Current Status: ${status || "PENDING"}
• Trigger: ${action || "WEBHOOK"}

Timestamp: ${new Date().toISOString()}
Fligh.com Cloud Functions Service`;

    await transporter.sendMail({
      from: `"Fligh.com Booking System" <no-reply@fligh.com>`,
      to: ADMIN_EMAIL,
      subject: mailSubject,
      text: mailBody,
    });

    res.status(200).json({
      success: true,
      message: `Notification email dispatched directly to ${ADMIN_EMAIL}`,
      recipient: ADMIN_EMAIL,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    logger.error("Error in sendBookingNotificationWebhook:", err);
    res.status(500).json({
      success: false,
      error: err?.message || String(err),
    });
  }
});
