import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background p-6">
      <main className="container mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Welcome to Ace-it AI Learning</h1>
            <p className="text-muted-foreground">Your personal AI tutor for personalized learning</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">Current Topic:</div>
            <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">Not Selected</div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/chat" className="group relative rounded-lg border p-6 hover:border-foreground">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M12 12c0-3.315-2.685-6-6-6s-6 2.685-6 6 2.685 6 6 6c1.18 0 2.285-.34 3.213-.921" />
                  <path d="M14 12c0 3.315 2.685 6 6 6s6-2.685 6-6-2.685-6-6-6c-1.18 0-2.285.34-3.213.921" />
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="font-medium">Start Learning</h3>
                <p className="text-sm text-muted-foreground">Begin an interactive learning session</p>
              </div>
            </div>
          </Link>

          <div className="rounded-lg border p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="font-medium">Learning Path</h3>
                <p className="text-sm text-muted-foreground">Track your progress and topics</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="font-medium">Practice Reminders</h3>
                <p className="text-sm text-muted-foreground">Set learning schedules</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border p-6">
            <h2 className="text-lg font-medium mb-4">Learning Progress</h2>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">Start your learning journey to see progress</div>
            </div>
          </div>

          <div className="rounded-lg border p-6">
            <h2 className="text-lg font-medium mb-4">Recent Topics</h2>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">No recent topics to display</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
