import { createSlice } from "@reduxjs/toolkit";
export default createSlice({
  name: "payments",
  initialState: { items: [] as any[], loading: false, error: null as any },
  reducers: {}
}).reducer;
