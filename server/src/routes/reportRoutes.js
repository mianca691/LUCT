import express from "express";
import auth from "../middlewares/authMiddleware.js";
import { createReport, getReports } from "../controllers/reportController.js";

const router = express.Router();

router.post("/", auth, createReport);
router.get("/", auth, getReports);

export default router;
