"use client"

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!quizStarted) return;
    setLoading(true);
    fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic }),
    })
      .then((res) => res.json())
      .then((data) => {
        setQuiz(data.questions || []);
        setUserAnswers(Array(10).fill(""));
        setAnswered(Array(10).fill(false));
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load quiz.");
        setLoading(false);
      });
  }, [quizStarted, topic]);

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
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Quiz</CardTitle>
        </CardHeader>
        <CardContent>
          {!quizStarted && (
            <form
              onSubmit={e => {
                e.preventDefault();
                if (topic.trim()) setQuizStarted(true);
                else inputRef.current?.focus();
              }}
              className="flex flex-col gap-4 items-center py-8"
            >
              <input
                ref={inputRef}
                type="text"
                className="border rounded-lg px-4 py-2 w-full max-w-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter a topic (e.g. General Knowledge, Science, History)"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                required
              />
              <Button type="submit" className="w-full max-w-md">Start Quiz</Button>
            </form>
          )}
          {quiz.length > 0 && !finished && quizStarted && (
            <div>
              <div className="mb-2 text-sm text-muted-foreground">{current + 1}/{quiz.length}</div>
              <div className="font-medium mb-4">{quiz[current].question}</div>
              <div className="flex flex-col gap-2 mb-4">
                {quiz[current].options.map((opt, oidx) => {
                  const isSelected = userAnswers[current] === opt;
                  const isCorrect = answered[current] && opt === quiz[current].answer;
                  const isWrong = answered[current] && isSelected && opt !== quiz[current].answer;
                  // Show correct answer's explanation only under the correct option
                  return (
                    <div key={oidx} className="relative">
                      <Button
                        type="button"
                        variant={isWrong ? "destructive" : isSelected ? "default" : "outline"}
                        className={`w-full text-left justify-start ${isCorrect ? "border-green-500 ring-2 ring-green-500" : ""} ${isWrong ? "border-red-500 ring-2 ring-red-500" : ""}`}
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
                      {/* Show explanation below the option if answered */}
                      {answered[current] && isCorrect && (!answered[current] || userAnswers[current] === quiz[current].answer) && (
                        <div className="rounded-lg border border-green-600 bg-green-50 p-3 mt-2">
                          <div className="font-semibold text-green-700">That&apos;s right!</div>
                          <div className="text-green-700 text-sm mt-1">{quiz[current].explanation}</div>
                        </div>
                      )}
                      {answered[current] && isWrong && (
                        <div className="rounded-lg border border-red-600 bg-red-50 p-3 mt-2">
                          <div className="font-semibold text-red-700 flex items-center gap-2"><span>✗</span> Not quite</div>
                          <div className="text-red-700 text-sm mt-1">{quiz[current].wrongExplanation?.[opt]}</div>
                          {/* Show correct answer's explanation without heading when wrong answer is selected */}
                          <div className="rounded-lg border border-green-600 bg-green-50 p-3 mt-2">
                            <div className="text-green-700 text-sm">{quiz[current].explanation}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <Button
                onClick={handleNext}
                disabled={loading || !answered[current]}
                className="w-full"
                variant="default"
              >
                {current === quiz.length - 1 ? "Finish" : "Next Question"}
              </Button>
            </div>
          )}
          {quiz.length > 0 && finished && quizStarted && (
            <div className="flex flex-col items-center gap-6 py-8">
              <div className="text-lg font-semibold mb-2">You did it! Quiz complete</div>
              <div className="flex flex-col md:flex-row gap-4 w-full justify-center items-center">
                <div className="flex gap-4 justify-center w-full md:w-auto">
                  <div className="rounded-xl bg-muted px-6 py-4 min-w-[120px] max-w-[120px] h-[110px] flex flex-col items-center justify-center text-center">
                    <div className="text-muted-foreground text-xs mb-1">Score</div>
                    <div className="text-2xl font-bold">{score}/{total}</div>
                  </div>
                  <div className="rounded-xl bg-muted px-6 py-4 min-w-[120px] max-w-[120px] h-[110px] flex flex-col items-center justify-center text-center">
                    <div className="text-muted-foreground text-xs mb-1">Accuracy</div>
                    <div className="text-2xl font-bold">{accuracy}%</div>
                  </div>
                </div>
                <div className="rounded-xl bg-muted px-6 py-4 min-w-[120px] max-w-[120px] h-[110px] flex flex-col items-center justify-center text-center">
                  <div className="text-muted-foreground text-xs mb-1">Right</div>
                  <div className="font-bold text-base">{right}</div>
                  <div className="text-muted-foreground text-xs mt-2">Wrong</div>
                  <div className="font-bold text-base">{wrong}</div>
                </div>
              </div>
            </div>
          )}
          {error && <div className="text-red-500 text-center mt-4">{error}</div>}
          {loading && quizStarted && <div className="text-center mt-4">Loading...</div>}
        </CardContent>
      </Card>
    </div>
  );
}