import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api/client";

export const fetchReports = createAsyncThunk<any, void>("reports/fetchSummary", async () => (await api.get("/reports/summary")).data);
export const fetchReportByType = createAsyncThunk<any, any>("reports/fetchByType", async ({ type, params = {} }) => (await api.get(`/reports/${type}`, { params })).data);

const initialState = { data: null as any, current: null as any, loading: false, error: null as any };

export default createSlice({
  name: "reports",
  initialState,
  reducers: {},
  extraReducers: (builder) => builder
    .addCase(fetchReports.fulfilled, (state, action) => { state.data = action.payload; })
    .addCase(fetchReportByType.pending, (state) => { state.loading = true; state.error = null; })
    .addCase(fetchReportByType.fulfilled, (state, action) => { state.loading = false; state.current = action.payload; })
    .addCase(fetchReportByType.rejected, (state, action) => { state.loading = false; state.error = action.error.message; })
}).reducer;
