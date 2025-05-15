import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { NextResponse } from "next/server";

const TITLE_SYSTEM_MESSAGE = `You are a title generator. Your task is to create a very short, concise title (maximum 30 characters) based on the message content.
Rules:
- Keep titles short and meaningful
- Capture the main topic or question
- Remove unnecessary words
- Do not use quotes or special characters
- Return only the title, nothing else`;

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0.3, // Lower temperature for more focused titles
  maxOutputTokens: 50, // We only need a short title
});

import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { message, sessionId } = await req.json();
    const response = await llm.invoke([
      ["system", TITLE_SYSTEM_MESSAGE],
      ["human", `Create a short title for this message: ${message}`],
    ]);

    const title = String(response.content).slice(0, 30); // Ensure max length and convert to string

    // Update the session in the database
    await prisma.session.update({
      where: { id: sessionId },
      data: { topic: title },
    });

    return NextResponse.json({ title });
  } catch (error) {
    console.error("Error generating title:", error);
    return NextResponse.json(
      { error: "Failed to generate title" },
      { status: 500 }
    );
  }
}
