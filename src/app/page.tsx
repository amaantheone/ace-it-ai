'use client';

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
            <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">Welcome to Ace-it AI</h1>
            <p className="text-lg text-muted-foreground">Your personal AI tutor for personalized learning</p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                toggleTheme();
                document.documentElement.classList.toggle('dark');
              }}
              className="rounded-full"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-primary" />
              ) : (
                <Moon className="h-5 w-5 text-primary" />
              )}
            </Button>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">Current Topic:</span>
              <Badge variant="secondary">Not Selected</Badge>
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/chat" className="block">
            <Card className="h-full transition-all hover:shadow-md hover:border-primary/50">
              <CardContent className="pt-6">
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

          <Card className="transition-all hover:shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-primary/10 p-2.5 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                  </svg>
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold">Learning Path</h3>
                  <p className="text-sm text-muted-foreground">Track your progress and topics</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-primary/10 p-2.5 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold">Practice Reminders</h3>
                  <p className="text-sm text-muted-foreground">Set learning schedules</p>
                </div>
              </div>
            </CardContent>
          </Card>
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
