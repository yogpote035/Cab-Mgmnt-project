import { Router } from "express";
import { exportReportExcel, exportReportPdf, reportData, reportsSummary } from "../controllers/report.controller.js";
import { requireAuth } from "../middleware/auth.js";

export const reportRoutes = Router();
reportRoutes.use(requireAuth);
reportRoutes.get("/summary", reportsSummary);
reportRoutes.get("/dashboard-summary", reportsSummary);
reportRoutes.get("/:type", reportData);
reportRoutes.get("/:type/export.xlsx", exportReportExcel);
reportRoutes.get("/:type/export.pdf", exportReportPdf);
