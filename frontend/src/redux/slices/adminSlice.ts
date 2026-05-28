import { createEntitySlice } from "./createEntitySlice";
const slice = createEntitySlice("admins", "/admins");
export const adminActions = slice.actions;
export default slice.reducer;
