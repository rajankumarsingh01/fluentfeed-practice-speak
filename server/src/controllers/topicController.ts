import { Request, Response } from "express";
import { topics } from "../data/topics";

// GET /api/topics/random
export const getRandomTopic = (req: Request, res: Response): void => {
  const randomIndex = Math.floor(Math.random() * topics.length);
  const topic = topics[randomIndex];

  res.status(200).json({ topic });
};