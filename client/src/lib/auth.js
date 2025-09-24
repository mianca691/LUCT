import { USER_ROLES } from "./constants";

const TOKEN_KEY = import.meta.env.VITE_JWT_KEY || "authToken";
const USER_KEY = "authUser";

export const setAuth = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const getUser = () => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => !!getToken();

export const getUserRole = () => {
  const user = getUser();
  return user?.role_name || null;
};

export const hasRole = (roles = []) => {
  const role = getUserRole();
  return roles.includes(role);
};

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.location.href = "/login";
};
