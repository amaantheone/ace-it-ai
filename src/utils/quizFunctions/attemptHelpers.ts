import { AttemptQuestionInput } from "@/app/api/quiz/attempt/create/route";

export interface QuizMeta {
  id: string;
  title: string;
  score: number | null;
  totalQuestions: number;
}

export async function createAttempt(quizId: string, score = 0) {
  const res = await fetch("/api/quiz/attempt/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quizId, score, questions: [] }),
  });
  if (!res.ok) throw new Error("Failed to create attempt");
  const data = await res.json();
  return data.attempt;
}

export async function saveQuestionAnswer(
  attemptId: string,
  questionData: AttemptQuestionInput
) {
  const res = await fetch("/api/quiz/attempt/question", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...questionData, attemptId }),
  });
  if (!res.ok) throw new Error("Failed to save question answer");
  return (await res.json()).question;
}

export async function updateQuizScore(
  quizId: string,
  score: number,
  totalQuestions: number
) {
  const res = await fetch("/api/quiz/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quizId, score, totalQuestions }),
  });
  if (!res.ok) throw new Error("Failed to update quiz score");
  return (await res.json()).quiz;
}

export async function updateAttemptScore(attemptId: string, score: number) {
  const res = await fetch("/api/quiz/attempt/score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ attemptId, score }),
  });
  if (!res.ok) throw new Error("Failed to update attempt score");
  return (await res.json()).attempt;
}

export async function getAttempt(quizId: string) {
  const res = await fetch(`/api/quiz/attempt/by-quiz/${quizId}`);
  if (!res.ok) return null;
  return (await res.json()).attempt;
}

export interface QuizAttemptQuestion {
  questionIndex: number;
  // ...other fields as needed
}

export async function getAttemptQuestions(attemptId: string) {
  const res = await fetch(`/api/quiz/attempt/${attemptId}`);
  if (!res.ok) return [];
  const attempt = (await res.json()).attempt;
  return (attempt?.questions || []).sort(
    (a: QuizAttemptQuestion, b: QuizAttemptQuestion) =>
      a.questionIndex - b.questionIndex
  );
}

// Quiz management functions
export async function deleteQuiz(quizId: string) {
  const res = await fetch(`/api/quiz/${quizId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete quiz");
  return await res.json();
}

export async function fetchQuizzes(): Promise<QuizMeta[]> {
  const res = await fetch("/api/quiz/list", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch quizzes");
  const data = await res.json();
  return data.quizzes || [];
}

// Cache management functions
export function updateQuizzesCache(quizzes: QuizMeta[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem("quizzes", JSON.stringify(quizzes));
  }
}

export function removeQuizFromCache(quizId: string): QuizMeta[] {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("quizzes");
    if (stored) {
      try {
        const quizzes: QuizMeta[] = JSON.parse(stored);
        const filtered = quizzes.filter((q: QuizMeta) => q.id !== quizId);
        localStorage.setItem("quizzes", JSON.stringify(filtered));
        return filtered;
      } catch (error) {
        console.error("Failed to update cache:", error);
      }
    }
  }
  return [];
}

export function getQuizzesFromCache(): QuizMeta[] {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("quizzes");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error("Failed to parse cached quizzes:", error);
        localStorage.removeItem("quizzes");
      }
    }
  }
  return [];
}
