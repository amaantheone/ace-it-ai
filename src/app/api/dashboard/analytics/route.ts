import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get current date and one week ago
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get total counts
    const [totalSessions, totalMindmaps, totalFlashcards, totalQuizzes] =
      await Promise.all([
        prisma.session.count({ where: { userId: user.id } }),
        prisma.mindmap.count({ where: { userId: user.id } }),
        prisma.flashCard.count({ where: { userId: user.id } }),
        prisma.quiz.count({ where: { userId: user.id } }),
      ]);

    // Get weekly counts
    const [weeklySessions, weeklyMindmaps, weeklyFlashcards, weeklyQuizzes] =
      await Promise.all([
        prisma.session.count({
          where: {
            userId: user.id,
            startedAt: { gte: oneWeekAgo },
          },
        }),
        prisma.mindmap.count({
          where: {
            userId: user.id,
            createdAt: { gte: oneWeekAgo },
          },
        }),
        prisma.flashCard.count({
          where: {
            userId: user.id,
            createdAt: { gte: oneWeekAgo },
          },
        }),
        prisma.quiz.count({
          where: {
            userId: user.id,
            createdAt: { gte: oneWeekAgo },
          },
        }),
      ]);

    // Get daily activity for the past 7 days
    const dailyActivity = [];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const startOfDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );
      const endOfDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() + 1
      );

      const [sessions, mindmaps, flashcards, quizzes] = await Promise.all([
        prisma.session.count({
          where: {
            userId: user.id,
            startedAt: { gte: startOfDay, lt: endOfDay },
          },
        }),
        prisma.mindmap.count({
          where: {
            userId: user.id,
            createdAt: { gte: startOfDay, lt: endOfDay },
          },
        }),
        prisma.flashCard.count({
          where: {
            userId: user.id,
            createdAt: { gte: startOfDay, lt: endOfDay },
          },
        }),
        prisma.quiz.count({
          where: {
            userId: user.id,
            createdAt: { gte: startOfDay, lt: endOfDay },
          },
        }),
      ]);

      dailyActivity.push({
        day: days[date.getDay()],
        sessions,
        mindmaps,
        flashcards,
        quizzes,
      });
    }

    const analytics = {
      summaryStats: [
        {
          title: "Total Sessions",
          value: totalSessions.toString(),
          change: weeklySessions > 0 ? `+${weeklySessions} this week` : "",
          icon: "MessageSquare",
          gradient: "from-blue-500 to-cyan-500",
          changeType: "positive",
        },
        {
          title: "Mind Maps Created",
          value: totalMindmaps.toString(),
          change: weeklyMindmaps > 0 ? `+${weeklyMindmaps} this week` : "",
          icon: "Brain",
          gradient: "from-purple-500 to-pink-500",
          changeType: "positive",
        },
        {
          title: "Flashcards Made",
          value: totalFlashcards.toString(),
          change: weeklyFlashcards > 0 ? `+${weeklyFlashcards} this week` : "",
          icon: "BookOpen",
          gradient: "from-orange-500 to-red-500",
          changeType: "positive",
        },
        {
          title: "Quizzes Completed",
          value: totalQuizzes.toString(),
          change: weeklyQuizzes > 0 ? `+${weeklyQuizzes} this week` : "",
          icon: "FileQuestion",
          gradient: "from-green-500 to-emerald-500",
          changeType: "positive",
        },
      ],
      weeklyData: dailyActivity,
      distributionData: [
        { name: "Chat Sessions", value: totalSessions, color: "#3B82F6" },
        { name: "Mind Maps", value: totalMindmaps, color: "#8B5CF6" },
        { name: "Flashcards", value: totalFlashcards, color: "#F59E0B" },
        { name: "Quizzes", value: totalQuizzes, color: "#10B981" },
      ],
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
