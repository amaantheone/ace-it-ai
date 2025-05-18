import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const MINDMAP_SYSTEM_MESSAGE = `You are a mindmap generator. 
Create a structured mindmap on the given topic.
Return a JSON structure with the following format:
{
  "root": {
    "text": "Main Topic",
    "children": [
      {
        "text": "Subtopic 1",
        "children": [
          {"text": "Detail 1.1"},
          {"text": "Detail 1.2"}
        ]
      },
      {
        "text": "Subtopic 2",
        "children": [
          {"text": "Detail 2.1"},
          {"text": "Detail 2.2"}
        ]
      }
    ]
  }
}
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
    return NextResponse.json({ error: "Unauthorize" }, { status: 401 });
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

    // Parse the response to ensure it's valid JSON
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

    return NextResponse.json({ mindmap: mindmapData });
  } catch (error) {
    console.error("Error generating mindmap:", error);
    return NextResponse.json(
      { error: "Failed to generate mindmap" },
      { status: 500 }
    );
  }
}
