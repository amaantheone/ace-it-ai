import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

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

async function testSubtopics() {
  const llm = new ChatGoogleGenerativeAI({
    model: "gemini-flash-latest",
    maxOutputTokens: 2048,
    temperature: 0.3,
  });

  try {
    const topic = "Physics";
    const count = 5;
    let subtopics = [];

    const subtopicsPrompt = `Generate ${count} subtopics for the main topic: ${topic}`;

    console.log("Sending prompt:", subtopicsPrompt);

    const subtopicsResponse = await llm.invoke([
      ["system", SUBTOPICS_SYSTEM_MESSAGE],
      ["human", subtopicsPrompt],
    ]);

    console.log("Raw response:", String(subtopicsResponse.content));

    // Parse subtopics - updated logic as in the fixed route
    const responseText = String(subtopicsResponse.content);
    console.log("Checking for code blocks...");

    // First try to extract from code blocks
    const codeBlockMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
    if (codeBlockMatch) {
      console.log("Found code block match");
      const jsonStr = codeBlockMatch[1];
      console.log("Extracted JSON string:", jsonStr);
      subtopics = JSON.parse(jsonStr);
    } else {
      console.log("No code block, trying array match...");
      // Try to extract JSON array directly
      const arrayMatch = responseText.match(/\[[\s\S]*?\]/);
      if (arrayMatch) {
        console.log("Found array match");
        const jsonStr = arrayMatch[0];
        console.log("Extracted JSON string:", jsonStr);
        subtopics = JSON.parse(jsonStr);
      } else {
        console.log("No array match, using entire response...");
        // Fall back to treating the entire response as JSON
        subtopics = JSON.parse(responseText);
      }
    }
    console.log("Parsed subtopics:", subtopics);

    if (subtopics.length === 0) {
      throw new Error("No valid subtopics generated");
    }

    console.log("Success! Generated", subtopics.length, "subtopics");

  } catch (error) {
    console.error("Error:", error);
    console.error("Full error details:", error.message);
  }
}

testSubtopics();