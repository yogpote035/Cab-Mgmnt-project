import { Booking } from "../models/Booking.js";
import { EmailLog } from "../models/EmailLog.js";

const fieldMap = {
  businessUnit: ["Business Unit", "Buisness Unit"],
  passengerName: ["Name of Passenger", "Passenger Name"],
  mobileNumber: ["Mobile Number", "Mobile No", "Contact Number"],
  travelStartDate: ["Travel Start Date", "Start Date"],
  travelEndDate: ["Travel End Date", "End Date"],
  departmentName: ["Department Name"],
  reportingAddress: ["Reporting Address", "Pickup Address"],
  carType: ["Car Type", "Car type"],
  dropAddress: ["Drop Address", "Drop address"],
  projectExpenses: ["Project Expenses"],
  costCenter: ["Cost Center Of Project", "Cost Center"],
  bookedBy: ["Booked By", "Booked by"],
  purpose: ["Purpose of Cab Booking", "Purpose of cab booking"],
  employeeCount: ["Employee Count"],
  cabRequestNumber: ["Cab Request No", "Cab Request No.", "Cab Request No .", "Cab Request Number"]
};

export function parseBookingEmail(text) {
  const payload = {};
  const normalizedText = normalizeEmailText(text);

  for (const [key, labels] of Object.entries(fieldMap)) {
    for (const label of labels) {
      const match = normalizedText.match(new RegExp(`^\\s*${escapeRegExp(label)}\\s*\\.?\\s*:\\s*(.+)\\s*$`, "im"));
      if (match) {
        payload[key] = cleanValue(match[1]);
        break;
      }
    }
  }

  payload.mobileNumber = normalizeMobile(payload.mobileNumber);
  payload.travelStartDate = parseTravelDate(payload.travelStartDate);
  payload.travelEndDate = parseTravelDate(payload.travelEndDate);
  payload.employeeCount = Number(payload.employeeCount || 1);
  payload.pickupLocation = payload.reportingAddress;
  payload.dropLocation = payload.dropAddress;
  return payload;
}

export async function createBookingFromEmail({ messageId, from, subject, text }) {
  const parsed = parseBookingEmail(text);
  if (!isBookingEmail(parsed)) {
    await upsertEmailLog({ messageId, direction: "Incoming", from, subject, status: "Ignored", error: "Email does not contain required cab booking fields" });
    return null;
  }

  const duplicateFilters = [{ emailMessageId: messageId }];
  if (parsed.cabRequestNumber) duplicateFilters.push({ cabRequestNumber: parsed.cabRequestNumber });

  const existing = await Booking.findOne({ $or: duplicateFilters });
  if (existing) {
    await upsertEmailLog({ messageId, direction: "Incoming", from, subject, status: "Duplicate", relatedBooking: existing._id });
    return existing;
  }

  const booking = await Booking.create({
    ...parsed,
    bookingId: `BK-${Date.now()}`,
    source: "Email",
    status: "New",
    emailMessageId: messageId,
    timeline: [{ title: "Email parsed", note: subject }]
  });
  await upsertEmailLog({ messageId, direction: "Incoming", from, subject, status: "Parsed", relatedBooking: booking._id });
  return booking;
}

export function isBookingEmail(parsed) {
  return Boolean(
    parsed.passengerName &&
    parsed.mobileNumber &&
    parsed.travelStartDate instanceof Date &&
    !Number.isNaN(parsed.travelStartDate.getTime()) &&
    parsed.reportingAddress &&
    parsed.dropAddress
  );
}

async function upsertEmailLog(payload) {
  return EmailLog.findOneAndUpdate(
    { messageId: payload.messageId },
    payload,
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

function parseTravelDate(value) {
  if (!value) return undefined;
  let normalized = value
    .replace(/(\d{2})-(\d{2})-(\d{4})/, "$3-$2-$1")
    .replace(/\s+/g, " ")
    .trim();

  normalized = normalized.replace(/\b(1[3-9]|2[0-3]):([0-5]\d)\s*(AM|PM)\b/i, "$1:$2");
  return new Date(normalized);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeEmailText(text) {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/=\r?\n/g, "")
    .replace(/=3D/g, "=");
}

function cleanValue(value) {
  return String(value || "")
    .replace(/^["'\[]+|["';,]+$/g, "")
    .trim();
}

function normalizeMobile(value) {
  if (!value) return value;
  const match = String(value).match(/\d{10,15}/);
  return match ? match[0] : value;
}
