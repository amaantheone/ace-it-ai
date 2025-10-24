import "dotenv/config";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/config/auth";
import { processPDF } from "@/utils/chatFunctions/pdf-utils";
import {
  processImage,
  isSupportedImageType,
} from "@/utils/chatFunctions/image-utils";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { Document } from "@langchain/core/documents";

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
  - when asked "What is the weather in San Francisco?", tell accurate weather of San Francisco.

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

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-flash-latest",
  temperature: 0.5,
  maxOutputTokens: 2048,
  streaming: false,
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
    let userMessageId: string | undefined;
    let isGuestMode: boolean = false;
    let guestMessages: { role: string; content: string; id?: string }[] = [];
    let isEdit: boolean = false;
    let editMessageId: string | undefined;

    if (contentType.includes("multipart/form-data")) {
      // Parse multipart form data
      const formData = await req.formData();
      message = formData.get("message") as string;
      sessionId = formData.get("sessionId") as string;
      userMessageId = formData.get("userMessageId") as string | undefined;
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
      // Fallback to JSON body
      const body = await req.json();
      message = body.message;
      sessionId = body.sessionId;
      userMessageId = body.userMessageId;
      isGuestMode = body.isGuestMode || false;
      isEdit = body.isEdit || false;
      editMessageId = body.editMessageId;
      guestMessages = body.guestMessages || [];
    }
    if (!sessionId) throw new Error("Session ID is required");

    // Check authentication - allow guest mode
    const session = await getServerSession(authOptions);
    let user = null;

    if (!isGuestMode) {
      // Authenticated mode - require session
      if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Get user
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
      if (!user) throw new Error("User not found");
    }

    // Retrieve previous messages - from database for authenticated users, from request for guests
    let prevMessages: {
      role: string;
      content: string;
      id?: string;
      createdAt?: Date;
    }[] = [];

    if (isGuestMode) {
      // Guest mode: use messages from request body, limited to MAX_HISTORY
      prevMessages = guestMessages.slice(-MAX_HISTORY);
    } else {
      // Authenticated mode: retrieve from database
      const dbMessages = await prisma.message.findMany({
        where: { chatSessionId: sessionId },
        orderBy: { createdAt: "asc" },
        take: MAX_HISTORY,
      });
      prevMessages = dbMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        id: msg.id,
        createdAt: msg.createdAt,
      }));
    }

    // Build conversation history for the LLM
    const messages: [string, string][] = [["system", SYSTEM_MESSAGE]];
    for (const msg of prevMessages) {
      const role = msg.role === "user" ? "human" : "ai";
      messages.push([role, msg.content]);
    }
    let pdfContext = "";
    let imageContext = "";

    if (fileBuffer && fileType) {
      try {
        if (fileType === "application/pdf") {
          // Process PDF and split into chunks
          const pdfText = await processPDF(fileBuffer);
          // Split into chunks for vector storage
          const chunks = pdfText.split(/\n{2,}/).map(
            (chunk, idx) =>
              new Document({
                pageContent: chunk,
                metadata: { page: idx + 1 },
              })
          );
          // Create embeddings and vector store
          const embeddings = new GoogleGenerativeAIEmbeddings({
            model: "embedding-001",
          });
          const vectorStore = await MemoryVectorStore.fromDocuments(
            chunks,
            embeddings
          );
          // Perform similarity search with user's message
          const topChunks = await vectorStore.similaritySearch(message, 4);
          pdfContext = topChunks
            .map(
              (doc) =>
                `--- PDF Chunk #${doc.metadata.page} ---\n${doc.pageContent}`
            )
            .join("\n\n");
        } else if (isSupportedImageType(fileType)) {
          // Process image
          const base64Image = await processImage(fileBuffer, fileType);
          imageContext = base64Image;
        } else {
          return NextResponse.json(
            { error: "Unsupported file type" },
            { status: 400 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: "Failed to process file" },
          { status: 400 }
        );
      }
    }
    // Inject PDF context into the system prompt if available
    let systemPrompt = SYSTEM_MESSAGE;
    if (pdfContext) {
      systemPrompt += `\n\nRelevant PDF Chunks:\n${pdfContext}`;
    }

    // Prepare messages for LLM
    const llmMessages: [string, string][] = [
      ["system", systemPrompt],
      ...messages.slice(1),
    ];

    // If we have an image, we need to handle it differently for Gemini Vision
    if (imageContext) {
      // For image analysis, add the image to the human message
      llmMessages.push([
        "human",
        `${message}\n\n[Image provided for analysis]`,
      ]);
    } else {
      llmMessages.push(["human", message]);
    }
    // Call the LLM with the conversation history and context
    let response;
    if (imageContext) {
      // For image analysis, we need to use a vision-capable model
      const visionLlm = new ChatGoogleGenerativeAI({
        model: "gemini-2.0-flash",
        temperature: 0.5,
        maxOutputTokens: 2048,
        streaming: false,
      });

      // Create message with image
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

      response = await visionLlm.invoke([
        { role: "system", content: systemPrompt },
        ...messages.slice(1).map(([role, content]) => ({
          role: role === "human" ? ("user" as const) : ("assistant" as const),
          content,
        })),
        messageWithImage,
      ]);
    } else {
      response = await llm.invoke(llmMessages);
    }
    const responseText = String(response.content);

    // Handle edit operations
    if (isEdit && editMessageId) {
      if (!isGuestMode && user) {
        // For authenticated users, update the message in the database
        await prisma.message.update({
          where: {
            id: editMessageId,
            userId: user.id, // Ensure user can only edit their own messages
          },
          data: {
            content: message,
          },
        });

        // After updating, trigger a regenerate with the updated message
        // Find and delete any AI response that follows this edited message
        const messages = await prisma.message.findMany({
          where: { chatSessionId: sessionId },
          orderBy: { createdAt: "asc" },
        });

        const editedMsgIndex = messages.findIndex(
          (m) => m.id === editMessageId
        );
        if (
          editedMsgIndex !== -1 &&
          editedMsgIndex + 1 < messages.length &&
          messages[editedMsgIndex + 1].role === "ai"
        ) {
          // Delete the AI response that follows the edited message
          await prisma.message.delete({
            where: { id: messages[editedMsgIndex + 1].id },
          });
        }

        // Build conversation history up to and including the edited message
        const messagesForLLM: [string, string][] = [["system", SYSTEM_MESSAGE]];
        for (let i = 0; i <= editedMsgIndex; i++) {
          const msg = messages[i];
          const content = msg.id === editMessageId ? message : msg.content; // Use updated content for edited message
          messagesForLLM.push([msg.role === "user" ? "human" : "ai", content]);
        }

        // Generate new AI response
        const regenerateResponse = await llm.invoke(messagesForLLM);
        const regenerateResponseText = String(regenerateResponse.content);

        // Insert the new AI message
        let createdAt = new Date();
        if (editedMsgIndex !== -1 && messages[editedMsgIndex]?.createdAt) {
          createdAt = new Date(
            new Date(messages[editedMsgIndex].createdAt).getTime() + 1
          );
        }

        await prisma.message.create({
          data: {
            role: "ai",
            content: regenerateResponseText,
            chatSessionId: sessionId,
            userId: user.id,
            createdAt,
          },
        });

        // Return the full updated messages array
        const allMessages = await prisma.message.findMany({
          where: { chatSessionId: sessionId },
          orderBy: { createdAt: "asc" },
        });

        return NextResponse.json({
          success: true,
          message: regenerateResponseText,
          messages: allMessages.map((msg) => ({
            id: msg.id,
            message: msg.content,
            role: msg.role === "assistant" ? "ai" : msg.role, // Transform assistant to ai for frontend
            name:
              msg.role === "assistant" || msg.role === "ai"
                ? "AI Tutor"
                : undefined,
          })),
          edited: true,
        });
      } else {
        // For guest mode, just return success (frontend handles the update and regenerate)
        return NextResponse.json({
          success: true,
          message: "Message updated successfully",
          edited: true,
        });
      }
    }

    // (Removed unused lastUserMsg logic; handled by userMessageId and message scan above)

    if (req.headers.get("x-regenerate") === "true") {
      // Regenerate: for authenticated users, delete the AI message after the specified user message
      // For guest users, we don't need to delete from database since we don't persist
      if (!isGuestMode && user) {
        const messages = await prisma.message.findMany({
          where: { chatSessionId: sessionId },
          orderBy: { createdAt: "asc" },
        });
        let userIdx = -1;
        if (userMessageId) {
          userIdx = messages.findIndex(
            (m) => m.id === userMessageId && m.role === "user"
          );
        } else {
          // Default to last user message
          for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i].role === "user") {
              userIdx = i;
              break;
            }
          }
        }
        let aiToDeleteId: string | null = null;
        if (
          userIdx !== -1 &&
          userIdx + 1 < messages.length &&
          messages[userIdx + 1].role === "ai"
        ) {
          aiToDeleteId = messages[userIdx + 1].id;
        }
        if (aiToDeleteId) {
          await prisma.message.delete({ where: { id: aiToDeleteId } });
        }
        // Build conversation history for the LLM up to and including the user message
        const messagesForLLM = [["system", SYSTEM_MESSAGE]];
        for (let i = 0; i <= userIdx; i++) {
          const msg = messages[i];
          messagesForLLM.push([
            msg.role === "user" ? "human" : "ai",
            msg.content,
          ]);
        }
        // Add the new user message content if not already present (for UI-initiated regeneration)
        if (
          !userMessageId &&
          message &&
          (!messages[userIdx] || messages[userIdx].content !== message)
        ) {
          messagesForLLM.push(["human", message]);
        }
        const llmMessages = messagesForLLM.map(([role, content]) => {
          if (role === "system") return { role: "system", content };
          if (role === "human") return { role: "user", content };
          return { role: "assistant", content };
        });
        const response = await llm.invoke(llmMessages);
        const responseText = String(response.content);
        // Insert the new AI message with a createdAt just after the user message
        let createdAt = new Date();
        if (userIdx !== -1 && messages[userIdx]?.createdAt) {
          // Add 1 millisecond to the user message's createdAt to ensure correct order
          createdAt = new Date(
            new Date(messages[userIdx].createdAt).getTime() + 1
          );
        }
        await prisma.message.create({
          data: {
            role: "ai",
            content: responseText,
            chatSessionId: sessionId,
            userId: user.id,
            createdAt,
          },
        });
        return NextResponse.json({ message: responseText });
      } else {
        // Guest mode regeneration: build conversation history and generate new response
        const messagesForLLM: [string, string][] = [["system", SYSTEM_MESSAGE]];

        // Use guestMessages for conversation history if available
        if (guestMessages.length > 0) {
          for (const msg of guestMessages) {
            messagesForLLM.push([
              msg.role === "user" ? "human" : "ai",
              msg.content,
            ]);
          }
        }

        // Add the current user message if it's not already the last message
        if (
          !guestMessages.length ||
          guestMessages[guestMessages.length - 1].content !== message
        ) {
          messagesForLLM.push(["human", message]);
        }

        const response = await llm.invoke(messagesForLLM);
        const guestResponseText = String(response.content);

        return NextResponse.json({ message: guestResponseText });
      }
    } else {
      // Normal flow: create messages for authenticated users, just return response for guests
      if (!isGuestMode && user) {
        await prisma.$transaction([
          prisma.message.create({
            data: {
              role: "user",
              content: message,
              chatSessionId: sessionId,
              userId: user.id,
            },
          }),
          prisma.message.create({
            data: {
              role: "ai",
              content: responseText,
              chatSessionId: sessionId,
              userId: user.id,
            },
          }),
        ]);
      }
      // For both authenticated and guest users, return the response
      return NextResponse.json({ message: responseText });
    }
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to get response" },
      { status: 500 }
    );
  }
}
