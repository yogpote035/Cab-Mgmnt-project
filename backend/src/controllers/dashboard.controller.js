import { Booking } from "../models/Booking.js";
import { Trip } from "../models/Trip.js";
import { Invoice } from "../models/Invoice.js";
import { Driver } from "../models/Driver.js";
import { Vehicle } from "../models/Vehicle.js";
import { ActivityLog } from "../models/ActivityLog.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const dashboard = asyncHandler(async (_req, res) => {
  const [totalBookings, activeTrips, completedTrips, pendingInvoices, availableDrivers, availableCars, revenue, recentBookings, recentInvoices, recentTrips, activity] = await Promise.all([
    Booking.countDocuments(),
    Trip.countDocuments({ status: { $in: ["Assigned", "In Trip"] } }),
    Trip.countDocuments({ status: "Completed" }),
    Invoice.countDocuments({ status: { $in: ["Draft", "Sent", "Partial", "Overdue"] } }),
    Driver.countDocuments({ status: "Available" }),
    Vehicle.countDocuments({ status: "Available" }),
    Invoice.aggregate([{ $group: { _id: null, total: { $sum: "$finalAmount" }, pending: { $sum: "$balanceAmount" } } }]),
    Booking.find().sort({ createdAt: -1 }).limit(5),
    Invoice.find().sort({ createdAt: -1 }).limit(5),
    Trip.find().populate("booking driver vehicle").sort({ createdAt: -1 }).limit(5),
    ActivityLog.find().populate("actor", "name").sort({ createdAt: -1 }).limit(8)
  ]);
  res.json({
    cards: {
      totalBookings,
      activeTrips,
      completedTrips,
      pendingInvoices,
      revenueSummary: revenue[0]?.total || 0,
      pendingPayments: revenue[0]?.pending || 0,
      availableDrivers,
      availableCars
    },
    charts: {
      revenue: await monthlyAggregate(Invoice, "finalAmount"),
      trips: await monthlyCount(Trip),
      bookings: await monthlyCount(Booking),
      invoiceStatus: await Invoice.aggregate([{ $group: { _id: "$status", value: { $sum: 1 } } }])
    },
    recentBookings,
    recentInvoices,
    recentTrips,
    activity
  });
});

function monthGroup() {
  return { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } };
}

async function monthlyAggregate(Model, field) {
  return Model.aggregate([{ $group: { _id: monthGroup(), value: { $sum: `$${field}` } } }, { $sort: { "_id.year": 1, "_id.month": 1 } }]);
}

async function monthlyCount(Model) {
  return Model.aggregate([{ $group: { _id: monthGroup(), value: { $sum: 1 } } }, { $sort: { "_id.year": 1, "_id.month": 1 } }]);
}
