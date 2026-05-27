import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const colors = ["#2388d9", "#10b981", "#f59e0b", "#ef4444", "#64748b"];
const normalize = (rows = []) => rows.map((row) => ({ name: row._id?.month ? `${row._id.month}/${row._id.year}` : row._id, value: row.value }));

export function DashboardCharts({ charts = {} }) {
  const revenue = normalize(charts.revenue);
  const trips = normalize(charts.trips);
  const status = normalize(charts.invoiceStatus);
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <div className="panel p-4 xl:col-span-2">
        <h3 className="mb-4 font-semibold text-slate-950 dark:text-white">Revenue Analytics</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={revenue}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Line type="monotone" dataKey="value" stroke="#2388d9" strokeWidth={3} /></LineChart>
        </ResponsiveContainer>
      </div>
      <div className="panel p-4">
        <h3 className="mb-4 font-semibold text-slate-950 dark:text-white">Invoice Status</h3>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart><Pie data={status} dataKey="value" nameKey="name" outerRadius={86}>{status.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}</Pie><Tooltip /></PieChart>
        </ResponsiveContainer>
      </div>
      <div className="panel p-4 xl:col-span-3">
        <h3 className="mb-4 font-semibold text-slate-950 dark:text-white">Trip Analytics</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={trips}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} /></BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
