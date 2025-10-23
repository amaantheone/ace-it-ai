import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/config/auth";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ sessionId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const params = await context.params;
    const { sessionId } = params;

    // Get the user from the database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // First, verify the session exists and belongs to the user
    const chatSession = await prisma.chatSession.findUnique({
      where: { id: sessionId },
    });

    if (!chatSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (chatSession.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Use a transaction to delete messages first, then the session
    await prisma.$transaction(async (tx) => {
      // Delete all messages associated with the session
      await tx.message.deleteMany({
        where: { chatSessionId: sessionId },
      });

      // Delete the session
      await tx.chatSession.delete({
        where: { id: sessionId },
      });
    });

    return NextResponse.json({ message: "Session deleted successfully" });
  } catch (error) {
    console.error("Error deleting session:", error);
    return NextResponse.json(
      { error: "Error deleting session" },
      { status: 500 }
    );
  }
}
