import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

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
    const { topic, count, subtopicsOnly, createFolder } = await req.json();

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
    const mainTopicResponse = await llm.invoke([
      ["system", MAIN_TOPIC_SYSTEM_MESSAGE],
      ["human", `User query: ${topic}`],
    ]);
    let mainTopic = String(mainTopicResponse.content)
      .replace(/\n/g, "")
      .replace(/^"|"$/g, "")
      .trim();
    if (!mainTopic) mainTopic = topic;

    // Step 1: Generate subtopics based on the main topic
    const subtopicsResponse = await llm.invoke([
      ["system", SUBTOPICS_SYSTEM_MESSAGE],
      [
        "human",
        `Generate ${adjustedCount} subtopics for the main topic: ${mainTopic}`,
      ],
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
    let folderCardIds: string[] = [];
    let folderName = mainTopic;

    const stream = new ReadableStream({
      async start(controller) {
        // Helper to send a JSON object as NDJSON
        const send = (obj: any) => {
          controller.enqueue(
            new TextEncoder().encode(JSON.stringify(obj) + "\n")
          );
        };

        // Create a folder for the flashcards if requested
        if (createFolder) {
          try {
            if (!session.user) throw new Error("No user in session");
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
            if (!session.user) throw new Error("No user in session");
            const flashcardResponse = await llm.invoke([
              ["system", FLASHCARD_SYSTEM_MESSAGE],
              [
                "human",
                `Generate a flashcard for the subtopic: \"${subtopic.topic}\" in the context of the main topic: \"${mainTopic}\". The definition and example should be specific to how \"${subtopic.topic}\" relates to \"${mainTopic}\". Do NOT give a generic definition, always use the main topic as context.`,
              ],
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

            // Prepare flashcard data
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
              userId: session.user.id,
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
