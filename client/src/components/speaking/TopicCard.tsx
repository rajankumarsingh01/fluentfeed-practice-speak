interface TopicCardProps {
  topic: string;
  isLoading: boolean;
  onNewTopic: () => void;
  disabled: boolean;
}

const TopicCard = ({ topic, isLoading, onNewTopic, disabled }: TopicCardProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-indigo-600 uppercase tracking-wide">
          Your Topic
        </span>
        <button
          onClick={onNewTopic}
          disabled={disabled}
          className="text-sm text-gray-500 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          🔄 New Topic
        </button>
      </div>
      {isLoading ? (
        <p className="text-gray-400 animate-pulse">Loading topic...</p>
      ) : (
        <p className="text-lg text-gray-800 font-medium">{topic}</p>
      )}
    </div>
  );
};

export default TopicCard;