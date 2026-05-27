import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api/client";
export const fetchReports = createAsyncThunk("reports/fetch", async () => (await api.get("/reports/summary")).data);
export default createSlice({
  name: "reports",
  initialState: { data: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => builder.addCase(fetchReports.fulfilled, (state, action) => { state.data = action.payload; })
}).reducer;
