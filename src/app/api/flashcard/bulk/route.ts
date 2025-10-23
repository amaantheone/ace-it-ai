import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/config/auth";
import { processPDF } from "@/utils/chatFunctions/pdf-utils";

interface SubTopic {
  topic: string;
}

interface FlashCard {
  term: string;
  translation: string | null;
  partOfSpeech: string | null;
  definition: string;
  example: string;
}

interface FlashCardFolder {
  folder: {
    id: string;
    name: string;
    cardIds: string[];
  };
}

const MAIN_TOPIC_SYSTEM_MESSAGE = `You are an education expert. Given a user query, return a short, clear main topic (1-3 words maximum) that best represents the subject for flashcard generation. Only return the topic string, no extra text or formatting.`;

const SUBTOPICS_SYSTEM_MESSAGE = `You are an education expert specializing in breaking down topics into subtopics.
Given a main topic, generate a list of related subtopics to create flashcards for.
Return a JSON array containing subtopics related to the main topic.
Keep the output format strictly as follows:
[
  {"topic": "first subtopic"},
  {"topic": "second subtopic"},
  ...
]
The subtopics should be diverse and cover different aspects of the main topic.
Keep each subtopic name VERY BRIEF (1-3 words maximum).
Ensure each subtopic is specific enough to create a meaningful flashcard.
Always return valid JSON format.`;

const FLASHCARD_SYSTEM_MESSAGE = `You are a flashcard generator specializing in educational content.
Create a detailed flashcard for learning the given word or concept.
Return a JSON structure with exactly this format:
{
  "term": "The word or concept itself (KEEP THIS SHORT, 1-3 words maximum)",
  "translation": "Translation or alternate name (or null if not applicable)",
  "partOfSpeech": "Part of speech for words (or null for concepts)",
  "definition": "A clear, concise definition",
  "example": "A practical example using the term"
}
Keep the content educational and accurate.
Ensure definitions are clear and examples are practical.
IMPORTANT: Keep the "term" field VERY SHORT (1-3 words maximum).
Always return valid JSON format.`;

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-flash-latest",
  maxOutputTokens: 2048,
  temperature: 0.3,
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const isGuest = !session?.user?.email;

  // Reject bulk generation for guests
  if (isGuest) {
    return NextResponse.json(
      {
        error:
          "Bulk flashcard generation is not available for guests. Please sign in to use this feature.",
      },
      { status: 401 }
    );
  }

  try {
    let topic = "";
    let count = 10;
    let subtopicsOnly = false;
    let createFolder = false;
    let pdfText = "";
    let context = "";
    const contentType = req.headers.get("content-type") || "";
    if (contentType.startsWith("multipart/form-data")) {
      const formData = await req.formData();
      topic = formData.get("topic")?.toString() || "";
      count = Number(formData.get("count")) || 10;
      subtopicsOnly = formData.get("subtopicsOnly") === "true";
      createFolder = formData.get("createFolder") === "true";
      const pdfFile = formData.get("pdf");
      if (pdfFile && typeof pdfFile === "object" && "arrayBuffer" in pdfFile) {
        const buffer = Buffer.from(await pdfFile.arrayBuffer());
        pdfText = await processPDF(buffer);
        context = pdfText.slice(0, 8000); // Limit context for LLM input
      }
    } else {
      const body = await req.json();
      topic = body.topic || "";
      count = body.count || 10;
      subtopicsOnly = body.subtopicsOnly || false;
      createFolder = body.createFolder || false;
      if (body.pdfText) {
        context = body.pdfText.slice(0, 8000);
      }
    }

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }
    if (!count || count < 1) {
      return NextResponse.json(
        { error: "Valid count is required" },
        { status: 400 }
      );
    }
    // Limit maximum count
    const adjustedCount = Math.min(count, 50);
    // Step 0: Get a short main topic from the LLM
    let mainTopicPrompt = `User query: ${topic}`;
    if (context) {
      mainTopicPrompt += `\nRelevant PDF Context:\n${context}`;
    }
    const mainTopicResponse = await llm.invoke([
      ["system", MAIN_TOPIC_SYSTEM_MESSAGE],
      ["human", mainTopicPrompt],
    ]);
    let mainTopic = String(mainTopicResponse.content)
      .replace(/\n/g, "")
      .replace(/^"|"$/g, "")
      .trim();
    if (!mainTopic) mainTopic = topic;
    // Step 1: Generate subtopics based on the main topic
    let subtopicsPrompt = `Generate ${adjustedCount} subtopics for the main topic: ${mainTopic}`;
    if (context) {
      subtopicsPrompt += `\nRelevant PDF Context:\n${context}`;
    }
    const subtopicsResponse = await llm.invoke([
      ["system", SUBTOPICS_SYSTEM_MESSAGE],
      ["human", subtopicsPrompt],
    ]);

    // Parse subtopics
    let subtopics: SubTopic[] = [];
    try {
      const responseText = String(subtopicsResponse.content);
      const jsonMatch =
        responseText.match(/```json\n([\s\S]*?)\n```/) ||
        responseText.match(/\[([\s\S]*?)\]/);

      const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : responseText;
      subtopics = JSON.parse(jsonStr) as SubTopic[];

      // Limit to the requested count
      subtopics = subtopics.slice(0, adjustedCount);

      if (subtopics.length === 0) {
        throw new Error("No valid subtopics generated");
      }

      // If only subtopics were requested, return them now
      if (subtopicsOnly) {
        return NextResponse.json({ subtopics });
      }
    } catch (parseError) {
      console.error("Failed to parse subtopics:", parseError);
      return NextResponse.json(
        { error: "Failed to generate valid subtopics" },
        { status: 500 }
      );
    }

    // --- Streaming response starts here ---
    let folderId: string | null = null;
    let folderSent = false;
    const folderCardIds: string[] = [];
    const folderName = mainTopic;

    const stream = new ReadableStream({
      async start(controller) {
        // Helper to send a JSON object as NDJSON
        const send = (obj: FlashCardFolder | { flashCard: FlashCard }) => {
          controller.enqueue(
            new TextEncoder().encode(JSON.stringify(obj) + "\n")
          );
        };

        // Create a folder for the flashcards if requested
        if (createFolder && !isGuest) {
          try {
            if (!session?.user) throw new Error("No user in session");
            const folder = await prisma.flashCardFolder.create({
              data: {
                name: folderName,
                userId: session.user.id,
              },
            });
            folderId = folder.id;
            folderSent = true;
            send({ folder: { id: folderId, name: folderName, cardIds: [] } });
          } catch (folderError) {
            console.error("Error creating folder:", folderError);
            // Continue without folder if creation fails
          }
        }

        // Step 2: Generate a flashcard for each subtopic
        for (const subtopic of subtopics) {
          try {
            let flashcardPrompt = `Generate a flashcard for the subtopic: \"${subtopic.topic}\" in the context of the main topic: \"${mainTopic}\". The definition and example should be specific to how \"${subtopic.topic}\" relates to \"${mainTopic}\". Do NOT give a generic definition, always use the main topic as context.`;
            if (context) {
              flashcardPrompt += `\nRelevant PDF Context:\n${context}`;
            }
            const flashcardResponse = await llm.invoke([
              ["system", FLASHCARD_SYSTEM_MESSAGE],
              ["human", flashcardPrompt],
            ]);

            const responseText = String(flashcardResponse.content);
            const jsonMatch =
              responseText.match(/```json\n([\s\S]*?)\n```/) ||
              responseText.match(/{[\s\S]*}/);

            const jsonStr = jsonMatch
              ? jsonMatch[1] || jsonMatch[0]
              : responseText;
            const parsedData = JSON.parse(jsonStr) as FlashCard;

            // Validate required fields
            const requiredFields = [
              "term",
              "definition",
              "example",
            ] as (keyof FlashCard)[];

            const missingFields = requiredFields.filter(
              (field) => !parsedData[field]
            );

            if (missingFields.length > 0) {
              console.warn(
                `Skipping card due to missing fields: ${missingFields.join(
                  ", "
                )}`
              );
              continue;
            }

            if (isGuest) {
              // For guest users, return flashcard without saving to database
              const guestFlashCard = {
                id: `guest_${Date.now()}_${Math.random()
                  .toString(36)
                  .substr(2, 9)}`,
                term: parsedData.term,
                translation: parsedData.translation,
                partOfSpeech: parsedData.partOfSpeech,
                definition: parsedData.definition,
                example: parsedData.example,
                tag: mainTopic,
                createdAt: new Date().toISOString(),
              };

              // Send the flashcard as soon as it's ready
              send({ flashCard: guestFlashCard });
              continue;
            }

            // Prepare flashcard data for authenticated users
            const flashCardData: {
              userId: string;
              term: string;
              translation: string | null;
              partOfSpeech: string | null;
              definition: string;
              example: string;
              folderId?: string;
              tag?: string;
            } = {
              userId: session!.user!.id,
              term: parsedData.term,
              translation: parsedData.translation,
              partOfSpeech: parsedData.partOfSpeech,
              definition: parsedData.definition,
              example: parsedData.example,
              tag: mainTopic, // Use main topic as tag for all generated cards
            };

            // Add folder ID if it exists
            if (folderId) {
              flashCardData.folderId = folderId;
            }

            // Save the flash card to the database
            const savedFlashCard = await prisma.flashCard.create({
              data: flashCardData,
            });

            // Track card IDs for folder
            if (folderId) {
              folderCardIds.push(savedFlashCard.id);
              // Send updated folder cardIds only once (on first card)
              if (folderSent && folderCardIds.length === 1) {
                send({
                  folder: {
                    id: folderId,
                    name: folderName,
                    cardIds: [savedFlashCard.id],
                  },
                });
              }
            }

            // Send the flashcard as soon as it's ready
            send({ flashCard: savedFlashCard });
          } catch (cardError) {
            console.error(
              `Error generating flashcard for subtopic ${subtopic.topic}:`,
              cardError
            );
            // Continue with next subtopic even if one fails
          }
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-store",
        Connection: "keep-alive",
        "Transfer-Encoding": "chunked",
      },
      status: 200,
    });
  } catch (error) {
    console.error("Error in bulk flashcard generation:", error);
    return NextResponse.json(
      { error: "Failed to generate flashcards" },
      { status: 500 }
    );
  }
}
