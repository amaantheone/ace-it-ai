import "dotenv/config";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { NextResponse } from "next/server";

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0.5,
  maxOutputTokens: 2048,
  streaming: true,
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const stream = await llm.stream(message);
    let fullResponse = "";

    for await (const chunk of stream) {
      fullResponse +=
        chunk.content instanceof Array ? chunk.content.join("") : chunk.content;
    }

    return NextResponse.json({ message: fullResponse });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to get response" },
      { status: 500 }
    );
  }
}
