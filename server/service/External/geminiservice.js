import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MODEL = "gemini-3.8-flash"; // current model as of Sep 2026 — check ai.google.dev if this changes again

// Interactions API uses 'user_input' / 'model_output' step types instead of 'user'/'model' roles
function toInteractionType(role) {
  return role === "assistant" ? "model_output" : "user_input";
}

// Convert our stored messages [{role, content}] into the Interactions API's `input` format
export function formatHistoryForGemini(messages) {
  return messages
    .filter((m) => m.role !== "system") // handle system prompts separately if needed
    .map((m) => ({
      type: toInteractionType(m.role),
      content: [{ type: "text", text: m.content }],
    }));
}

// Streams a reply. Calls onChunk(text) for every piece of text as it arrives.
// Returns the full concatenated text once the stream ends.
export async function streamGeminiReply(history, onChunk) {
  const stream = await ai.interactions.create({
    model: MODEL,
    store: false, // stateless — we send full history ourselves each time
    input: history,
    stream: true,
  });

  let fullText = "";

  for await (const event of stream) {
    if (event.event_type === "step.delta" && event.delta?.type === "text") {
      const text = event.delta.text;
      fullText += text;
      onChunk(text);
    }
  }

  return fullText;
}

export async function streamReply(messages, onChunk) {
  return streamGeminiReply(formatHistoryForGemini(messages), onChunk);
}
