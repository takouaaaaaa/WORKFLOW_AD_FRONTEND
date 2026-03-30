import axios from "axios";

// ── Single instance — everything through the API Gateway on 8080 ──
const api = axios.create({
  baseURL: "http://localhost:8080",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth (user-service)
export const loginUser  = (data) => api.post("/users/auth/login", data);
export const registerUser = (data) => api.post("/users/register", data);

// Config-service routes
export const getFluxes    = () => api.get("/flux");
export const getFileIns   = () => api.get("/filein");
export const getFileOuts  = () => api.get("/fileout");

export const forceFileIn  = (id) => api.put(`/filein/${id}/force`);
export const rejectFileIn = (id) => api.put(`/filein/${id}/reject`);

export const getSenders   = () => api.get("/senders");
export const getReceivers = () => api.get("/receivers");
export const getTypeFlux  = () => api.get("/typeflux");

export default api;