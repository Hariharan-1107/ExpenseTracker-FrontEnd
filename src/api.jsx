// Set up axios interceptor or fetch wrapper
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080", // Your backend URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api; // Fixed: export default
