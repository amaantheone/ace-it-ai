import "dotenv/config";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/config/auth";
// Fixed first message streaming issue
import { processPDF } from "@/utils/chatFunctions/pdf-utils";
import {
  processImage,
  isSupportedImageType,
} from "@/utils/chatFunctions/image-utils";

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
  - The founder of Ace It AI is Shaik Amaan Abdullah, a hobbyist developer.
  - when asked "What is the weather in any city?", tell accurate weather of that city.

PDF_CONTEXT:
  - If a PDF is provided, you will receive relevant context chunks from the PDF below.
  - Reference specific pages or sections when answering questions about the PDF.
  - If the user asks about a table or diagram, describe it textually as best as possible.
  - Always cite the PDF context you use in your answer (e.g., "According to page X...").

IMAGE_CONTEXT:
  - If an image is provided, analyze it thoroughly and provide detailed explanations.
  - Describe what you see in the image including text, diagrams, charts, mathematical formulas, or other visual elements.
  - Help explain concepts shown in the image and relate them to the user's learning goals.
  - If the image contains problems or exercises, help guide the user through understanding them.
  - Point out important details that might be relevant for studying or understanding the content.

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

// Create streaming LLM instance
const streamingLlm = new ChatGoogleGenerativeAI({
  model: "gemini-flash-latest",
  temperature: 0.5,
  maxOutputTokens: 2048,
  streaming: true, // Enable streaming
});

// Vision LLM for images
const visionLlm = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0.5,
  maxOutputTokens: 2048,
  streaming: true,
});

// Maximum number of previous messages to include for context
const MAX_HISTORY = 10;

export async function POST(req: Request) {
  try {
    // Check if the request is multipart/form-data
    const contentType = req.headers.get("content-type") || "";
    let message: string = "";
    let fileBuffer: Buffer | null = null;
    let fileType: string | null = null;
    let sessionId: string = "";
    let isGuestMode: boolean = false;
    let guestMessages: { role: string; content: string; id?: string }[] = [];
    let isEdit: boolean = false;
    let editMessageId: string | undefined;

    if (contentType.includes("multipart/form-data")) {
      // Parse multipart form data
      const formData = await req.formData();
      message = formData.get("message") as string;
      sessionId = formData.get("sessionId") as string;
      isGuestMode = formData.get("isGuestMode") === "true";
      isEdit = formData.get("isEdit") === "true";
      editMessageId = formData.get("editMessageId") as string | undefined;
      const guestMessagesStr = formData.get("guestMessages") as string;
      if (guestMessagesStr) {
        guestMessages = JSON.parse(guestMessagesStr);
      }
      const file = formData.get("file") as File | null;
      if (file) {
        if (file.size > 10 * 1024 * 1024) {
          return NextResponse.json(
            { error: "File too large (max 10MB)" },
            { status: 400 }
          );
        }
        // Read file into buffer
        const arrayBuffer = await file.arrayBuffer();
        fileBuffer = Buffer.from(arrayBuffer);
        fileType = file.type;
      }
    } else {
      // Parse JSON
      const body = await req.json();
      message = body.message;
      sessionId = body.sessionId;
      isGuestMode = body.isGuestMode || false;
      guestMessages = body.guestMessages || [];
      isEdit = body.isEdit || false;
      editMessageId = body.editMessageId;
    }

    if (!message || !sessionId) {
      return NextResponse.json(
        { error: "Message and sessionId are required" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    let user = null;

    // For authenticated users, fetch user from database
    if (!isGuestMode && session?.user?.email) {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    }

    // Process file if provided
    let fileContext = "";
    let imageContext = "";

    if (fileBuffer && fileType) {
      if (fileType === "application/pdf") {
        try {
          fileContext = await processPDF(fileBuffer);
        } catch (error) {
          console.error("Error processing PDF:", error);
          return NextResponse.json(
            { error: "Failed to process PDF" },
            { status: 500 }
          );
        }
      } else if (isSupportedImageType(fileType)) {
        try {
          imageContext = await processImage(fileBuffer, fileType);
        } catch (error) {
          console.error("Error processing image:", error);
          return NextResponse.json(
            { error: "Failed to process image" },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { error: "Unsupported file type" },
          { status: 400 }
        );
      }
    }

    // Prepare system prompt with file context
    let systemPrompt = SYSTEM_MESSAGE;

    if (fileContext) {
      systemPrompt += `\n\nPDF CONTEXT:\n${fileContext}`;
    }

    // Get message history
    let messages: [string, string][] = [];

    if (isGuestMode) {
      // For guest mode, use the passed messages
      messages = guestMessages.map((msg) => [msg.role, msg.content]) as [
        string,
        string
      ][];
    } else if (user) {
      // For authenticated users, get from database
      const dbMessages = await prisma.message.findMany({
        where: { chatSessionId: sessionId },
        orderBy: { createdAt: "asc" },
        take: MAX_HISTORY * 2, // Take more to account for user/assistant pairs
      });

      // Convert to the format expected by the LLM
      messages = dbMessages.map((msg) => [
        msg.role === "user" ? "human" : "assistant",
        msg.content,
      ]) as [string, string][];
    }

    // Add current message to history for context
    messages.push(["human", message]);

    // Limit message history
    if (messages.length > MAX_HISTORY * 2) {
      messages = messages.slice(-MAX_HISTORY * 2);
    }

    // Convert messages to format expected by LangChain
    const llmMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map(([role, content]) => ({
        role: role === "human" ? ("user" as const) : ("assistant" as const),
        content,
      })),
    ];

    // Create a ReadableStream for streaming response
    const encoder = new TextEncoder();
    let completeResponse = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Generate AI response with streaming
          let response;

          if (imageContext) {
            // For images, use vision model
            const messageWithImage = {
              role: "user" as const,
              content: [
                { type: "text" as const, text: message },
                {
                  type: "image_url" as const,
                  image_url: { url: imageContext },
                },
              ],
            };

            response = await visionLlm.stream([
              { role: "system", content: systemPrompt },
              ...messages.slice(1).map(([role, content]) => ({
                role:
                  role === "human" ? ("user" as const) : ("assistant" as const),
                content,
              })),
              messageWithImage,
            ]);
          } else {
            response = await streamingLlm.stream(llmMessages);
          }

          // Process streaming response in 2-3 word chunks for optimal speed
          let buffer = "";

          for await (const chunk of response) {
            const content = chunk.content;
            if (content) {
              const contentStr =
                typeof content === "string" ? content : String(content);
              completeResponse += contentStr;
              buffer += contentStr;

              // Split buffer into words and send them in groups of 2-3
              const words = buffer.split(/(\s+)/); // Split on whitespace but keep the whitespace

              // Only keep the last word in buffer if it's not whitespace and might be incomplete
              // Check if the last element is a complete word (not whitespace) that might continue
              let wordsToSend = words;
              if (words.length > 0) {
                const lastElement = words[words.length - 1];
                // Only keep in buffer if it's a non-whitespace word that might be incomplete
                if (
                  lastElement &&
                  lastElement.trim() &&
                  !contentStr.endsWith(" ") &&
                  !contentStr.endsWith("\n")
                ) {
                  buffer = words.pop() || "";
                  wordsToSend = words;
                } else {
                  buffer = "";
                }
              }

              // Group words into chunks of 2-3 and send them
              for (let i = 0; i < wordsToSend.length; i += 3) {
                const wordChunk = wordsToSend.slice(i, i + 3).join("");
                if (wordChunk) {
                  // Send all chunks including whitespace-only ones to preserve spacing
                  const data = JSON.stringify({
                    type: "chunk",
                    content: wordChunk,
                    complete: false,
                  });
                  controller.enqueue(encoder.encode(`data: ${data}\n\n`));

                  // Small delay for natural reading pace (15ms per chunk)
                  await new Promise((resolve) => setTimeout(resolve, 15));
                }
              }
            }
          }

          // Send any remaining content in buffer
          if (buffer) {
            const data = JSON.stringify({
              type: "chunk",
              content: buffer,
              complete: false,
            });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }

          // Send completion signal
          const completionData = JSON.stringify({
            type: "complete",
            content: completeResponse,
            complete: true,
          });
          controller.enqueue(encoder.encode(`data: ${completionData}\n\n`));

          // Save messages to database for authenticated users
          if (!isGuestMode && user) {
            try {
              // Handle edit operations
              if (isEdit && editMessageId) {
                // Update the edited message
                await prisma.message.update({
                  where: {
                    id: editMessageId,
                    userId: user.id,
                  },
                  data: {
                    content: message,
                  },
                });

                // Delete any AI response that follows this edited message
                const allMessages = await prisma.message.findMany({
                  where: { chatSessionId: sessionId },
                  orderBy: { createdAt: "asc" },
                });

                const editedMsgIndex = allMessages.findIndex(
                  (m) => m.id === editMessageId
                );

                if (
                  editedMsgIndex !== -1 &&
                  editedMsgIndex + 1 < allMessages.length
                ) {
                  const nextMessage = allMessages[editedMsgIndex + 1];
                  if (nextMessage.role === "assistant") {
                    await prisma.message.delete({
                      where: { id: nextMessage.id },
                    });
                  }
                }

                // Create new AI response
                await prisma.message.create({
                  data: {
                    content: completeResponse,
                    role: "assistant",
                    chatSessionId: sessionId,
                    userId: user.id,
                  },
                });
              } else {
                // Normal message creation - always create new messages for streaming
                await prisma.message.create({
                  data: {
                    content: message,
                    role: "user",
                    chatSessionId: sessionId,
                    userId: user.id,
                  },
                });

                // Create AI response
                await prisma.message.create({
                  data: {
                    content: completeResponse,
                    role: "assistant",
                    chatSessionId: sessionId,
                    userId: user.id,
                  },
                });
              }

              // Update session title if it's empty
              const chatSession = await prisma.chatSession.findUnique({
                where: { id: sessionId },
              });

              if (chatSession && !chatSession.topic) {
                const title =
                  message.slice(0, 50) + (message.length > 50 ? "..." : "");
                await prisma.chatSession.update({
                  where: { id: sessionId },
                  data: { topic: title },
                });
              }
            } catch (dbError) {
              console.error("Database error:", dbError);
              // Send error but don't fail the stream
              const errorData = JSON.stringify({
                type: "error",
                content: "Failed to save message to database",
                complete: true,
              });
              controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
            }
          }

          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          const errorData = JSON.stringify({
            type: "error",
            content: "Failed to generate response",
            complete: true,
          });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      },
    });

    // Return streaming response
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
