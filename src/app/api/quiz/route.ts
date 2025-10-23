import { NextResponse } from "next/server";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { processPDF } from "@/utils/chatFunctions/pdf-utils";

// Timeout wrapper to prevent infinite hangs
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Operation timed out after ${timeoutMs}ms`)),
        timeoutMs
      )
    ),
  ]);
};

// Dynamically generate the subtopic system message for the correct count
const SUBTOPIC_SYSTEM_MESSAGE_TEMPLATE = ({ count }: { count: number }) =>
  `You are a helpful assistant. Given a topic and optional context, generate a list of ${count} diverse, non-overlapping subtopics or key concepts that together cover the breadth of the topic at an accessible introductory level suitable for a broad range of learners. Focus on fundamental concepts and avoid niche advanced details. Use the provided context if available. Return only a JSON array of strings, no explanations.`;

const QUIZ_SYSTEM_MESSAGE = `Generate a clear multiple-choice question suitable for a broad range of learners. The question should test understanding of the given Subtopic in the context of the provided Main Topic.

Inputs you will receive:
- Main Topic
- Subtopic
- Optional Context (from PDF)

Requirements:
- Ensure the question clearly relates to the Main Topic (stay within its domain) while focusing on the Subtopic concept
- 4 clear, simple options
- Plain, age-agnostic language
- Emphasize fundamental concepts
- Short options (under 8 words each)

Return JSON format:
{
  "question": "Question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "answer": "Correct option text",
  "explanation": "Simple explanation (1-2 sentences)",
  "wrongExplanation": {
    "Wrong Option": "Why it's wrong"
  }
}`;

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-flash-latest",
  maxOutputTokens: 1024, // Reduced from 2048 for faster response
  temperature: 0.1, // Reduced from 0.3 for more consistent output
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    let topic = "General Knowledge";
    let pdfText = "";
    let context = "";
    const count = 10; // Fixed count of 10 questions

    // Check if the request is multipart (PDF upload)
    const contentType = req.headers.get("content-type") || "";
    console.log("Quiz generation started for topic:", topic);

    if (contentType.startsWith("multipart/form-data")) {
      const formData = await req.formData();
      topic = formData.get("topic")?.toString() || topic;
      const pdfFile = formData.get("pdf");

      if (pdfFile && typeof pdfFile === "object" && "arrayBuffer" in pdfFile) {
        console.log("Processing PDF file:", pdfFile.name || "unknown");
        try {
          const buffer = Buffer.from(await pdfFile.arrayBuffer());
          pdfText = await withTimeout(processPDF(buffer), 30000); // 30 second timeout for PDF processing
          context = pdfText.slice(0, 8000); // Limit context for LLM input
          console.log(
            "PDF processed successfully, extracted text length:",
            pdfText.length
          );
        } catch (pdfError) {
          console.error("PDF processing failed:", pdfError);
          if (
            pdfError instanceof Error &&
            pdfError.message.includes("timed out")
          ) {
            return NextResponse.json(
              {
                error:
                  "PDF processing timed out. Please try with a smaller file.",
              },
              { status: 408 }
            );
          }
          return NextResponse.json(
            {
              error:
                "Failed to process PDF file. Please ensure it's a valid PDF.",
            },
            { status: 400 }
          );
        }
      }
    } else {
      // JSON body
      const body = await req.json();
      topic = body.topic || topic;
      if (body.pdfText) {
        context = body.pdfText.slice(0, 8000);
      }
    }
    // Generate subtopics
    const subtopicPrompt = context
      ? `Topic: ${topic}\nContext: ${context}`
      : `Topic: ${topic}`;
    const subtopicSystemMessage = SUBTOPIC_SYSTEM_MESSAGE_TEMPLATE({ count });

    console.log("Generating subtopics for topic:", topic);
    let subtopicRes;
    try {
      subtopicRes = await withTimeout(
        llm.invoke([
          ["system", subtopicSystemMessage],
          ["human", subtopicPrompt],
        ]),
        30000 // 30 second timeout for subtopic generation (increased from 20s)
      );
    } catch (timeoutError) {
      console.error("Subtopic generation failed:", timeoutError);
      if (
        timeoutError instanceof Error &&
        timeoutError.message.includes("timed out")
      ) {
        return NextResponse.json(
          {
            error:
              "Quiz generation timed out. Please try again with a simpler topic.",
          },
          { status: 408 }
        );
      }
      return NextResponse.json(
        { error: "Failed to generate subtopics." },
        { status: 500 }
      );
    }

    let subtopics: string[] = [];
    try {
      const contentStr = String(subtopicRes.content);
      const match = contentStr.match(/\[([\s\S]*?)\]/);
      const jsonStr = match ? match[0] : contentStr;
      subtopics = JSON.parse(jsonStr);
      // Ensure subtopics is an array of strings and slice to count
      if (!Array.isArray(subtopics))
        throw new Error("Subtopics is not an array");
      subtopics = subtopics
        .filter((s) => typeof s === "string")
        .slice(0, count);
      console.log("Generated subtopics:", subtopics.length);
    } catch (parseError) {
      console.error("Failed to parse subtopics:", parseError);
      return NextResponse.json(
        { error: "Failed to parse subtopics." },
        { status: 500 }
      );
    }

    if (!Array.isArray(subtopics) || subtopics.length === 0) {
      console.error("No valid subtopics generated");
      return NextResponse.json(
        { error: `Failed to generate any subtopics.` },
        { status: 500 }
      );
    }
    // Generate questions for each subtopic with retry logic
    const questions: Record<string, unknown>[] = [];
    const maxRetries = 2;

    for (const subtopic of subtopics) {
      const questionPrompt = context
        ? `Main Topic: ${topic}\nSubtopic: ${subtopic}\nContext: ${context}`
        : `Main Topic: ${topic}\nSubtopic: ${subtopic}`;

      let questionGenerated = false;

      // Try generating question with retries
      for (
        let attempt = 1;
        attempt <= maxRetries && !questionGenerated;
        attempt++
      ) {
        try {
          console.log(
            `Generating question for subtopic "${subtopic}" (attempt ${attempt}/${maxRetries})`
          );

          const response = await withTimeout(
            llm.invoke([
              ["system", QUIZ_SYSTEM_MESSAGE],
              ["human", questionPrompt],
            ]),
            45000 // Increased to 45 second timeout per question
          );

          const responseText = String(response.content);
          const jsonMatch =
            responseText.match(/```json\n([\s\S]*?)\n```/) ||
            responseText.match(/{[\s\S]*}/);
          const jsonStr = jsonMatch
            ? jsonMatch[1] || jsonMatch[0]
            : responseText;

          let questionObj;
          try {
            questionObj = JSON.parse(jsonStr);
          } catch (parseError) {
            console.error(
              `Failed to parse question JSON for subtopic "${subtopic}" on attempt ${attempt}:`,
              parseError
            );
            continue; // Try again
          }

          questions.push(questionObj);
          questionGenerated = true;
          console.log(
            `Successfully generated question for subtopic "${subtopic}"`
          );
        } catch (questionError) {
          console.error(
            `Question generation failed for subtopic "${subtopic}" on attempt ${attempt}:`,
            questionError
          );

          if (attempt < maxRetries) {
            console.log(
              `Retrying question generation for subtopic "${subtopic}"...`
            );
            // Wait a bit before retrying
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
      }

      // If question generation failed after all retries, create a fallback question
      if (!questionGenerated) {
        console.log(`Creating fallback question for subtopic "${subtopic}"`);
        const fallbackQuestion = {
          question: `What is a key concept related to ${subtopic}?`,
          options: [
            "Basic understanding is important",
            "Advanced concepts only",
            "Not relevant to study",
            "Too complex to learn",
          ],
          answer: "Basic understanding is important",
          explanation: `Understanding the basics of ${subtopic} helps build foundational knowledge.`,
          wrongExplanation: {
            "Advanced concepts only":
              "Starting with basics is more effective than jumping to advanced concepts.",
            "Not relevant to study":
              "All fundamental concepts are relevant for learning.",
            "Too complex to learn":
              "Breaking down complex topics makes them easier to understand.",
          },
        };
        questions.push(fallbackQuestion);
        console.log(`Added fallback question for subtopic "${subtopic}"`);
      }
    }

    console.log(
      `Quiz generation completed: ${questions.length} questions generated`
    );
    return NextResponse.json({ questions });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate quiz." },
      { status: 500 }
    );
  }
}
