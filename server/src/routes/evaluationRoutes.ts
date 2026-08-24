import { Router } from "express";
import { evaluateResponse, getEvaluationHistory } from "../controllers/evaluationController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.post("/", protect, evaluateResponse);
router.get("/history", protect, getEvaluationHistory);

export default router;