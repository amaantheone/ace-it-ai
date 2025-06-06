import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/config/auth";

// GET, PATCH and DELETE handlers for /api/flashcard/folder/[folderId]

// Get all cards in a folder
export async function GET(req: NextRequest, context: unknown) {
  const { folderId } = (context as { params: { folderId: string } }).params;

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch the folder and its cards
    const folder = await prisma.flashCardFolder.findFirst({
      where: {
        id: folderId,
        userId: user.id, // Ensure the folder belongs to the user
      },
      include: {
        cards: {
          orderBy: {
            createdAt: "asc", // Order by creation date
          },
        },
      },
    });

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    return NextResponse.json({
      folder: {
        id: folder.id,
        name: folder.name,
      },
      flashCards: folder.cards,
    });
  } catch (error) {
    console.error("Error fetching folder cards:", error);
    return NextResponse.json(
      { error: "Failed to fetch folder cards" },
      { status: 500 }
    );
  }
}

// Update folder
export async function PATCH(req: NextRequest, context: unknown) {
  const { folderId } = (context as { params: { folderId: string } }).params;
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

    const { name } = await req.json();

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Folder name is required" },
        { status: 400 }
      );
    }

    // Check if the folder belongs to the user
    const folder = await prisma.flashCardFolder.findUnique({
      where: { id: folderId },
    });

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    if (folder.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updatedFolder = await prisma.flashCardFolder.update({
      where: { id: folderId },
      data: { name },
    });

    return NextResponse.json({
      folder: {
        id: updatedFolder.id,
        name: updatedFolder.name,
      },
    });
  } catch (error) {
    console.error("Error updating folder:", error);
    return NextResponse.json(
      { error: "Failed to update folder" },
      { status: 500 }
    );
  }
}

// Delete folder
export async function DELETE(context: unknown) {
  const { folderId } = (context as { params: { folderId: string } }).params;
  try {
    // Fix: use getServerSession(authOptions) for proper authentication
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

    // Check if the folder belongs to the user
    const folder = await prisma.flashCardFolder.findUnique({
      where: { id: folderId },
    });

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    if (folder.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // When a folder is deleted, also delete all its flashcards
    await prisma.flashCard.deleteMany({
      where: { folderId },
    });

    // Now delete the folder
    await prisma.flashCardFolder.delete({
      where: { id: folderId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting folder:", error);
    return NextResponse.json(
      { error: "Failed to delete folder" },
      { status: 500 }
    );
  }
}
