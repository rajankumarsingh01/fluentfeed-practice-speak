import { Router } from "express";
import { getRandomTopic } from "../controllers/topicController";

const router = Router();

router.get("/random", getRandomTopic);

export default router;