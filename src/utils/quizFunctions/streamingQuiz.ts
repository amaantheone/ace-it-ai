// Types for streaming quiz generation
interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
  wrongExplanation?: Record<string, string>;
  questionIndex?: number;
}

interface StreamStatus {
  status:
    | "generating_subtopics"
    | "subtopics_generated"
    | "generating_question"
    | "question_generated"
    | "completed"
    | "error";
  data?: {
    subtopics?: string[];
    question?: QuizQuestion;
    current?: number;
    total?: number;
    subtopic?: string;
    fallback?: boolean;
    timeout?: boolean;
    questions?: QuizQuestion[];
    totalGenerated?: number;
  };
  error?: string;
}

// Streaming quiz generation utility
export async function generateQuizStreaming(
  topic: string,
  pdfFile: File | null,
  onProgress: (status: StreamStatus) => void
) {
  return new Promise<QuizQuestion[]>(async (resolve, reject) => {
    try {
      let res;

      if (pdfFile) {
        const formData = new FormData();
        formData.append("topic", topic);
        formData.append("pdf", pdfFile);

        res = await fetch("/api/quiz/stream", {
          method: "POST",
          body: formData,
        });
      } else {
        res = await fetch("/api/quiz/stream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topic,
          }),
        });
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      if (!res.body) {
        throw new Error("No response body");
      }

      // Process the streaming response
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      const questions = [];

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim()) {
            try {
              const status = JSON.parse(line);

              if (onProgress) {
                onProgress(status);
              }

              if (
                status.status === "question_generated" &&
                status.data?.question
              ) {
                questions.push(status.data.question);
              } else if (status.status === "completed") {
                resolve(questions);
                return;
              } else if (status.status === "error") {
                reject(new Error(status.error || "Quiz generation failed"));
                return;
              }
            } catch {
              console.warn("Failed to parse streaming response:", line);
            }
          }
        }
      }

      // If we reach here and have questions, resolve with what we have
      if (questions.length > 0) {
        resolve(questions);
      } else {
        reject(new Error("No questions generated"));
      }
    } catch (error) {
      reject(error);
    }
  });
}
