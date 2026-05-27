import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";

const outputDir = path.resolve("generated");

export async function generateInvoicePdf(invoice) {
  fs.mkdirSync(outputDir, { recursive: true });
  const paidAmount = Number(invoice.paidAmount || 0);
  const balanceAmount = Number(invoice.balanceAmount ?? Math.max(Number(invoice.finalAmount || 0) - paidAmount, 0));
  const paymentStatus = balanceAmount === 0 ? "Paid" : paidAmount > 0 ? "Partial" : "Pending";
  const filePath = path.join(outputDir, `${invoice.invoiceNumber}.pdf`);
  const doc = new PDFDocument({ margin: 48 });
  doc.pipe(fs.createWriteStream(filePath));
  doc.fontSize(20).text("Cab Service Invoice", { align: "center" });
  doc.moveDown().fontSize(12).text(`Invoice: ${invoice.invoiceNumber}`);
  doc.text(`Client: ${invoice.clientName || "Corporate Client"}`);
  doc.text(`Subtotal: ${invoice.subtotal.toFixed(2)}`);
  doc.text(`GST (${invoice.gstPercent}%): ${invoice.gstAmount.toFixed(2)}`);
  doc.text(`Final Amount: ${invoice.finalAmount.toFixed(2)}`);
  doc.text(`Paid Amount: ${paidAmount.toFixed(2)}`);
  doc.text(`Outstanding Balance: ${balanceAmount.toFixed(2)}`);
  doc.text(`Payment Status: ${paymentStatus}`);
  doc.text(`Invoice Status: ${invoice.status}`);
  doc.end();
  return filePath;
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
