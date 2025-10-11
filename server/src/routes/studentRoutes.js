import express from "express";
import { getStudentAttendance, markAttendance } from "../controllers/studentController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/attendance", authMiddleware, getStudentAttendance);
router.post("/attendance", authMiddleware, markAttendance);

export default router;
