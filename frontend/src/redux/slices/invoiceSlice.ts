import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../api/client";
import { createEntitySlice } from "./createEntitySlice";

const slice = createEntitySlice("invoices", "/invoices");
export const generateInvoice = createAsyncThunk<any, any>("invoices/generate", async (tripId) => (await api.post("/invoices", { tripId })).data);
export const regenerateInvoice = createAsyncThunk<any, any>("invoices/regenerate", async (id) => (await api.post(`/invoices/${id}/regenerate`)).data);
export const sendInvoice = createAsyncThunk<any, any>("invoices/send", async ({ id, payload }) => (await api.post(`/invoices/${id}/send`, payload, { timeout: 120000 })).data);
export const recordPayment = createAsyncThunk<any, any>("invoices/payment", async ({ id, payload }) => (await api.post(`/invoices/${id}/payments`, payload)).data);
export const invoiceActions = slice.actions;
export default slice.reducer;
