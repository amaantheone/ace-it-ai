import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { NextResponse } from "next/server";

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  temperature: 0.1,
  maxOutputTokens: 150,
  topP: 0.8,
  topK: 40,
});

const IMPROVE_SYSTEM_PROMPT = `You are a prompt-improvement assistant. DO NOT answer the user's request. Your only task is to rewrite and improve the user's prompt so it is clear, specific, and ready to use with an AI.

Rules:
- Preserve the original intent and meaning; do not add new goals.
- Produce a concise, improved prompt only (no commentary, no explanations).
- Target length: about 1.25–1.5× the original prompt, up to 300 tokens.
- Structure the prompt if helpful using short labeled sections (e.g., Role:, Task:, Context:, Constraints:, Output Format:), but return a single continuous prompt text.
- Remove ambiguity, tighten phrasing, and add necessary details or examples to clarify the desired output.

Return ONLY the improved prompt text (plain text).`;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      console.warn("[improve] Invalid prompt type");
      return NextResponse.json(
        { error: "Valid prompt string is required" },
        { status: 400 }
      );
    }

    if (prompt.trim().length === 0) {
      console.warn("[improve] Empty prompt");
      return NextResponse.json(
        { error: "Prompt cannot be empty" },
        { status: 400 }
      );
    }

    // Validate prompt isn't already too long
    const wordCount = prompt.split(/\s+/).length;
    if (wordCount > 2000) {
      console.warn("[improve] Prompt too long:", wordCount, "words");
      return NextResponse.json(
        { error: "Prompt is too long (max 2000 words)" },
        { status: 400 }
      );
    }

    console.log(`[improve] Enhancing prompt (${wordCount} words)...`);

    // Call the LLM to improve the prompt
    let improvedPrompt = "";
    try {
      const response = await llm.invoke([
        ["system", IMPROVE_SYSTEM_PROMPT],
        ["human", prompt],
      ]);
      improvedPrompt = String(response.content).trim();
      console.log(`[improve] Generated improved prompt (${improvedPrompt.length} chars)`);
    } catch (llmError) {
      console.error("[improve] LLM invocation failed:", llmError);
      throw llmError;
    }

    // Ensure output isn't empty or too short (sanity check)
    if (!improvedPrompt || improvedPrompt.length < 5) {
      console.warn("[improve] Generated prompt too short:", improvedPrompt.length);
      return NextResponse.json(
        { error: "Failed to generate improvement" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      improved: improvedPrompt,
    });
  } catch (error) {
    console.error("[improve] Fatal error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[improve] Error details:", errorMessage);
    return NextResponse.json(
      { error: "Failed to improve prompt: " + errorMessage },
      { status: 500 }
    );
  }
}
