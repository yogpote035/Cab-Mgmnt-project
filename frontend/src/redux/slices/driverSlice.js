import { createEntitySlice } from "./createEntitySlice";
const slice = createEntitySlice("drivers", "/drivers");
export const driverActions = slice.actions;
export default slice.reducer;
