import { Invoice } from "../models/Invoice.js";
import { Payment } from "../models/Payment.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateInvoiceForTrip } from "../services/invoice.service.js";
import { sendInvoiceEmail } from "../services/email.service.js";

export const listInvoices = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Number(req.query.limit || 10);
  const filter = req.query.status ? { status: req.query.status } : {};
  const [items, total] = await Promise.all([
    Invoice.find(filter).populate("booking trip").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Invoice.countDocuments(filter)
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) || 1 });
});

export const createInvoice = asyncHandler(async (req, res) => res.status(201).json(await generateInvoiceForTrip(req.body.tripId)));

export const sendInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) throw new ApiError(404, "Invoice not found");
  if (!invoice.clientEmail) invoice.clientEmail = req.body.clientEmail;
  await sendInvoiceEmail(invoice, invoice.pdfPath);
  invoice.status = "Sent";
  invoice.sentAt = new Date();
  await invoice.save();
  res.json(invoice);
});

export const recordPayment = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) throw new ApiError(404, "Invoice not found");
  const payment = await Payment.create({ ...req.body, invoice: invoice._id, recordedBy: req.user._id });
  invoice.paidAmount += payment.amount;
  invoice.balanceAmount = Math.max(invoice.finalAmount - invoice.paidAmount, 0);
  invoice.status = invoice.balanceAmount === 0 ? "Paid" : "Partial";
  await invoice.save();
  res.status(201).json({ invoice, payment });
});
