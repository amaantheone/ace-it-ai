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
  const { title, totalQuestions } = body;
  if (!title || !totalQuestions) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
  // Find user
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  // Create quiz
  const quiz = await prisma.quiz.create({
    data: {
      title,
      totalQuestions,
      userId: user.id,
    },
  });
  return NextResponse.json({ quiz });
}
