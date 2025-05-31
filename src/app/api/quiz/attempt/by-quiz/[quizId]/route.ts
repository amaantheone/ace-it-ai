import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, context: unknown) {
  const { quizId } = (context as { params: Record<string, string> }).params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const attempt = await prisma.quizAttempt.findFirst({
    where: { quizId, user: { email: session.user.email } },
    orderBy: { createdAt: "desc" },
    include: { questions: true },
  });
  if (!attempt) {
    return NextResponse.json({ attempt: null });
  }
  return NextResponse.json({ attempt });
}
