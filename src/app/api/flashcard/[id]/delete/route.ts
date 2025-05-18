import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const { id } = await context.params;

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check if the flashcard exists before attempting to delete
    const existingCard = await prisma.flashCard.findUnique({ where: { id } });
    if (!existingCard) {
      return NextResponse.json(
        { error: "Flash card not found" },
        { status: 404 }
      );
    }
    const deletedFlashCard = await prisma.flashCard.delete({
      where: { id },
    });

    return NextResponse.json({ flashCard: deletedFlashCard });
  } catch (error) {
    console.error("Error deleting flash card:", error);
    return NextResponse.json(
      { error: "Failed to delete flash card" },
      { status: 500 }
    );
  }
}
