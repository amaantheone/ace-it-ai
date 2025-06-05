"use client";

import { BookOpen, ChevronLeft, Plus } from "lucide-react";
import { useEffect, useState } from "react";

export function QuizSidebar({
  quizzes = [],
  onSelectQuiz,
}: {
  quizzes?: { id: string; title: string; score: number | null }[];
  onSelectQuiz?: (id: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Detect mobile view
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobileView(mobile);
      if (!mobile) {
        setMobileOpen(false); // Reset mobile menu state when switching to desktop
      }
    };

    // Initial check
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Toggle button for mobile and desktop collapsed view
  if (collapsed && !isMobileView) {
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

  // Determine sidebar container classes based on mobile/desktop
  const sidebarClasses = isMobileView
    ? `fixed inset-0 bg-black bg-opacity-50 z-50 ${mobileOpen ? 'block' : 'hidden'}`
    : '';

  const sidebarContentClasses = isMobileView
    ? 'h-screen bg-muted border-r border-border flex flex-col w-[70%] max-w-[225px] relative z-30 ml-0'
    : 'h-screen bg-muted border-r border-border flex flex-col w-64 relative z-30';

  // Mobile sidebar toggle button - always visible on mobile
  const MobileToggleButton = () => {
    if (!isMobileView) return null;
    
    return (
      <button
        className="fixed top-4 right-4 z-40 bg-muted border border-border rounded-full p-2 shadow hover:bg-accent transition-colors"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? "Close sidebar" : "Open sidebar"}
      >
        <span className="sr-only">{mobileOpen ? "Close sidebar" : "Open sidebar"}</span>
        {mobileOpen 
          ? <ChevronLeft className="w-6 h-6 text-primary" />
          : <BookOpen className="w-6 h-6 text-primary" />
        }
      </button>
    );
  };

  return (
    <>
      <MobileToggleButton />
      
      <div className={sidebarClasses} onClick={isMobileView ? () => setMobileOpen(false) : undefined}>
        <aside 
          className={sidebarContentClasses}
          onClick={isMobileView ? e => e.stopPropagation() : undefined}
        >
          {/* Only show the collapse button on desktop */}
          {!isMobileView && (
            <button
              className="absolute z-40 bg-background border border-border rounded-full p-1 shadow hover:bg-accent transition-colors hover:cursor-pointer"
              style={{ top: 16, right: 5 }}
              onClick={() => setCollapsed(true)}
              aria-label="Collapse sidebar"
            >
              <span className="sr-only">Collapse sidebar</span>
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
          <div className={`flex items-center justify-between ${isMobileView ? 'p-3' : 'p-4'} border-b border-border gap-3`}>
            <span className="font-semibold text-foreground text-lg flex items-center gap-2">
              {/* Only show the book icon on desktop */}
              {!isMobileView && <BookOpen className="w-5 h-5 text-primary" />}
              <span>Quiz Library</span>
            </span>
            <button
              className={`p-1 rounded-full bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-primary/40 hover:cursor-pointer ${isMobileView ? '' : 'mr-8'}`}
              aria-label="New Quiz"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.location.href = "/quiz";
                }
              }}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className={`flex flex-col flex-1 ${isMobileView ? 'px-3' : 'px-4'} py-2`}>
            <div className="flex flex-col gap-1">
              {quizzes.length === 0 ? (
                <div className="text-sm text-muted-foreground italic">No quizzes yet</div>
              ) : (
                quizzes.map(q => (
                  <button
                    key={q.id}
                    className={`flex items-center gap-2 ${isMobileView ? 'px-2' : 'px-3'} py-2 rounded text-sm font-medium transition-colors w-full text-left hover:bg-accent/60 ${selectedQuiz === q.id ? "bg-primary/10 text-primary" : ""}`}
                    onClick={() => {
                      setSelectedQuiz(q.id);
                      setQuizScore(q.score ?? null);
                      if (onSelectQuiz) {
                        onSelectQuiz(q.id);
                        if (isMobileView) {
                          setMobileOpen(false);
                        }
                      }
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
      </div>
    </>
  );
}
