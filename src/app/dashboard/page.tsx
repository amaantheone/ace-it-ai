'use client';

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, LogIn } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useSession, signOut } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-background p-8">
      <main className="container mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">Welcome to Ace It AI</h1>
            <p className="text-lg text-muted-foreground">
              Chat, Mindmaps, Flashcards, Quizzes and progress - all in one AI tutor.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle className="rounded-full" />
            {session ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => signOut()}
                className="hover:cursor-pointer flex gap-2 items-center"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            ) : (
              <Link href="/auth/login">
                <Button 
                variant="outline" 
                size="sm" 
                className="hover:cursor-pointer flex gap-2 items-center"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/chat" className="block">
            <Card className="h-full transition-all hover:shadow-md bg-gradient-to-br from-blue-600/60 to-purple-700/60 border-0 dark:from-blue-500/30 dark:to-purple-600/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-white/20 p-3 transition-colors dark:bg-white/10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <path d="M12 12c0-3.315-2.685-6-6-6s-6 2.685-6 6 2.685 6 6 6c1.18 0 2.285-.34 3.213-.921" />
                      <path d="M14 12c0 3.315 2.685 6 6 6s6-2.685 6-6-2.685-6-6-6c-1.18 0-2.285.34-3.213.921" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-xl text-white">Start Learning</h3>
                    <p className="text-white/90 text-sm">Begin an interactive learning session</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/mindmap" className="block">
            <Card className="h-full transition-all hover:shadow-md bg-gradient-to-br from-purple-600/60 to-pink-700/60 border-0 dark:from-purple-500/30 dark:to-pink-600/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-white/20 p-3 transition-colors dark:bg-white/10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <circle cx="12" cy="12" r="8"></circle>
                      <path d="M12 2v4"></path>
                      <path d="M12 18v4"></path>
                      <path d="M4.93 4.93l2.83 2.83"></path>
                      <path d="M16.24 16.24l2.83 2.83"></path>
                      <path d="M2 12h4"></path>
                      <path d="M18 12h4"></path>
                      <path d="M4.93 19.07l2.83-2.83"></path>
                      <path d="M16.24 7.76l2.83-2.83"></path>
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-xl text-white">Mind Map Generator</h3>
                    <p className="text-white/90 text-sm">Visualize concepts with AI</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/quiz" className="block">
            <Card className="h-full transition-all hover:shadow-md bg-gradient-to-br from-blue-600/60 to-indigo-700/60 border-0 dark:from-blue-500/30 dark:to-indigo-600/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-white/20 p-3 transition-colors dark:bg-white/10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <path d="M8 3v9a4 4 0 0 0 4 4h9" />
                      <rect x="3" y="8" width="18" height="13" rx="2" />
                      <path d="M7 14h.01" />
                      <path d="M12 14h.01" />
                      <path d="M17 14h.01" />
                      <path d="M12 19h.01" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-xl text-white">Quiz Generator</h3>
                    <p className="text-white/90 text-sm">Test your knowledge with AI quizzes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/flashcard" className="block">
            <Card className="h-full transition-all hover:shadow-md bg-gradient-to-br from-orange-600/60 to-red-700/60 border-0 dark:from-orange-500/30 dark:to-red-600/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-white/20 p-3 transition-colors dark:bg-white/10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
                      <path d="M12 8v8" />
                      <path d="M8 12h8" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-xl text-white">Flash Card Generator</h3>
                    <p className="text-white/90 text-sm">Create and review flashcards</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
}
