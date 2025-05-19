import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request, context: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const { id } = await context.params;

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
