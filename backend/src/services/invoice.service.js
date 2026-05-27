import { env } from "../config/env.js";
import { Invoice } from "../models/Invoice.js";
import { Trip } from "../models/Trip.js";
import { generateInvoicePdf } from "./pdf.service.js";

export async function generateInvoiceForTrip(tripId) {
  const trip = await Trip.findById(tripId).populate("booking driver vehicle");
  if (!trip) throw new Error("Trip not found");
  const subtotal = (trip.totalKm * trip.vehicle.ratePerKm) + trip.tollCharges + trip.parkingCharges + trip.extraCharges;
  const gstAmount = subtotal * (env.gstPercent / 100);
  const finalAmount = subtotal + gstAmount;
  const count = await Invoice.countDocuments();
  const invoice = await Invoice.create({
    invoiceNumber: `INV-${new Date().getFullYear()}-${String(count + 1).padStart(5, "0")}`,
    trip: trip._id,
    booking: trip.booking._id,
    clientName: trip.booking.businessUnit || trip.booking.bookedBy,
    clientEmail: "",
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
