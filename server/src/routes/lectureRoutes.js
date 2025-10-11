import express from "express";
import { getLecturerRatings } from "../controllers/lecturerController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/ratings", authMiddleware, getLecturerRatings);

export default router;
