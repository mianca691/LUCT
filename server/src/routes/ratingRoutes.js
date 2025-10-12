import express from "express";
import { getAvailableClasses, createRating, getMyRatings } from "../controllers/ratingController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/classes", authMiddleware, getAvailableClasses);
router.get("/my", authMiddleware, getMyRatings);
router.post("/", authMiddleware, createRating);

export default router;
