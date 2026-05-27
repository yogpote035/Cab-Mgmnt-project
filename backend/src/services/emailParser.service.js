import { Booking } from "../models/Booking.js";
import { EmailLog } from "../models/EmailLog.js";

const fieldMap = {
  "Business Unit": "businessUnit",
  "Name of Passenger": "passengerName",
  "Mobile Number": "mobileNumber",
  "Travel Start Date": "travelStartDate",
  "Travel End Date": "travelEndDate",
  "Department Name": "departmentName",
  "Reporting Address": "reportingAddress",
  "Car Type": "carType",
  "Drop Address": "dropAddress",
  "Project Expenses": "projectExpenses",
  "Cost Center Of Project": "costCenter",
  "Booked By": "bookedBy",
  "Purpose of Cab Booking": "purpose",
  "Employee Count": "employeeCount",
  "Cab Request No": "cabRequestNumber"
};

export function parseBookingEmail(text) {
  const payload = {};
  for (const [label, key] of Object.entries(fieldMap)) {
    const match = text.match(new RegExp(`${escapeRegExp(label)}\\s*:\\s*(.+)`, "i"));
    if (match) payload[key] = match[1].trim();
  }
  payload.travelStartDate = parseTravelDate(payload.travelStartDate);
  payload.travelEndDate = parseTravelDate(payload.travelEndDate);
  payload.employeeCount = Number(payload.employeeCount || 1);
  payload.pickupLocation = payload.reportingAddress;
  payload.dropLocation = payload.dropAddress;
  return payload;
}

export async function createBookingFromEmail({ messageId, from, subject, text }) {
  const existing = await Booking.findOne({ $or: [{ emailMessageId: messageId }, { cabRequestNumber: parseBookingEmail(text).cabRequestNumber }] });
  if (existing) {
    await EmailLog.create({ messageId, direction: "Incoming", from, subject, status: "Duplicate", relatedBooking: existing._id });
    return existing;
  }
  const parsed = parseBookingEmail(text);
  const booking = await Booking.create({
    ...parsed,
    bookingId: `BK-${Date.now()}`,
    source: "Email",
    status: "New",
    emailMessageId: messageId,
    timeline: [{ title: "Email parsed", note: subject }]
  });
  await EmailLog.create({ messageId, direction: "Incoming", from, subject, status: "Parsed", relatedBooking: booking._id });
  return booking;
}

function parseTravelDate(value) {
  if (!value) return undefined;
  const normalized = value.replace(/(\d{2})-(\d{2})-(\d{4})/, "$3-$2-$1").replace(" PM", " PM").replace(" AM", " AM");
  return new Date(normalized);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
