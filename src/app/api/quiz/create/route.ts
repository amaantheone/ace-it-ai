import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
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
  const { title, totalQuestions } = await req.json();
  if (!title) {
    return NextResponse.json({ error: "Missing title" }, { status: 400 });
  }
  const quiz = await prisma.quiz.create({
    data: {
      title,
      userId: user.id,
      score: null,
      totalQuestions,
    },
    select: { id: true, title: true, score: true, totalQuestions: true },
  });
  return NextResponse.json({ quiz });
}
