import express from "express";
import {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse
} from "../controllers/courseController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// ==========================
// COURSE ROUTES
// ==========================

// GET all courses
router.get("/", authMiddleware, getAllCourses);

// GET course by ID
router.get("/:id", authMiddleware, getCourseById);

// CREATE new course (PL only)
router.post("/", authMiddleware, createCourse);

// UPDATE a course
router.put("/:id", authMiddleware, updateCourse);

// DELETE a course
router.delete("/:id", authMiddleware, deleteCourse);

export default router;
