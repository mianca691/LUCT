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

router.get("/", authMiddleware, getAllClasses);

router.get("/:id", authMiddleware, getClassById);

router.post("/", authMiddleware, createClass);

router.put("/:id", authMiddleware, updateClass);

router.delete("/:id", authMiddleware, deleteClass);

export default router;
