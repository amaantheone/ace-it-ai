"use client"

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { X } from "lucide-react";
import { QuizSidebar } from "@/components/ui/quiz/quiz-sidebar";
import { createAttempt, saveQuestionAnswer, getAttempt, getAttemptQuestions, updateQuizScore } from "@/utils/quizFunctions/attemptHelpers";
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

  const [quizId, setQuizId] = useState<string | null>(null);
  const [sidebarQuizzes, setSidebarQuizzes] = useState<QuizMeta[]>([]);
  const [showScoreFor, setShowScoreFor] = useState<QuizMeta | null>(null);
  const [reviewAttempt, setReviewAttempt] = useState<QuizAttempt | null>(null);
  const [currentReviewQuestionIdx, setCurrentReviewQuestionIdx] = useState(0);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const quizGenerationInProgress = useRef(false);

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
        .then((data) => {
          if (data.quizzes && Array.isArray(data.quizzes)) {
            setSidebarQuizzes(data.quizzes);
            localStorage.setItem("quizzes", JSON.stringify(data.quizzes));
          }
        })
        .catch(() => {});
    }
  }, []);

  // When a quiz is generated, create it in DB but don't add to sidebar/localStorage until finished
  useEffect(() => {
    if (quizStarted && topic && !quizId) {
      fetch("/api/quiz/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: topic, totalQuestions: 10 }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.quiz && data.quiz.id) {
            setQuizId(data.quiz.id);
            // Don't add to sidebar yet - will add after completion
          }
        });
    }
  }, [quizStarted, topic, quizId]);

  // When quiz is finished, update score in DB and sidebar/localStorage
  useEffect(() => {
    if (finished && quizId) {
      const score = quiz.filter((q, i) => answered[i] && userAnswers[i] === q.answer).length;
      
      // Save score to database
      updateQuizScore(quizId, score, quiz.length)
        .then(() => {
          // Now add to sidebar/localStorage
          const newQuiz: QuizMeta = { 
            id: quizId, 
            title: topic, 
            score, 
            totalQuestions: quiz.length 
          };
          
          setSidebarQuizzes(prev => {
            const updated = [newQuiz, ...prev.filter(q => q.id !== quizId)];
            localStorage.setItem("quizzes", JSON.stringify(updated));
            return updated;
          });
        })
        .catch((err: Error) => {
          console.error("Failed to update quiz score:", err);
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

  // Generate quiz questions in backend with performance optimizations
  useEffect(() => {
    if (!quizStarted || quizGenerationInProgress.current) return;
    
    quizGenerationInProgress.current = true;
    setLoading(true);
    setQuiz([]);
    setUserAnswers([]);
    setAnswered([]);
    setError(null);
    setFinished(false);
    
    const fetchQuiz = async () => {
      let res;
      try {
        if (pdfFile) {
          const formData = new FormData();
          formData.append("topic", topic);
          formData.append("count", "10");
          formData.append("pdf", pdfFile);
          res = await fetch("/api/quiz", {
            method: "POST",
            body: formData,
          });
        } else {
          res = await fetch("/api/quiz", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ topic, count: 10, quizId }),
          });
        }
      } catch (fetchError) {
        console.error("Network error during quiz generation:", fetchError);
        throw new Error("Network error. Please check your internet connection and try again.");
      }
      // Check for quiz deletion header
      const deletedQuizId = res.headers.get("X-Quiz-Deleted");
      if (deletedQuizId) {
        setSidebarQuizzes(prev => {
          const updated = prev.filter(q => q.id !== deletedQuizId);
          localStorage.setItem("quizzes", JSON.stringify(updated));
          return updated;
        });
        setQuizId(null);
      }
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Failed to load quiz" }));
        // Provide more specific error messages for common issues
        if (res.status === 408) {
          throw new Error("Request timed out. Please try again with a simpler topic or smaller PDF file.");
        } else if (res.status === 413) {
          throw new Error("PDF file is too large. Please try a smaller file (max 10MB).");
        } else if (res.status === 415) {
          throw new Error("Invalid file type. Please upload a valid PDF file.");
        } else if (errorData.error && errorData.error.includes("PDF")) {
          throw new Error(`PDF processing error: ${errorData.error}`);
        }
        throw new Error(errorData.error || "Failed to load quiz");
      }

      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
        setLoading(false);
        quizGenerationInProgress.current = false;
        // Remove quiz from sidebar/localStorage if quizIdToDelete is present in error
        if (data.quizIdToDelete) {
          setSidebarQuizzes(prev => {
            const updated = prev.filter(q => q.id !== data.quizIdToDelete);
            localStorage.setItem("quizzes", JSON.stringify(updated));
            return updated;
          });
          setQuizId(null);
        }
        return;
      }

      // Handle both { questions: [...] } and { question: ... } formats
      let questions: QuizQuestion[] = [];
      if (data.questions && Array.isArray(data.questions)) {
        questions = data.questions;
      } else if (data.question) {
        questions = [data.question];
      } else {
        throw new Error("Invalid response format");
      }

      setQuiz(questions);
      setUserAnswers(Array(questions.length).fill(""));
      setAnswered(Array(questions.length).fill(false));
      setLoading(false);
      quizGenerationInProgress.current = false;
    };
    fetchQuiz().catch((error) => {
      console.error("Quiz generation failed:", error);
      // Provide more user-friendly error messages
      if (error.message.includes("PDF")) {
        setError(`PDF Error: ${error.message}`);
      } else if (error.message.includes("Network")) {
        setError("Connection failed. Please check your internet and try again.");
      } else {
        setError(error.message || "Failed to generate quiz. Please try again.");
      }
      setLoading(false);
      quizGenerationInProgress.current = false;
    });
  }, [quizStarted, topic, pdfFile, quizId]);

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

  return (
    <div className="min-h-screen flex flex-row items-stretch justify-center bg-gradient-to-br from-background to-muted/60 p-1 md:p-2">
      {/* The QuizSidebar component now handles its own visibility */}
      <QuizSidebar onSelectQuiz={handleSidebarSelect} quizzes={sidebarQuizzes} />
      
      {/* Main content area - adjusted padding for mobile sidebar */}
      <div className="flex-1 flex flex-col items-center justify-center md:ml-0 ml-0 pt-16 md:pt-0 px-1 md:px-4">
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
                        <div className="flex items-center justify-between gap-2">
                          <Button
                            variant="outline"
                            className="px-3 py-2 md:px-4 md:py-2 rounded-lg shadow-sm border-muted/60 hover:cursor-pointer text-sm md:text-base"
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
                            className="px-3 py-2 md:px-4 md:py-2 rounded-lg shadow-sm border-muted/60 hover:cursor-pointer text-sm md:text-base"
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
            <Card className="w-full max-w-2xl mx-1 md:mx-0 shadow-xl border border-muted/40 dark:border-white/10 rounded-2xl bg-white/90 dark:bg-background/80 backdrop-blur-md dark:shadow-2xl">
              <CardContent className="py-1 px-2 md:py-2 md:px-8">
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
                      className="border border-muted rounded-lg px-3 py-2 md:px-4 md:py-3 w-full max-w-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/60 text-sm md:text-base shadow-sm"
                      placeholder="Enter a topic (e.g. General Knowledge, Science, History)"
                      value={topic}
                      onChange={e => setTopic(e.target.value)}
                      required
                      autoFocus
                    />
                    <div className="w-full max-w-lg flex flex-col gap-2">
                      <label className="block text-sm font-medium text-foreground mb-1">Attach PDF (optional)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept="application/pdf"
                          id="pdf-upload"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              // Check file size (10MB limit)
                              if (file.size > 10 * 1024 * 1024) {
                                setError("PDF file is too large. Please select a file smaller than 10MB.");
                                return;
                              }
                              // Check file type
                              if (file.type !== "application/pdf") {
                                setError("Please select a valid PDF file.");
                                return;
                              }
                              setError(null); // Clear any previous errors
                              setPdfFile(file);
                            } else {
                              setPdfFile(null);
                            }
                          }}
                        />
                        <label htmlFor="pdf-upload">
                          <span>
                            <Button variant="outline" className="px-3 py-2 md:px-4 md:py-2 cursor-pointer rounded-lg shadow-sm border-muted/60 hover:cursor-pointer text-sm md:text-base" asChild>
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
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs md:text-sm font-medium bg-primary/10 dark:bg-white px-2 md:px-3 py-1 rounded-lg shadow-sm transition-colors">
                        <span className="text-black dark:text-black">Question {current + 1}</span>
                        <span className="text-black dark:text-black opacity-80 ml-1">/ {quiz.length}</span>
                      </div>
                    </div>
                    <div className="font-semibold text-base md:text-lg mb-3 md:mb-4 text-foreground/90 min-h-[40px] md:min-h-[48px]">{quiz[current].question}</div>
                    <div className="flex flex-col gap-2 md:gap-3 mb-3 md:mb-4">
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
                              <div className="rounded-lg border border-green-600 bg-green-50 p-2 md:p-3 mt-2 shadow-sm">
                                <div className="font-semibold text-green-700 text-sm md:text-base">That&apos;s right!</div>
                                <div className="text-green-700 text-xs md:text-sm mt-1">{quiz[current].explanation}</div>
                              </div>
                            )}
                            {answered[current] && isWrong && (
                              <div className="rounded-lg border border-red-600 bg-red-50 p-2 md:p-3 mt-2 shadow-sm">
                                <div className="font-semibold text-red-700 flex items-center gap-2 text-sm md:text-base"><span>✗</span> Not quite</div>
                                <div className="text-red-700 text-xs md:text-sm mt-1">{quiz[current].wrongExplanation?.[opt]}</div>
                                <div className="rounded-lg border border-green-600 bg-green-50 p-2 md:p-3 mt-2">
                                  <div className="text-green-700 text-xs md:text-sm">{quiz[current].explanation}</div>
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
                        <div className="rounded-2xl bg-muted/60 px-4 md:px-8 py-4 md:py-6 min-w-[120px] md:min-w-[140px] max-w-[120px] md:max-w-[140px] h-[100px] md:h-[120px] flex flex-col items-center justify-center text-center shadow">
                          <div className="text-muted-foreground text-xs mb-1">Score</div>
                          <div className="text-2xl md:text-3xl font-bold text-primary">{score}/{total}</div>
                        </div>
                        <div className="rounded-2xl bg-muted/60 px-4 md:px-8 py-4 md:py-6 min-w-[120px] md:min-w-[140px] max-w-[120px] md:max-w-[140px] h-[100px] md:h-[120px] flex flex-col items-center justify-center text-center shadow">
                          <div className="text-muted-foreground text-xs mb-1">Accuracy</div>
                          <div className="text-2xl md:text-3xl font-bold text-primary">{accuracy}%</div>
                        </div>
                      </div>
                      <div className="rounded-2xl bg-muted/60 px-4 md:px-8 py-4 md:py-6 min-w-[120px] md:min-w-[140px] max-w-[120px] md:max-w-[140px] h-[100px] md:h-[120px] flex flex-col items-center justify-center text-center shadow">
                        <div className="text-muted-foreground text-xs mb-1">Right</div>
                        <div className="font-bold text-base md:text-lg text-green-700">{right}</div>
                        <div className="text-muted-foreground text-xs mt-2">Wrong</div>
                        <div className="font-bold text-base md:text-lg text-red-600">{wrong}</div>
                      </div>
                    </div>
                  </div>
                )}
                {error && <div className="text-red-500 text-center mt-4">{error}</div>}
                {loading && quizStarted && quiz.length === 0 && (
                  <div className="flex flex-col items-center justify-center mt-8">
                    <Spinner className="h-10 w-10 mb-3" />
                    <span className="text-muted-foreground text-base font-medium">
                      {pdfFile ? "Processing PDF and generating quiz..." : "Generating quiz..."}
                    </span>
                    {pdfFile && (
                      <span className="text-muted-foreground text-sm mt-1">
                        This may take up to 2 minutes for complex topics
                      </span>
                    )}
                  </div>
                )}
                {/* Render review UI outside the score summary block so it's always visible */}
                {showScoreFor && reviewAttempt && (
                  <div className="mt-8 w-full max-w-2xl mx-1 md:mx-0">
                    <div className="text-lg font-semibold text-foreground mb-4">Review Attempt</div>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between gap-2">
                        <Button
                          variant="outline"
                          className="px-3 py-2 md:px-4 md:py-2 rounded-lg shadow-sm border-muted/60 hover:cursor-pointer text-sm md:text-base"
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
                          className="px-3 py-2 md:px-4 md:py-2 rounded-lg shadow-sm border-muted/60 hover:cursor-pointer text-sm md:text-base"
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
                                  className={`w-full text-left justify-start py-2 md:py-3 px-3 md:px-4 rounded-lg text-sm md:text-base font-medium transition border-2 ${isCorrect ? "border-green-500 ring-2 ring-green-500" : ""} ${isWrong ? "border-red-500 ring-2 ring-red-500" : "border-muted/40"} hover:cursor-pointer`}
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