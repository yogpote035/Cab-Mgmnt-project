import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  invoice: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice", required: true },
  amount: { type: Number, required: true, min: 0 },
  paymentDate: { type: Date, default: Date.now },
  method: { type: String, enum: ["Bank Transfer", "UPI", "Cash", "Cheque", "Other"], default: "Bank Transfer" },
  referenceNumber: String,
  notes: String,
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export const Payment = mongoose.model("Payment", paymentSchema);
