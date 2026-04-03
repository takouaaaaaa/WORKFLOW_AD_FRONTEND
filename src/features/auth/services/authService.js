import axios from "axios";

const AUTH_BASE = "http://localhost:8080/users/auth";

export function loginUser(data) {
  return axios.post(`${AUTH_BASE}/login`, data);
}

export function refreshAccessToken(refreshToken) {
  return axios.post(`${AUTH_BASE}/refresh`, { refreshToken });
}

export function logoutUser(refreshToken) {
  return axios.post(`${AUTH_BASE}/logout`, { refreshToken });
}