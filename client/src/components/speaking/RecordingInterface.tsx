import { useState, useRef, useEffect, useCallback } from "react";

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    webkitSpeechRecognition: new () => ISpeechRecognition;
    SpeechRecognition: new () => ISpeechRecognition;
  }
}

interface RecordingInterfaceProps {
  onSubmit: (transcript: string) => void;
  isSubmitting: boolean;
}

const TARGET_MIN_WORDS = 100;
const TARGET_MAX_WORDS = 200;
const ABSOLUTE_MIN_WORDS = 1;

const WaveBars = ({ active }: { active: boolean }) => {
  const heights = [6, 14, 20, 12, 8];
  return (
    <div className="flex items-end gap-[3px] h-5">
      {heights.map((h, i) => (
        <span
          key={i}
          className={`w-[3px] rounded-full ${i % 2 === 0 ? "bg-primary" : "bg-accent"} ${
            active ? "wave-bar" : ""
          }`}
          style={{
            height: active ? "16px" : `${h}px`,
            animationDelay: `${i * 0.12}s`,
          }}
        ></span>
      ))}
    </div>
  );
};

const RecordingInterface = ({ onSubmit, isSubmitting }: RecordingInterfaceProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  const [micError, setMicError] = useState("");
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const finalTranscriptRef = useRef("");
  const isRecordingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;

        if (result.isFinal) {
          finalTranscriptRef.current += text.trim() + " ";
        } else {
          interimText += text;
        }
      }

      setTranscript((finalTranscriptRef.current + interimText).trim());
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "no-speech") return;
      if (event.error === "aborted") return;

      setMicError(
        event.error === "not-allowed"
          ? "Microphone access was denied. Please allow microphone permission and try again."
          : `Speech recognition error: ${event.error}`
      );
      isRecordingRef.current = false;
      setIsRecording(false);
    };

    recognition.onend = () => {
      if (isRecordingRef.current) {
        try {
          recognition.start();
        } catch {
          // ignore
        }
      } else {
        setIsRecording(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      isRecordingRef.current = false;
      recognition.stop();
    };
  }, []);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const handleStart = useCallback(() => {
    setMicError("");
    finalTranscriptRef.current = "";
    setTranscript("");
    setSecondsElapsed(0);
    isRecordingRef.current = true;
    recognitionRef.current?.start();
    setIsRecording(true);
  }, []);

  const handleStop = useCallback(() => {
    isRecordingRef.current = false;
    recognitionRef.current?.stop();
    setIsRecording(false);
  }, []);

  const wordCount = transcript.trim() === "" ? 0 : transcript.trim().split(/\s+/).length;
  const isInTargetRange = wordCount >= TARGET_MIN_WORDS && wordCount <= TARGET_MAX_WORDS;
  const canSubmit = wordCount >= ABSOLUTE_MIN_WORDS && !isRecording;

  const handleSubmit = () => {
    if (isRecording) handleStop();
    onSubmit(transcript.trim());
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (!isSupported) {
    return (
      <div className="bg-red-50 text-danger rounded-2xl p-6 text-center">
        <p className="font-medium">Speech recognition isn't supported in this browser.</p>
        <p className="text-sm mt-1">Please use Google Chrome or Microsoft Edge to record your response.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-black/5 shadow-[0_1px_2px_rgba(16,10,60,0.04),0_12px_24px_-16px_rgba(16,10,60,0.15)] p-6 space-y-5">
      {!isRecording && wordCount === 0 && !micError && (
        <div className="flex items-start gap-2.5 bg-primary-soft text-primary text-sm px-4 py-3 rounded-xl">
          <span className="mt-0.5">💡</span>
          <span>Speak clearly, at a normal pace, in a quiet room for the most accurate transcript.</span>
        </div>
      )}

      {micError && (
        <div className="bg-red-50 text-danger text-sm px-4 py-3 rounded-xl">{micError}</div>
      )}

      <div className="min-h-[160px] bg-paper rounded-xl p-4 text-ink leading-relaxed border border-black/5">
        {transcript ? (
          transcript
        ) : (
          <span className="text-ink-soft/60">Your transcript will appear here as you speak…</span>
        )}
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-sm">
          <span
            className={
              wordCount === 0
                ? "text-ink-soft"
                : isInTargetRange
                ? "text-success font-semibold"
                : "text-warning font-semibold"
            }
          >
            {wordCount} words
          </span>
          <span className="text-ink-soft"> · target {TARGET_MIN_WORDS}-{TARGET_MAX_WORDS}</span>
          {wordCount > 0 && !isInTargetRange && (
            <span className="block text-xs text-warning/80 mt-0.5">
              You can still submit — this is just a suggested range.
            </span>
          )}
        </div>

        {isRecording && (
          <div className="flex items-center gap-3">
            <span className="text-ink-soft text-sm font-mono">{formatTime(secondsElapsed)}</span>
            <div className="flex items-center gap-2 text-accent text-sm font-medium">
              <WaveBars active />
              Recording
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        {!isRecording ? (
          <button
            onClick={handleStart}
            disabled={isSubmitting}
            className="flex-1 inline-flex items-center justify-center gap-2.5 bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary-dark transition disabled:opacity-50"
          >
            <WaveBars active={false} />
            Start recording
          </button>
        ) : (
          <button
            onClick={handleStop}
            className="flex-1 bg-ink text-white py-3 rounded-xl font-medium hover:opacity-90 transition"
          >
            Stop recording
          </button>
        )}

        <button
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          className="flex-1 bg-accent text-white py-3 rounded-xl font-medium hover:brightness-95 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Evaluating…" : "Submit for evaluation"}
        </button>
      </div>
    </div>
  );
};

export default RecordingInterface;