import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api/client";

export const fetchDashboard = createAsyncThunk<any, any>("dashboard/fetch", async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/dashboard", { params });
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

const initialState = { data: null as any, loading: false, error: null as any };

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => builder
    .addCase(fetchDashboard.pending, (state) => { state.loading = true; })
    .addCase(fetchDashboard.fulfilled, (state, action) => { state.loading = false; state.data = action.payload; })
    .addCase(fetchDashboard.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
});

export default dashboardSlice.reducer;
