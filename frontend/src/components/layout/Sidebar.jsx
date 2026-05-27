import { BarChart3, Car, ClipboardList, FileText, Gauge, Shield, UserCircle, Users, Wrench } from "lucide-react";
import { NavLink } from "react-router-dom";

const items = [
  { label: "Dashboard", path: "/", icon: Gauge },
  { label: "Cars", path: "/inventory/cars", icon: Car },
  { label: "Drivers", path: "/inventory/drivers", icon: Users },
  { label: "Inquiries", path: "/bookings/inquiries", icon: ClipboardList },
  { label: "Trips", path: "/bookings/trips", icon: Wrench },
  { label: "Invoices", path: "/invoices", icon: FileText },
  { label: "Reports", path: "/reports", icon: BarChart3 },
  { label: "Profile", path: "/admin/profile", icon: UserCircle },
  { label: "Manage Admins", path: "/admin/manage", icon: Shield }
];

export function Sidebar({ open, onClose }) {
  return (
    <aside className={`${open ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200 bg-white transition md:static md:translate-x-0 dark:border-slate-800 dark:bg-slate-950`}>
      <div className="flex h-16 items-center border-b border-slate-200 px-5 dark:border-slate-800">
        <div className="text-lg font-bold text-slate-950 dark:text-white">Cab ERP</div>
      </div>
      <nav className="space-y-1 p-3">
        {items.map(({ label, path, icon: Icon }) => (
          <NavLink key={path} to={path} onClick={onClose} className={({ isActive }) => `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${isActive ? "bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-100" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"}`}>
            <Icon className="h-4 w-4" />{label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
