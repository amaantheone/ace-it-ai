import { AttemptQuestionInput } from "@/app/api/quiz/attempt/create/route";

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
