import { NextResponse } from "next/server";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { processPDF } from "@/utils/chatFunctions/pdf-utils";

const SUBTOPIC_SYSTEM_MESSAGE = `You are a helpful assistant. Given a topic and optional context, generate a list of 10 diverse, non-overlapping subtopics or key concepts that together cover the breadth of the topic at a high-school level. Use the provided context if available. Return only a JSON array of strings, no explanations.`;

const QUIZ_SYSTEM_MESSAGE = `You are a quiz generator. Generate a single multiple-choice quiz question on the given subtopic. The question should have strictly 4 options and specify the correct answer. For the question, also provide:
- an 'explanation' field: a concise explanation for the correct answer (1-2 sentences)
- a 'wrongExplanation' field: an object mapping each wrong option to a short explanation of why it is incorrect (1-2 sentences)
- Each option must be concise (ideally under 8 words) and short enough to fit comfortably in a single line in a quiz UI.
Use the provided context if available.
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
          const subtopicRes = await llm.invoke([
            ["system", SUBTOPIC_SYSTEM_MESSAGE.replace("10", String(count))],
            ["human", subtopicPrompt],
          ]);
          let subtopics: string[] = [];
          try {
            const contentStr = String(subtopicRes.content);
            const match = contentStr.match(/\[([\s\S]*?)\]/);
            const jsonStr = match ? match[0] : contentStr;
            subtopics = JSON.parse(jsonStr);
          } catch {
            controller.enqueue(
              encoder.encode(
                JSON.stringify({ error: "Failed to parse subtopics." }) + "\n"
              )
            );
            controller.close();
            return;
          }
          if (!Array.isArray(subtopics) || subtopics.length < count) {
            controller.enqueue(
              encoder.encode(
                JSON.stringify({
                  error: `Failed to generate ${count} subtopics.`,
                }) + "\n"
              )
            );
            controller.close();
            return;
          }
          // Step 2: For each subtopic, generate and stream a quiz question
          for (const subtopic of subtopics.slice(0, count)) {
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
