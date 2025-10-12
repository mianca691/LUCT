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

router.get("/", authMiddleware, getAllCourses);

router.get("/:id", authMiddleware, getCourseById);

router.post("/", authMiddleware, createCourse);

router.put("/:id", authMiddleware, updateCourse);

router.delete("/:id", authMiddleware, deleteCourse);

export default router;
