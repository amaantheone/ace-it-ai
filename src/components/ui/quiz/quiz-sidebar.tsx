"use client";

import { BookOpen, ChevronLeft, Plus } from "lucide-react";
import { useState } from "react";

export function QuizSidebar({
  quizzes = [],
  onSelectQuiz,
  onNewQuiz,
}: {
  quizzes?: { id: string; title: string; score: number | null }[];
  onSelectQuiz?: (id: string) => void;
  onNewQuiz?: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  if (collapsed) {
    return (
      <button
        className="fixed top-4 left-4 z-40 bg-muted border border-border rounded-full p-2 shadow hover:bg-accent transition-colors"
        onClick={() => setCollapsed(false)}
        aria-label="Open sidebar"
      >
        <span className="sr-only">Open sidebar</span>
        <BookOpen className="w-6 h-6 text-primary" />
      </button>
    );
  }

  return (
    <aside className="h-screen bg-muted border-r border-border flex flex-col w-64 relative z-30">
      <button
        className="absolute z-40 bg-background border border-border rounded-full p-1 shadow hover:bg-accent transition-colors hover:cursor-pointer"
        style={{ top: 16, right: 8 }}
        onClick={() => setCollapsed(true)}
        aria-label="Collapse sidebar"
      >
        <span className="sr-only">Collapse sidebar</span>
        <ChevronLeft className="w-5 h-5 text-muted-foreground" />
      </button>
      <div className="flex items-center justify-between p-4 border-b border-border gap-3">
        <span className="font-semibold text-foreground text-lg flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" /> Quiz Library
        </span>
        <button
          className="p-1 rounded-full bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-primary/40 hover:cursor-pointer"
          aria-label="New Quiz"
          onClick={() => {
            if (onNewQuiz) {
              onNewQuiz();
            } else if (typeof window !== "undefined") {
              window.location.href = "/quiz";
            }
          }}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
      <div className="flex flex-col flex-1 px-4 py-2">
        <div className="flex flex-col gap-1">
          {quizzes.length === 0 ? (
            <div className="text-sm text-muted-foreground italic">No quizzes yet</div>
          ) : (
            quizzes.map(q => (
              <button
                key={q.id}
                className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-colors w-full text-left hover:bg-accent/60 ${selectedQuiz === q.id ? "bg-primary/10 text-primary" : ""}`}
                onClick={() => {
                  setSelectedQuiz(q.id);
                  setQuizScore(q.score ?? null);
                  if (onSelectQuiz) onSelectQuiz(q.id);
                }}
              >
                <span className="truncate">{q.title}</span>
              </button>
            ))
          )}
        </div>
        {selectedQuiz && quizScore !== null && (
          <div className="mt-2 text-xs text-primary font-semibold">Score: {quizScore}</div>
        )}
      </div>
    </aside>
  );
}
