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
  deleteClass,
  getClassesForCourse,
  getLecturerDetails
} from "../controllers/plController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { getLecturers } from "../controllers/lecturerController.js";
import {
  getMonitoringMetrics,
  getMonitoringClasses,
  getMonitoringLecturers
} from "../controllers/monitoringController.js";
import { 
  getReportMetrics, 
  getReports, 
  getReportById 
} from "../controllers/plReportsController.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/courses", getCourses);
router.post("/courses", addCourse);
router.put("/courses/:id", updateCourse);

router.post("/courses/assign", assignLecturerToClass);

router.get("/lecturers", getLecturers);
router.get("/lecturer-details", getLecturerDetails)
router.get("/faculties", getFaculties);

router.get("/classes", getClasses);
router.post("/classes", createClass);
router.put("/classes/:id", updateClass);
router.delete("/classes/:id", deleteClass);
router.get("/courses/:id/classes", getClassesForCourse);

router.get("/monitoring/metrics", getMonitoringMetrics);
router.get("/monitoring/classes", getMonitoringClasses);
router.get("/monitoring/lecturers", getMonitoringLecturers);

router.get("/reports/metrics", getReportMetrics);  
router.get("/reports", getReports);                
router.get("/reports/:id", getReportById); 

export default router;
