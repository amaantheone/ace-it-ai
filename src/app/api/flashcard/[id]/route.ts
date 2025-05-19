import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const { id } = await context.params;

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

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const { id } = await context.params;

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const flashCardData = await req.json();

    // First check if the flashcard exists and belongs to the current user
    const existingCard = await prisma.flashCard.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingCard) {
      return NextResponse.json(
        { error: "Flash card not found or access denied" },
        { status: 404 }
      );
    }

    // Validate required fields
    const requiredFields = ["term", "definition", "example"];
    const missingFields = requiredFields.filter(
      (field) => !flashCardData[field]
    );

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    const updatedFlashCard = await prisma.flashCard.update({
      where: { id },
      data: {
        term: flashCardData.term,
        translation: flashCardData.translation,
        partOfSpeech: flashCardData.partOfSpeech,
        definition: flashCardData.definition,
        example: flashCardData.example,
        tag: flashCardData.tag ?? null,
      },
    });

    return NextResponse.json({ flashCard: updatedFlashCard });
  } catch (error) {
    console.error("Error updating flash card:", error);
    return NextResponse.json(
      { error: "Failed to update flash card" },
      { status: 500 }
    );
  }
}
