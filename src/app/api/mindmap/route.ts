import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

const MINDMAP_SYSTEM_MESSAGE = `You are a mindmap generator. 
Create a structured mindmap on the given topic.
Return a JSON structure with the following format:
{
  "root": {
    "text": "Main Topic",
    "definition": "Definition of the main topic in the context of the mindmap.",
    "children": [
      {
        "text": "Subtopic 1",
        "definition": "Definition of Subtopic 1 in the context of the main topic.",
        "children": [
          {"text": "Detail 1.1", "definition": "Definition of Detail 1.1 in the context of Subtopic 1."},
          {"text": "Detail 1.2", "definition": "Definition of Detail 1.2 in the context of Subtopic 1."}
        ]
      },
      {
        "text": "Subtopic 2",
        "definition": "Definition of Subtopic 2 in the context of the main topic.",
        "children": [
          {"text": "Detail 2.1", "definition": "Definition of Detail 2.1 in the context of Subtopic 2."},
          {"text": "Detail 2.2", "definition": "Definition of Detail 2.2 in the context of Subtopic 2."}
        ]
      }
    ]
  }
}
Each node (root, subtopic, detail) must have a 'definition' field that is concise and contextual.
Keep the structure concise and focused.
Limit to max 3 levels deep.
Use clear and concise labels.`;

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  maxOutputTokens: 2048,
  temperature: 0.3,
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { topic } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const response = await llm.invoke([
      ["system", MINDMAP_SYSTEM_MESSAGE],
      ["human", `Generate a mindmap for: ${topic}`],
    ]);

    // Parse the response to ensure it's valid JSON with definitions at each node
    let mindmapData;
    try {
      const responseText = String(response.content);
      const jsonMatch =
        responseText.match(/```json\n([\s\S]*?)\n```/) ||
        responseText.match(/{[\s\S]*}/);

      const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : responseText;
      mindmapData = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse mindmap data:", parseError);
      return NextResponse.json(
        { error: "Failed to generate valid mindmap structure" },
        { status: 500 }
      );
    }

    // Save mindmap to database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const savedMindmap = await prisma.mindmap.create({
      data: {
        data: mindmapData,
        topic,
        userId: user.id,
      },
    });

    return NextResponse.json({ mindmap: mindmapData, id: savedMindmap.id });
  } catch (error) {
    console.error("Error generating mindmap:", error);
    return NextResponse.json(
      { error: "Failed to generate mindmap" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const mindmaps = await prisma.mindmap.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ mindmaps });
}
