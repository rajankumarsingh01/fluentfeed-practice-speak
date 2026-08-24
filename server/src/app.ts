import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

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

// Health check route (we'll add real routes in later phases)
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", message: "FluentFeed server is running" });
});

export default app;