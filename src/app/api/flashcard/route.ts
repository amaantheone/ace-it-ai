import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

interface FlashCard {
  term: string;
  translation: string | null;
  partOfSpeech: string | null;
  definition: string;
  example: string;
  tag?: string | null;
}

const FLASHCARD_SYSTEM_MESSAGE = `You are a flashcard generator specializing in educational content.
Create a detailed flashcard for learning the given word or concept.
Return a JSON structure with exactly this format:
{
  "term": "The word or concept itself (KEEP THIS SHORT, 1-3 words maximum)",
  "translation": "Translation or alternate name (or null if not applicable)",
  "partOfSpeech": "Part of speech for words (or null for concepts)",
  "definition": "A clear, concise definition",
  "example": "A practical example using the term",
  "tag": "A generic subject for this flashcard, such as 'Maths', 'Science', 'English', 'Geography', etc. (1-2 words, Title Case, do not use subtopics or specific terms)"
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
    const { topic } = await req.json(); // removed folderId since it's unused

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const response = await llm.invoke([
      ["system", FLASHCARD_SYSTEM_MESSAGE],
      ["human", `Generate a flashcard for: ${topic}`],
    ]);

    // Parse the response to ensure it's valid JSON
    let flashCard: FlashCard;
    try {
      const responseText = String(response.content);
      const jsonMatch =
        responseText.match(/```json\n([\s\S]*?)\n```/) ||
        responseText.match(/{[\s\S]*}/);

      const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : responseText;
      flashCard = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse flashcard data" },
        { status: 500 }
      );
    }

    // Validate required fields
    const requiredFields = [
      "term",
      "definition",
      "example",
    ] as (keyof FlashCard)[];
    const missingFields = requiredFields.filter((field) => !flashCard[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // Find or create the 'Uncategorized' folder for this user
    let uncategorizedFolder = await prisma.flashCardFolder.findFirst({
      where: {
        userId: session.user.id,
        name: "Uncategorized",
      },
    });
    if (!uncategorizedFolder) {
      uncategorizedFolder = await prisma.flashCardFolder.create({
        data: {
          name: "Uncategorized",
          userId: session.user.id,
        },
      });
    }

    const flashCardData = {
      userId: session.user.id,
      term: flashCard.term,
      translation: flashCard.translation,
      partOfSpeech: flashCard.partOfSpeech,
      definition: flashCard.definition,
      example: flashCard.example,
      tag: flashCard.tag || null, // Use the LLM-provided tag (subject)
      folderId: uncategorizedFolder.id,
    };

    // Save the flash card to the database
    const savedFlashCard = await prisma.flashCard.create({
      data: flashCardData,
    });

    return NextResponse.json({ flashCard: savedFlashCard });
  } catch (error) {
    console.error("Error generating flashcard:", error);
    return NextResponse.json(
      { error: "Failed to generate flashcard" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const flashCards = await prisma.flashCard.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ flashCards });
  } catch (error) {
    console.error("Error fetching flash cards:", error);
    return NextResponse.json(
      { error: "Failed to fetch flash cards" },
      { status: 500 }
    );
  }
}
