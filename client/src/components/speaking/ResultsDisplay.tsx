import type { EvaluationResult } from "../../types";

const ScoreRing = ({ score }: { score: number }) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(10, score)) / 10;
  const offset = circumference * (1 - pct);
  const ringColor =
    score >= 7 ? "var(--color-success)" : score >= 4 ? "var(--color-warning)" : "var(--color-danger)";

  return (
    <svg width="140" height="140" viewBox="0 0 140 140" className="mx-auto">
      <circle cx="70" cy="70" r={radius} fill="none" stroke="var(--color-primary-soft)" strokeWidth="12" />
      <circle
        cx="70"
        cy="70"
        r={radius}
        fill="none"
        stroke={ringColor}
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 70 70)"
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
      <text x="70" y="66" textAnchor="middle" fontFamily="Space Grotesk, sans-serif" fontSize="28" fontWeight="700" fill="var(--color-ink)">
        {score.toFixed(1)}
      </text>
      <text x="70" y="86" textAnchor="middle" fontSize="12" fill="var(--color-ink-soft)">
        out of 10
      </text>
    </svg>
  );
};

const ScoreBar = ({ label, score }: { label: string; score: number }) => {
  const percentage = (score / 10) * 100;
  const barColor = score >= 7 ? "bg-success" : score >= 4 ? "bg-warning" : "bg-danger";

  return (
    <div>
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="text-sm font-medium text-ink">{label}</span>
        <span className="text-sm font-semibold text-ink">{score.toFixed(1)} / 10</span>
      </div>
      <div className="w-full bg-paper rounded-full h-2">
        <div
          className={`h-2 rounded-full ${barColor} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

interface ResultsDisplayProps {
  result: EvaluationResult;
  onTryAnother: () => void;
}

const ResultsDisplay = ({ result, onTryAnother }: ResultsDisplayProps) => {
  return (
    <div className="bg-white rounded-2xl border border-black/5 shadow-[0_1px_2px_rgba(16,10,60,0.04),0_12px_24px_-16px_rgba(16,10,60,0.15)] p-6 space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-ink mb-1">Your evaluation</h2>
        <p className="text-sm text-ink-soft">{result.topic}</p>
      </div>

      <ScoreRing score={result.overallScore} />

      <div className="space-y-4">
        <ScoreBar label="Grammar" score={result.grammarScore} />
        <ScoreBar label="Vocabulary" score={result.vocabularyScore} />
      </div>

      <div>
        <h3 className="text-xs font-semibold text-ink-soft uppercase tracking-wider mb-3">
          Suggestions for improvement
        </h3>
        <ul className="space-y-2">
          {result.suggestions.map((suggestion, index) => (
            <li
              key={index}
              className="flex items-start gap-2.5 text-sm text-ink bg-paper rounded-xl px-3.5 py-2.5"
            >
              <span className="text-accent mt-0.5">●</span>
              <span>{suggestion}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={onTryAnother}
        className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary-dark transition"
      >
        Try another topic
      </button>
    </div>
  );
};

export default ResultsDisplay;