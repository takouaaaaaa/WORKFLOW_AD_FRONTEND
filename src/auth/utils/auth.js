import { jwtDecode } from "jwt-decode";

// Access token stored in memory only — never readable by XSS
let _accessToken = null;

export function getToken() {
  return _accessToken;
}

export function getRefreshToken() {
  return sessionStorage.getItem("refreshToken");
}

export function setTokens(accessToken, refreshToken) {
  _accessToken = accessToken;
  sessionStorage.setItem("refreshToken", refreshToken);
}

export function setAccessToken(accessToken) {
  _accessToken = accessToken;
}

export function clearToken() {
  _accessToken = null;
  sessionStorage.removeItem("refreshToken");
}

export function isTokenExpired(token) {
  if (!token) return true;

  try {
    const decoded = jwtDecode(token);
    const now = Date.now() / 1000;
    return decoded.exp < now;
  } catch {
    return true;
  }
}

function normalizeRole(role) {
  if (!role) return "";
  return role.startsWith("ROLE_") ? role.replace("ROLE_", "") : role;
}

export function getUserFromToken() {
  const token = getToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);

    const rawRoles =
      decoded.roles ||
      decoded.authorities ||
      decoded.role ||
      [];

    const rolesArray = Array.isArray(rawRoles) ? rawRoles : [rawRoles];
    const normalizedRoles = rolesArray.map(normalizeRole);

    return {
      email: decoded.sub || decoded.email || "",
      roles: normalizedRoles,
      decoded,
    };
  } catch {
    clearToken();
    return null;
  }
}

export function hasRole(allowedRoles = []) {
  const user = getUserFromToken();

  if (!user || !user.roles) return false;

  const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return user.roles.some((role) => rolesArray.includes(role));
}