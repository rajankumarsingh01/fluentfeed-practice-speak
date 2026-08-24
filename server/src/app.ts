import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import topicRoutes from "./routes/topicRoutes";
import { errorHandler } from "./middleware/errorMiddleware";

dotenv.config();

const app: Application = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// Health check route
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", message: "FluentFeed server is running" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/topics", topicRoutes);

// Error handler (must be last, after all routes)
app.use(errorHandler);

export default app;