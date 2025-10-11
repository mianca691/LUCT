// src/routes/monitoringRoutes.js
import express from "express";
import { getMonitoringData } from "../controllers/monitoringController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Protect the route — students must be logged in
router.get("/", authMiddleware, getMonitoringData);

export default router;
