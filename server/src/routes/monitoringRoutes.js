import express from "express";
import { getMonitoringData } from "../controllers/monitoringController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getMonitoringData);

export default router;
