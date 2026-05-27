import mongoose from "mongoose";

const dutySlipSchema = new mongoose.Schema({
  slipNumber: { type: String, required: true, unique: true },
  trip: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", required: true },
  pdfPath: String,
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export const DutySlip = mongoose.model("DutySlip", dutySlipSchema);
