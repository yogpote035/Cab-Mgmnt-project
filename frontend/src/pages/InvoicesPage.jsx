import { Download } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DataTable } from "../components/tables/DataTable";
import { invoiceActions } from "../redux/slices/invoiceSlice";

export function InvoicesPage() {
  const dispatch = useDispatch();
  const invoices = useSelector((s) => s.invoices);
  useEffect(() => { dispatch(invoiceActions.fetchAll()); }, [dispatch]);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Invoices</h1><p className="text-sm text-slate-500">Invoice generation, emailing, payment tracking, and ageing.</p></div>
        <a className="btn-secondary" href={`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/reports/invoices.xlsx`}><Download className="h-4 w-4" />Excel</a>
      </div>
      <div className="panel p-4">
        <DataTable loading={invoices.loading} rows={invoices.items} columns={[
          { key: "invoiceNumber", header: "Invoice" }, { key: "clientName", header: "Client" }, { key: "status", header: "Status" }, { key: "finalAmount", header: "Total", render: (r) => `₹${Number(r.finalAmount || 0).toLocaleString()}` }, { key: "balanceAmount", header: "Balance", render: (r) => `₹${Number(r.balanceAmount || 0).toLocaleString()}` }
        ]} />
      </div>
    </div>
  );
}
