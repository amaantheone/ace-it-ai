import { NextResponse } from "next/server";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const DEFINITION_SYSTEM_MESSAGE = `You are a helpful assistant that provides concise definitions for words or phrases. Reply with a short, clear definition for the given input.`;

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  maxOutputTokens: 256,
  temperature: 0.2,
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorize" }, { status: 401 });
  }
  try {
    const { word } = await req.json();
    if (!word) {
      return NextResponse.json({ error: "Word is required" }, { status: 400 });
    }
    const response = await llm.invoke([
      ["system", DEFINITION_SYSTEM_MESSAGE],
      ["human", `Define: ${word}`],
    ]);
    return NextResponse.json({ definition: String(response.content).trim() });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch definition" },
      { status: 500 }
    );
  }
}
