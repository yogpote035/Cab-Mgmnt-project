import { Booking } from "../models/Booking.js";
import { Driver } from "../models/Driver.js";
import { DutySlip } from "../models/DutySlip.js";
import { Trip } from "../models/Trip.js";
import { Vehicle } from "../models/Vehicle.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateDutySlipPdf } from "../services/pdf.service.js";

export const listTrips = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Number(req.query.limit || 10);
  const filter = req.query.status ? { status: req.query.status } : {};
  const [items, total] = await Promise.all([
    Trip.find(filter).populate("booking driver vehicle").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Trip.countDocuments(filter)
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) || 1 });
});

export const assignTrip = asyncHandler(async (req, res) => {
  const { bookingId, driverId, vehicleId } = req.body;
  const [booking, driver, vehicle] = await Promise.all([Booking.findById(bookingId), Driver.findById(driverId), Vehicle.findById(vehicleId)]);
  if (!booking || !driver || !vehicle) throw new ApiError(404, "Booking, driver, or vehicle not found");
  if (driver.status !== "Available" || vehicle.status !== "Available") throw new ApiError(400, "Driver and vehicle must be available");
  const count = await Trip.countDocuments();
  const trip = await Trip.create({ tripNumber: `TRP-${String(count + 1).padStart(6, "0")}`, booking: booking._id, driver: driver._id, vehicle: vehicle._id });
  booking.status = "Assigned";
  booking.timeline.push({ title: "Trip assigned", note: `${driver.driverName} / ${vehicle.registrationNumber}`, actor: req.user._id });
  driver.status = "In Trip";
  vehicle.status = "In Trip";
  await Promise.all([booking.save(), driver.save(), vehicle.save()]);
  res.status(201).json(await trip.populate("booking driver vehicle"));
});

export const startTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id);
  if (!trip) throw new ApiError(404, "Trip not found");
  Object.assign(trip, { status: "In Trip", kmOut: req.body.kmOut, timeOut: req.body.timeOut || new Date() });
  await trip.save();
  res.json(trip);
});

export const completeTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id).populate("driver vehicle booking");
  if (!trip) throw new ApiError(404, "Trip not found");
  const kmOut = Number(req.body.kmOut ?? trip.kmOut);
  const kmIn = Number(req.body.kmIn);
  const timeOut = new Date(req.body.timeOut || trip.timeOut);
  const timeIn = new Date(req.body.timeIn || Date.now());
  if (kmIn < kmOut) throw new ApiError(400, "KM IN must be greater than or equal to KM OUT");
  if (timeIn <= timeOut) throw new ApiError(400, "Time IN must be after Time OUT");
  Object.assign(trip, req.body, {
    kmOut,
    kmIn,
    timeOut,
    timeIn,
    totalKm: kmIn - kmOut,
    totalHours: Number(((timeIn - timeOut) / 36e5).toFixed(2)),
    status: "Completed"
  });
  trip.driver.status = "Available";
  trip.vehicle.status = "Available";
  await Promise.all([trip.save(), trip.driver.save(), trip.vehicle.save()]);
  res.json(trip);
});

export const dutySlip = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id).populate("booking driver vehicle");
  if (!trip) throw new ApiError(404, "Trip not found");
  const count = await DutySlip.countDocuments();
  const pdfPath = await generateDutySlipPdf(trip);
  const slip = await DutySlip.create({ slipNumber: `DS-${String(count + 1).padStart(6, "0")}`, trip: trip._id, pdfPath, generatedBy: req.user._id });
  res.json(slip);
});
