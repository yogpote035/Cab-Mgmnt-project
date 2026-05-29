import { BarChart3, Car, ChevronRight, ClipboardList, FileText, Gauge, LogOut, Shield, UserCircle, Users, Wrench } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { logout } from "../../redux/slices/authSlice";

const sections = [
  {
    label: "Main",
    items: [{ label: "Dashboard", path: "/", icon: Gauge }]
  },
  {
    label: "Inventory",
    items: [
      { label: "Cars", path: "/inventory/cars", icon: Car },
      { label: "Drivers", path: "/inventory/drivers", icon: Users }
    ]
  },
  {
    label: "Bookings",
    items: [
      { label: "Inquiries", path: "/bookings/inquiries", icon: ClipboardList },
      { label: "Trips", path: "/bookings/trips", icon: Wrench }
    ]
  },
  {
    label: "Billing",
    items: [{ label: "Invoices", path: "/invoices", icon: FileText }]
  },
  {
    label: "Reports",
    items: [{ label: "Reports", path: "/reports", icon: BarChart3 }]
  },
  {
    label: "Admin",
    items: [
      { label: "Profile", path: "/admin/profile", icon: UserCircle },
      { label: "Manage Admins", path: "/admin/manage", icon: Shield }
    ]
  }
];

export function Sidebar({ open, onClose }: { open: boolean; onClose?: () => void }) {
  const dispatch = useAppDispatch();
  return (
    <aside className={`${open ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-40 flex w-62 flex-col border-r border-slate-200 bg-white/95 shadow-xl backdrop-blur transition md:static md:translate-x-0 dark:border-slate-800 dark:bg-slate-950/95`}>
      <div className="flex h-16 items-center gap-3 border-b border-slate-200/80 px-5 dark:border-slate-800">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-cyan-500 text-white shadow-lg shadow-brand-500/20">
          <Car className="h-5 w-5" />
        </div>
        <div>
          <div className="text-lg font-bold leading-tight text-slate-950 dark:text-white">Cab ERP</div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Management & Billing</div>
        </div>
      </div>
      <nav className="scrollbar-hidden flex-1 space-y-5 overflow-y-auto p-3">
        {sections.map((section) => (
          <div key={section.label}>
            {section.label !== "Main" && (
              <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                {section.label}
              </div>
            )}
            <div className="space-y-1">
              {section.items.map(({ label, path, icon: Icon }) => (
                <NavLink
                  key={path}
                  to={path}
                  onClick={onClose}
                  className={({ isActive }) => `group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? "bg-gradient-to-r from-brand-600 to-cyan-500 text-white shadow-md shadow-brand-500/20 dark:from-brand-500 dark:to-cyan-400 dark:text-slate-950" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"}`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    {label}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-current opacity-0 transition group-hover:opacity-80" />
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="sticky bottom-0 border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
        {/* <div className="mb-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{user?.name || "Admin"}</p>
          <p className="truncate text-xs text-slate-500">{user?.role || "Administrator"}</p>
        </div> */}
        <button className="btn-secondary w-full justify-start" onClick={() => dispatch(logout())}>
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}

