import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import type { HistoryItem } from "../types";

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const scoreColor = (score: number): string => {
  if (score >= 7) return "text-green-600";
  if (score >= 4) return "text-amber-600";
  return "text-red-600";
};

const HistoryPage = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get<HistoryItem[]>("/evaluate/history");
        setHistory(res.data);
      } catch (err) {
        console.error("Failed to fetch history:", err);
        setError("Could not load your evaluation history. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Your Progress</h1>
          <Link to="/" className="text-sm text-indigo-600 hover:underline font-medium">
            ← Back to Home
          </Link>
        </div>

        {isLoading && (
          <div className="bg-white rounded-2xl shadow-md p-8 text-center text-gray-400">
            Loading your history...
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>
        )}

        {!isLoading && !error && history.length === 0 && (
          <div className="bg-white rounded-2xl shadow-md p-8 text-center">
            <p className="text-gray-500 mb-4">
              You haven't completed any speaking evaluations yet.
            </p>
            <Link
              to="/speaking"
              className="inline-block bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              Start Your First Evaluation
            </Link>
          </div>
        )}

        {!isLoading && history.length > 0 && (
          <div className="space-y-3">
            {history.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-md p-5">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <p className="font-medium text-gray-800 flex-1">{item.topic}</p>
                  <span className={`text-lg font-bold ${scoreColor(item.overallScore)}`}>
                    {item.overallScore.toFixed(1)}/10
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-3">{formatDate(item.createdAt)}</p>
                <div className="flex gap-4 text-sm">
                  <span className="text-gray-600">
                    Grammar: <span className={`font-medium ${scoreColor(item.grammarScore)}`}>{item.grammarScore.toFixed(1)}</span>
                  </span>
                  <span className="text-gray-600">
                    Vocabulary: <span className={`font-medium ${scoreColor(item.vocabularyScore)}`}>{item.vocabularyScore.toFixed(1)}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;