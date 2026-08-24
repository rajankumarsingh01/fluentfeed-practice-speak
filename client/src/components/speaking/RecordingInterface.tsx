import { useState, useRef, useEffect, useCallback } from "react";

// Minimal type declarations for the Web Speech API (not in TS's default DOM lib)
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

const MIN_WORDS = 100;
const MAX_WORDS = 200;

const RecordingInterface = ({ onSubmit, isSubmitting }: RecordingInterfaceProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  const [micError, setMicError] = useState("");

  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const finalTranscriptRef = useRef(""); // accumulates confirmed (final) text across the session

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

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;

        if (result.isFinal) {
          finalTranscriptRef.current += text + " ";
        } else {
          interimText += text;
        }
      }

      setTranscript(finalTranscriptRef.current + interimText);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "no-speech") return; // ignore harmless silence gaps
      setMicError(
        event.error === "not-allowed"
          ? "Microphone access was denied. Please allow microphone permission and try again."
          : `Speech recognition error: ${event.error}`
      );
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, []);

  const handleStart = useCallback(() => {
    setMicError("");
    finalTranscriptRef.current = "";
    setTranscript("");
    recognitionRef.current?.start();
    setIsRecording(true);
  }, []);

  const handleStop = useCallback(() => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  }, []);

  const wordCount = transcript.trim() === "" ? 0 : transcript.trim().split(/\s+/).length;
  const isWordCountValid = wordCount >= MIN_WORDS && wordCount <= MAX_WORDS;

  const handleSubmit = () => {
    if (isRecording) handleStop();
    onSubmit(transcript.trim());
  };

  if (!isSupported) {
    return (
      <div className="bg-red-50 text-red-700 rounded-2xl p-6 text-center">
        <p className="font-medium">Speech recognition isn't supported in this browser.</p>
        <p className="text-sm mt-1">Please use Google Chrome or Microsoft Edge to record your response.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
      {micError && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg">{micError}</div>
      )}

      <div className="min-h-[160px] bg-gray-50 rounded-xl p-4 text-gray-700 leading-relaxed">
        {transcript ? (
          transcript
        ) : (
          <span className="text-gray-400">
            Your transcript will appear here as you speak...
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm">
          <span
            className={
              wordCount === 0
                ? "text-gray-500"
                : isWordCountValid
                ? "text-green-600 font-medium"
                : "text-amber-600 font-medium"
            }
          >
            {wordCount} words
          </span>
          <span className="text-gray-400"> (target: {MIN_WORDS}-{MAX_WORDS})</span>
        </div>

        {isRecording && (
          <div className="flex items-center gap-2 text-red-500 text-sm font-medium">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            Recording...
          </div>
        )}
      </div>

      <div className="flex gap-3">
        {!isRecording ? (
          <button
            onClick={handleStart}
            disabled={isSubmitting}
            className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
          >
            🎤 Start Recording
          </button>
        ) : (
          <button
            onClick={handleStop}
            className="flex-1 bg-gray-700 text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 transition"
          >
            ⏹ Stop Recording
          </button>
        )}

        <button
          onClick={handleSubmit}
          disabled={!isWordCountValid || isRecording || isSubmitting}
          className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Evaluating..." : "Submit for Evaluation"}
        </button>
      </div>
    </div>
  );
};

export default RecordingInterface;