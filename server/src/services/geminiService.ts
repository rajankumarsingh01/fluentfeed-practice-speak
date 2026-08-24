import { GoogleGenAI, Type } from "@google/genai";
import { GeminiEvaluationResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

const buildPrompt = (topic: string, transcript: string): string => {
  return `You are a strict, professional English speaking evaluator for a language-learning platform. A student was given this topic to speak about:

Topic: "${topic}"

Here is their spoken response, transcribed from speech-to-text (minor transcription errors like missing punctuation are normal and should not be penalized):
"${transcript}"

Evaluate the response carefully and honestly. Follow these rules strictly:

1. First check: does the response actually address the given topic? If the student went off-topic, gave an unrelated answer, asked a question instead of answering, or the response is too short/incoherent to properly evaluate, the overallScore MUST be low (0-3), and grammarScore/vocabularyScore should also be capped low, with the top suggestion clearly stating that the response did not address the topic.
2. grammarScore (0-10): correctness of sentence structure, tense usage, subject-verb agreement. A perfect 9-10 should be rare and only for genuinely error-free, well-structured speech.
3. vocabularyScore (0-10): range, precision, and appropriateness of vocabulary used relative to the topic. A perfect 9-10 requires varied, precise, topic-relevant vocabulary.
4. overallScore (0-10): overall fluency, coherence, relevance to the topic, and how well the student communicated their ideas. This should reflect genuine speaking ability, not just grammatical correctness.
5. Be consistent: your suggestions must logically match your scores. Never give a high score while also pointing out a fundamental flaw (like not answering the topic) in the suggestions.
6. suggestions: exactly 2-4 short, specific, actionable tips grounded in what the student actually said.

Score realistically and critically, the way a strict IELTS/TOEFL speaking examiner would — do not default to high scores.`;
};

export const evaluateSpeech = async (
  topic: string,
  transcript: string
): Promise<GeminiEvaluationResult> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: buildPrompt(topic, transcript),
    config: {
      temperature: 0.3, // lower temperature = more consistent, less random scoring across runs
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