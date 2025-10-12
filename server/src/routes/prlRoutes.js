import express from "express";
import {
  getReports,
  addFeedback,
  fetchPRLCourses,
  fetchMonitoring,
  fetchPRLRatings,
  fetchPRLClasses
} from "../controllers/prlController.js";
import authMiddleware, { restrictTo } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);
router.use(restrictTo("prl"));

router.get("/reports", getReports);
router.post("/reports/:reportId/feedback", addFeedback);
router.get("/courses", fetchPRLCourses);
router.get("/monitoring", fetchMonitoring);
router.get("/rating", fetchPRLRatings);
router.get("/classes", fetchPRLClasses);

export default router;
