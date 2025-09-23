export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/";

export const USER_ROLES = {
  STUDENT: "student",
  LECTURER: "lecturer",
  PRL: "prl",
  PL: "pl",
};

export const MESSAGES = {
  LOGIN_SUCCESS: "Login successful.",
  LOGIN_FAILED: "Invalid credentials, please try again.",
  LOGOUT_SUCCESS: "You have been logged out.",
  REPORT_SUBMIT_SUCCESS: "Report submitted successfully.",
  REPORT_SUBMIT_ERROR: "Failed to submit report. Try again.",
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
};

// API endpoints mapped to backend routes
export const ENDPOINTS = {
  AUTH: {
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGIN: `${API_BASE_URL}/auth/login`,
  },
  USERS: `${API_BASE_URL}/users`,
  STUDENTS: `${API_BASE_URL}/students`,
  LECTURERS: `${API_BASE_URL}/lecturers`,
  CLASSES: `${API_BASE_URL}/classes`,
  COURSES: `${API_BASE_URL}/courses`,
  COURSE_ASSIGNMENTS: `${API_BASE_URL}/course-assignments`,
  FACULTIES: `${API_BASE_URL}/faculties`,
  PROGRAMS: `${API_BASE_URL}/programs`,
  VENUES: `${API_BASE_URL}/venues`,
  LECTURE_REPORTS: `${API_BASE_URL}/lecture-reports`,
  FEEDBACK: `${API_BASE_URL}/feedbacks`,
  RATINGS: `${API_BASE_URL}/ratings`,
  ENROLMENTS: `${API_BASE_URL}/enrolments`,
  ROLES: `${API_BASE_URL}/roles`,
};
