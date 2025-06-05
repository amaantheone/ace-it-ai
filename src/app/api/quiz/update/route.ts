import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { quizId, score } = body;

  if (!quizId || score === undefined) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Check if quiz exists and belongs to the user
  const existingQuiz = await prisma.quiz.findFirst({
    where: {
      id: quizId,
      userId: user.id,
    },
  });

  if (!existingQuiz) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  // Update quiz with score
  const updatedQuiz = await prisma.quiz.update({
    where: { id: quizId },
    data: {
      score,
      totalQuestions: body.totalQuestions || existingQuiz.totalQuestions,
    },
  });

  return NextResponse.json({ quiz: updatedQuiz });
}
