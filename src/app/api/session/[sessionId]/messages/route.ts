import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

interface MessageWithUser {
  id: string;
  content: string;
  role: string;
  user: {
    name: string | null;
    image: string | null;
  };
}

export async function GET(
  request: Request,
  context: { params: Promise<{ sessionId: string }> }
) {
  const session = await getServerSession(authOptions);
  const { sessionId } = await context.params;

  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const messages: MessageWithUser[] = await prisma.message.findMany({
      where: {
        sessionId: sessionId,
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    // Transform messages to match frontend format
    const transformedMessages = messages.map((msg: MessageWithUser) => ({
      id: msg.id,
      message: msg.content,
      role: msg.role,
      name: msg.user.name || "Guest",
      avatar: msg.user.image,
    }));

    return NextResponse.json(transformedMessages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ sessionId: string }> }
) {
  const session = await getServerSession(authOptions);
  const { sessionId } = await context.params;

  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const [user, { content, role }] = await Promise.all([
      prisma.user.findUnique({
        where: { email: session.user.email },
      }),
      request.json(),
    ]);

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const message = await prisma.message.create({
      data: {
        content,
        role,
        sessionId: sessionId,
        userId: user.id,
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    // Transform message to match frontend format
    const transformedMessage = {
      id: message.id,
      message: message.content,
      role: message.role,
      name: message.user.name || "Guest",
      avatar: message.user.image,
    };

    return NextResponse.json(transformedMessage);
  } catch (error) {
    console.error("Error creating message:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
