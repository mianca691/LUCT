// lib/endpoints/classes.js
import api from "@/lib/api";
import { ENDPOINTS } from "@/lib/constants";

export const getAllClasses = () => api.get(ENDPOINTS.CLASSES.ALL);

export const getStudentClasses = (studentId) =>
  api.get(ENDPOINTS.CLASSES.BY_STUDENT(studentId));

export const getStudentClassCount = (studentId) =>
  api.get(ENDPOINTS.CLASSES.COUNT_BY_STUDENT(studentId));
