import { Response } from "express";
import { AuthRequest } from "../types";
import { evaluateSpeech } from "../services/geminiService";
import Evaluation from "../models/Evaluation";

// POST /api/evaluate  (protected route)
export const evaluateResponse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { topic, transcript } = req.body;

    if (!topic || !transcript || transcript.trim().length === 0) {
      res.status(400).json({ message: "Topic and a non-empty transcript are required" });
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

// GET /api/evaluate/history  (protected route)
export const getEvaluationHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const evaluations = await Evaluation.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select("topic grammarScore vocabularyScore overallScore suggestions createdAt");

    res.status(200).json(
      evaluations.map((evalDoc) => ({
        id: evalDoc._id,
        topic: evalDoc.topic,
        grammarScore: evalDoc.grammarScore,
        vocabularyScore: evalDoc.vocabularyScore,
        overallScore: evalDoc.overallScore,
        suggestions: evalDoc.suggestions,
        createdAt: evalDoc.createdAt,
      }))
    );
  } catch (error) {
    console.error("Fetch history error:", error);
    res.status(500).json({ message: "Failed to load evaluation history" });
  }
};