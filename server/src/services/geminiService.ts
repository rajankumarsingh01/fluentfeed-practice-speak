import { GoogleGenAI, Type } from "@google/genai";
import { GeminiEvaluationResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

const buildPrompt = (topic: string, transcript: string): string => {
  return `You are an English speaking evaluator. A student was given this topic to speak about:

Topic: "${topic}"

Here is what they said (transcribed from speech):
"${transcript}"

Evaluate their spoken English response.

Scoring guidance:
- grammarScore (0-10): correctness of sentence structure, tense usage, subject-verb agreement
- vocabularyScore (0-10): range and appropriateness of vocabulary used, relevant to the topic
- overallScore (0-10): overall fluency, coherence, and how well they addressed the topic
- suggestions: 2-4 short, specific, actionable tips for improvement (not generic praise)`;
};

export const evaluateSpeech = async (
  topic: string,
  transcript: string
): Promise<GeminiEvaluationResult> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: buildPrompt(topic, transcript),
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          grammarScore: { type: Type.NUMBER },
          vocabularyScore: { type: Type.NUMBER },
          overallScore: { type: Type.NUMBER },
          suggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ["grammarScore", "vocabularyScore", "overallScore", "suggestions"],
      },
    },
  });

  const responseText = response.text;

  if (!responseText) {
    throw new Error("AI returned an empty response");
  }

  let parsed: GeminiEvaluationResult;
  try {
    parsed = JSON.parse(responseText);
  } catch (parseError) {
    console.error("Failed to parse Gemini response as JSON:", responseText);
    throw new Error("AI returned an unexpected response format");
  }

  if (
    typeof parsed.grammarScore !== "number" ||
    typeof parsed.vocabularyScore !== "number" ||
    typeof parsed.overallScore !== "number" ||
    !Array.isArray(parsed.suggestions)
  ) {
    throw new Error("AI response is missing required evaluation fields");
  }

  return parsed;
};