'use client';

import { Paperclip, CornerDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatInput as BaseChatInput } from "./chat-input";
import { useRef, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";

// Dynamically import VoiceInput to avoid SSR issues
const VoiceInput = dynamic(() => import("@/components/VoiceInput"), { ssr: false });

interface ChatInputAreaProps {
  input: string;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  selectedFile: File | null;
  onFileChange: (file: File | null) => void;
  onRemoveFile: () => void;
}

export function ChatInputArea({
  input,
  isLoading,
  onSubmit,
  onKeyDown,
  onChange,
  selectedFile,
  onFileChange,
  onRemoveFile,
}: ChatInputAreaProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [voiceTranscript, setVoiceTranscript] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onFileChange(file);
    if (file && file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  // Combine typed and voice input
  const combinedInput = input + (voiceTranscript ? (input ? " " : "") + voiceTranscript : "");

  // When voice input is sent, append to input and clear transcript
  const handleVoiceTranscription = (text: string) => {
    setVoiceTranscript("");
    if (text) {
      // If there's already typed input, add a space
      onChange({
        target: { value: (input ? input + " " : "") + text },
      } as React.ChangeEvent<HTMLTextAreaElement>);
      // Optionally, auto-submit here if desired
    }
  };

  return (
    <div className="p-2 md:p-4 bg-background">
      <div className="max-w-3xl mx-auto">
        <form
          ref={formRef}
          onSubmit={onSubmit}
          className="relative flex flex-col gap-2"
        >
          <div className="flex items-center gap-2">
            <BaseChatInput
              ref={inputRef}
              value={combinedInput}
              onKeyDown={onKeyDown}
              onChange={onChange}
              placeholder="Ask anything..."
              className="min-h-[60px] md:min-h-[80px] resize-none rounded-lg bg-muted border-border p-3 text-foreground placeholder:text-muted-foreground"
            />
            <VoiceInput
              onTranscription={handleVoiceTranscription}
              disabled={isLoading}
            />
          </div>
          {selectedFile && (
            <div className="flex items-center gap-2 mt-2">
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="preview"
                  width={48}
                  height={48}
                  className="w-12 h-12 object-cover rounded"
                />
              ) : (
                <div className="flex items-center gap-1 text-sm">
                  <span className="inline-block bg-gray-200 rounded p-1 text-xs">
                    PDF
                  </span>
                  <span>{selectedFile.name}</span>
                </div>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onRemoveFile}
                aria-label="Remove file"
              >
                ✕
              </Button>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                type="button"
                className="h-8 w-8 hover:opacity-80 transition-opacity text-foreground"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Attach file"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            <Button
              type="submit"
              disabled={!input || isLoading}
              variant="default"
              size="sm"
              className="gap-2"
            >
              Send message
              <CornerDownLeft className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
