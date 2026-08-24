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
  if (score >= 7) return "text-success";
  if (score >= 4) return "text-warning";
  return "text-danger";
};

const HistoryPage = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-paper px-4 py-6 sm:px-6 sm:py-10 md:py-14">
      <div className="max-w-2xl mx-auto space-y-5 sm:space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h1 className="font-display text-xl sm:text-2xl font-bold text-ink">Your progress</h1>
          <Link to="/" className="text-sm text-primary hover:underline font-medium">
            ← Back to home
          </Link>
        </div>

        {isLoading && (
          <div className="bg-white rounded-2xl border border-black/5 p-8 text-center text-ink-soft">
            Loading your history…
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-danger text-sm px-4 py-3 rounded-xl">{error}</div>
        )}

        {!isLoading && !error && history.length === 0 && (
          <div className="bg-white rounded-2xl border border-black/5 p-8 text-center">
            <p className="text-ink-soft mb-4">
              You haven't completed any speaking evaluations yet.
            </p>
            <Link
              to="/speaking"
              className="inline-block bg-primary text-white px-5 py-2.5 rounded-xl font-medium hover:bg-primary-dark transition"
            >
              Start your first evaluation
            </Link>
          </div>
        )}

        {!isLoading && history.length > 0 && (
          <div className="space-y-3">
            {history.map((item) => {
              const isOpen = expandedId === item.id;
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-black/5 shadow-[0_1px_2px_rgba(16,10,60,0.04)] overflow-hidden"
                >
                  <button
                    onClick={() => toggleExpand(item.id)}
                    className="w-full text-left p-4 sm:p-5 hover:bg-paper/60 transition"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                      <p className="font-medium text-ink flex-1 min-w-[60%] break-words">{item.topic}</p>
                      <span className={`text-lg font-bold shrink-0 ${scoreColor(item.overallScore)}`}>
                        {item.overallScore.toFixed(1)}/10
                      </span>
                    </div>
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <p className="text-xs text-ink-soft">{formatDate(item.createdAt)}</p>
                      <span className="text-xs text-primary font-medium">
                        {isOpen ? "Hide details ▲" : "View details ▼"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm mt-3">
                      <span className="text-ink-soft">
                        Grammar: <span className={`font-medium ${scoreColor(item.grammarScore)}`}>{item.grammarScore.toFixed(1)}</span>
                      </span>
                      <span className="text-ink-soft">
                        Vocabulary: <span className={`font-medium ${scoreColor(item.vocabularyScore)}`}>{item.vocabularyScore.toFixed(1)}</span>
                      </span>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-black/5">
                      <h4 className="text-xs font-semibold text-ink-soft uppercase tracking-wider mb-2 mt-3">
                        Suggestions for improvement
                      </h4>
                      <ul className="space-y-2">
                        {item.suggestions.map((suggestion, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2.5 text-sm text-ink bg-paper rounded-xl px-3.5 py-2.5"
                          >
                            <span className="text-accent mt-0.5">●</span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;