import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/config/auth";

// Add card to folder
export async function PUT(req: NextRequest, context: unknown) {
  const { folderId, cardId } = (context as {
    params: { folderId: string; cardId: string };
  }).params;

  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if the folder exists and belongs to the user
    const folder = await prisma.flashCardFolder.findUnique({
      where: { id: folderId },
    });

    if (!folder || folder.userId !== user.id) {
      return NextResponse.json(
        { error: "Folder not found or unauthorized" },
        { status: 404 }
      );
    }

    // Check if the card exists and belongs to the user
    const card = await prisma.flashCard.findUnique({
      where: { id: cardId },
    });

    if (!card || card.userId !== user.id) {
      return NextResponse.json(
        { error: "Card not found or unauthorized" },
        { status: 404 }
      );
    }

    // Update the card to belong to the folder
    const updatedCard = await prisma.flashCard.update({
      where: { id: cardId },
      data: { folderId },
    });

    return NextResponse.json({ success: true, card: updatedCard });
  } catch (error) {
    console.error("Error adding card to folder:", error);
    return NextResponse.json(
      { error: "Failed to add card to folder" },
      { status: 500 }
    );
  }
}

// Remove card from folder
export async function DELETE(req: NextRequest, context: unknown) {
  const { folderId, cardId } = (context as {
    params: { folderId: string; cardId: string };
  }).params;

  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if the card exists, belongs to the user, and is in the specified folder
    const card = await prisma.flashCard.findUnique({
      where: { id: cardId },
    });

    if (!card || card.userId !== user.id) {
      return NextResponse.json(
        { error: "Card not found or unauthorized" },
        { status: 404 }
      );
    }

    if (card.folderId !== folderId) {
      return NextResponse.json(
        { error: "Card is not in the specified folder" },
        { status: 400 }
      );
    }

    // Remove the card from the folder (but don't delete the card)
    const updatedCard = await prisma.flashCard.update({
      where: { id: cardId },
      data: { folderId: null },
    });

    return NextResponse.json({ success: true, card: updatedCard });
  } catch (error) {
    console.error("Error removing card from folder:", error);
    return NextResponse.json(
      { error: "Failed to remove card from folder" },
      { status: 500 }
    );
  }
}
