import express from "express";
import { getStudentAttendance } from "../controllers/studentController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/attendance", authMiddleware, getStudentAttendance);

export default router;
