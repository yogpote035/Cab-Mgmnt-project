import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", required: true },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, enum: ["Active", "Released"], default: "Active" }
}, { timestamps: true });

export const Assignment = mongoose.model("Assignment", assignmentSchema);
