import "dotenv/config";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0.5,
  maxOutputTokens: 2048,
  streaming: true,
});

const query =
  "Are you a multi-modal model?, what inputs do you take?, can you take a pdf file as input?";

// Using streaming
const stream = await llm.stream(query);

console.log(); // Add a newline for better formatting
for await (const chunk of stream) {
  // Print each chunk of the response as it arrives
  process.stdout.write(
    chunk.content instanceof Array ? chunk.content.join("") : chunk.content
  );
}