import { NextResponse } from "next/server";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { processPDF } from "@/utils/chatFunctions/pdf-utils";

// Timeout wrapper to prevent infinite hangs for each step
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
  `You are a helpful assistant. Given a topic and optional context, generate a list of ${count} diverse, non-overlapping subtopics or key concepts that together cover the breadth of the topic at a BASIC introductory level suitable for 9th-10th grade students (ages 14-16). Focus on fundamental concepts, not advanced applications. Use the provided context if available. Return only a JSON array of strings, no explanations.`;

const QUIZ_SYSTEM_MESSAGE = `Generate a simple multiple-choice question for 9th-10th grade students. The question should test basic understanding of the given subtopic.

Requirements:
- 4 clear, simple options
- Basic vocabulary (15-year-old level)
- Test fundamental concepts only
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
  model: "gemini-2.0-flash",
  maxOutputTokens: 1024, // Reduced for faster response
  temperature: 0.1, // Reduced for more consistent output
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

    // Parse request data - handle both multipart and JSON
    const contentType = req.headers.get("content-type") || "";

    if (contentType.startsWith("multipart/form-data")) {
      const formData = await req.formData();
      topic = formData.get("topic")?.toString() || topic;
      const pdfFile = formData.get("pdf");

      if (pdfFile && typeof pdfFile === "object" && "arrayBuffer" in pdfFile) {
        console.log(
          "Processing PDF file for streaming quiz:",
          pdfFile.name || "unknown"
        );
        try {
          const buffer = Buffer.from(await pdfFile.arrayBuffer());
          pdfText = await withTimeout(processPDF(buffer), 25000); // 25 second timeout for PDF processing
          context = pdfText.slice(0, 8000); // Limit context for LLM input
          console.log(
            "PDF processed successfully, extracted text length:",
            pdfText.length
          );
        } catch (pdfError) {
          console.error("PDF processing failed:", pdfError);
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

    // Types for streaming responses
    interface StreamResponse {
      status: string;
      data?: {
        subtopics?: string[];
        question?: Record<string, unknown>;
        current?: number;
        total?: number;
        subtopic?: string;
        fallback?: boolean;
        timeout?: boolean;
        questions?: Record<string, unknown>[];
        totalGenerated?: number;
      };
      error?: string;
    }

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const send = (obj: StreamResponse) => {
          controller.enqueue(
            new TextEncoder().encode(JSON.stringify(obj) + "\n")
          );
        };

        try {
          // Step 1: Generate subtopics
          send({ status: "generating_subtopics" });

          const subtopicPrompt = context
            ? `Topic: ${topic}\nContext: ${context}`
            : `Topic: ${topic}`;
          const subtopicSystemMessage = SUBTOPIC_SYSTEM_MESSAGE_TEMPLATE({
            count,
          });

          const subtopicRes = await withTimeout(
            llm.invoke([
              ["system", subtopicSystemMessage],
              ["human", subtopicPrompt],
            ]),
            20000 // 20 second timeout for subtopic generation
          );

          let subtopics: string[] = [];
          try {
            // Safely convert content to string with additional checks
            let contentStr;
            if (typeof subtopicRes.content === "string") {
              contentStr = subtopicRes.content;
            } else if (Array.isArray(subtopicRes.content)) {
              // Handle case where content is an array of message parts
              contentStr = subtopicRes.content
                .map((part) =>
                  typeof part === "string"
                    ? part
                    : part && typeof part === "object" && "text" in part
                    ? part.text
                    : String(part)
                )
                .join("");
            } else {
              contentStr = String(subtopicRes.content || "");
            }

            console.log("Subtopic LLM response:", contentStr);

            if (!contentStr || contentStr.length === 0) {
              throw new Error("Empty content received from LLM");
            }

            // Try to find JSON array in the response with more robust parsing
            let jsonStr = "";
            const arrayMatch = contentStr.match(/\[([\s\S]*?)\]/);
            if (arrayMatch) {
              jsonStr = arrayMatch[0];
            } else {
              // Try to extract JSON from markdown code blocks
              const codeBlockMatch = contentStr.match(
                /```(?:json)?\s*(\[[\s\S]*?\])\s*```/
              );
              if (codeBlockMatch) {
                jsonStr = codeBlockMatch[1];
              } else {
                // Fall back to the entire content if it looks like JSON
                jsonStr = contentStr.trim();
              }
            }

            if (!jsonStr) {
              throw new Error("No JSON array found in response");
            }

            subtopics = JSON.parse(jsonStr);
            if (!Array.isArray(subtopics)) {
              throw new Error("Parsed content is not an array");
            }

            // Filter out any non-string items and limit to count
            subtopics = subtopics
              .filter((s) => typeof s === "string" && s.trim().length > 0)
              .slice(0, count);
          } catch (parseError) {
            console.error("Subtopic parsing error:", parseError);
            console.error("Raw response:", subtopicRes);

            // Fallback to default subtopics based on topic
            subtopics = [
              `Introduction to ${topic}`,
              `Basic concepts of ${topic}`,
              `Key principles of ${topic}`,
              `Applications of ${topic}`,
              `Fundamentals of ${topic}`,
              `History of ${topic}`,
              `Types of ${topic}`,
              `Benefits of ${topic}`,
              `Examples of ${topic}`,
              `Future of ${topic}`,
            ].slice(0, count);
          }

          if (subtopics.length === 0) {
            send({
              status: "error",
              error: "Failed to generate any valid subtopics",
            });
            controller.close();
            return;
          }

          // Notify client that subtopics are ready
          send({
            status: "subtopics_generated",
            data: {
              subtopics: subtopics,
            },
          });

          // Step 2: Generate a question for each subtopic
          const questions = [];

          for (let i = 0; i < subtopics.length; i++) {
            const subtopic = subtopics[i];
            send({
              status: "generating_question",
              data: {
                current: i + 1,
                total: subtopics.length,
                subtopic: subtopic,
              },
            });

            try {
              const questionPrompt = context
                ? `Subtopic: ${subtopic}\nContext: ${context}`
                : `Subtopic: ${subtopic}`;

              // Generate question with timeout
              const response = await withTimeout(
                llm.invoke([
                  ["system", QUIZ_SYSTEM_MESSAGE],
                  ["human", questionPrompt],
                ]),
                30000 // 30s timeout per question
              );

              if (!response || !response.content) {
                throw new Error("No content received from LLM for question");
              }

              // Safely convert response content to string
              let responseText;
              if (typeof response.content === "string") {
                responseText = response.content;
              } else if (Array.isArray(response.content)) {
                responseText = response.content
                  .map((part) =>
                    typeof part === "string"
                      ? part
                      : part && typeof part === "object" && "text" in part
                      ? part.text
                      : String(part)
                  )
                  .join("");
              } else {
                responseText = String(response.content || "");
              }

              console.log(`Question ${i + 1} LLM response:`, responseText);

              if (!responseText || responseText.length === 0) {
                throw new Error("Empty response content received");
              }

              // Extract and parse JSON from the response
              const jsonMatch =
                responseText.match(/```json\n([\s\S]*?)\n```/) ||
                responseText.match(/{[\s\S]*}/);
              const jsonStr = jsonMatch
                ? jsonMatch[1] || jsonMatch[0]
                : responseText;

              let questionObj;
              try {
                questionObj = JSON.parse(jsonStr);
                // Validate the question object structure
                if (
                  !questionObj.question ||
                  !questionObj.options ||
                  !Array.isArray(questionObj.options) ||
                  !questionObj.answer
                ) {
                  throw new Error("Invalid question object structure");
                }

                questionObj.questionIndex = i;
                questions.push(questionObj);

                // Send question back as it's generated
                send({
                  status: "question_generated",
                  data: {
                    question: questionObj,
                    current: i + 1,
                    total: subtopics.length,
                  },
                });
              } catch (parseError) {
                console.error(`Question ${i + 1} parsing error:`, parseError);

                // Create fallback question
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
                      "Starting with basics is more effective.",
                    "Not relevant to study":
                      "All fundamental concepts are relevant.",
                    "Too complex to learn":
                      "Breaking down topics makes them easier.",
                  },
                  questionIndex: i,
                };

                questions.push(fallbackQuestion);
                send({
                  status: "question_generated",
                  data: {
                    question: fallbackQuestion,
                    current: i + 1,
                    total: subtopics.length,
                    fallback: true,
                  },
                });
              }
            } catch (questionError) {
              console.error(
                `Question generation error for subtopic ${subtopic}:`,
                questionError
              );

              // Create fallback question on timeout or other error
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
                    "Starting with basics is more effective.",
                  "Not relevant to study":
                    "All fundamental concepts are relevant.",
                  "Too complex to learn":
                    "Breaking down topics makes them easier.",
                },
                questionIndex: i,
              };

              questions.push(fallbackQuestion);
              send({
                status: "question_generated",
                data: {
                  question: fallbackQuestion,
                  current: i + 1,
                  total: subtopics.length,
                  fallback: true,
                  timeout: true,
                },
              });
            }
          }

          // Send completion
          send({
            status: "completed",
            data: {
              questions,
              totalGenerated: questions.length,
            },
          });
        } catch (error) {
          console.error("Streaming quiz generation error:", error);
          send({
            status: "error",
            error:
              error instanceof Error
                ? error.message
                : "Failed to generate quiz",
          });
        } finally {
          controller.close();
        }
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
    console.error("Quiz streaming setup error:", error);
    return NextResponse.json(
      { error: "Failed to start quiz generation" },
      { status: 500 }
    );
  }
}
