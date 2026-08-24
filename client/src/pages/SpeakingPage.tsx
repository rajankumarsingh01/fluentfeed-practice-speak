import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../api/axios";
import type { TopicResponse, EvaluationResult } from "../types";
import TopicCard from "../components/speaking/TopicCard";
import RecordingInterface from "../components/speaking/RecordingInterface";
import ResultsDisplay from "../components/speaking/ResultsDisplay";

const BackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
  </svg>
);

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75"
    />
  </svg>
);

const SpeakingPage = () => {
  const [topic, setTopic] = useState("");
  const [isTopicLoading, setIsTopicLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState("");

  const navigate = useNavigate();

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
    <div className="min-h-screen bg-paper px-4 py-6 sm:px-6 sm:py-10 md:py-14">
      <div className="max-w-2xl mx-auto space-y-5 sm:space-y-6">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-primary transition px-1 py-1"
          >
            <BackIcon />
            <span>Back</span>
          </button>

          <h1 className="font-display text-lg sm:text-2xl font-bold text-ink text-center flex-1 truncate">
            Speaking practice
          </h1>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-primary transition px-1 py-1"
          >
            <HomeIcon />
            <span className="hidden sm:inline">Home</span>
          </Link>
        </div>

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
              <div className="bg-red-50 text-danger text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {isSubmitting ? (
              <div className="bg-white rounded-2xl border border-black/5 p-8 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-4 border-primary-soft border-t-primary rounded-full animate-spin"></div>
                <p className="text-ink-soft text-sm text-center">Evaluating your response… this can take a few seconds.</p>
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