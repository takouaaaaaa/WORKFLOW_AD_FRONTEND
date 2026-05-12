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
          // Race condition fix: attach finally directly on the promise
          refreshPromise = refreshAccessTokenRequest().finally(() => {
            isRefreshing = false;
            refreshPromise = null;
          });
        }

        // All concurrent requests await the same single promise
        token = await refreshPromise;
      } catch (error) {
        clearToken();
        return Promise.reject(error);
      }
    }

    // No in-memory token — try to silently refresh on page load
    if (!token) {
      try {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshPromise = refreshAccessTokenRequest().finally(() => {
            isRefreshing = false;
            refreshPromise = null;
          });
        }
        token = await refreshPromise;
      } catch {
        // No valid session at all — let the request go through without a token
        // The 401 interceptor below will redirect to login
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