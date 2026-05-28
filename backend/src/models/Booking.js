import mongoose from "mongoose";
import { Counter } from "./Counter.js";

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

bookingSchema.pre("validate", async function assignBookingId(next) {
  if (!this.isNew || this.bookingId) return next();

  try {
    const counter = await Counter.findOneAndUpdate(
      { key: "booking" },
      { $inc: { value: 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    this.bookingId = `BK-${String(counter.value).padStart(2, "0")}`;
    next();
  } catch (error) {
    next(error);
  }
});

export const Booking = mongoose.model("Booking", bookingSchema);
