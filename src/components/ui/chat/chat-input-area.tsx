'use client';

import { Paperclip, CornerDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatInput as BaseChatInput } from "./chat-input";
import { useRef, useState } from "react";
import Image from "next/image";

interface ChatInputAreaProps {
  input: string;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export function ChatInputArea({
  input,
  isLoading,
  onSubmit,
  onKeyDown,
  onChange,
}: ChatInputAreaProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file));
    } else if (file.type === "application/pdf") {
      setPreviewUrl(null); // No preview, just show filename/icon
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  return (
    <div className="p-2 md:p-4 bg-background">
      <div className="max-w-3xl mx-auto">
        <form
          ref={formRef}
          onSubmit={onSubmit}
          className="relative flex flex-col gap-2"
        >
          <BaseChatInput
            ref={inputRef}
            value={input}
            onKeyDown={onKeyDown}
            onChange={onChange}
            placeholder="Ask anything..."
            className="min-h-[60px] md:min-h-[80px] resize-none rounded-lg bg-muted border-border p-3 text-foreground placeholder:text-muted-foreground"
          />
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
                onClick={handleRemoveFile}
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
                accept="image/*,application/pdf"
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
