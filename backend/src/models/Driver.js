import mongoose from "mongoose";

const driverSchema = new mongoose.Schema({
  driverName: { type: String, required: true, trim: true },
  contactNumber: { type: String, required: true, trim: true },
  alternateContact: String,
  licenseNumber: { type: String, required: true, unique: true, trim: true },
  licenseExpiry: Date,
  address: String,
  idReference: String,
  documentExpiries: {
    policeVerification: Date,
    medical: Date,
    badge: Date
  },
  status: { type: String, enum: ["Available", "In Trip", "Unavailable"], default: "Available" }
}, { timestamps: true });

export const Driver = mongoose.model("Driver", driverSchema);
