import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "https://trademass-backend-java1.onrender.com";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const billApi = {
  getAll: () => api.get("/api/bills"),
  create: (data) => api.post("/api/bills", data),
  delete: (id) => api.delete(`/api/bills/${id}`),
  // FIX: update + pay rendu-me data anuppanum
  update: (id, data) => api.put(`/api/bills/${id}`, data),
  pay: (id, data) => api.patch(`/api/bills/${id}/pay`, data),
};

export default api;