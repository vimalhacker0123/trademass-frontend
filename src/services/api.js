import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

// Request log - debugging ku
api.interceptors.request.use((config) => {
  console.log("API CALL:", config.method, config.url, config.data);
  return config;
});

// Response error log
api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("API ERROR:", err.response?.status, err.response?.data || err.message);
    return Promise.reject(err);
  }
);

export const billApi = {
  getAll: () => api.get("/bills"),
  getById: (id) => api.get(`/bills/${id}`),
  create: (data) => api.post("/bills", data),
  update: (id, data) => api.put(`/bills/${id}`, data),
  delete: (id) => api.delete(`/bills/${id}`),
  pay: (id) => api.patch(`/bills/${id}/pay`),
};

export default api;