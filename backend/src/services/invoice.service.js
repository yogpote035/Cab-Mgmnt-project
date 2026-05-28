import { env } from "../config/env.js";
import { Invoice } from "../models/Invoice.js";
import { Trip } from "../models/Trip.js";
import { generateInvoicePdf } from "./pdf.service.js";

export async function generateInvoiceForTrip(tripId, { regenerate = false } = {}) {
  const trip = await Trip.findById(tripId).populate("booking driver vehicle");
  if (!trip) throw new Error("Trip not found");
  if (trip.status !== "Completed") throw new Error("Trip must be completed before invoicing");
  const subtotal = (trip.totalKm * trip.vehicle.ratePerKm) + trip.tollCharges + trip.parkingCharges + trip.extraCharges;
  const gstAmount = subtotal * (env.gstPercent / 100);
  const finalAmount = subtotal + gstAmount;
  const existing = await Invoice.findOne({ trip: trip._id });

  if (existing && !regenerate) return existing;
  if (existing && regenerate) {
    existing.booking = trip.booking._id;
    existing.clientName = trip.booking.businessUnit || trip.booking.bookedBy;
    existing.subtotal = subtotal;
    existing.gstPercent = env.gstPercent;
    existing.gstAmount = gstAmount;
    existing.finalAmount = finalAmount;
    existing.balanceAmount = Math.max(finalAmount - existing.paidAmount, 0);
    existing.status = existing.balanceAmount === 0 ? "Paid" : existing.paidAmount > 0 ? "Partial" : "Draft";
    existing.pdfPath = await generateInvoicePdf(existing);
    await existing.save();
    return existing;
  }

  const count = await Invoice.countDocuments();
  const invoice = await Invoice.create({
    invoiceNumber: `INV-${new Date().getFullYear()}-${String(count + 1).padStart(5, "0")}`,
    trip: trip._id,
    booking: trip.booking._id,
    clientName: trip.booking.businessUnit || trip.booking.bookedBy,
    clientEmail: trip.booking.senderEmail || "",
    subtotal,
    gstPercent: env.gstPercent,
    gstAmount,
    finalAmount,
    balanceAmount: finalAmount,
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
  });
  invoice.pdfPath = await generateInvoicePdf(invoice);
  await invoice.save();
  return invoice;
}

export async function regenerateInvoice(invoiceId) {
  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) throw new Error("Invoice not found");
  return generateInvoiceForTrip(invoice.trip, { regenerate: true });
}
