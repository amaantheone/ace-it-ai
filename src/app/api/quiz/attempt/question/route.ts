import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { prisma } from "@/lib/prisma";

interface AttemptQuestionInput {
  attemptId: string;
  question: string;
  options: string[];
  answer: string;
  userAnswer: string;
  explanation?: string;
  wrongExplanation?: Record<string, string>;
  questionIndex: number;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const {
    attemptId,
    question,
    options,
    answer,
    userAnswer,
    explanation,
    wrongExplanation,
    questionIndex,
  } = body as AttemptQuestionInput;
  if (
    !attemptId ||
    !question ||
    !options ||
    !answer ||
    userAnswer === undefined ||
    questionIndex === undefined
  ) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
  // Upsert (insert or update) the question for this attempt and index
  const upserted = await prisma.quizAttemptQuestion.upsert({
    where: {
      attemptId_questionIndex: {
        attemptId,
        questionIndex,
      },
    },
    update: {
      userAnswer,
      explanation,
      wrongExplanation: wrongExplanation
        ? JSON.stringify(wrongExplanation)
        : null,
    },
    create: {
      attemptId,
      question,
      options: JSON.stringify(options),
      answer,
      userAnswer,
      explanation,
      wrongExplanation: wrongExplanation
        ? JSON.stringify(wrongExplanation)
        : null,
      questionIndex,
    },
  });
  return NextResponse.json({ question: upserted });
}
