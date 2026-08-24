export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface TopicResponse {
  topic: string;
}

export interface EvaluationResult {
  id: string;
  topic: string;
  transcript: string;
  grammarScore: number;
  vocabularyScore: number;
  overallScore: number;
  suggestions: string[];
  createdAt: string;
}