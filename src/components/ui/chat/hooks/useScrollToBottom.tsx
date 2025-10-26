import { useCallback, useRef, useState } from "react";
import type { UIEvent } from "react";

interface UseScrollToBottomOptions {
  threshold?: number; // px distance from bottom before showing the button
  behavior?: ScrollBehavior; // 'smooth' | 'auto'
}

interface ScrollToBottomOptions {
  force?: boolean;
}

interface UseScrollToBottomResult {
  bottomRef: React.RefObject<HTMLDivElement | null>;
  showScrollToBottom: boolean;
  handleScroll: (event: UIEvent<HTMLDivElement>) => void;
  scrollToBottom: (options?: ScrollToBottomOptions) => void;
  isAutoScrollEnabled: boolean;
  getAutoScrollEnabled: () => boolean;
}

export function useScrollToBottom(
  { threshold = 100, behavior = "smooth" }: UseScrollToBottomOptions = {}
): UseScrollToBottomResult {
  const bottomRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScrollRef = useRef(false);
  const isAutoScrollEnabledRef = useRef(true);
  const previousScrollTopRef = useRef(0);
  const previousScrollHeightRef = useRef(0);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);

  const handleScroll = useCallback(
    (event: UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
      const distance = scrollHeight - scrollTop - clientHeight;
      const shouldShowButton = distance > threshold;
      const previousScrollTop = previousScrollTopRef.current;
      const previousScrollHeight = previousScrollHeightRef.current;
      const contentGrew = scrollHeight > previousScrollHeight + 1;
      const userScrolledUp = scrollTop + 1 < previousScrollTop;

      if (isProgrammaticScrollRef.current) {
        if (!shouldShowButton) {
          isProgrammaticScrollRef.current = false;
        }
        previousScrollTopRef.current = scrollTop;
        previousScrollHeightRef.current = scrollHeight;
        return;
      }

      if (userScrolledUp && isAutoScrollEnabledRef.current) {
        isAutoScrollEnabledRef.current = false;
        setIsAutoScrollEnabled(false);
      }

      if (isAutoScrollEnabledRef.current && contentGrew) {
        setShowScrollToBottom(false);
      } else {
        const shouldEnableAutoScroll = distance <= threshold;
        if (shouldEnableAutoScroll !== isAutoScrollEnabledRef.current) {
          isAutoScrollEnabledRef.current = shouldEnableAutoScroll;
          setIsAutoScrollEnabled(shouldEnableAutoScroll);
        }
        setShowScrollToBottom(!shouldEnableAutoScroll && shouldShowButton);
      }

      previousScrollTopRef.current = scrollTop;
      previousScrollHeightRef.current = scrollHeight;
    },
    [threshold]
  );

  const scrollToBottom = useCallback(
    (options: ScrollToBottomOptions = {}) => {
      const { force = false } = options;
      if (!force && !isAutoScrollEnabledRef.current) {
        return;
      }

      isAutoScrollEnabledRef.current = true;
      setIsAutoScrollEnabled(true);
      setShowScrollToBottom(false);

      if (!bottomRef.current) return;
      isProgrammaticScrollRef.current = true;
      bottomRef.current.scrollIntoView({ behavior });
      requestAnimationFrame(() => {
        isProgrammaticScrollRef.current = false;
      });
    },
    [behavior]
  );

  const getAutoScrollEnabled = useCallback(() => isAutoScrollEnabledRef.current, []);

  return {
    bottomRef,
    showScrollToBottom,
    handleScroll,
    scrollToBottom,
    isAutoScrollEnabled,
    getAutoScrollEnabled,
  };
}
