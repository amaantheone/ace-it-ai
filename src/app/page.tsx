'use client';

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export default function Home() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background p-8">
      <main className="container mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">Welcome to Ace It AI</h1>
            <p className="text-lg text-muted-foreground">
              Chat, Mindmaps, Flashcards and progress - all in one AI tutor.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                toggleTheme();
              }}
              className="rounded-full"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-primary" />
              ) : (
                <Moon className="h-5 w-5 text-primary" />
              )}
            </Button>
            <Link href="/auth/login">
              <Button variant="outline" size="sm" className="hover:cursor-pointer">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/chat" className="block">
            <Card className="h-full transition-all hover:shadow-md hover:border-primary/50">
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-2.5 transition-colors group-hover:bg-primary/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                      <path d="M12 12c0-3.315-2.685-6-6-6s-6 2.685-6 6 2.685 6 6 6c1.18 0 2.285-.34 3.213-.921" />
                      <path d="M14 12c0 3.315 2.685 6 6 6s6-2.685 6-6-2.685-6-6-6c-1.18 0-2.285.34-3.213.921" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold">Start Learning</h3>
                    <p className="text-sm text-muted-foreground">Begin an interactive learning session</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/mindmap" className="block">
            <Card className="transition-all hover:shadow-md hover:border-primary/50">
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-2.5 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M12 16V8"></path>
                      <path d="M8 12h8"></path>
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold">Mind Map Generator</h3>
                    <p className="text-sm text-muted-foreground">Visualize concepts with AI</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/flashcard" className="block">
            <Card className="transition-all hover:shadow-md hover:border-primary/50">
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-2.5 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                      <rect x="3" y="4" width="18" height="16" rx="2" />
                      <path d="M7 8h10M7 12h4" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold">Flash Card Generator</h3>
                    <p className="text-sm text-muted-foreground">Create and review flashcards</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Learning Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Start your learning journey to see progress
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                No recent topics to display
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
