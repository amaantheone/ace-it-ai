import React, { useCallback, useEffect, useRef, useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";

interface VoiceInputProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscription, disabled }) => {
  const [listening, setListening] = useState(false);
  const autoStopTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const {
    transcript,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechRecognition();

  const handleStopListening = useCallback(() => {
    // Always stop speech recognition first
    SpeechRecognition.stopListening();
    setListening(false);
    
    // Clear timeout
    if (autoStopTimeoutRef.current) {
      clearTimeout(autoStopTimeoutRef.current);
      autoStopTimeoutRef.current = null;
    }

    // Process transcript if available
    if (transcript.trim()) {
      onTranscription(transcript.trim());
    }
    resetTranscript();
  }, [transcript, onTranscription, resetTranscript]);

  // Auto-stop listening after 3 seconds of silence
  useEffect(() => {
    if (!listening) return;

    // Clear existing timeout
    if (autoStopTimeoutRef.current) {
      clearTimeout(autoStopTimeoutRef.current);
    }

    // Set new timeout to stop listening after silence
    const timeout = setTimeout(() => {
      handleStopListening();
    }, 3000);

    autoStopTimeoutRef.current = timeout;

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [transcript, listening, handleStopListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      SpeechRecognition.stopListening();
      if (autoStopTimeoutRef.current) {
        clearTimeout(autoStopTimeoutRef.current);
      }
    };
  }, []);

  const handleMicClick = () => {
    if (!browserSupportsSpeechRecognition || !isMicrophoneAvailable) return;
    
    if (listening) {
      handleStopListening();
    } else {
      // Clear any existing timeouts before starting
      if (autoStopTimeoutRef.current) {
        clearTimeout(autoStopTimeoutRef.current);
        autoStopTimeoutRef.current = null;
      }
      
      resetTranscript();
      setListening(true);
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
      {!isMicrophoneAvailable && (
        <span className="text-destructive text-xs ml-2">Microphone unavailable</span>
      )}
    </div>
  );
};

export default VoiceInput;
