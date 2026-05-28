import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api/client";

export function createEntitySlice(name: string, endpoint: string) {
  const fetchAll = createAsyncThunk<any, any>(`${name}/fetchAll`, async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get(endpoint, { params });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  });

  const createOne = createAsyncThunk<any, any>(`${name}/createOne`, async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post(endpoint, payload);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  });

  const updateOne = createAsyncThunk<any, any>(`${name}/updateOne`, async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`${endpoint}/${id}`, payload);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  });

  const deleteOne = createAsyncThunk<any, any>(`${name}/deleteOne`, async (id, { rejectWithValue }) => {
    try {
      await api.delete(`${endpoint}/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  });

  const slice = createSlice({
    name,
    initialState: { items: [] as any[], total: 0, page: 1, pages: 1, loading: false, error: null as any },
    reducers: {},
    extraReducers: (builder) => {
      builder
        .addCase(fetchAll.pending, (state) => { state.loading = true; state.error = null; })
        .addCase(fetchAll.fulfilled, (state, action) => {
          Object.assign(state, { loading: false, items: action.payload.items || action.payload, total: action.payload.total || 0, page: action.payload.page || 1, pages: action.payload.pages || 1 });
        })
        .addCase(fetchAll.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
        .addCase(createOne.fulfilled, (state, action) => { state.items.unshift(action.payload); })
        .addCase(updateOne.fulfilled, (state, action) => {
          state.items = state.items.map((item) => (item._id === action.payload._id ? action.payload : item));
        })
        .addCase(deleteOne.fulfilled, (state, action) => {
          state.items = state.items.filter((item) => item._id !== action.payload);
        });
    }
  });

  return { reducer: slice.reducer, actions: { fetchAll, createOne, updateOne, deleteOne } };
}
