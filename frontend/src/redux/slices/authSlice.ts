import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api/client";
import { apiErrorMessage } from "../../api/errors";

export const login = createAsyncThunk<any, any>("auth/login", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/auth/login", payload);
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    return data.user;
  } catch (error) {
    return rejectWithValue(apiErrorMessage(error));
  }
});

export const loadMe = createAsyncThunk<any, void>("auth/loadMe", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/auth/me");
    return data.user;
  } catch (error) {
    return rejectWithValue(apiErrorMessage(error));
  }
});

const initialState = {
  user: null as any,
  loading: false,
  error: null as any,
  isAuthenticated: Boolean(localStorage.getItem("accessToken"))
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      state.user = null;
      state.isAuthenticated = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; state.isAuthenticated = true; })
      .addCase(login.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(loadMe.fulfilled, (state, action) => { state.user = action.payload; state.isAuthenticated = true; })
      .addCase(loadMe.rejected, (state) => { state.isAuthenticated = false; state.user = null; });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
