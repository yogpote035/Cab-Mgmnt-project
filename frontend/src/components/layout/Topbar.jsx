import { Bell, Menu, Moon, Search, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { toggleTheme } from "../../redux/slices/themeSlice";

export function Topbar({ onMenu }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { mode } = useSelector((state) => state.theme);
  const user = useSelector((state) => state.auth.user);
  const [openNotifications, setOpenNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [seenIds, setSeenIds] = useState(() => JSON.parse(localStorage.getItem("seenBookingNotifications") || "[]"));
  const unreadNotifications = notifications.filter((item) => !seenIds.includes(item._id));

  useEffect(() => {
    let mounted = true;

    async function fetchNotifications() {
      try {
        const { data } = await api.get("/bookings", { params: { status: "New", limit: 5 } });
        if (mounted) setNotifications(data.items || []);
      } catch {
        if (mounted) setNotifications([]);
      }
    }

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  function openInquiry(notification) {
    const nextSeen = Array.from(new Set([...seenIds, notification._id]));
    setSeenIds(nextSeen);
    localStorage.setItem("seenBookingNotifications", JSON.stringify(nextSeen));
    setOpenNotifications(false);
    navigate("/bookings/inquiries");
  }

  function clearNotification(event, notificationId) {
    event.stopPropagation();
    const nextSeen = Array.from(new Set([...seenIds, notificationId]));
    setSeenIds(nextSeen);
    localStorage.setItem("seenBookingNotifications", JSON.stringify(nextSeen));
  }

  function clearAllNotifications() {
    const nextSeen = notifications.map((notification) => notification._id);
    setSeenIds(nextSeen);
    localStorage.setItem("seenBookingNotifications", JSON.stringify(nextSeen));
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 lg:px-6">
      <button className="btn-secondary p-2 md:hidden" onClick={onMenu} aria-label="Open menu">
        <Menu className="h-4 w-4" />
      </button>

      {/* <div className="hidden min-w-0 md:block">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Operations Console</p>
        <h1 className="truncate text-lg font-semibold text-slate-950 dark:text-white">Cab Management</h1>
      </div> */}

      <div className="relative ml-0 max-w-2xl flex-1 md:ml-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input className="input h-10 rounded-lg bg-slate-50 pl-9 dark:bg-slate-900" placeholder="Search bookings, invoices, drivers..." />
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <button className="btn-secondary relative p-2" aria-label="Notifications" onClick={() => setOpenNotifications((value) => !value)}>
            <Bell className="h-4 w-4" />
            {unreadNotifications.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                {unreadNotifications.length}
              </span>
            )}
          </button>
          {openNotifications && (
            <div className="absolute right-0 top-12 z-50 w-80 rounded-lg border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-3 py-2 dark:border-slate-800">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</p>
                  <p className="text-xs text-slate-500">{unreadNotifications.length} new booking inquiries</p>
                </div>
                {notifications.length > 0 && (
                  <button className="rounded-md px-2 py-1 text-xs font-medium text-brand-700 outline-none hover:bg-brand-50 dark:text-brand-200 dark:hover:bg-slate-800" onClick={clearAllNotifications}>
                    Clear all
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto py-2">
                {notifications.length === 0 ? (
                  <p className="px-3 py-5 text-center text-sm text-slate-500">No new booking notifications.</p>
                ) : notifications.map((notification) => (
                  <button
                    key={notification._id}
                    className="w-full rounded-md px-3 py-2 text-left outline-none transition hover:bg-slate-50 dark:hover:bg-slate-800"
                    onClick={() => openInquiry(notification)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{notification.passengerName || "New booking inquiry"}</p>
                        <p className="text-xs text-slate-500">{notification.cabRequestNumber || notification.bookingId}</p>
                        <span
                          role="button"
                          tabIndex={0}
                          className="mt-1 inline-block text-xs font-medium text-slate-500 hover:text-brand-700 dark:hover:text-brand-200"
                          onClick={(event) => clearNotification(event, notification._id)}
                          onKeyDown={(event) => { if (event.key === "Enter") clearNotification(event, notification._id); }}
                        >
                          Clear
                        </span>
                      </div>
                      {!seenIds.includes(notification._id) && <span className="mt-1 h-2 w-2 rounded-full bg-red-600" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <button className="btn-secondary p-2" onClick={() => dispatch(toggleTheme())} aria-label="Toggle theme">
          {mode === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>

      <div className="hidden items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 sm:flex dark:border-slate-800 dark:bg-slate-900">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-600 text-sm font-semibold text-white">
          {(user?.name || "A").slice(0, 1)}
        </div>
        <div className="min-w-0 text-sm">
          <p className="truncate font-semibold text-slate-900 dark:text-white">{user?.name || "Admin"}</p>
          <p className="truncate text-xs text-slate-500">{user?.role || "Administrator"}</p>
        </div>
      </div>
    </header>
  );
}
