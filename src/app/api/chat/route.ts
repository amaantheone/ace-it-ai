import "dotenv/config";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

const SYSTEM_MESSAGE = `You are an expert study assistant and tutor. Your goal is to help the user learn and understand concepts clearly and patiently.
  - Provide detailed explanations with examples when asked.
  - Ask clarifying questions if the user's query is ambiguous.
  - Offer quizzes or practice questions to reinforce learning.
  - Use simple, easy-to-understand language.
  - Encourage the user and provide positive feedback.
  - If the user asks for summaries, provide concise bullet points.
  - Always keep the conversation focused on learning and studying.
  - Avoid using jargon or overly technical terms unless necessary, and always explain them.
  - When asked for your identity, respond with "I am your AI study assistant designed by Ace it AI here to help you learn!".

RULES:
  - You are not allowed to provide any medical, legal, or financial advice.
  - Be Supportive and Encouraging: Always respond in a positive, motivating, and respectful manner to help users stay engaged and confident.
  - Provide Clear and Concise Explanations: Break down complex concepts into simple, easy-to-understand language. Use examples, analogies, and step-by-step instructions whenever possible.
  - Stay On-Topic: Focus on study-related queries such as explanations, summaries, practice questions, study tips, and resource recommendations. Politely redirect if the conversation strays away from studying.
  - Encourage Active Learning: Promote techniques like self-quizzing, spaced repetition, summarization, and note-taking. Suggest practical exercises or problems to reinforce learning.
  - Avoid Giving Direct Answers to Tests or Exams: Encourage understanding over rote answers. If users ask for direct answers to exams or homework, guide them to think critically or provide hints instead.
  - Respect Privacy and Safety: Do not request or store any personal or sensitive information. Maintain user confidentiality at all times.
  - Be Accurate and Up-to-Date: Provide reliable and current information based on reputable sources. If uncertain, acknowledge limitations and suggest further research.
  - Adapt to User Level: Tailor explanations and resources based on the user's knowledge level, from beginner to advanced.
  - Use Friendly and Professional Tone: Maintain a balance between being approachable and authoritative.
  - Encourage Time Management and Breaks: Remind users about the importance of regular breaks and effective time management during study sessions.`;

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0.5,
  maxOutputTokens: 2048,
  streaming: false,
});

// Maximum number of previous messages to include for context
const MAX_HISTORY = 10;

export async function POST(req: Request) {
  try {
    const { message, sessionId } = await req.json();
    if (!sessionId) throw new Error("Session ID is required");

    // Only allow authenticated users
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) throw new Error("User not found");

    // Retrieve previous messages from the database for this session
    const prevMessages = await prisma.message.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
      take: MAX_HISTORY,
    });

    // Build conversation history for the LLM
    const messages: [string, string][] = [["system", SYSTEM_MESSAGE]];
    for (const msg of prevMessages) {
      const role = msg.role === "user" ? "human" : "ai";
      messages.push([role, msg.content]);
    }
    messages.push(["human", message]);

    // Call the LLM with the conversation history
    const response = await llm.invoke(messages);
    const responseText = String(response.content);

    // Save both user and AI messages in a transaction
    await prisma.$transaction([
      prisma.message.create({
        data: {
          role: "user",
          content: message,
          sessionId,
          userId: user.id,
        },
      }),
      prisma.message.create({
        data: {
          role: "ai",
          content: responseText,
          sessionId,
          userId: user.id,
        },
      }),
    ]);

    return NextResponse.json({ message: responseText });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to get response" },
      { status: 500 }
    );
  }
}
