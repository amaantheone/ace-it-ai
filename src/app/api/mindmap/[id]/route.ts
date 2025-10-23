import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { authOptions } from "@/config/auth";

export async function GET(req: Request, context: unknown) {
  const session = await getServerSession(authOptions);
  const { id } = await (context as { params: Promise<{ id: string }> }).params;

  // For guest users, return a 404 since they use localStorage
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Mindmap not found" }, { status: 404 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const mindmap = await prisma.mindmap.findFirst({
    where: { id, userId: user.id },
  });
  if (!mindmap) {
    return NextResponse.json({ error: "Mindmap not found" }, { status: 404 });
  }
  return NextResponse.json({ mindmap });
}

export async function DELETE(req: Request, context: unknown) {
  const session = await getServerSession(authOptions);
  const { id } = await (context as { params: Promise<{ id: string }> }).params;

  // For guest users, we'll handle deletion client-side via localStorage
  // So we return success for guest mindmap IDs (which start with 'guest_')
  if (!session?.user?.email) {
    if (id.startsWith("guest_")) {
      return NextResponse.json({
        success: true,
        message: "Guest mindmap deletion handled client-side",
      });
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // For authenticated users, delete from database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const mindmap = await prisma.mindmap.findFirst({
    where: { id, userId: user.id },
  });
  if (!mindmap) {
    return NextResponse.json({ error: "Mindmap not found" }, { status: 404 });
  }

  await prisma.mindmap.delete({
    where: { id },
  });

  return NextResponse.json({
    success: true,
    message: "Mindmap deleted successfully",
  });
}

export async function PUT(req: Request, context: unknown) {
  const session = await getServerSession(authOptions);
  const { id } = await (context as { params: Promise<{ id: string }> }).params;

  try {
    const body = await req.json();
    const { data: mindmapData, topic } = body;

    if (!mindmapData) {
      return NextResponse.json(
        { error: "Mindmap data is required" },
        { status: 400 }
      );
    }

    // For guest users, we'll handle updates client-side via localStorage
    // So we return success for guest mindmap IDs (which start with 'guest_')
    if (!session?.user?.email) {
      if (id.startsWith("guest_")) {
        return NextResponse.json({
          success: true,
          message: "Guest mindmap update handled client-side",
          mindmap: { id, data: mindmapData, topic },
        });
      }
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // For authenticated users, update in database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existingMindmap = await prisma.mindmap.findFirst({
      where: { id, userId: user.id },
    });
    if (!existingMindmap) {
      return NextResponse.json({ error: "Mindmap not found" }, { status: 404 });
    }

    const updatedMindmap = await prisma.mindmap.update({
      where: { id },
      data: {
        data: mindmapData,
        topic: topic || existingMindmap.topic,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Mindmap updated successfully",
      mindmap: updatedMindmap,
    });
  } catch (error) {
    console.error("Error updating mindmap:", error);
    return NextResponse.json(
      { error: "Failed to update mindmap" },
      { status: 500 }
    );
  }
}
