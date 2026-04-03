import { jwtDecode } from "jwt-decode";

export function getToken() {
  return localStorage.getItem("token");
}

export function getRefreshToken() {
  return localStorage.getItem("refreshToken");
}

export function setTokens(accessToken, refreshToken) {
  localStorage.setItem("token", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
}

export function setAccessToken(accessToken) {
  localStorage.setItem("token", accessToken);
}

export function clearToken() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
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
export function hasRole(allowedRoles = []) {
  const user = getUserFromToken();

  if (!user || !user.roles) return false;

  const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return user.roles.some((role) => rolesArray.includes(role));
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