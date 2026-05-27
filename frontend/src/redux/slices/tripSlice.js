import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../api/client";
import { createEntitySlice } from "./createEntitySlice";

const slice = createEntitySlice("trips", "/trips");
export const assignTrip = createAsyncThunk("trips/assign", async (payload) => (await api.post("/trips/assign", payload)).data);
export const completeTrip = createAsyncThunk("trips/complete", async ({ id, payload }) => (await api.patch(`/trips/${id}/complete`, payload)).data);
export const tripActions = slice.actions;
export default slice.reducer;
