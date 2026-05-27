import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";

const outputDir = path.resolve("generated");

export async function generateInvoicePdf(invoice) {
  fs.mkdirSync(outputDir, { recursive: true });
  const filePath = path.join(outputDir, `${invoice.invoiceNumber}.pdf`);
  const doc = new PDFDocument({ margin: 48 });
  doc.pipe(fs.createWriteStream(filePath));
  doc.fontSize(20).text("Cab Service Invoice", { align: "center" });
  doc.moveDown().fontSize(12).text(`Invoice: ${invoice.invoiceNumber}`);
  doc.text(`Client: ${invoice.clientName || "Corporate Client"}`);
  doc.text(`Subtotal: ${invoice.subtotal.toFixed(2)}`);
  doc.text(`GST (${invoice.gstPercent}%): ${invoice.gstAmount.toFixed(2)}`);
  doc.text(`Final Amount: ${invoice.finalAmount.toFixed(2)}`);
  doc.text(`Paid: ${invoice.paidAmount.toFixed(2)}`);
  doc.text(`Balance: ${invoice.balanceAmount.toFixed(2)}`);
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
