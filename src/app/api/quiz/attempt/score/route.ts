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
  const { attemptId, score } = body as { attemptId?: string; score?: number };

  if (!attemptId || typeof score !== "number") {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  // Fetch attempt and ensure it belongs to the current user
  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
  });
  if (!attempt) {
    return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
  }
  if (attempt.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.quizAttempt.update({
    where: { id: attemptId },
    data: { score },
  });

  return NextResponse.json({ attempt: updated });
}
