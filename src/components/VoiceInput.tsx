import React, { useEffect, useRef, useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";

interface VoiceInputProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscription, disabled }) => {
  const [listening, setListening] = useState(false);
  const [autoSendTimeout, setAutoSendTimeout] = useState<NodeJS.Timeout | null>(null);
  const {
    transcript,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechRecognition();

  const prevTranscript = useRef("");

  useEffect(() => {
    if (!listening) return;
    if (transcript !== prevTranscript.current) {
      if (autoSendTimeout) clearTimeout(autoSendTimeout);
      const timeout = setTimeout(() => {
        if (transcript.trim()) {
          onTranscription(transcript.trim());
          resetTranscript();
          setListening(false);
          SpeechRecognition.stopListening();
        }
      }, 2000);
      setAutoSendTimeout(timeout as unknown as NodeJS.Timeout);
      prevTranscript.current = transcript;
    }
  }, [transcript, listening, autoSendTimeout, onTranscription, resetTranscript]);

  useEffect(() => {
    if (!listening) {
      if (autoSendTimeout) clearTimeout(autoSendTimeout);
      prevTranscript.current = "";
    }
  }, [listening, autoSendTimeout]);

  const handleMicClick = () => {
    if (!browserSupportsSpeechRecognition || !isMicrophoneAvailable) return;
    if (listening) {
      // If user stops listening, send transcript if available
      if (transcript.trim()) {
        onTranscription(transcript.trim());
        resetTranscript();
      }
      setListening(false);
      SpeechRecognition.stopListening();
    } else {
      setListening(true);
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true, language: "en-US" });
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="flex items-center gap-2 text-destructive text-sm">
        <MicOff className="w-4 h-4" /> Voice input not supported in this browser.
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant={listening ? "secondary" : "ghost"}
        size="icon"
        onClick={handleMicClick}
        disabled={disabled || !isMicrophoneAvailable}
        className={listening ? "animate-pulse bg-primary/20" : ""}
        aria-label={listening ? "Stop voice input" : "Start voice input"}
      >
        {listening ? <Mic className="w-5 h-5 text-primary" /> : <MicOff className="w-5 h-5" />}
      </Button>
      {listening && (
        <span className="text-muted-foreground text-sm flex items-center gap-1">
          <Loader2 className="w-3 h-3 animate-spin" /> Listening...
        </span>
      )}
      {transcript && (
        <span className="ml-2 px-2 py-1 rounded bg-muted text-foreground text-xs max-w-xs truncate">
          {transcript}
        </span>
      )}
      {!isMicrophoneAvailable && (
        <span className="text-destructive text-xs ml-2">Microphone unavailable</span>
      )}
    </div>
  );
};

export default VoiceInput;
