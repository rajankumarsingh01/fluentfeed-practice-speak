interface TopicCardProps {
  topic: string;
  isLoading: boolean;
  onNewTopic: () => void;
  disabled: boolean;
}

const TopicCard = ({ topic, isLoading, onNewTopic, disabled }: TopicCardProps) => {
  return (
    <div className="bg-white rounded-2xl border border-black/5 shadow-[0_1px_2px_rgba(16,10,60,0.04),0_12px_24px_-16px_rgba(16,10,60,0.15)] p-6">
      <div className="flex items-center justify-between mb-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
          Your topic
        </span>
        <button
          onClick={onNewTopic}
          disabled={disabled}
          className="text-xs font-medium text-ink-soft hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          New topic
        </button>
      </div>
      {isLoading ? (
        <div className="h-6 w-3/4 bg-primary-soft rounded animate-pulse"></div>
      ) : (
        <p className="font-display text-xl text-ink font-medium leading-snug">{topic}</p>
      )}
    </div>
  );
};

export default TopicCard;