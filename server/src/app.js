import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import classRoutes from "./routes/classRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import ratingRoutes from "./routes/ratingRoutes.js";
import monitoringRoutes from "./routes/monitoringRoutes.js";

dotenv.config();

const app = express();

// Enable CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// API Routes
app.use("/auth", authRoutes);
app.use("/reports", reportRoutes);
app.use("/classes", classRoutes);
app.use("/courses", courseRoutes);
app.use("/student", studentRoutes);
app.use("/ratings", ratingRoutes);      
app.use("/monitoring", monitoringRoutes); 


app.get("/ping", (req, res) => res.json({ message: "pong" }));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}/`)
);

export default app;
