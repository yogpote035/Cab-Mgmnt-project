import { createEntitySlice } from "./createEntitySlice";
const slice = createEntitySlice("vehicles", "/vehicles");
export const vehicleActions = slice.actions;
export default slice.reducer;
