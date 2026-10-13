import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || process.env.OPEN_ROUTER_KEY,
  timeout: 120_000,
});

const MODEL = "apodex/apodex-1.1-mini:free";

export const firstChunkTimeoutMs = 120_000;

export async function streamReply(messages, onChunk) {
  const stream = await client.chat.completions.create({
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
    stream: true,
    reasoning: { enabled: true },
  });

  let fullText = "";
  let reasoningDetails = null;

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta;
    const text = delta?.content;
    if (typeof text === "string" && text.length > 0) {
      fullText += text;
      onChunk(text);
    }

    const reasoningDelta = delta?.reasoning_details;
    if (Array.isArray(reasoningDelta)) {
      reasoningDetails = [
        ...(Array.isArray(reasoningDetails) ? reasoningDetails : []),
        ...reasoningDelta,
      ];
    } else if (reasoningDelta != null) {
      reasoningDetails = reasoningDelta;
    }
  }

  if (!fullText) {
    throw new Error("Apodex returned no assistant message content");
  }

  return {
    text: fullText,
    reasoningDetails,
  };
}
