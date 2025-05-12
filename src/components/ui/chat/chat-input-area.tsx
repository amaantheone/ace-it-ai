'use client';

import { Paperclip, CornerDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatInput as BaseChatInput } from "./chat-input";
import { useRef } from "react";

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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                type="button"
                className="h-8 w-8 hover:opacity-80 transition-opacity text-foreground"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
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
