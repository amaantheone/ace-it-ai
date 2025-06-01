import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/config/auth";

// Get all folders for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      // Guest users store folders in localStorage, return empty array
      return NextResponse.json({ folders: [] });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const folders = await prisma.flashCardFolder.findMany({
      where: { userId: user.id },
      include: {
        cards: {
          select: {
            id: true,
          },
        },
      },
    });

    // Transform the data to match the expected format in the front-end
    const formattedFolders = folders.map((folder) => ({
      id: folder.id,
      name: folder.name,
      cardIds: folder.cards.map((card) => card.id),
    }));

    return NextResponse.json({ folders: formattedFolders });
  } catch (error) {
    console.error("Error fetching folders:", error);
    return NextResponse.json(
      { error: "Failed to fetch folders" },
      { status: 500 }
    );
  }
}

// Create a new folder
export async function POST(req: NextRequest) {
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

    const newFolder = await prisma.flashCardFolder.create({
      data: {
        name,
        userId: user.id,
      },
    });

    return NextResponse.json({
      folder: {
        id: newFolder.id,
        name: newFolder.name,
        cardIds: [],
      },
    });
  } catch (error) {
    console.error("Error creating folder:", error);
    return NextResponse.json(
      { error: "Failed to create folder" },
      { status: 500 }
    );
  }
}
