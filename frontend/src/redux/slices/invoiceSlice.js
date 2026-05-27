import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../api/client";
import { createEntitySlice } from "./createEntitySlice";

const slice = createEntitySlice("invoices", "/invoices");
export const generateInvoice = createAsyncThunk("invoices/generate", async (tripId) => (await api.post("/invoices", { tripId })).data);
export const regenerateInvoice = createAsyncThunk("invoices/regenerate", async (id) => (await api.post(`/invoices/${id}/regenerate`)).data);
export const sendInvoice = createAsyncThunk("invoices/send", async ({ id, payload }) => (await api.post(`/invoices/${id}/send`, payload)).data);
export const recordPayment = createAsyncThunk("invoices/payment", async ({ id, payload }) => (await api.post(`/invoices/${id}/payments`, payload)).data);
export const invoiceActions = slice.actions;
export default slice.reducer;
