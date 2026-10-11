import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || process.env.OPEN_ROUTER_KEY,
  timeout: 120_000,
});

const MODEL = "apodex/apodex-1.1-mini:free";

export const firstChunkTimeoutMs = 120_000;

export async function streamReply(messages, onChunk) {
  const apiResponse = await client.chat.completions.create({
    model: MODEL,
    messages: messages.map(
      ({ role, content, reasoningDetails, reasoning_details }) => ({
        role,
        content,
        ...((reasoningDetails ?? reasoning_details) != null
          ? { reasoning_details: reasoningDetails ?? reasoning_details }
          : {}),
      }),
    ),
    reasoning: { enabled: true },
  });

  const response = apiResponse.choices[0]?.message;
  const text = response?.content;
  if (typeof text !== "string") {
    throw new Error("Apodex returned no assistant message content");
  }

  onChunk(text);
  return {
    text,
    reasoningDetails: response.reasoning_details ?? null,
  };
}