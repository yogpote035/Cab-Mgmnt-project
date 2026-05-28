import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../api/client";
import { createEntitySlice } from "./createEntitySlice";

const slice = createEntitySlice("trips", "/trips");
export const assignTrip = createAsyncThunk<any, any>("trips/assign", async (payload) => (await api.post("/trips/assign", payload)).data);
export const completeTrip = createAsyncThunk<any, any>("trips/complete", async ({ id, payload }) => (await api.patch(`/trips/${id}/complete`, payload)).data);
export const updateTripStatus = createAsyncThunk<any, any>("trips/updateStatus", async ({ id, payload }) => (await api.patch(`/trips/${id}/status`, payload)).data);
export const tripActions = slice.actions;
export default slice.reducer;
