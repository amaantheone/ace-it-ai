import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { prisma } from "@/lib/prisma";

export interface AttemptQuestionInput {
  question: string;
  options: string[];
  answer: string;
  userAnswer: string;
  explanation?: string;
  wrongExplanation?: Record<string, string>;
  questionIndex?: number;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const { quizId, score, questions } = body as {
    quizId: string;
    score: number;
    questions: AttemptQuestionInput[];
  };
  if (!quizId || !Array.isArray(questions)) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
  const attempt = await prisma.quizAttempt.create({
    data: {
      userId: session.user.id,
      quizId,
      score,
      questions: {
        create: questions.map((q: AttemptQuestionInput, idx: number) => ({
          question: q.question,
          options: JSON.stringify(q.options),
          answer: q.answer,
          userAnswer: q.userAnswer,
          explanation: q.explanation,
          wrongExplanation: q.wrongExplanation
            ? JSON.stringify(q.wrongExplanation)
            : null,
          questionIndex: q.questionIndex !== undefined ? q.questionIndex : idx,
        })),
      },
    },
    include: { questions: true },
  });
  return NextResponse.json({ attempt });
}
