import axios from "axios";
import {
  getToken,
  getRefreshToken,
  setAccessToken,
  clearToken,
  isTokenExpired,
} from "../auth/utils/auth";

const http = axios.create({
  baseURL: "http://localhost:8080",
});

let isRefreshing = false;
let refreshPromise = null;

async function refreshAccessTokenRequest() {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error("No refresh token found");
  }

  const response = await axios.post("http://localhost:8080/users/auth/refresh", {
    refreshToken,
  });

  const newAccessToken = response.data.accessToken;

  if (!newAccessToken) {
    throw new Error("No new access token returned");
  }

  setAccessToken(newAccessToken);
  return newAccessToken;
}

http.interceptors.request.use(
  async (config) => {
    let token = getToken();

    if (token && isTokenExpired(token)) {
      try {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshPromise = refreshAccessTokenRequest();
        }

        token = await refreshPromise;
      } catch (error) {
        // refresh failed — clear token but don't redirect yet
        // let the 401 response interceptor handle the redirect
        clearToken();
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      clearToken();
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default http;