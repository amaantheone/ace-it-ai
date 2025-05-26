import { NextResponse } from "next/server";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";

const QUIZ_SYSTEM_MESSAGE = `You are a quiz generator. Generate 10 multiple-choice quiz questions on the given topic. Each question should have 4 options and specify the correct answer. For each question, also provide:
- an 'explanation' field: a concise explanation for the correct answer (1-2 sentences)
- a 'wrongExplanation' field: an object mapping each wrong option to a short explanation of why it is incorrect (1-2 sentences)
Return a JSON structure with exactly this format:
{
  "questions": [
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
    },
    ... (total 10 questions)
  ]
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
    const { topic = "General Knowledge" } = await req.json();
    const response = await llm.invoke([
      ["system", QUIZ_SYSTEM_MESSAGE],
      ["human", `Generate a quiz on: ${topic}`],
    ]);
    const responseText = String(response.content);
    const jsonMatch =
      responseText.match(/```json\n([\s\S]*?)\n```/) ||
      responseText.match(/{[\s\S]*}/);
    const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : responseText;
    let quiz;
    try {
      quiz = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse quiz output." },
        { status: 500 }
      );
    }
    return NextResponse.json(quiz);
  } catch {
    return NextResponse.json(
      { error: "Failed to generate quiz." },
      { status: 500 }
    );
  }
}
