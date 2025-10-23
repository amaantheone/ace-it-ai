"use client";

import { BookOpen, ChevronLeft, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function QuizSidebar({
  quizzes = [],
  onSelectQuiz,
  onNewQuiz,
  onDeleteQuiz,
}: {
  quizzes?: { id: string; title: string; score: number | null }[];
  onSelectQuiz?: (id: string) => void;
  onNewQuiz?: () => void;
  onDeleteQuiz?: (id: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [deleteConfirmQuiz, setDeleteConfirmQuiz] = useState<{id: string, title: string} | null>(null);

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
        className="fixed top-4 left-4 z-40 bg-muted border border-border rounded-full p-2 shadow hover:bg-accent transition-colors"
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
              {!isMobileView && (
                <span 
                  className="cursor-pointer hover:cursor-pointer" 
                  onClick={() => typeof window !== "undefined" && (window.location.href = "/home")}
                  title="Go to homepage"
                >
                  <BookOpen className="w-5 h-5 text-primary" />
                </span>
              )}
              <span>Quiz Library</span>
            </span>
            <button
              className={`p-1 rounded-full bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-primary/40 hover:cursor-pointer ${isMobileView ? '' : 'mr-8'}`}
              aria-label="New Quiz"
              onClick={() => {
                if (onNewQuiz) {
                  onNewQuiz();
                  if (isMobileView) {
                    setMobileOpen(false);
                  }
                } else if (typeof window !== "undefined") {
                  window.location.href = "/quiz";
                }
              }}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className={`flex flex-col flex-1 ${isMobileView ? 'px-3' : 'px-4'} py-2 overflow-hidden`}>
            <div className="flex flex-col gap-1 overflow-y-auto min-h-0 flex-1">
              {quizzes.length === 0 ? (
                <div className="text-sm text-muted-foreground italic">No quizzes yet</div>
              ) : (
                quizzes.map(q => (
                  <div
                    key={q.id}
                    className={`flex items-center gap-2 ${isMobileView ? 'px-2' : 'px-3'} py-2 rounded text-sm font-medium transition-colors w-full hover:bg-accent/60 group ${selectedQuiz === q.id ? "bg-primary/10 text-primary" : ""} min-w-0`}
                  >
                    <button
                      className="flex items-center gap-2 flex-1 text-left min-w-0"
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
                      <span className="truncate min-w-0 flex-1">{q.title}</span>
                    </button>
                    {onDeleteQuiz && (
                      <button
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/20 hover:text-destructive transition-all flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmQuiz({ id: q.id, title: q.title });
                        }}
                        aria-label={`Delete quiz "${q.title}"`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
            {selectedQuiz && quizScore !== null && (
              <div className="mt-2 text-xs text-primary font-semibold">Score: {quizScore}</div>
            )}
          </div>
        </aside>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmQuiz !== null}
        onCancel={() => setDeleteConfirmQuiz(null)}
        onConfirm={() => {
          if (deleteConfirmQuiz && onDeleteQuiz) {
            onDeleteQuiz(deleteConfirmQuiz.id);
          }
          setDeleteConfirmQuiz(null);
        }}
        title="Delete Quiz"
        description={`Are you sure you want to delete "${deleteConfirmQuiz?.title || 'this quiz'}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
}
