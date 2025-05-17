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

    // Create a folder for the flashcards if requested
    let folderId: string | null = null;
    if (createFolder) {
      try {
        const folder = await prisma.flashCardFolder.create({
          data: {
            name: topic,
            userId: session.user.id,
          },
        });
        folderId = folder.id;
      } catch (folderError) {
        console.error("Error creating folder:", folderError);
        // Continue without folder if creation fails
      }
    }

    // Limit maximum count
    const adjustedCount = Math.min(count, 50);

    // Step 1: Generate subtopics based on the main topic
    const subtopicsResponse = await llm.invoke([
      ["system", SUBTOPICS_SYSTEM_MESSAGE],
      [
        "human",
        `Generate ${adjustedCount} subtopics for the main topic: ${topic}`,
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

    // Step 2: Generate a flashcard for each subtopic
    const flashCards: any[] = [];

    for (const subtopic of subtopics) {
      try {
        const flashcardResponse = await llm.invoke([
          ["system", FLASHCARD_SYSTEM_MESSAGE],
          ["human", `Generate a flashcard for: ${subtopic.topic}`],
        ]);

        const responseText = String(flashcardResponse.content);
        const jsonMatch =
          responseText.match(/```json\n([\s\S]*?)\n```/) ||
          responseText.match(/{[\s\S]*}/);

        const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : responseText;
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
            `Skipping card due to missing fields: ${missingFields.join(", ")}`
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
        } = {
          userId: session.user.id,
          term: parsedData.term,
          translation: parsedData.translation,
          partOfSpeech: parsedData.partOfSpeech,
          definition: parsedData.definition,
          example: parsedData.example,
        };

        // Add folder ID if it exists
        if (folderId) {
          flashCardData.folderId = folderId;
        }

        // Save the flash card to the database
        const savedFlashCard = await prisma.flashCard.create({
          data: flashCardData,
        });

        flashCards.push(savedFlashCard);
      } catch (cardError) {
        console.error(
          `Error generating flashcard for subtopic ${subtopic.topic}:`,
          cardError
        );
        // Continue with next subtopic even if one fails
      }
    }

    // Prepare the response
    const response: {
      flashCards: any[];
      folder?: { id: string; name: string; cardIds: string[] };
    } = {
      flashCards,
    };

    // If a folder was created, add it to the response
    if (folderId) {
      response.folder = {
        id: folderId,
        name: topic,
        cardIds: flashCards.map((card) => card.id),
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in bulk flashcard generation:", error);
    return NextResponse.json(
      { error: "Failed to generate flashcards" },
      { status: 500 }
    );
  }
}
