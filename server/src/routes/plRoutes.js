import express from "express";
import { getCourses, addCourse, assignLecturerToClass } from "../controllers/plController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { getLecturers } from "../controllers/lecturerController.js";

const router = express.Router();

router.use(authMiddleware); 

router.get("/courses", getCourses);
router.post("/courses", addCourse);
router.post("/courses/:courseId/lectures", assignLecturerToClass);
router.get("/lecturers", getLecturers);

export default router;