'use client';

import { useGuest } from "@/contexts/GuestContext";
import { Button } from "@/components/ui/button";
import { CornerDownLeft } from "lucide-react";

interface SendButtonProps {
  input: string;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  formRef: React.RefObject<HTMLFormElement | null>;
}

export function SendButton({ input, isLoading, onSubmit, formRef }: SendButtonProps) {
  const { isGuest, guestMessageCount, setShowChatLoginPopup } = useGuest();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Check guest message count and show popup if limit reached (4 messages)
    if (isGuest && guestMessageCount >= 4) {
      setShowChatLoginPopup(true);
      return; // Prevent sending more messages if limit reached
    }

    // Manually submit the form
    if (formRef.current) {
      onSubmit(new Event('submit') as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  return (
    <Button
      type="button" // Changed to button to prevent default form submission
      disabled={!input || isLoading}
      variant="default"
      size="sm"
      className="gap-2"
      onClick={handleClick}
    >
      Send message
      <CornerDownLeft className="h-4 w-4" />
    </Button>
  );
}
