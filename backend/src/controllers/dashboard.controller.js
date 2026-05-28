import { Booking } from "../models/Booking.js";
import { Trip } from "../models/Trip.js";
import { Invoice } from "../models/Invoice.js";
import { Driver } from "../models/Driver.js";
import { Vehicle } from "../models/Vehicle.js";
import { ActivityLog } from "../models/ActivityLog.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const dashboard = asyncHandler(async (req, res) => {
  const period = ["day", "week", "month", "year"].includes(req.query.period) ? req.query.period : "month";
  const { start, end } = periodRange(period);
  const dateFilter = { createdAt: { $gte: start, $lte: end } };

  const [totalBookings, activeTrips, completedTrips, pendingInvoices, availableDrivers, availableCars, revenue, recentBookings, recentInvoices, recentTrips, activity] = await Promise.all([
    Booking.countDocuments(dateFilter),
    Trip.countDocuments({ ...dateFilter, status: { $in: ["Assigned", "In Trip"] } }),
    Trip.countDocuments({ ...dateFilter, status: "Completed" }),
    Invoice.countDocuments({ ...dateFilter, status: { $in: ["Draft", "Sent", "Partial", "Overdue"] } }),
    Driver.countDocuments({ status: "Available" }),
    Vehicle.countDocuments({ status: "Available" }),
    Invoice.aggregate([{ $match: dateFilter }, { $group: { _id: null, total: { $sum: "$finalAmount" }, pending: { $sum: "$balanceAmount" } } }]),
    Booking.find(dateFilter).sort({ createdAt: -1 }).limit(5),
    Invoice.find(dateFilter).sort({ createdAt: -1 }).limit(5),
    Trip.find(dateFilter).populate("booking driver vehicle").sort({ createdAt: -1 }).limit(5),
    ActivityLog.find(dateFilter).populate("actor", "name").sort({ createdAt: -1 }).limit(8)
  ]);
  res.json({
    period: { key: period, start, end },
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
      revenue: await aggregateByPeriod(Invoice, "finalAmount", period, dateFilter),
      trips: await countByPeriod(Trip, period, dateFilter),
      bookings: await countByPeriod(Booking, period, dateFilter),
      invoiceStatus: await Invoice.aggregate([{ $match: dateFilter }, { $group: { _id: "$status", value: { $sum: 1 } } }])
    },
    recentBookings,
    recentInvoices,
    recentTrips,
    activity
  });
});

function periodRange(period) {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  if (period === "day") {
    start.setHours(0, 0, 0, 0);
  } else if (period === "week") {
    const day = start.getDay() || 7;
    start.setDate(start.getDate() - day + 1);
    start.setHours(0, 0, 0, 0);
  } else if (period === "year") {
    start.setMonth(0, 1);
    start.setHours(0, 0, 0, 0);
  } else {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
  }

  return { start, end };
}

function periodFormat(period) {
  if (period === "day") return "%H:00";
  if (period === "year") return "%m/%Y";
  return "%d/%m";
}

function periodGroup(period) {
  return { $dateToString: { format: periodFormat(period), date: "$createdAt", timezone: "Asia/Kolkata" } };
}

async function aggregateByPeriod(Model, field, period, dateFilter) {
  return Model.aggregate([
    { $match: dateFilter },
    { $group: { _id: periodGroup(period), value: { $sum: `$${field}` } } },
    { $sort: { _id: 1 } }
  ]);
}

async function countByPeriod(Model, period, dateFilter) {
  return Model.aggregate([
    { $match: dateFilter },
    { $group: { _id: periodGroup(period), value: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);
}
