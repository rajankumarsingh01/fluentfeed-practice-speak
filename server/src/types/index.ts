import { Request } from "express";

export interface AuthRequest extends Request {
  userId?: string;
}

export interface JwtPayload {
  userId: string;
}

// Shape we expect back from Gemini after parsing its JSON response
export interface GeminiEvaluationResult {
  grammarScore: number;
  vocabularyScore: number;
  overallScore: number;
  suggestions: string[];
}