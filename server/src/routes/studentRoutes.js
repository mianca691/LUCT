import express from "express";
import { getEnrolledClasses, enrollInClass } from "../controllers/enrolmentsController.js";
import { getAttendance, markAttendance } from "../controllers/attendanceController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { getEnrolledReports } from "../controllers/reportController.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/enrolments", getEnrolledClasses);
router.post("/enrolments", enrollInClass);

router.get("/attendance/:reportId", getAttendance);
router.post("/attendance", markAttendance);

router.get("/reports/enrolled", getEnrolledReports);

export default router;
