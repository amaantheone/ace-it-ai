import React from 'react';
import { Card } from '../card';
import { Button } from '../button';
import { SUGGESTION_PRESETS } from '@/utils/chatFunctions/constants';

interface SuggestionsGridProps {
  onSuggestionClick: (text: string) => void;
  isLoading: boolean;
  userMessageCount: number;
}

export default function SuggestionsGrid({ onSuggestionClick, isLoading, userMessageCount }: SuggestionsGridProps) {
  if (isLoading || userMessageCount > 0) return null;
  return (
    <div className="w-full flex justify-center mt-6 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
  {SUGGESTION_PRESETS.map((s, i) => (
          <Card key={i} className="p-0 shadow-none border-none bg-transparent">
            <Button
              variant="outline"
              className="w-full px-0 py-0 rounded-xl flex flex-col items-start justify-center text-left group hover:cursor-pointer min-h-[72px] sm:min-h-[96px]"
              onClick={() => onSuggestionClick(s.text)}
            >
              <span className="font-semibold text-base sm:text-lg leading-tight pl-4 pt-3 sm:pl-5 sm:pt-4">{s.title}</span>
              <span className="text-muted-foreground text-xs sm:text-sm font-normal pl-4 pb-3 pt-1 sm:pl-5 sm:pb-4 group-hover:text-foreground transition-colors">{s.subtitle}</span>
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
