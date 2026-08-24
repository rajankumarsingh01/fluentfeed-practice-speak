import { Router } from "express";
import { evaluateResponse } from "../controllers/evaluationController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.post("/", protect, evaluateResponse);

export default router;