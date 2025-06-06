import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { authOptions } from "@/config/auth";

export async function GET(req: Request, context: unknown) {
  const session = await getServerSession(authOptions);
  const { id } = (context as { params: { id: string } }).params;

  // For guest users, return a 404 since they use localStorage
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Mindmap not found" }, { status: 404 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const mindmap = await prisma.mindmap.findFirst({
    where: { id, userId: user.id },
  });
  if (!mindmap) {
    return NextResponse.json({ error: "Mindmap not found" }, { status: 404 });
  }
  return NextResponse.json({ mindmap });
}
