import express from "express";
import {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass
} from "../controllers/classController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// ==========================
// CLASS ROUTES
// ==========================

// GET all classes
router.get("/", authMiddleware, getAllClasses);

// GET a specific class by ID
router.get("/:id", authMiddleware, getClassById);

// CREATE a new class (lecturer or admin only)
router.post("/", authMiddleware, createClass);

// UPDATE a class
router.put("/:id", authMiddleware, updateClass);

// DELETE a class
router.delete("/:id", authMiddleware, deleteClass);

export default router;
