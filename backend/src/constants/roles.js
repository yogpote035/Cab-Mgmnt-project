export const ROLES = ["Super Admin", "Operations Admin", "Billing Admin", "Viewer"];

export const PERMISSIONS = {
  dashboard: ["Super Admin", "Operations Admin", "Billing Admin", "Viewer"],
  inventory: ["Super Admin", "Operations Admin"],
  bookings: ["Super Admin", "Operations Admin"],
  trips: ["Super Admin", "Operations Admin"],
  invoices: ["Super Admin", "Billing Admin"],
  reports: ["Super Admin", "Billing Admin", "Viewer"],
  admins: ["Super Admin"]
};
