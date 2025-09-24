// lib/endpoints/users.js
import api from "@/lib/api";
import { ENDPOINTS } from "@/lib/constants";

export const getCurrentUser = () => api.get(ENDPOINTS.USERS);
