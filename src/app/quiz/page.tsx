"use client"

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { X } from "lucide-react";

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
  wrongExplanation?: Record<string, string>;
}

export default function QuizPage() {
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
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleSelect = (option: string) => {
    if (answered[current]) return;
    const newAnswers = [...userAnswers];
    newAnswers[current] = option;
    setUserAnswers(newAnswers);
    setAnswered((prev) => {
      const newAnswered = [...prev];
      newAnswered[current] = true;
      return newAnswered;
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-muted/60 p-2">
      <div className="mb-4 text-center select-none">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-primary drop-shadow-sm mb-1">Quiz Generator</h1>
        <p className="text-base md:text-lg text-muted-foreground font-medium italic opacity-90">Test your knowledge or generate a quiz from a PDF!</p>
      </div>
      <Card className="w-full max-w-2xl shadow-xl border border-muted/40 dark:border-white/10 rounded-2xl bg-white/90 dark:bg-background/80 backdrop-blur-md dark:shadow-2xl">
        <CardContent className="py-2 px-4 md:px-8">
          {!quizStarted && (
            <form
              onSubmit={e => {
                e.preventDefault();
                if (topic.trim()) setQuizStarted(true);
                else inputRef.current?.focus();
              }}
              className="flex flex-col gap-2 items-center mt-0"
              encType="multipart/form-data"
            >
              <input
                ref={inputRef}
                type="text"
                className="border border-muted rounded-lg px-4 py-3 w-full max-w-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/60 text-base shadow-sm"
                placeholder="Enter a topic (e.g. General Knowledge, Science, History)"
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
                      <Button variant="outline" className="px-4 py-2 cursor-pointer rounded-lg shadow-sm border-muted/60 hover:cursor-pointer" asChild>
                        <span>{pdfFile ? "Change PDF" : "Choose PDF"}</span>
                      </Button>
                    </span>
                  </label>
                  {pdfFile && (
                    <div className="flex items-center gap-1 bg-muted/60 px-2 py-1 rounded text-xs shadow-sm">
                      <span className="truncate max-w-[140px] font-medium">{pdfFile.name}</span>
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
              <Button type="submit" className="w-full max-w-lg text-base py-3 rounded-lg shadow-md hover:cursor-pointer" variant="default">
                Start Quiz
              </Button>
            </form>
          )}
          {quiz.length > 0 && !finished && quizStarted && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium bg-primary/10 dark:bg-white px-3 py-1 rounded-lg shadow-sm transition-colors">
                  <span className="text-black dark:text-black">Question {current + 1}</span>
                  <span className="text-black dark:text-black opacity-80 ml-1">/ {quiz.length}</span>
                </div>
              </div>
              <div className="font-semibold text-lg mb-4 text-foreground/90 min-h-[48px]">{quiz[current].question}</div>
              <div className="flex flex-col gap-3 mb-4">
                {quiz[current].options.map((opt, oidx) => {
                  const isSelected = userAnswers[current] === opt;
                  const isCorrect = answered[current] && opt === quiz[current].answer;
                  const isWrong = answered[current] && isSelected && opt !== quiz[current].answer;
                  return (
                    <div key={oidx} className="relative">
                      <Button
                        type="button"
                        variant={isWrong ? "destructive" : isSelected ? "default" : "outline"}
                        className={`w-full text-left justify-start py-3 px-4 rounded-lg text-base font-medium transition border-2 ${isCorrect ? "border-green-500 ring-2 ring-green-500" : ""} ${isWrong ? "border-red-500 ring-2 ring-red-500" : "border-muted/40"} hover:cursor-pointer`}
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
                  className="w-full max-w-lg text-base py-3 rounded-lg shadow-md bg-primary text-white hover:bg-primary/90 focus:ring-2 focus:ring-primary/40 focus:outline-none transition-colors dark:bg-white dark:text-black dark:hover:bg-neutral-100 hover:cursor-pointer"
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
        </CardContent>
      </Card>
    </div>
  );
}