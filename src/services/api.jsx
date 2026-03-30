import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8081",
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const loginUser = (data) => axios.post("http://localhost:8081/users/auth/login", data);
export const registerUser = (data) => axiosInstance.post("/users/register", data);

const configInstance = axios.create({
  baseURL: "http://localhost:8082",
});

configInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getFileIns = () => configInstance.get("/filein");
export const getFileOuts = () => configInstance.get("/fileout");
export const forceFileIn = (id) => configInstance.put(`/filein/${id}/force`);
export const rejectFileIn = (id) => configInstance.put(`/filein/${id}/reject`);
export default axiosInstance;