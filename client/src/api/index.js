import axios from "axios";

const API_BASE_URL = "http://localhost:4183/api";

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

export default api;
