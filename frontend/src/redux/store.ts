import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import dashboardReducer from "./slices/dashboardSlice";
import bookingReducer from "./slices/bookingSlice";
import tripReducer from "./slices/tripSlice";
import vehicleReducer from "./slices/vehicleSlice";
import driverReducer from "./slices/driverSlice";
import invoiceReducer from "./slices/invoiceSlice";
import paymentReducer from "./slices/paymentSlice";
import adminReducer from "./slices/adminSlice";
import reportReducer from "./slices/reportSlice";
import analyticsReducer from "./slices/analyticsSlice";
import themeReducer from "./slices/themeSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    bookings: bookingReducer,
    trips: tripReducer,
    vehicles: vehicleReducer,
    drivers: driverReducer,
    invoices: invoiceReducer,
    payments: paymentReducer,
    admins: adminReducer,
    reports: reportReducer,
    analytics: analyticsReducer,
    theme: themeReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
