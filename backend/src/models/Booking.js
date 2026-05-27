import mongoose from "mongoose";

const timelineSchema = new mongoose.Schema({
  title: String,
  note: String,
  actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  at: { type: Date, default: Date.now }
}, { _id: false });

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  businessUnit: String,
  passengerName: { type: String, required: true },
  mobileNumber: String,
  travelStartDate: Date,
  travelEndDate: Date,
  departmentName: String,
  reportingAddress: String,
  carType: String,
  dropAddress: String,
  projectExpenses: String,
  costCenter: String,
  bookedBy: String,
  purpose: String,
  employeeCount: Number,
  cabRequestNumber: { type: String, unique: true, sparse: true },
  pickupLocation: String,
  dropLocation: String,
  specialInstructions: String,
  source: { type: String, enum: ["Email", "Manual"], default: "Manual" },
  status: { type: String, enum: ["New", "Pending Assignment", "Assigned", "Cancelled"], default: "New" },
  emailMessageId: { type: String, unique: true, sparse: true },
  timeline: [timelineSchema]
}, { timestamps: true });

export const Booking = mongoose.model("Booking", bookingSchema);
