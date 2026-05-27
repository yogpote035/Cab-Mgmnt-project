import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { AdminsPage, ProfilePage } from "../pages/AdminPage";
import { InquiriesPage } from "../pages/BookingsPage";
import { DashboardPage } from "../pages/DashboardPage";
import { CarsPage, DriversPage } from "../pages/InventoryPages";
import { InvoicesPage } from "../pages/InvoicesPage";
import { LoginPage } from "../pages/LoginPage";
import { ReportsPage } from "../pages/ReportsPage";
import { TripsPage } from "../pages/TripsPage";
import { ProtectedRoute } from "./ProtectedRoute";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [{
      element: <AppLayout />,
      children: [
        { index: true, element: <DashboardPage /> },
        { path: "inventory/cars", element: <CarsPage /> },
        { path: "inventory/drivers", element: <DriversPage /> },
        { path: "bookings/inquiries", element: <InquiriesPage /> },
        { path: "bookings/trips", element: <TripsPage /> },
        { path: "invoices", element: <InvoicesPage /> },
        { path: "reports", element: <ReportsPage /> },
        { path: "reports/:type", element: <ReportsPage /> },
        { path: "admin/profile", element: <ProfilePage /> },
        { path: "admin/manage", element: <AdminsPage /> }
      ]
    }]
  }
]);
