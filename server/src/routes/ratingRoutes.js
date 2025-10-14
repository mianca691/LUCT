import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  getAvailableClasses,
  createRating,
  getMyRatings,
} from "../controllers/ratingController.js";

const router = express.Router();

router.get("/available-classes", authMiddleware, getAvailableClasses);
router.post("/", authMiddleware, createRating);
router.get("/my", authMiddleware, getMyRatings);

export default router;
