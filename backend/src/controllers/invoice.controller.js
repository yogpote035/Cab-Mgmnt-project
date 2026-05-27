import { Invoice } from "../models/Invoice.js";
import { Payment } from "../models/Payment.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateInvoiceForTrip, regenerateInvoice } from "../services/invoice.service.js";
import { sendInvoiceEmail } from "../services/email.service.js";
import { generateInvoicePdf } from "../services/pdf.service.js";

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

export const regenerateInvoiceController = asyncHandler(async (req, res) => res.json(await regenerateInvoice(req.params.id)));

export const downloadInvoicePdf = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) throw new ApiError(404, "Invoice not found");
  invoice.pdfPath = await generateInvoicePdf(invoice);
  await invoice.save();
  const freshInvoice = await Invoice.findById(req.params.id);
  res.download(freshInvoice.pdfPath, `${freshInvoice.invoiceNumber}.pdf`);
});

export const sendInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) throw new ApiError(404, "Invoice not found");
  if (req.body.clientEmail) invoice.clientEmail = req.body.clientEmail;
  if (!invoice.clientEmail) throw new ApiError(400, "Client email is required before sending invoice");
  invoice.pdfPath = await generateInvoicePdf(invoice);
  await invoice.save();
  const invoiceToSend = await Invoice.findById(req.params.id).populate("booking trip");
  await sendInvoiceEmail(invoiceToSend, invoiceToSend.pdfPath);
  invoiceToSend.status = "Sent";
  invoiceToSend.sentAt = new Date();
  await invoiceToSend.save();
  res.json(await Invoice.findById(req.params.id).populate("booking trip"));
});

export const recordPayment = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) throw new ApiError(404, "Invoice not found");
  const amount = Number(req.body.amount);
  if (!amount || amount <= 0) throw new ApiError(400, "Payment amount must be greater than zero");
  if (amount > invoice.balanceAmount) throw new ApiError(400, "Payment amount cannot exceed outstanding balance");
  const payment = await Payment.create({ ...req.body, invoice: invoice._id, recordedBy: req.user._id });
  invoice.paidAmount += payment.amount;
  invoice.balanceAmount = Math.max(invoice.finalAmount - invoice.paidAmount, 0);
  invoice.status = invoice.balanceAmount === 0 ? "Paid" : "Partial";
  invoice.pdfPath = await generateInvoicePdf(invoice);
  await invoice.save();
  res.status(201).json({ invoice, payment });
});
