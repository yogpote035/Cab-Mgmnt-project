import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import "../models/Booking.js";
import "../models/Driver.js";
import { Invoice } from "../models/Invoice.js";
import { Payment } from "../models/Payment.js";
import "../models/Trip.js";
import "../models/Vehicle.js";

const outputDir = path.resolve("generated");

export async function generateInvoicePdf(invoice) {
  fs.mkdirSync(outputDir, { recursive: true });
  const fullInvoice = await loadInvoiceForPdf(invoice);
  const latestPayment = await Payment.findOne({ invoice: fullInvoice._id }).sort({ paymentDate: -1, createdAt: -1 }).lean();
  const trip = fullInvoice.trip || {};
  const booking = fullInvoice.booking || trip.booking || {};
  const driver = trip.driver || {};
  const vehicle = trip.vehicle || {};
  const paidAmount = Number(fullInvoice.paidAmount || 0);
  const balanceAmount = Number(fullInvoice.balanceAmount ?? Math.max(Number(fullInvoice.finalAmount || 0) - paidAmount, 0));
  const paymentStatus = balanceAmount === 0 ? "Paid" : paidAmount > 0 ? "Partial" : "Pending";
  const filePath = path.join(outputDir, `${fullInvoice.invoiceNumber}.pdf`);
  const doc = new PDFDocument({ size: "A4", margin: 40 });
  const stream = fs.createWriteStream(filePath);
  const done = new Promise((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
  doc.pipe(stream);

  const company = {
    name: process.env.COMPANY_NAME || "CAB ERP",
    address: process.env.COMPANY_ADDRESS || "Corporate Cab Management & Billing",
    gstin: process.env.COMPANY_GSTIN || "GSTIN: Not configured",
    email: process.env.COMPANY_EMAIL || "support@caberp.local",
    phone: process.env.COMPANY_PHONE || "+91 98765 43210"
  };

  const invoiceDate = new Date(fullInvoice.createdAt || Date.now()).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const totalKm = Number(trip.totalKm || 0);
  const ratePerKm = Number(vehicle.ratePerKm || 0);
  const distanceFare = totalKm * ratePerKm;
  const toll = Number(trip.tollCharges || 0);
  const parking = Number(trip.parkingCharges || 0);
  const extras = Number(trip.extraCharges || 0);
  const taxableAmount = Number(fullInvoice.subtotal || 0);
  const cgst = Number(fullInvoice.gstAmount || 0) / 2;
  const sgst = Number(fullInvoice.gstAmount || 0) / 2;

  doc.rect(0, 0, 600, 130).fill("#F8F9FA");
  doc.fillColor("#D35400").fontSize(22).font("Helvetica-Bold").text(company.name, 50, 40);
  doc.fillColor("#444444").fontSize(9).font("Helvetica")
    .text(company.address, 50, 68, { width: 320 })
    .text(`GSTIN: ${company.gstin}`, 50, 82)
    .text(`Support: ${company.phone} | ${company.email}`, 50, 96);

  doc.fillColor("#000000").fontSize(16).font("Helvetica-Bold").text("TAX INVOICE", 400, 40, { align: "right" });
  doc.font("Helvetica").fontSize(10).text(`Date: ${invoiceDate}`, 400, 62, { align: "right" });
  doc.text(`Status: ${paymentStatus.toUpperCase()}`, 400, 76, { align: "right" });

  doc.moveTo(40, 140).lineTo(555, 140).stroke("#EEEEEE");

  doc.fillColor("#555555").fontSize(9).font("Helvetica-Bold").text("INVOICE DETAILS", 50, 155);
  doc.font("Helvetica").fillColor("#000000")
    .text(`Invoice: ${fullInvoice.invoiceNumber}`, 50, 170)
    .text(`Booking ID: ${booking.bookingId || "-"}`, 50, 184)
    .text(`Payment: ${latestPayment?.method || (paymentStatus === "Paid" ? "Paid" : "Pending")}`, 50, 198);

  doc.fillColor("#555555").font("Helvetica-Bold").text("PASSENGER", 250, 155);
  doc.font("Helvetica").fillColor("#000000")
    .text(booking.passengerName || fullInvoice.clientName || "Corporate Client", 250, 170, { width: 130 })
    .text(booking.mobileNumber || "-", 250, 198);

  doc.fillColor("#555555").font("Helvetica-Bold").text("DRIVER & CAB", 400, 155);
  doc.font("Helvetica").fillColor("#000000")
    .text(driver.driverName || "-", 400, 170, { width: 145 })
    .text(vehicle.registrationNumber || "-", 400, 184)
    .text(vehicle.vehicleModel || vehicle.vehicleType || "-", 400, 198, { width: 145 });

  doc.rect(40, 220, 515, 64).fill("#EBF5FB").stroke("#AED6F1");
  doc.fillColor("#21618C").font("Helvetica-Bold").fontSize(10).text("TRIP SUMMARY", 55, 232);
  doc.fillColor("#000000").font("Helvetica").fontSize(9)
    .text(`FROM: ${booking.pickupLocation || booking.reportingAddress || "-"}`, 55, 248, { width: 315 })
    .text(`TO: ${booking.dropLocation || booking.dropAddress || "-"}`, 55, 262, { width: 315 })
    .text(`DISTANCE: ${totalKm.toFixed(2)} KM`, 400, 248)
    .text(`DURATION: ${Number(trip.totalHours || 0).toFixed(2)} hrs`, 400, 262);

  const tableTop = 315;
  doc.rect(40, tableTop, 515, 22).fill("#34495E");
  doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(9).text("Description", 60, tableTop + 7);
  doc.text("Rate / Qty", 250, tableTop + 7);
  doc.text("Amount (INR)", 430, tableTop + 7, { width: 105, align: "right" });

  doc.fillColor("#000000").font("Helvetica").fontSize(9);
  let rowY = tableTop + 34;
  rowY = invoiceRow(doc, rowY, "Distance Fare", `${totalKm.toFixed(2)} km x Rs.${ratePerKm.toFixed(2)}/km`, distanceFare);
  rowY = invoiceRow(doc, rowY, "Toll Charges", "Actuals", toll);
  rowY = invoiceRow(doc, rowY, "Parking Charges", "Actuals", parking);
  rowY = invoiceRow(doc, rowY, "Extra Charges", "Actuals", extras);

  rowY += 8;
  doc.moveTo(300, rowY).lineTo(555, rowY).stroke("#BBBBBB");
  rowY += 12;

  doc.fontSize(9).text("Taxable Value:", 300, rowY);
  doc.text(formatMoney(taxableAmount), 430, rowY, { width: 105, align: "right" });
  rowY += 16;
  doc.text(`CGST (${Number(fullInvoice.gstPercent || 0) / 2}%):`, 300, rowY);
  doc.text(formatMoney(cgst), 430, rowY, { width: 105, align: "right" });
  rowY += 16;
  doc.text(`SGST (${Number(fullInvoice.gstPercent || 0) / 2}%):`, 300, rowY);
  doc.text(formatMoney(sgst), 430, rowY, { width: 105, align: "right" });
  rowY += 18;
  doc.text("Paid Amount:", 300, rowY);
  doc.text(formatMoney(paidAmount), 430, rowY, { width: 105, align: "right" });
  rowY += 16;
  doc.text("Outstanding:", 300, rowY);
  doc.text(formatMoney(balanceAmount), 430, rowY, { width: 105, align: "right" });

  rowY += 28;
  doc.rect(300, rowY - 6, 255, 32).fill(paymentStatus === "Paid" ? "#27AE60" : "#D35400");
  doc.fillColor("#FFFFFF").fontSize(14).font("Helvetica-Bold").text(paymentStatus === "Paid" ? "Total Paid:" : "Invoice Total:", 310, rowY + 3);
  doc.text(`Rs. ${formatMoney(fullInvoice.finalAmount)}`, 430, rowY + 3, { width: 105, align: "right" });

  doc.fillColor("#7F8C8D").fontSize(8).font("Helvetica-Oblique")
    .text("This is a computer generated invoice and does not require a physical signature.", 40, 750, { align: "center", width: 515 });
  doc.end();
  await done;
  return filePath;
}

async function loadInvoiceForPdf(invoice) {
  const id = invoice?._id || invoice;
  const fullInvoice = await Invoice.findById(id)
    .populate("booking")
    .populate({ path: "trip", populate: ["booking", "driver", "vehicle"] });
  return fullInvoice || invoice;
}

function invoiceRow(doc, y, description, rate, amount) {
  doc.text(description, 60, y);
  doc.text(rate, 250, y);
  doc.text(formatMoney(amount), 430, y, { width: 105, align: "right" });
  return y + 21;
}

function formatMoney(value) {
  return Number(value || 0).toFixed(2);
}

export async function generateDutySlipPdf(trip) {
  fs.mkdirSync(outputDir, { recursive: true });
  const filePath = path.join(outputDir, `DutySlip-${trip.tripNumber}.pdf`);
  const doc = new PDFDocument({ margin: 48 });
  doc.pipe(fs.createWriteStream(filePath));
  doc.fontSize(20).text("Duty Slip", { align: "center" });
  doc.moveDown().fontSize(12).text(`Trip: ${trip.tripNumber}`);
  doc.text(`Passenger: ${trip.booking?.passengerName || ""}`);
  doc.text(`Driver: ${trip.driver?.driverName || ""}`);
  doc.text(`Vehicle: ${trip.vehicle?.registrationNumber || ""}`);
  doc.text(`KM Out: ${trip.kmOut || ""}`);
  doc.text(`KM In: ${trip.kmIn || ""}`);
  doc.end();
  return filePath;
}
