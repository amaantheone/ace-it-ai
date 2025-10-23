import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/config/auth";

export async function DELETE(_req: Request, context: unknown) {
  const session = await getServerSession(authOptions);
  const params = await (context as { params: Promise<{ id: string }> }).params;
  const { id } = params;

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if quiz exists and belongs to user
    const quiz = await prisma.quiz.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz not found or access denied" },
        { status: 404 }
      );
    }

    // Delete related quiz attempts and their questions (cascade delete)
    // First get all attempts for this quiz
    const attempts = await prisma.quizAttempt.findMany({
      where: { quizId: id },
      select: { id: true },
    });

    // Delete all questions for all attempts
    for (const attempt of attempts) {
      await prisma.quizAttemptQuestion.deleteMany({
        where: { attemptId: attempt.id },
      });
    }

    // Delete all attempts
    await prisma.quizAttempt.deleteMany({
      where: { quizId: id },
    });

    // Finally delete the quiz itself
    await prisma.quiz.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    return NextResponse.json(
      { error: "Failed to delete quiz" },
      { status: 500 }
    );
  }
}

export async function GET(_req: Request, context: unknown) {
  const session = await getServerSession(authOptions);
  const params = await (context as { params: Promise<{ id: string }> }).params;
  const { id } = params;

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get quiz details
    const quiz = await prisma.quiz.findFirst({
      where: {
        id,
        userId: user.id,
      },
      select: {
        id: true,
        title: true,
        score: true,
        totalQuestions: true,
        createdAt: true,
      },
    });

    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({ quiz });
  } catch (error) {
    console.error("Error fetching quiz:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz" },
      { status: 500 }
    );
  }
}
