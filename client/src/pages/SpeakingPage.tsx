import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import api from "../api/axios";
import type { TopicResponse, EvaluationResult } from "../types";
import TopicCard from "../components/speaking/TopicCard";
import RecordingInterface from "../components/speaking/RecordingInterface";
import ResultsDisplay from "../components/speaking/ResultsDisplay";

const SpeakingPage = () => {
  const [topic, setTopic] = useState("");
  const [isTopicLoading, setIsTopicLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState("");

  const fetchTopic = useCallback(async () => {
    setIsTopicLoading(true);
    try {
      const res = await api.get<TopicResponse>("/topics/random");
      setTopic(res.data.topic);
    } catch (err) {
      console.error("Failed to fetch topic:", err);
      setTopic("Could not load a topic. Please click 'New Topic' to retry.");
    } finally {
      setIsTopicLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTopic();
  }, [fetchTopic]);

  const handleSubmit = async (transcript: string) => {
    setIsSubmitting(true);
    setError("");

    try {
      const res = await api.post<EvaluationResult>("/evaluate", {
        topic,
        transcript,
      });
      setResult(res.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Something went wrong while evaluating your response. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTryAnother = () => {
    setResult(null);
    setError("");
    fetchTopic();
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Speaking Practice</h1>

        {result ? (
          <ResultsDisplay result={result} onTryAnother={handleTryAnother} />
        ) : (
          <>
            <TopicCard
              topic={topic}
              isLoading={isTopicLoading}
              onNewTopic={fetchTopic}
              disabled={isSubmitting}
            />

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {isSubmitting ? (
              <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-gray-500 text-sm">Evaluating your response... this can take a few seconds.</p>
              </div>
            ) : (
              <RecordingInterface onSubmit={handleSubmit} isSubmitting={isSubmitting} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SpeakingPage;