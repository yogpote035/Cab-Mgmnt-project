import { Download, FileBarChart } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { StatCard } from "../components/common/StatCard";
import { fetchReports } from "../redux/slices/reportSlice";

export function ReportsPage() {
  const dispatch = useDispatch();
  const reports = useSelector((state) => state.reports.data);
  useEffect(() => { dispatch(fetchReports()); }, [dispatch]);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-sm text-slate-500">Daily trips, driver-wise, vehicle-wise, billing, pending payment, and revenue exports.</p>
        </div>
        <a className="btn-primary" href={`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/reports/invoices.xlsx`}><Download className="h-4 w-4" />Export Billing Excel</a>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={FileBarChart} label="Completed Trips" value={reports?.tripCount} />
        <StatCard icon={FileBarChart} label="Invoices" value={reports?.invoiceCount} />
        <StatCard icon={FileBarChart} label="Revenue" value={`₹${Number(reports?.revenue || 0).toLocaleString()}`} tone="green" />
        <StatCard icon={FileBarChart} label="Outstanding" value={`₹${Number(reports?.outstanding || 0).toLocaleString()}`} tone="amber" />
      </div>
      <div className="panel p-4">
        <h2 className="font-semibold">Available Filters</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-5">
          <input className="input" type="date" />
          <input className="input" type="date" />
          <input className="input" placeholder="Driver" />
          <input className="input" placeholder="Vehicle" />
          <select className="input"><option>All invoice statuses</option><option>Draft</option><option>Sent</option><option>Paid</option><option>Partial</option><option>Overdue</option></select>
        </div>
      </div>
    </div>
  );
}
