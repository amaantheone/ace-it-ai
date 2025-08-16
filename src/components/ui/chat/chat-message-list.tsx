import * as React from "react";

type ChatMessageListProps = React.HTMLAttributes<HTMLDivElement>;

const ChatMessageList = React.forwardRef<HTMLDivElement, ChatMessageListProps>(
  ({ className, children, ...props }, ref) => {
    // Keep this component purely presentational. The page-level container
    // manages scrolling and the scroll-to-bottom button.
    return (
      <div className={`flex flex-col w-full p-4 ${className || ""}`} ref={ref} {...props}>
        <div className="flex flex-col gap-6">{children}</div>
      </div>
    );
  }
);

ChatMessageList.displayName = "ChatMessageList";

export { ChatMessageList };
