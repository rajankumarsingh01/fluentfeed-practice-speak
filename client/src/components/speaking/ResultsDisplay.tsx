import type { EvaluationResult } from "../../types";

interface ScoreBarProps {
  label: string;
  score: number;
}

const ScoreBar = ({ label, score }: ScoreBarProps) => {
  const percentage = (score / 10) * 100;

  const barColor =
    score >= 7 ? "bg-green-500" : score >= 4 ? "bg-amber-500" : "bg-red-500";

  return (
    <div>
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-semibold text-gray-800">{score.toFixed(1)} / 10</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${barColor} transition-all duration-500`}
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
    <div className="bg-white rounded-2xl shadow-md p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-1">Your Evaluation</h2>
        <p className="text-sm text-gray-500">Topic: {result.topic}</p>
      </div>

      {/* Overall score highlighted separately */}
      <div className="bg-indigo-50 rounded-xl p-4 text-center">
        <p className="text-sm font-medium text-indigo-600 uppercase tracking-wide mb-1">
          Overall Score
        </p>
        <p className="text-4xl font-bold text-indigo-700">
          {result.overallScore.toFixed(1)}
          <span className="text-xl text-indigo-400"> / 10</span>
        </p>
      </div>

      <div className="space-y-4">
        <ScoreBar label="Grammar" score={result.grammarScore} />
        <ScoreBar label="Vocabulary" score={result.vocabularyScore} />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
          Suggestions for Improvement
        </h3>
        <ul className="space-y-2">
          {result.suggestions.map((suggestion, index) => (
            <li
              key={index}
              className="flex items-start gap-2 text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2"
            >
              <span className="text-indigo-500 mt-0.5">•</span>
              <span>{suggestion}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={onTryAnother}
        className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition"
      >
        Try Another Topic
      </button>
    </div>
  );
};

export default ResultsDisplay;