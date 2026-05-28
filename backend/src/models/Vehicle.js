import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema({
  registrationNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
  vehicleType: { type: String, required: true },
  vehicleModel: { type: String, required: true },
  cabCategory: { type: String, required: true },
  seatingCapacity: { type: Number, min: 1, default: 4 },
  ratePerKm: { type: Number, required: true, min: 0 },
  insurancePolicyNumber: String,
  insuranceExpiry: Date,
  fitnessCertificateExpiry: Date,
  pucExpiry: Date,
  status: { type: String, enum: ["Available", "In Trip", "Maintenance"], default: "Available" },
  maintenanceNotes: String
}, { timestamps: true });

export const Vehicle = mongoose.model("Vehicle", vehicleSchema);
