import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";
import { getOrCreateGuestUser } from "@/lib/guestUser";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  let user;
  if (!session?.user?.email) {
    user = await getOrCreateGuestUser();
  } else {
    user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
  }
  try {
    const { topic } = await req.json().catch(() => ({}));
    const newSession = await prisma.session.create({
      data: {
        userId: user.id,
        sessionToken: crypto.randomUUID(),
        topic: topic || null,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        startedAt: new Date(),
      },
    });
    return NextResponse.json(newSession);
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: "Error creating session" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  let user;
  if (!session?.user?.email) {
    user = await getOrCreateGuestUser();
  } else {
    user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
  }

  try {
    const { sessionId, message, topic } = await req.json();

    if (!sessionId || !message) {
      return NextResponse.json(
        { error: "Missing sessionId or message" },
        { status: 400 }
      );
    }

    const chatSession = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { messages: true },
    });

    if (!chatSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (chatSession.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const newMessage = await prisma.message.create({
      data: {
        content: message,
        role: "user",
        userId: user.id,
        sessionId: sessionId,
      },
    });

    return NextResponse.json(newMessage);
  } catch (error) {
    console.error("Error in PUT /api/session:", error);
    return NextResponse.json(
      { error: "Error updating session" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  let user;
  if (!session?.user?.email) {
    user = await getOrCreateGuestUser();
  } else {
    user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
  }
  try {
    const sessions = await prisma.session.findMany({
      where: { userId: user.id },
      orderBy: { startedAt: "desc" },
    });
    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Error fetching sessions" },
      { status: 500 }
    );
  }
}
