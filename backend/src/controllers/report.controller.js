import { asyncHandler } from "../utils/asyncHandler.js";
import { getReport, reportExcelBuffer, reportPdfBuffer, summaryReport } from "../services/report.service.js";

export const reportsSummary = asyncHandler(async (_req, res) => res.json(await summaryReport()));

export const reportData = asyncHandler(async (req, res) => res.json(await getReport(req.params.type, req.query)));

export const exportReportExcel = asyncHandler(async (req, res) => {
  const buffer = await reportExcelBuffer(req.params.type, req.query);
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename=${req.params.type}.xlsx`);
  res.send(buffer);
});

export const exportReportPdf = asyncHandler(async (req, res) => {
  const buffer = await reportPdfBuffer(req.params.type, req.query);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=${req.params.type}.pdf`);
  res.send(buffer);
});
