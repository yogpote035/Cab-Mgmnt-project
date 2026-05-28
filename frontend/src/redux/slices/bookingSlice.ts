import { createEntitySlice } from "./createEntitySlice";
const slice = createEntitySlice("bookings", "/bookings");
export const bookingActions = slice.actions;
export default slice.reducer;
