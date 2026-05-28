import mongoose from "mongoose";

const tripSchema = new mongoose.Schema({
  tripNumber: { type: String, required: true, unique: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", required: true },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
  status: { type: String, enum: ["Assigned", "In Trip", "Completed", "Cancelled"], default: "Assigned" },
  kmOut: Number,
  kmIn: Number,
  timeOut: Date,
  timeIn: Date,
  tollCharges: { type: Number, default: 0 },
  parkingCharges: { type: Number, default: 0 },
  extraCharges: { type: Number, default: 0 },
  userClosingKm: Number,
  userClosingTime: Date,
  totalKm: { type: Number, default: 0 },
  totalHours: { type: Number, default: 0 },
  notes: String
}, { timestamps: true });

export const Trip = mongoose.model("Trip", tripSchema);
