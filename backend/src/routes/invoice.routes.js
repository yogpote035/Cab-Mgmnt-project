import { Router } from "express";
import { createInvoice, downloadInvoicePdf, listInvoices, recordPayment, regenerateInvoiceController, sendInvoice } from "../controllers/invoice.controller.js";
import { allowRoles, requireAuth } from "../middleware/auth.js";

export const invoiceRoutes = Router();
invoiceRoutes.use(requireAuth);
invoiceRoutes.get("/", listInvoices);
invoiceRoutes.post("/", allowRoles("Super Admin", "Billing Admin"), createInvoice);
invoiceRoutes.get("/:id/pdf", downloadInvoicePdf);
invoiceRoutes.post("/:id/regenerate", allowRoles("Super Admin", "Billing Admin"), regenerateInvoiceController);
invoiceRoutes.post("/:id/send", allowRoles("Super Admin", "Billing Admin"), sendInvoice);
invoiceRoutes.post("/:id/payments", allowRoles("Super Admin", "Billing Admin"), recordPayment);
