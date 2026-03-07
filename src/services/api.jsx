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
export const registerUser = (data) => axios.post("http://localhost:8081/users/auth/register", data);

export default axiosInstance;