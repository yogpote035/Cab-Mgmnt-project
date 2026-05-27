import { Menu, Moon, Search, Sun } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../../redux/slices/themeSlice";
import { logout } from "../../redux/slices/authSlice";

export function Topbar({ onMenu }) {
  const dispatch = useDispatch();
  const { mode } = useSelector((state) => state.theme);
  const user = useSelector((state) => state.auth.user);
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <button className="btn-secondary p-2 md:hidden" onClick={onMenu} aria-label="Open menu"><Menu className="h-4 w-4" /></button>
      <div className="relative max-w-xl flex-1">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input className="input pl-9" placeholder="Search bookings, invoices, drivers..." />
      </div>
      <button className="btn-secondary p-2" onClick={() => dispatch(toggleTheme())} aria-label="Toggle theme">{mode === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button>
      <div className="hidden text-right text-sm sm:block">
        <p className="font-medium text-slate-900 dark:text-white">{user?.name || "Admin"}</p>
        <p className="text-slate-500">{user?.role}</p>
      </div>
      <button className="btn-secondary" onClick={() => dispatch(logout())}>Logout</button>
    </header>
  );
}
