import { Router } from "express";
import { exportInvoices, reportsSummary } from "../controllers/report.controller.js";
import { requireAuth } from "../middleware/auth.js";

export const reportRoutes = Router();
reportRoutes.use(requireAuth);
reportRoutes.get("/summary", reportsSummary);
reportRoutes.get("/invoices.xlsx", exportInvoices);
