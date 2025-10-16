import express from "express";
import {
  getCourses,
  addCourse,
  assignLecturerToClass,
  updateCourse,
  getFaculties,
  getClasses, 
  createClass, 
  updateClass, 
  deleteClass
} from "../controllers/plController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { getLecturers } from "../controllers/lecturerController.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/courses", getCourses);
router.post("/courses", addCourse);
router.put("/courses/:id", updateCourse);

router.post("/courses/assign", assignLecturerToClass);

router.get("/lecturers", getLecturers);
router.get("/faculties", getFaculties);

router.get("/classes", getClasses);
router.post("/classes", createClass);
router.put("/classes/:id", updateClass);
router.delete("/classes/:id", deleteClass);

export default router;
