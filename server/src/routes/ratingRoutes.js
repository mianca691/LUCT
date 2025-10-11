import express from "express";
import { getAvailableClasses, createRating, getMyRatings } from "../controllers/ratingController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/classes", authMiddleware, getAvailableClasses); // all classes for rating
router.get("/my", authMiddleware, getMyRatings);             // student's own ratings
router.post("/", authMiddleware, createRating);              // submit rating

export default router;
