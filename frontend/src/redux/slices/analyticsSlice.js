import { createSlice } from "@reduxjs/toolkit";
import { fetchReportByType } from "./reportSlice";

export default createSlice({
  name: "analytics",
  initialState: { lastReportType: null, chartData: [] },
  reducers: {},
  extraReducers: (builder) => builder.addCase(fetchReportByType.fulfilled, (state, action) => {
    state.lastReportType = action.payload.type;
    state.chartData = action.payload.charts?.trend || [];
  })
}).reducer;
