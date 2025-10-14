import express from "express";
import { 
    getOverviewStats, 
    getRecentReports, 
    getLecturerClasses, 
    getLecturerReports,
    getAssignedCourses,
    getLecturerAssignedClasses,
 } from "../controllers/lecturerController.js";
import authMiddleware, { restrictTo } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware, restrictTo("lecturer"));

router.get("/overview/stats", getOverviewStats);

router.get("/overview/recent-reports", getRecentReports);

router.get("/classes", getLecturerClasses);

router.get("/reports", getLecturerReports);

router.get("/:id/assigned-courses", getAssignedCourses);
router.get("/:id/classes", getLecturerAssignedClasses);


export default router;
