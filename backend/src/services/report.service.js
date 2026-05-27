import ExcelJS from "exceljs";
import { Invoice } from "../models/Invoice.js";
import { Trip } from "../models/Trip.js";

export async function summaryReport() {
  const [tripCount, invoiceCount, revenue] = await Promise.all([
    Trip.countDocuments({ status: "Completed" }),
    Invoice.countDocuments(),
    Invoice.aggregate([{ $group: { _id: null, total: { $sum: "$finalAmount" }, outstanding: { $sum: "$balanceAmount" } } }])
  ]);
  return { tripCount, invoiceCount, revenue: revenue[0]?.total || 0, outstanding: revenue[0]?.outstanding || 0 };
}

export async function invoicesExcelBuffer() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Invoices");
  sheet.columns = [
    { header: "Invoice", key: "invoiceNumber", width: 18 },
    { header: "Status", key: "status", width: 14 },
    { header: "Final Amount", key: "finalAmount", width: 16 },
    { header: "Balance", key: "balanceAmount", width: 16 }
  ];
  const invoices = await Invoice.find().lean();
  sheet.addRows(invoices);
  return workbook.xlsx.writeBuffer();
}
