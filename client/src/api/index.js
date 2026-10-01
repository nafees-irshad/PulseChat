import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout
});

api.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? window.localStorage.getItem("token") : null;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response interceptor (centralized error handling)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("token");
        if (
          window.location.pathname !== "/login" &&
          window.location.pathname !== "/signup"
        ) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;
