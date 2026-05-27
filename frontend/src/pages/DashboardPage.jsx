import { Banknote, CalendarCheck, Car, ClipboardList, FileClock, IndianRupee, Route, Users } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DashboardCharts } from "../components/charts/DashboardCharts";
import { LoadingSkeleton } from "../components/common/LoadingSkeleton";
import { StatCard } from "../components/common/StatCard";
import { DataTable } from "../components/tables/DataTable";
import { fetchDashboard } from "../redux/slices/dashboardSlice";

export function DashboardPage() {
  const dispatch = useDispatch();
  const { data, loading } = useSelector((state) => state.dashboard);
  useEffect(() => { dispatch(fetchDashboard()); }, [dispatch]);
  if (loading && !data) return <LoadingSkeleton rows={8} />;
  const cards = data?.cards || {};
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white">Dashboard</h1>
        <p className="text-sm text-slate-500">Live cab operations, billing, availability, and recent activity.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={ClipboardList} label="Total Bookings" value={cards.totalBookings} />
        <StatCard icon={Route} label="Active Trips" value={cards.activeTrips} tone="amber" />
        <StatCard icon={CalendarCheck} label="Completed Trips" value={cards.completedTrips} tone="green" />
        <StatCard icon={FileClock} label="Pending Invoices" value={cards.pendingInvoices} tone="amber" />
        <StatCard icon={IndianRupee} label="Revenue Summary" value={`₹${Number(cards.revenueSummary || 0).toLocaleString()}`} tone="green" />
        <StatCard icon={Banknote} label="Pending Payments" value={`₹${Number(cards.pendingPayments || 0).toLocaleString()}`} tone="amber" />
        <StatCard icon={Users} label="Available Drivers" value={cards.availableDrivers} />
        <StatCard icon={Car} label="Available Cars" value={cards.availableCars} />
      </div>
      <DashboardCharts charts={data?.charts} />
      <div className="grid gap-4 xl:grid-cols-2">
        <section className="panel p-4">
          <h2 className="mb-3 font-semibold">Recent Bookings</h2>
          <DataTable rows={data?.recentBookings || []} columns={[{ key: "bookingId", header: "Booking" }, { key: "passengerName", header: "Passenger" }, { key: "status", header: "Status" }]} />
        </section>
        <section className="panel p-4">
          <h2 className="mb-3 font-semibold">Recent Invoices</h2>
          <DataTable rows={data?.recentInvoices || []} columns={[{ key: "invoiceNumber", header: "Invoice" }, { key: "status", header: "Status" }, { key: "finalAmount", header: "Amount", render: (r) => `₹${Number(r.finalAmount || 0).toLocaleString()}` }]} />
        </section>
      </div>
    </div>
  );
}
