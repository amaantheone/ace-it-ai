"use client"

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { X } from "lucide-react";
import { QuizSidebar } from "@/components/ui/quiz/quiz-sidebar";
import { createAttempt, saveQuestionAnswer, getAttempt, getAttemptQuestions } from "@/utils/quizFunctions/attemptHelpers";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
  wrongExplanation?: Record<string, string>;
}

interface QuizAttemptQuestion {
  id: string;
  question: string;
  options: string; // JSON stringified array
  answer: string;
  userAnswer: string;
  explanation?: string | null;
  wrongExplanation?: string | null; // JSON stringified object
}

interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  createdAt: string;
  questions: QuizAttemptQuestion[];
}

type QuizMeta = { id: string; title: string; score: number | null; totalQuestions: number };

export default function QuizPage() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login");
    }
  }, [status, router]);

  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answered, setAnswered] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);
  const [topic, setTopic] = useState("");
  const [quizStarted, setQuizStarted] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [count, setCount] = useState(10);
  const [quizId, setQuizId] = useState<string | null>(null);
  const [sidebarQuizzes, setSidebarQuizzes] = useState<QuizMeta[]>([]);
  const [showScoreFor, setShowScoreFor] = useState<QuizMeta | null>(null);
  const [reviewAttempt, setReviewAttempt] = useState<QuizAttempt | null>(null);
  const [currentReviewQuestionIdx, setCurrentReviewQuestionIdx] = useState(0);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load quizzes for sidebar from localStorage, and if empty, fetch from DB
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("quizzes");
    if (stored && JSON.parse(stored).length > 0) {
      setSidebarQuizzes(JSON.parse(stored));
    } else {
      // If no quizzes in localStorage, fetch from DB
      fetch("/api/quiz/list", { credentials: "include" })
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => {
          if (data.quizzes && Array.isArray(data.quizzes)) {
            setSidebarQuizzes(data.quizzes);
            localStorage.setItem("quizzes", JSON.stringify(data.quizzes));
          }
        })
        .catch(() => {});
    }
  }, []);

  // When a quiz is generated, create it in DB and add to sidebar/localStorage
  useEffect(() => {
    if (quizStarted && topic && !quizId) {
      fetch("/api/quiz/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: topic, totalQuestions: count }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.quiz && data.quiz.id) {
            setQuizId(data.quiz.id);
            // Add to sidebar/localStorage
            const newQuiz: QuizMeta = { id: data.quiz.id, title: data.quiz.title, score: null, totalQuestions: count };
            setSidebarQuizzes(prev => {
              const updated = [newQuiz, ...prev.filter(q => q.id !== newQuiz.id)];
              localStorage.setItem("quizzes", JSON.stringify(updated));
              return updated;
            });
          }
        });
    }
  }, [quizStarted, topic, quizId, count]);

  // When quiz is finished, update score in DB and sidebar/localStorage
  useEffect(() => {
    if (finished && quizId) {
      const score = quiz.filter((q, i) => answered[i] && userAnswers[i] === q.answer).length;
      setSidebarQuizzes(prev => {
        const updated = prev.map(q => q.id === quizId ? { ...q, score, totalQuestions: quiz.length } : q);
        localStorage.setItem("quizzes", JSON.stringify(updated));
        return updated;
      });
    }
  }, [finished, quizId, quiz, answered, userAnswers, topic]);

  // When quiz is started and you have a quizId, create an attempt
  useEffect(() => {
    if (quizStarted && quizId && !attemptId) {
      createAttempt(quizId, 0).then(attempt => {
        setAttemptId(attempt.id);
      });
    }
  }, [quizStarted, quizId, attemptId]);

  // Handler for sidebar quiz selection
  const handleSidebarSelect = async (quizId: string) => {
    let quizMeta = sidebarQuizzes.find(q => q.id === quizId) || null;
    // If not in localStorage/sidebar, fetch from DB
    if (!quizMeta) {
      try {
        const res = await fetch(`/api/quiz/list`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          const found = (data.quizzes as QuizMeta[] | undefined)?.find(q => q.id === quizId) || null;
          if (found) {
            quizMeta = found;
            setSidebarQuizzes(prev => {
              const updated = [found, ...prev.filter(q => q.id !== found.id)];
              localStorage.setItem("quizzes", JSON.stringify(updated));
              return updated;
            });
          }
        }
      } catch {}
    }
    if (quizMeta) setShowScoreFor(quizMeta);
    setReviewAttempt(null);
    setCurrentReviewQuestionIdx(0);
    setReviewLoading(true);
    try {
      const attempt = await getAttempt(quizId);
      if (attempt) {
        const questions = await getAttemptQuestions(attempt.id);
        setReviewAttempt({ ...attempt, questions });
      }
    } finally {
      setReviewLoading(false);
    }
  };

  useEffect(() => {
    if (!quizStarted) return;
    setLoading(true);
    setQuiz([]);
    setUserAnswers([]);
    setAnswered([]);
    setError(null);
    setFinished(false);
    const fetchQuiz = async () => {
      let res;
      if (pdfFile) {
        const formData = new FormData();
        formData.append("topic", topic);
        formData.append("count", String(count));
        formData.append("pdf", pdfFile);
        res = await fetch("/api/quiz", {
          method: "POST",
          body: formData,
        });
      } else {
        res = await fetch("/api/quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic, count }),
        });
      }
      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      setUserAnswers(Array(count).fill(""));
      setAnswered(Array(count).fill(false));
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const obj = JSON.parse(line);
            if (obj.error) {
              setError(obj.error);
              setLoading(false);
              return;
            }
            if (obj.question) {
              setQuiz((prev) => {
                const next = [...prev, obj.question];
                setUserAnswers((ua) => {
                  const arr = [...ua];
                  while (arr.length < next.length) arr.push("");
                  return arr;
                });
                setAnswered((an) => {
                  const arr = [...an];
                  while (arr.length < next.length) arr.push(false);
                  return arr;
                });
                return next;
              });
            }
          } catch {
            // ignore parse errors for incomplete lines
          }
        }
      }
      setLoading(false);
    };
    fetchQuiz().catch(() => {
      setError("Failed to load quiz.");
      setLoading(false);
    });
  }, [quizStarted, topic, pdfFile, count]);

  // Update your answer handler to save each answer as soon as it’s given
  const handleSelect = async (option: string) => {
    if (answered[current] || !attemptId) return;
    const newAnswers = [...userAnswers];
    newAnswers[current] = option;
    setUserAnswers(newAnswers);
    setAnswered(prev => {
      const newAnswered = [...prev];
      newAnswered[current] = true;
      return newAnswered;
    });

    // Save answer to backend
    const q = quiz[current];
    await saveQuestionAnswer(attemptId, {
      question: q.question,
      options: q.options,
      answer: q.answer,
      userAnswer: option,
      explanation: q.explanation,
      wrongExplanation: q.wrongExplanation,
      questionIndex: current,
    });
  };

  const handleNext = () => {
    if (current < quiz.length - 1) {
      setCurrent((prev) => prev + 1);
    } else {
      setFinished(true);
    }
  };

  // Calculate results
  const right = quiz.filter((q, i) => answered[i] && userAnswers[i] === q.answer).length;
  const wrong = quiz.filter((q, i) => answered[i] && userAnswers[i] && userAnswers[i] !== q.answer).length;
  const score = right;
  const total = quiz.length;
  const accuracy = total > 0 ? Math.round((right / total) * 100) : 0;

  // PLAN: Quiz Review UI
  // 1. When a quiz is selected from the sidebar, fetch the latest attempt for that quiz (or let user pick an attempt if multiple).
  // 2. Store the fetched attempt (with questions, answers, explanations) in state, e.g. reviewAttempt.
  // 3. Add state for currentReviewQuestionIdx to navigate through questions.
  // 4. Render the score summary at the top (already done).
  // 5. Below, render the current question, all options (highlight user answer and correct answer), explanation, and wrong explanation if relevant.
  // 6. Add Prev/Next navigation buttons to move through questions.
  // 7. Make the review UI read-only (no answer selection).
  // 8. If no attempt data, show a loading spinner or error.

  // Function to reset all quiz state for a fresh start
  const resetQuizState = () => {
    setQuiz([]);
    setCurrent(0);
    setUserAnswers([]);
    setLoading(false);
    setError(null);
    setAnswered([]);
    setFinished(false);
    setTopic("");
    setQuizStarted(false);
    setPdfFile(null);
    setCount(10);
    setQuizId(null); // Critical: Reset quizId to allow new quiz creation
    setShowScoreFor(null);
    setReviewAttempt(null);
    setCurrentReviewQuestionIdx(0);
    setReviewLoading(false);
    setAttemptId(null);
    // Focus the input for immediate new quiz creation
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="min-h-screen flex flex-row items-stretch justify-center bg-gradient-to-br from-background to-muted/60 p-2">
      {/* The QuizSidebar component now handles its own visibility */}
      <QuizSidebar onSelectQuiz={handleSidebarSelect} quizzes={sidebarQuizzes} onNewQuiz={resetQuizState} />
      
      {/* Main content area - shifted padding for mobile */}
      <div className="flex-1 flex flex-col items-center justify-center md:ml-0 ml-0 mt-12 md:mt-0">
        {showScoreFor ? (
          (() => {
            const score = showScoreFor.score ?? 0;
            const total = showScoreFor.totalQuestions ?? 0;
            const right = score;
            const wrong = total - score;
            const accuracy = total > 0 ? Math.round((right / total) * 100) : 0;
            return (
              <>
                <div className="flex flex-col items-center gap-8 py-10">
                  <div className="text-2xl font-bold mb-2 text-primary">Quiz Complete!</div>
                  <div className="flex flex-col md:flex-row gap-6 w-full justify-center items-center">
                    <div className="flex gap-6 justify-center w-full md:w-auto">
                      <div className="rounded-2xl bg-muted/60 px-8 py-6 min-w-[140px] max-w-[140px] h-[120px] flex flex-col items-center justify-center text-center shadow">
                        <div className="text-muted-foreground text-xs mb-1">Score</div>
                        <div className="text-3xl font-bold text-primary">{score}/{total}</div>
                      </div>
                      <div className="rounded-2xl bg-muted/60 px-8 py-6 min-w-[140px] max-w-[140px] h-[120px] flex flex-col items-center justify-center text-center shadow">
                        <div className="text-muted-foreground text-xs mb-1">Accuracy</div>
                        <div className="text-3xl font-bold text-primary">{accuracy}%</div>
                      </div>
                    </div>
                    <div className="rounded-2xl bg-muted/60 px-8 py-6 min-w-[140px] max-w-[140px] h-[120px] flex flex-col items-center justify-center text-center shadow">
                      <div className="text-muted-foreground text-xs mb-1">Right</div>
                      <div className="font-bold text-lg text-green-700">{right}</div>
                      <div className="text-muted-foreground text-xs mt-2">Wrong</div>
                      <div className="font-bold text-lg text-red-600">{wrong}</div>
                    </div>
                  </div>
                </div>
                {/* Review UI always visible below score summary */}
                <div className="w-full max-w-2xl mx-auto">
                  {reviewLoading ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Spinner className="h-8 w-8 mb-2" />
                      <span className="text-muted-foreground text-base font-medium">Loading attempt...</span>
                    </div>
                  ) : reviewAttempt ? (
                    <div className="mt-8">
                      <div className="text-lg font-semibold text-foreground mb-4">Review Attempt</div>
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <Button
                            variant="outline"
                            className="px-4 py-2 rounded-lg shadow-sm border-muted/60 hover:cursor-pointer"
                            onClick={() => {
                              const idx = currentReviewQuestionIdx - 1;
                              if (idx >= 0) setCurrentReviewQuestionIdx(idx);
                            }}
                            disabled={currentReviewQuestionIdx === 0}
                          >
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            className="px-4 py-2 rounded-lg shadow-sm border-muted/60 hover:cursor-pointer"
                            onClick={() => {
                              const idx = currentReviewQuestionIdx + 1;
                              if (idx < reviewAttempt.questions.length) setCurrentReviewQuestionIdx(idx);
                              else setShowScoreFor(null);
                            }}
                            disabled={currentReviewQuestionIdx === reviewAttempt.questions.length - 1}
                          >
                            {currentReviewQuestionIdx === reviewAttempt.questions.length - 1 ? "Finish" : "Next"}
                          </Button>
                        </div>
                        <div className="rounded-lg border border-muted/40 bg-muted/60 p-4">
                          <div className="font-semibold text-lg text-foreground mb-2">
                            Question {currentReviewQuestionIdx + 1} of {reviewAttempt.questions.length}
                          </div>
                          <div className="text-foreground/90 mb-2">
                            {reviewAttempt.questions[currentReviewQuestionIdx].question}
                          </div>
                          <div className="flex flex-col gap-2 mb-4">
                            {JSON.parse(reviewAttempt.questions[currentReviewQuestionIdx].options).map((opt: string, oidx: number) => {
                              const userAnswer = reviewAttempt.questions[currentReviewQuestionIdx].userAnswer;
                              const correctAnswer = reviewAttempt.questions[currentReviewQuestionIdx].answer;
                              const isSelected = userAnswer === opt;
                              const isCorrect = opt === correctAnswer;
                              const isWrong = isSelected && !isCorrect;
                              return (
                                <div key={oidx} className="relative">
                                  <Button
                                    type="button"
                                    variant={isWrong ? "destructive" : isSelected ? "default" : "outline"}
                                    className={`w-full text-left justify-start py-3 px-4 rounded-lg text-base font-medium transition border-2 ${isCorrect ? "border-green-500 ring-2 ring-green-500" : ""} ${isWrong ? "border-red-500 ring-2 ring-red-500" : "border-muted/40"} hover:cursor-pointer`}
                                    disabled
                                  >
                                    <span className="mr-2 font-semibold">{String.fromCharCode(65 + oidx)}.</span> {opt}
                                    {isCorrect && (
                                      <span className="ml-2 text-green-600 font-semibold">✓</span>
                                    )}
                                    {isWrong && (
                                      <span className="ml-2 text-red-600 font-semibold">✗</span>
                                    )}
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                          <div className="text-foreground/80 text-sm mt-2">
                            <div className="font-semibold text-foreground">Explanation:</div>
                            <div>{reviewAttempt.questions[currentReviewQuestionIdx].explanation}</div>
                            {(() => {
                              const userAnswer = reviewAttempt.questions[currentReviewQuestionIdx].userAnswer;
                              const correctAnswer = reviewAttempt.questions[currentReviewQuestionIdx].answer;
                              if (userAnswer && userAnswer !== correctAnswer && reviewAttempt.questions[currentReviewQuestionIdx].wrongExplanation) {
                                const wrongExplanations = JSON.parse(reviewAttempt.questions[currentReviewQuestionIdx].wrongExplanation || '{}');
                                return (
                                  <div className="mt-2">
                                    <div className="font-semibold text-foreground">Why not:</div>
                                    <div>{wrongExplanations[userAnswer]}</div>
                                  </div>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8">
                      <span className="text-muted-foreground text-base font-medium">No attempt data found for this quiz.</span>
                    </div>
                  )}
                </div>
              </>
            );
          })()
        ) : (
          <>
            <div className="mb-4 text-center select-none">
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-primary drop-shadow-sm mb-1">Quiz Generator</h1>
              <p className="text-sm md:text-lg text-muted-foreground font-medium italic opacity-90">Test your knowledge or generate a quiz from a PDF!</p>
            </div>
            <Card className="w-full max-w-2xl shadow-xl border border-muted/40 dark:border-white/10 rounded-2xl bg-white/90 dark:bg-background/80 backdrop-blur-md dark:shadow-2xl">
              <CardContent className="py-2 px-3 md:px-8">
                {!quizStarted && (
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      if (topic.trim()) {
                        // Reset quizId to ensure fresh quiz creation
                        setQuizId(null);
                        setQuizStarted(true);
                      } else {
                        inputRef.current?.focus();
                      }
                    }}
                    className="flex flex-col gap-2 items-center mt-0"
                    encType="multipart/form-data"
                  >
                    <input
                      ref={inputRef}
                      type="text"
                      className="border border-muted rounded-lg px-3 md:px-4 py-2 md:py-3 w-full max-w-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/60 text-sm md:text-base shadow-sm"
                      placeholder="Enter a topic (e.g. General Knowledge, Science)"
                      value={topic}
                      onChange={e => setTopic(e.target.value)}
                      required
                      autoFocus
                    />
                    <div className="w-full max-w-lg flex flex-col gap-2">
                      <label className="block text-sm font-medium text-foreground mb-1">Number of questions</label>
                      <input
                        type="number"
                        min={10}
                        max={25}
                        value={count}
                        onChange={e => setCount(Math.max(10, Math.min(25, Number(e.target.value))))}
                        className="border border-muted rounded-lg px-4 py-2 w-full max-w-[120px] text-base shadow-sm"
                      />
                    </div>
                    <div className="w-full max-w-lg flex flex-col gap-2">
                      <label className="block text-sm font-medium text-foreground mb-1">Attach PDF (optional)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept="application/pdf"
                          id="pdf-upload"
                          className="hidden"
                          onChange={e => setPdfFile(e.target.files?.[0] || null)}
                        />
                        <label htmlFor="pdf-upload">
                          <span>
                            <Button variant="outline" className="px-3 md:px-4 py-1 md:py-2 text-xs md:text-sm cursor-pointer rounded-lg shadow-sm border-muted/60 hover:cursor-pointer" asChild>
                              <span>{pdfFile ? "Change PDF" : "Choose PDF"}</span>
                            </Button>
                          </span>
                        </label>
                        {pdfFile && (
                          <div className="flex items-center gap-1 bg-muted/60 px-2 py-1 rounded text-xs shadow-sm">
                            <span className="truncate max-w-[100px] md:max-w-[140px] font-medium">{pdfFile.name}</span>
                            <button
                              type="button"
                              className="ml-1 text-muted-foreground hover:text-destructive"
                              onClick={() => setPdfFile(null)}
                              aria-label="Remove file"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button type="submit" className="w-full max-w-lg text-sm md:text-base py-2 md:py-3 rounded-lg shadow-md hover:cursor-pointer" variant="default">
                      Start Quiz
                    </Button>
                  </form>
                )}
                {quiz.length > 0 && !finished && quizStarted && (
                  <div className="flex flex-col gap-4 md:gap-6">
                    <div className="flex items-center justify-between mb-1 md:mb-2">
                      <div className="text-xs md:text-sm font-medium bg-primary/10 dark:bg-white px-2 md:px-3 py-1 rounded-lg shadow-sm transition-colors">
                        <span className="text-black dark:text-black">Question {current + 1}</span>
                        <span className="text-black dark:text-black opacity-80 ml-1">/ {quiz.length}</span>
                      </div>
                    </div>
                    <div className="font-semibold text-base md:text-lg mb-2 md:mb-4 text-foreground/90 min-h-[48px]">{quiz[current].question}</div>
                    <div className="flex flex-col gap-2 md:gap-3 mb-2 md:mb-4">
                      {quiz[current].options.map((opt, oidx) => {
                        const isSelected = userAnswers[current] === opt;
                        const isCorrect = answered[current] && opt === quiz[current].answer;
                        const isWrong = answered[current] && isSelected && opt !== quiz[current].answer;
                        return (
                          <div key={oidx} className="relative">
                            <Button
                              type="button"
                              variant={isWrong ? "destructive" : isSelected ? "default" : "outline"}
                              className={`w-full text-left justify-start py-2 md:py-3 px-3 md:px-4 rounded-lg text-sm md:text-base font-medium transition border-2 ${isCorrect ? "border-green-500 ring-2 ring-green-500" : ""} ${isWrong ? "border-red-500 ring-2 ring-red-500" : "border-muted/40"} hover:cursor-pointer`}
                              onClick={() => handleSelect(opt)}
                              disabled={answered[current]}
                            >
                              <span className="mr-2 font-semibold">{String.fromCharCode(65 + oidx)}.</span> {opt}
                              {isCorrect && (
                                <span className="ml-2 text-green-600 font-semibold">✓</span>
                              )}
                              {isWrong && (
                                <span className="ml-2 text-red-600 font-semibold">✗</span>
                              )}
                            </Button>
                            {answered[current] && isCorrect && (!answered[current] || userAnswers[current] === quiz[current].answer) && (
                              <div className="rounded-lg border border-green-600 bg-green-50 p-3 mt-2 shadow-sm">
                                <div className="font-semibold text-green-700">That&apos;s right!</div>
                                <div className="text-green-700 text-sm mt-1">{quiz[current].explanation}</div>
                              </div>
                            )}
                            {answered[current] && isWrong && (
                              <div className="rounded-lg border border-red-600 bg-red-50 p-3 mt-2 shadow-sm">
                                <div className="font-semibold text-red-700 flex items-center gap-2"><span>✗</span> Not quite</div>
                                <div className="text-red-700 text-sm mt-1">{quiz[current].wrongExplanation?.[opt]}</div>
                                <div className="rounded-lg border border-green-600 bg-green-50 p-3 mt-2">
                                  <div className="text-green-700 text-sm">{quiz[current].explanation}</div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-center w-full">
                      <Button
                        onClick={handleNext}
                        disabled={
                          !answered[current] ||
                          (current === quiz.length - 1 && answered.filter(Boolean).length < quiz.length) ||
                          (current === quiz.length - 1 && answered.slice(0, quiz.length - 1).some(a => !a))
                        }
                        className="w-full max-w-lg text-sm md:text-base py-2 md:py-3 rounded-lg shadow-md bg-primary text-white hover:bg-primary/90 focus:ring-2 focus:ring-primary/40 focus:outline-none transition-colors dark:bg-white dark:text-black dark:hover:bg-neutral-100 hover:cursor-pointer"
                        variant="default"
                      >
                        {current === quiz.length - 1 ? "Finish" : "Next Question"}
                      </Button>
                    </div>
                  </div>
                )}
                {quiz.length > 0 && finished && quizStarted && (
                  <div className="flex flex-col items-center gap-8 py-10">
                    <div className="text-2xl font-bold mb-2 text-primary">Quiz Complete!</div>
                    <div className="flex flex-col md:flex-row gap-6 w-full justify-center items-center">
                      <div className="flex gap-6 justify-center w-full md:w-auto">
                        <div className="rounded-2xl bg-muted/60 px-8 py-6 min-w-[140px] max-w-[140px] h-[120px] flex flex-col items-center justify-center text-center shadow">
                          <div className="text-muted-foreground text-xs mb-1">Score</div>
                          <div className="text-3xl font-bold text-primary">{score}/{total}</div>
                        </div>
                        <div className="rounded-2xl bg-muted/60 px-8 py-6 min-w-[140px] max-w-[140px] h-[120px] flex flex-col items-center justify-center text-center shadow">
                          <div className="text-muted-foreground text-xs mb-1">Accuracy</div>
                          <div className="text-3xl font-bold text-primary">{accuracy}%</div>
                        </div>
                      </div>
                      <div className="rounded-2xl bg-muted/60 px-8 py-6 min-w-[140px] max-w-[140px] h-[120px] flex flex-col items-center justify-center text-center shadow">
                        <div className="text-muted-foreground text-xs mb-1">Right</div>
                        <div className="font-bold text-lg text-green-700">{right}</div>
                        <div className="text-muted-foreground text-xs mt-2">Wrong</div>
                        <div className="font-bold text-lg text-red-600">{wrong}</div>
                      </div>
                    </div>
                  </div>
                )}
                {error && <div className="text-red-500 text-center mt-4">{error}</div>}
                {loading && quizStarted && quiz.length === 0 && (
                  <div className="flex flex-col items-center justify-center mt-8">
                    <Spinner className="h-10 w-10 mb-3" />
                    <span className="text-muted-foreground text-base font-medium">Generating quiz...</span>
                  </div>
                )}
                {/* Render review UI outside the score summary block so it's always visible */}
                {showScoreFor && reviewAttempt && (
                  <div className="mt-8 w-full max-w-2xl">
                    <div className="text-lg font-semibold text-foreground mb-4">Review Attempt</div>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <Button
                          variant="outline"
                          className="px-4 py-2 rounded-lg shadow-sm border-muted/60 hover:cursor-pointer"
                          onClick={() => {
                            const idx = currentReviewQuestionIdx - 1;
                            if (idx >= 0) setCurrentReviewQuestionIdx(idx);
                          }}
                          disabled={currentReviewQuestionIdx === 0}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          className="px-4 py-2 rounded-lg shadow-sm border-muted/60 hover:cursor-pointer"
                          onClick={() => {
                            const idx = currentReviewQuestionIdx + 1;
                            if (idx < reviewAttempt.questions.length) setCurrentReviewQuestionIdx(idx);
                            else setShowScoreFor(null);
                          }}
                          disabled={currentReviewQuestionIdx === reviewAttempt.questions.length - 1}
                        >
                          {currentReviewQuestionIdx === reviewAttempt.questions.length - 1 ? "Finish" : "Next"}
                        </Button>
                      </div>
                      <div className="rounded-lg border border-muted/40 bg-muted/60 p-4">
                        <div className="font-semibold text-lg text-foreground mb-2">
                          Question {currentReviewQuestionIdx + 1} of {reviewAttempt.questions.length}
                        </div>
                        <div className="text-foreground/90 mb-2">
                          {reviewAttempt.questions[currentReviewQuestionIdx].question}
                        </div>
                        <div className="flex flex-col gap-2 mb-4">
                          {JSON.parse(reviewAttempt.questions[currentReviewQuestionIdx].options).map((opt: string, oidx: number) => {
                            const userAnswer = reviewAttempt.questions[currentReviewQuestionIdx].userAnswer;
                            const correctAnswer = reviewAttempt.questions[currentReviewQuestionIdx].answer;
                            const isSelected = userAnswer === opt;
                            const isCorrect = opt === correctAnswer;
                            const isWrong = isSelected && !isCorrect;
                            return (
                              <div key={oidx} className="relative">
                                <Button
                                  type="button"
                                  variant={isWrong ? "destructive" : isSelected ? "default" : "outline"}
                                  className={`w-full text-left justify-start py-3 px-4 rounded-lg text-base font-medium transition border-2 ${isCorrect ? "border-green-500 ring-2 ring-green-500" : ""} ${isWrong ? "border-red-500 ring-2 ring-red-500" : "border-muted/40"} hover:cursor-pointer`}
                                  disabled
                                >
                                  <span className="mr-2 font-semibold">{String.fromCharCode(65 + oidx)}.</span> {opt}
                                  {isCorrect && (
                                    <span className="ml-2 text-green-600 font-semibold">✓</span>
                                  )}
                                  {isWrong && (
                                    <span className="ml-2 text-red-600 font-semibold">✗</span>
                                  )}
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                        <div className="text-foreground/80 text-sm mt-2">
                          <div className="font-semibold text-foreground">Explanation:</div>
                          <div>{reviewAttempt.questions[currentReviewQuestionIdx].explanation}</div>
                          {(() => {
                            const userAnswer = reviewAttempt.questions[currentReviewQuestionIdx].userAnswer;
                            const correctAnswer = reviewAttempt.questions[currentReviewQuestionIdx].answer;
                            if (userAnswer && userAnswer !== correctAnswer && reviewAttempt.questions[currentReviewQuestionIdx].wrongExplanation) {
                              const wrongExplanations = JSON.parse(reviewAttempt.questions[currentReviewQuestionIdx].wrongExplanation || '{}');
                              return (
                                <div className="mt-2">
                                  <div className="font-semibold text-foreground">Why not:</div>
                                  <div>{wrongExplanations[userAnswer]}</div>
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}