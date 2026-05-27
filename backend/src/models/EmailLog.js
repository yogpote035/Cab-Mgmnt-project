import mongoose from "mongoose";

const emailLogSchema = new mongoose.Schema({
  messageId: { type: String, unique: true, sparse: true },
  direction: { type: String, enum: ["Incoming", "Outgoing"], required: true },
  to: String,
  from: String,
  subject: String,
  status: { type: String, enum: ["Parsed", "Sent", "Failed", "Duplicate", "Ignored"], required: true },
  error: String,
  relatedBooking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
  relatedInvoice: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice" }
}, { timestamps: true });

export const EmailLog = mongoose.model("EmailLog", emailLogSchema);
