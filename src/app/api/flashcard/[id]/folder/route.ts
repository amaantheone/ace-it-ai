import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

interface Params {
  params: {
    id: string;
  };
}

// Update flashcard folder association
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    const { folderId } = await req.json();
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

    // Check if the card exists and belongs to the user
    const card = await prisma.flashCard.findUnique({
      where: { id },
    });

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    if (card.userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized to modify this card" },
        { status: 403 }
      );
    }

    // If folderId is provided, verify the folder exists and belongs to user
    if (folderId) {
      const folder = await prisma.flashCardFolder.findUnique({
        where: { id: folderId },
      });

      if (!folder) {
        return NextResponse.json(
          { error: "Folder not found" },
          { status: 404 }
        );
      }

      if (folder.userId !== user.id) {
        return NextResponse.json(
          { error: "Unauthorized to use this folder" },
          { status: 403 }
        );
      }
    }

    // Update the card's folder
    const updatedCard = await prisma.flashCard.update({
      where: { id },
      data: { folderId: folderId || null },
    });

    return NextResponse.json({ card: updatedCard });
  } catch (error) {
    console.error("Error updating card folder:", error);
    return NextResponse.json(
      { error: "Failed to update card folder" },
      { status: 500 }
    );
  }
}
