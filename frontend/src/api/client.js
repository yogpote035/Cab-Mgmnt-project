import axios from "axios";

let activeRequests = 0;

function emitLoading() {
  window.dispatchEvent(new CustomEvent("api-loading", { detail: activeRequests > 0 }));
}

function startLoading() {
  activeRequests += 1;
  emitLoading();
}

function stopLoading() {
  activeRequests = Math.max(activeRequests - 1, 0);
  emitLoading();
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 20000
});

api.interceptors.request.use((config) => {
  startLoading();
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => {
  stopLoading();
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => {
    stopLoading();
    return response;
  },
  async (error) => {
    stopLoading();
    const original = error.config;
    if (error.response?.status === 401 && !original._retry && localStorage.getItem("refreshToken")) {
      original._retry = true;
      const { data } = await axios.post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken: localStorage.getItem("refreshToken") });
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      original.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(original);
    }
    return Promise.reject(error);
  }
);
