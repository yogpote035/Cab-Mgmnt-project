import { asyncHandler } from "../utils/asyncHandler.js";
import { invoicesExcelBuffer, summaryReport } from "../services/report.service.js";

export const reportsSummary = asyncHandler(async (_req, res) => res.json(await summaryReport()));

export const exportInvoices = asyncHandler(async (_req, res) => {
  const buffer = await invoicesExcelBuffer();
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", "attachment; filename=invoices.xlsx");
  res.send(buffer);
});
