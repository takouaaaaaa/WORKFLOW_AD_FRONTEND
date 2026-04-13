import axios from "axios";
import http from "../../../services/http";

const AUTH_BASE = "http://localhost:8080/users/auth";
const USER_BASE = "http://localhost:8080/users";

export function loginUser(data) {
  return axios.post(`${AUTH_BASE}/login`, data);
}

export function refreshAccessToken(refreshToken) {
  return axios.post(`${AUTH_BASE}/refresh`, { refreshToken });
}

export function logoutUser(refreshToken) {
  return axios.post(`${AUTH_BASE}/logout`, { refreshToken });
}

export function updateMyProfile(data) {
  return http.put("/users/me", data);
}