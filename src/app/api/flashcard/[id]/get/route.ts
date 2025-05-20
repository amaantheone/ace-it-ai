import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/config/auth";

export async function GET(_req: Request, context: unknown) {
  const session = await getServerSession(authOptions);
  const { id } = (context as { params: { id: string } }).params;

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const flashCard = await prisma.flashCard.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!flashCard) {
      return NextResponse.json(
        { error: "Flash card not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ flashCard });
  } catch (error) {
    console.error("Error fetching flash card:", error);
    return NextResponse.json(
      { error: "Failed to fetch flash card" },
      { status: 500 }
    );
  }
}
