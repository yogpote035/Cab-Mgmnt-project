import { createSlice } from "@reduxjs/toolkit";

const initialMode = localStorage.getItem("theme") || "light";
document.documentElement.classList.toggle("dark", initialMode === "dark");

const initialState = { mode: initialMode };

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme(state) {
      state.mode = state.mode === "dark" ? "light" : "dark";
      localStorage.setItem("theme", state.mode);
      document.documentElement.classList.toggle("dark", state.mode === "dark");
    }
  }
});

export const { toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
