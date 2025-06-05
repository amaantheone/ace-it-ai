import { NextResponse } from "next/server";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { processPDF } from "@/utils/chatFunctions/pdf-utils";

// Dynamically generate the subtopic system message for the correct count
const SUBTOPIC_SYSTEM_MESSAGE_TEMPLATE = ({ count }: { count: number }) =>
  `You are a helpful assistant. Given a topic and optional context, generate a list of ${count} diverse, non-overlapping subtopics or key concepts that together cover the breadth of the topic at a BASIC introductory level suitable for 9th-10th grade students (ages 14-16). Focus on fundamental concepts, not advanced applications. Use the provided context if available. Return only a JSON array of strings, no explanations.`;

const QUIZ_SYSTEM_MESSAGE = `You are a quiz generator for 9th-10th grade students (ages 14-16). Generate a single multiple-choice quiz question on the given subtopic that tests BASIC understanding and factual recall, not complex analysis or application. The question should:
- Test fundamental concepts, definitions, or simple cause-and-effect relationships
- Avoid complex calculations, multi-step reasoning, or advanced terminology
- Be answerable by someone with basic introductory knowledge of the topic
- Have strictly 4 options with clear, simple language
- Use vocabulary appropriate for a 15-year-old student

For the question, also provide:
- an 'explanation' field: a simple explanation for the correct answer (1-2 sentences using basic language)
- a 'wrongExplanation' field: an object mapping each wrong option to a short explanation of why it is incorrect
- Each option must be concise (ideally under 8 words) and short enough to fit comfortably in a single line
Return a JSON object with exactly this format:
{
  "question": "Question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "answer": "Correct option text",
  "explanation": "Explanation for the correct answer.",
  "wrongExplanation": {
    "Option A": "Why A is wrong.",
    "Option B": "Why B is wrong.",
    ...
  }
}
Keep the questions clear, relevant, and at a high-school level. Always return valid JSON format.`;

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
    let topic = "General Knowledge";
    let pdfText = "";
    let context = "";
    let count = 10;
    // Check if the request is multipart (PDF upload)
    const contentType = req.headers.get("content-type") || "";
    if (contentType.startsWith("multipart/form-data")) {
      const formData = await req.formData();
      topic = formData.get("topic")?.toString() || topic;
      count = Math.max(10, Math.min(25, Number(formData.get("count")) || 10));
      const pdfFile = formData.get("pdf");
      if (pdfFile && typeof pdfFile === "object" && "arrayBuffer" in pdfFile) {
        const buffer = Buffer.from(await pdfFile.arrayBuffer());
        pdfText = await processPDF(buffer);
        context = pdfText.slice(0, 8000); // Limit context for LLM input
      }
    } else {
      // JSON body
      const body = await req.json();
      topic = body.topic || topic;
      count = Math.max(10, Math.min(25, Number(body.count) || 10));
      if (body.pdfText) {
        context = body.pdfText.slice(0, 8000);
      }
    }
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Step 1: Generate N diverse subtopics
          const subtopicPrompt = context
            ? `Topic: ${topic}\nContext: ${context}`
            : `Topic: ${topic}`;
          const subtopicSystemMessage = SUBTOPIC_SYSTEM_MESSAGE_TEMPLATE({
            count,
          });
          const subtopicRes = await llm.invoke([
            ["system", subtopicSystemMessage],
            ["human", subtopicPrompt],
          ]);
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
          } catch {
            controller.enqueue(
              encoder.encode(
                JSON.stringify({ error: "Failed to parse subtopics." }) + "\n"
              )
            );
            controller.close();
            return;
          }
          if (!Array.isArray(subtopics) || subtopics.length === 0) {
            controller.enqueue(
              encoder.encode(
                JSON.stringify({ error: `Failed to generate any subtopics.` }) +
                  "\n"
              )
            );
            controller.close();
            return;
          }
          if (subtopics.length < count) {
            controller.enqueue(
              encoder.encode(
                JSON.stringify({
                  warning: `Only generated ${subtopics.length} questions instead of requested ${count}.`,
                }) + "\n"
              )
            );
          }
          // Step 2: For each subtopic, generate and stream a quiz question
          for (const subtopic of subtopics) {
            const questionPrompt = context
              ? `Subtopic: ${subtopic}\nContext: ${context}`
              : `Subtopic: ${subtopic}`;
            const response = await llm.invoke([
              ["system", QUIZ_SYSTEM_MESSAGE],
              ["human", questionPrompt],
            ]);
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
            } catch {
              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    error: `Failed to parse question for subtopic: ${subtopic}`,
                  }) + "\n"
                )
              );
              controller.close();
              return;
            }
            controller.enqueue(
              encoder.encode(JSON.stringify({ question: questionObj }) + "\n")
            );
          }
          controller.close();
        } catch {
          controller.enqueue(
            encoder.encode(
              JSON.stringify({ error: "Failed to generate quiz." }) + "\n"
            )
          );
          controller.close();
        }
      },
    });
    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate quiz." },
      { status: 500 }
    );
  }
}
