import { Router } from "express";
import { createInvoice, listInvoices, recordPayment, sendInvoice } from "../controllers/invoice.controller.js";
import { allowRoles, requireAuth } from "../middleware/auth.js";

export const invoiceRoutes = Router();
invoiceRoutes.use(requireAuth);
invoiceRoutes.get("/", listInvoices);
invoiceRoutes.post("/", allowRoles("Super Admin", "Billing Admin"), createInvoice);
invoiceRoutes.post("/:id/send", allowRoles("Super Admin", "Billing Admin"), sendInvoice);
invoiceRoutes.post("/:id/payments", allowRoles("Super Admin", "Billing Admin"), recordPayment);
