import { useCallback, useRef, useState } from "react";

interface UseScrollToBottomOptions {
  threshold?: number; // px distance from bottom before showing the button
  behavior?: ScrollBehavior; // 'smooth' | 'auto'
}

interface UseScrollToBottomResult {
  bottomRef: React.RefObject<HTMLDivElement | null>;
  showScrollToBottom: boolean;
  handleScroll: (event: React.UIEvent<HTMLDivElement>) => void;
  scrollToBottom: () => void;
}

export function useScrollToBottom(
  { threshold = 100, behavior = "smooth" }: UseScrollToBottomOptions = {}
): UseScrollToBottomResult {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
      const distance = scrollHeight - scrollTop - clientHeight;
      if (distance > threshold) {
        setShowScrollToBottom(true);
      } else {
        setShowScrollToBottom(false);
      }
    },
    [threshold]
  );

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior });
    setShowScrollToBottom(false);
  }, [behavior]);

  return {
    bottomRef,
    showScrollToBottom,
    handleScroll,
    scrollToBottom,
  };
}
