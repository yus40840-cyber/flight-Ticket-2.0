"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBookingPdf = generateBookingPdf;
const pdfkit_1 = __importDefault(require("pdfkit"));
/**
 * Generates an official, formal PDF E-Ticket & Boarding Pass document buffer.
 */
function generateBookingPdf(data) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new pdfkit_1.default({
                size: "A4",
                margin: 40,
                info: {
                    Title: `Official E-Ticket - PNR ${data.pnr}`,
                    Author: "Fligh.com Travel Services",
                    Subject: `Electronic Ticket and Travel Voucher for ${data.passengerName}`,
                    Keywords: "Flight, E-Ticket, Boarding Pass, Travel, Booking Confirmation",
                },
            });
            const buffers = [];
            doc.on("data", (chunk) => buffers.push(chunk));
            doc.on("end", () => resolve(Buffer.concat(buffers)));
            doc.on("error", (err) => reject(err));
            const primaryColor = "#0f172a"; // slate-900
            const accentBlue = "#0284c7"; // sky-600
            const emeraldGreen = "#059669"; // emerald-600
            const borderGray = "#cbd5e1"; // slate-300
            const lightBg = "#f8fafc"; // slate-50
            // 1. Top Header Banner
            doc
                .rect(40, 40, 515, 65)
                .fill(primaryColor);
            // Logo / Brand
            doc
                .fillColor("#38bdf8")
                .fontSize(22)
                .font("Helvetica-Bold")
                .text("Fligh.com", 60, 55, { continued: true })
                .fillColor("#ffffff")
                .text(" Travel");
            doc
                .fillColor("#94a3b8")
                .fontSize(9)
                .font("Helvetica")
                .text("OFFICIAL ELECTRONIC TICKET & BOARDING PASS", 60, 80);
            // Status Stamp (Top-Right)
            doc
                .rect(395, 52, 140, 36)
                .fill("#064e3b")
                .strokeColor(emeraldGreen)
                .stroke();
            doc
                .fillColor("#34d399")
                .fontSize(10)
                .font("Helvetica-Bold")
                .text("STATUS: APPROVED", 405, 58, { align: "center", width: 120 });
            doc
                .fillColor("#a7f3d0")
                .fontSize(8)
                .font("Helvetica")
                .text("VERIFIED & ISSUED", 405, 72, { align: "center", width: 120 });
            // 2. Receipt Subtitle & Reference Bar
            doc
                .rect(40, 115, 515, 35)
                .fill(lightBg)
                .strokeColor(borderGray)
                .stroke();
            doc
                .fillColor("#475569")
                .fontSize(9)
                .font("Helvetica-Bold")
                .text("BOOKING REFERENCE (PNR):", 55, 128);
            doc
                .fillColor(accentBlue)
                .fontSize(12)
                .font("Courier-Bold")
                .text(data.pnr, 210, 126);
            doc
                .fillColor("#475569")
                .fontSize(9)
                .font("Helvetica-Bold")
                .text("E-TICKET NO:", 340, 128);
            doc
                .fillColor("#0f172a")
                .fontSize(10)
                .font("Courier-Bold")
                .text(data.eTicketNumber || "214-8930194821", 420, 127);
            // 3. Passenger Details Table Box
            let currentY = 165;
            doc
                .fillColor(primaryColor)
                .fontSize(11)
                .font("Helvetica-Bold")
                .text("PASSENGER & CONTACT INFORMATION", 40, currentY);
            currentY += 18;
            doc
                .rect(40, currentY, 515, 70)
                .fill("#ffffff")
                .strokeColor(borderGray)
                .stroke();
            // Row 1
            doc
                .fillColor("#64748b")
                .fontSize(8)
                .font("Helvetica")
                .text("PASSENGER FULL NAME", 55, currentY + 10);
            doc
                .fillColor("#0f172a")
                .fontSize(10)
                .font("Helvetica-Bold")
                .text(data.passengerName.toUpperCase(), 55, currentY + 22);
            doc
                .fillColor("#64748b")
                .fontSize(8)
                .font("Helvetica")
                .text("PASSPORT / CNIC NO", 240, currentY + 10);
            doc
                .fillColor("#0f172a")
                .fontSize(10)
                .font("Helvetica-Bold")
                .text(data.passportOrCnic || "PK84920194", 240, currentY + 22);
            doc
                .fillColor("#64748b")
                .fontSize(8)
                .font("Helvetica")
                .text("CABIN CLASS", 420, currentY + 10);
            doc
                .fillColor(accentBlue)
                .fontSize(10)
                .font("Helvetica-Bold")
                .text(data.cabinClass || "Economy", 420, currentY + 22);
            // Row 2
            doc
                .fillColor("#64748b")
                .fontSize(8)
                .font("Helvetica")
                .text("CONTACT EMAIL", 55, currentY + 42);
            doc
                .fillColor("#0f172a")
                .fontSize(9)
                .font("Helvetica")
                .text(data.passengerEmail || "passenger@fligh.com", 55, currentY + 53);
            doc
                .fillColor("#64748b")
                .fontSize(8)
                .font("Helvetica")
                .text("CONTACT TELEPHONE", 240, currentY + 42);
            doc
                .fillColor("#0f172a")
                .fontSize(9)
                .font("Helvetica")
                .text(data.passengerPhone || "+92 300 8241920", 240, currentY + 53);
            doc
                .fillColor("#64748b")
                .fontSize(8)
                .font("Helvetica")
                .text("BAGGAGE ALLOWANCE", 420, currentY + 42);
            doc
                .fillColor("#0f172a")
                .fontSize(9)
                .font("Helvetica-Bold")
                .text("30 KG Check-in + 7 KG Cabin", 420, currentY + 53);
            // 4. Flight Itinerary Section
            currentY += 90;
            doc
                .fillColor(primaryColor)
                .fontSize(11)
                .font("Helvetica-Bold")
                .text("CONFIRMED FLIGHT ITINERARY", 40, currentY);
            currentY += 18;
            doc
                .rect(40, currentY, 515, 110)
                .fill(lightBg)
                .strokeColor(borderGray)
                .stroke();
            // Route Banner inside
            doc
                .rect(40, currentY, 515, 26)
                .fill("#e2e8f0");
            doc
                .fillColor("#0f172a")
                .fontSize(10)
                .font("Helvetica-Bold")
                .text(data.itineraryTitle || "Direct Commercial Flight Service", 55, currentY + 8);
            // Departure
            const originCity = data.originCity || "Karachi";
            const originCode = data.originCode || "KHI";
            const destCity = data.destCity || "Milan";
            const destCode = data.destCode || "MXP";
            doc
                .fillColor("#64748b")
                .fontSize(8)
                .font("Helvetica")
                .text("DEPARTURE", 55, currentY + 38);
            doc
                .fillColor("#0f172a")
                .fontSize(14)
                .font("Helvetica-Bold")
                .text(originCode, 55, currentY + 50);
            doc
                .fillColor("#334155")
                .fontSize(9)
                .font("Helvetica")
                .text(originCity, 55, currentY + 68);
            doc
                .fillColor("#64748b")
                .fontSize(8)
                .font("Helvetica")
                .text(`${data.departDate || "04 Oct 2026"} at ${data.departTime || "03:45 AM"}`, 55, currentY + 82);
            // Arrow & Flight Number in middle
            doc
                .fillColor(accentBlue)
                .fontSize(14)
                .font("Helvetica-Bold")
                .text("✈ ─────────── ➔", 215, currentY + 54);
            doc
                .fillColor("#475569")
                .fontSize(9)
                .font("Helvetica-Bold")
                .text(data.flightNumber || "Flight PK-785", 240, currentY + 74);
            // Destination
            doc
                .fillColor("#64748b")
                .fontSize(8)
                .font("Helvetica")
                .text("ARRIVAL", 420, currentY + 38);
            doc
                .fillColor("#0f172a")
                .fontSize(14)
                .font("Helvetica-Bold")
                .text(destCode, 420, currentY + 50);
            doc
                .fillColor("#334155")
                .fontSize(9)
                .font("Helvetica")
                .text(destCity, 420, currentY + 68);
            doc
                .fillColor("#64748b")
                .fontSize(8)
                .font("Helvetica")
                .text(`Arrival: ${data.arriveTime || "08:30 AM"}`, 420, currentY + 82);
            // 5. Boarding & Gate Voucher Box
            currentY += 130;
            doc
                .rect(40, currentY, 515, 60)
                .fill("#ffffff")
                .strokeColor(accentBlue)
                .lineWidth(1.5)
                .stroke();
            doc
                .fillColor("#64748b")
                .fontSize(8)
                .font("Helvetica")
                .text("TERMINAL", 65, currentY + 12);
            doc
                .fillColor("#0f172a")
                .fontSize(14)
                .font("Helvetica-Bold")
                .text(data.terminal || "1", 65, currentY + 25);
            doc
                .fillColor("#64748b")
                .fontSize(8)
                .font("Helvetica")
                .text("BOARDING GATE", 185, currentY + 12);
            doc
                .fillColor("#0f172a")
                .fontSize(14)
                .font("Helvetica-Bold")
                .text(data.gate || "24", 185, currentY + 25);
            doc
                .fillColor("#64748b")
                .fontSize(8)
                .font("Helvetica")
                .text("SEAT NUMBER", 310, currentY + 12);
            doc
                .fillColor(emeraldGreen)
                .fontSize(14)
                .font("Helvetica-Bold")
                .text(data.seat || "14A", 310, currentY + 25);
            doc
                .fillColor("#64748b")
                .fontSize(8)
                .font("Helvetica")
                .text("BOARDING TIME", 425, currentY + 12);
            doc
                .fillColor(primaryColor)
                .fontSize(14)
                .font("Helvetica-Bold")
                .text(data.departTime || "03:15 AM", 425, currentY + 25);
            // 6. Payment & Fare Breakdown
            currentY += 80;
            doc
                .fillColor(primaryColor)
                .fontSize(11)
                .font("Helvetica-Bold")
                .text("PAYMENT SUMMARY & RECEIPT", 40, currentY);
            currentY += 16;
            doc
                .rect(40, currentY, 515, 65)
                .fill(lightBg)
                .strokeColor(borderGray)
                .lineWidth(1)
                .stroke();
            doc
                .fillColor("#64748b")
                .fontSize(9)
                .font("Helvetica")
                .text("Payment Method: Verified Online Payment (Card / Wallet)", 55, currentY + 14);
            doc
                .fillColor("#64748b")
                .fontSize(9)
                .font("Helvetica")
                .text("Payment Status: PAID & SETTLED (100% Guaranteed)", 55, currentY + 30);
            doc
                .fillColor("#64748b")
                .fontSize(9)
                .font("Helvetica")
                .text(`Authorized by Fligh.com Operations on ${data.approvedAt || new Date().toLocaleDateString("en-GB")}`, 55, currentY + 46);
            doc
                .fillColor("#0f172a")
                .fontSize(9)
                .font("Helvetica-Bold")
                .text("TOTAL AMOUNT PAID:", 360, currentY + 20);
            doc
                .fillColor(emeraldGreen)
                .fontSize(14)
                .font("Helvetica-Bold")
                .text(`Rs ${data.pricePKR} PKR`, 360, currentY + 35);
            // 7. Security Barcode Section
            currentY += 85;
            doc
                .rect(40, currentY, 515, 45)
                .fill("#ffffff")
                .strokeColor(borderGray)
                .stroke();
            // Render barcode bars simulation
            const startX = 60;
            const barY = currentY + 8;
            for (let i = 0; i < 90; i++) {
                const barWidth = (i % 3 === 0 || i % 7 === 0) ? 2.5 : 1;
                doc
                    .rect(startX + i * 4.6, barY, barWidth, 20)
                    .fill(primaryColor);
            }
            doc
                .fillColor("#475569")
                .fontSize(8)
                .font("Courier")
                .text(`IATA-BCBP-VERIFIED * ${data.pnr} * ${data.eTicketNumber || "2148930194821"} * OK`, 40, currentY + 32, {
                align: "center",
                width: 515,
            });
            // 8. Important Notice / Footer
            currentY += 60;
            doc
                .fillColor("#94a3b8")
                .fontSize(7.5)
                .font("Helvetica")
                .text("IMPORTANT TRAVEL NOTICE: Please present this electronic ticket along with your original valid CNIC / Passport at the check-in counter at least 3 hours prior to scheduled departure. Fligh.com is an authorized travel agency registered under Civil Aviation Authority standards. Have a pleasant flight!", 40, currentY, { width: 515, align: "center", lineGap: 2 });
            doc.end();
        }
        catch (err) {
            reject(err);
        }
    });
}
//# sourceMappingURL=pdfGenerator.js.map