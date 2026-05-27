import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  trip: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
  clientName: String,
  clientEmail: String,
  subtotal: { type: Number, required: true },
  gstPercent: { type: Number, required: true },
  gstAmount: { type: Number, required: true },
  finalAmount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  balanceAmount: { type: Number, required: true },
  status: { type: String, enum: ["Draft", "Sent", "Paid", "Partial", "Overdue"], default: "Draft" },
  dueDate: Date,
  pdfPath: String,
  sentAt: Date
}, { timestamps: true });

export const Invoice = mongoose.model("Invoice", invoiceSchema);
