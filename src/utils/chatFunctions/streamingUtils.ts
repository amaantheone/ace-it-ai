// Streaming utilities for handling real-time AI responses

export interface StreamingChunk {
  type: "chunk" | "complete" | "error";
  content: string;
  complete: boolean;
}

export interface StreamingCallbacks {
  onChunk?: (content: string) => void;
  onComplete?: (fullContent: string) => void;
  onError?: (error: string) => void;
}

/**
 * Handles streaming response from the chat API
 * @param response - The fetch response containing the stream
 * @param callbacks - Callbacks for handling chunks, completion, and errors
 * @returns Promise that resolves with the complete response content
 */
export async function handleStreamingResponse(
  response: Response,
  callbacks: StreamingCallbacks = {}
): Promise<string> {
  if (!response.body) {
    throw new Error("No response body available for streaming");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullContent = "";

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      // Decode the chunk
      const chunk = decoder.decode(value, { stream: true });

      // Parse Server-Sent Events format
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6));
            const streamingChunk = data as StreamingChunk;

            switch (streamingChunk.type) {
              case "chunk":
                fullContent += streamingChunk.content;
                // Add a small delay for typewriter effect
                await new Promise((resolve) => setTimeout(resolve, 15));
                callbacks.onChunk?.(streamingChunk.content);
                break;

              case "complete":
                fullContent = streamingChunk.content; // Use complete content in case of sync issues
                callbacks.onComplete?.(fullContent);
                return fullContent;

              case "error":
                callbacks.onError?.(streamingChunk.content);
                throw new Error(streamingChunk.content);
            }
          } catch {
            console.warn("Failed to parse streaming chunk:", line);
          }
        }
      }
    }

    return fullContent;
  } catch (error) {
    callbacks.onError?.(
      error instanceof Error ? error.message : "Unknown streaming error"
    );
    throw error;
  } finally {
    reader.releaseLock();
  }
}

/**
 * Creates a streaming chat request with proper headers and body formatting
 * @param endpoint - The API endpoint to call (/api/chat/stream)
 * @param payload - The chat payload (message, sessionId, etc.)
 * @param file - Optional file to upload
 * @returns Promise<Response> - The streaming response
 */
export async function createStreamingChatRequest(
  endpoint: string,
  payload: {
    message: string;
    sessionId: string;
    userMessageId?: string;
    isGuestMode?: boolean;
    guestMessages?: Array<{ role: string; content: string; id?: string }>;
    isEdit?: boolean;
    editMessageId?: string;
  },
  file?: File | null
): Promise<Response> {
  let body: FormData | string;
  const headers: Record<string, string> = {};

  if (file) {
    // Use FormData for file uploads
    const formData = new FormData();
    formData.append("message", payload.message);
    formData.append("sessionId", payload.sessionId);

    if (payload.userMessageId) {
      formData.append("userMessageId", payload.userMessageId);
    }

    formData.append("isGuestMode", String(payload.isGuestMode || false));

    if (payload.guestMessages) {
      formData.append("guestMessages", JSON.stringify(payload.guestMessages));
    }

    if (payload.isEdit) {
      formData.append("isEdit", String(payload.isEdit));
    }

    if (payload.editMessageId) {
      formData.append("editMessageId", payload.editMessageId);
    }

    formData.append("file", file);
    body = formData;
  } else {
    // Use JSON for text-only messages
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(payload);
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response;
}

/**
 * Utility to generate a unique message ID
 * @returns string - A unique identifier for the message
 */
export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Debounce function for streaming updates to prevent excessive re-renders
 * @param func - Function to debounce
 * @param wait - Milliseconds to wait
 * @returns Debounced function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Streaming message state for managing incremental updates
 */
export class StreamingMessageState {
  private content: string = "";
  private isComplete: boolean = false;
  private callbacks: Set<(content: string, isComplete: boolean) => void> =
    new Set();

  constructor(initialContent: string = "") {
    this.content = initialContent;
  }

  /**
   * Append content to the streaming message
   */
  appendContent(chunk: string): void {
    if (this.isComplete) {
      console.warn("Attempting to append content to completed message");
      return;
    }

    this.content += chunk;
    this.notifyCallbacks();
  }

  /**
   * Set the complete content (replaces all existing content)
   */
  setCompleteContent(content: string): void {
    this.content = content;
    this.isComplete = true;
    this.notifyCallbacks();
  }

  /**
   * Mark the message as complete without changing content
   */
  markComplete(): void {
    this.isComplete = true;
    this.notifyCallbacks();
  }

  /**
   * Get current content
   */
  getContent(): string {
    return this.content;
  }

  /**
   * Check if message is complete
   */
  getIsComplete(): boolean {
    return this.isComplete;
  }

  /**
   * Subscribe to content updates
   */
  subscribe(
    callback: (content: string, isComplete: boolean) => void
  ): () => void {
    this.callbacks.add(callback);

    // Return unsubscribe function
    return () => {
      this.callbacks.delete(callback);
    };
  }

  /**
   * Clear all content and reset state
   */
  reset(): void {
    this.content = "";
    this.isComplete = false;
    this.notifyCallbacks();
  }

  private notifyCallbacks(): void {
    this.callbacks.forEach((callback) => {
      try {
        callback(this.content, this.isComplete);
      } catch (error) {
        console.error("Error in streaming message callback:", error);
      }
    });
  }
}
