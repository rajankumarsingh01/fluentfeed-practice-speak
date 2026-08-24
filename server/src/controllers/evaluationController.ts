import { Response } from "express";
import { AuthRequest } from "../types";
import { evaluateSpeech } from "../services/geminiService";
import Evaluation from "../models/Evaluation";

const MIN_WORDS = 100;
const MAX_WORDS = 200;

// POST /api/evaluate  (protected route)
export const evaluateResponse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { topic, transcript } = req.body;

    if (!topic || !transcript) {
      res.status(400).json({ message: "Topic and transcript are required" });
      return;
    }

    const wordCount = transcript.trim().split(/\s+/).length;
    if (wordCount < MIN_WORDS || wordCount > MAX_WORDS) {
      res.status(400).json({
        message: `Transcript must be between ${MIN_WORDS} and ${MAX_WORDS} words (got ${wordCount})`,
      });
      return;
    }

    if (!req.userId) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const evaluationResult = await evaluateSpeech(topic, transcript);

    const savedEvaluation = await Evaluation.create({
      userId: req.userId,
      topic,
      transcript,
      grammarScore: evaluationResult.grammarScore,
      vocabularyScore: evaluationResult.vocabularyScore,
      overallScore: evaluationResult.overallScore,
      suggestions: evaluationResult.suggestions,
    });

    res.status(201).json({
      id: savedEvaluation._id,
      topic: savedEvaluation.topic,
      transcript: savedEvaluation.transcript,
      grammarScore: savedEvaluation.grammarScore,
      vocabularyScore: savedEvaluation.vocabularyScore,
      overallScore: savedEvaluation.overallScore,
      suggestions: savedEvaluation.suggestions,
      createdAt: savedEvaluation.createdAt,
    });
  } catch (error) {
    console.error("Evaluation error:", error);
    res.status(500).json({
      message: "Failed to evaluate response. Please try again.",
    });
  }
};