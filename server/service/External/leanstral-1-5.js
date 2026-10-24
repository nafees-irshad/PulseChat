import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.REQUESTY_API_KEY,
  baseURL: "https://router.requesty.ai/v1",
  timeout: 120_000,
});

const MODEL = "leanstral-1-5";

export const firstChunkTimeoutMs = 120_000;

export async function streamReply(messages, onChunk) {
  const stream = await client.chat.completions.create({
    model: MODEL,
    messages: messages.map(({ role, content }) => ({ role, content })),
    stream: true,
  });

  let fullText = "";

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content;
    if (typeof text === "string" && text.length > 0) {
      fullText += text;
      onChunk(text);
    }
  }

  if (!fullText.trim()) {
    throw new Error("Leanstral 1.5 returned no assistant message content");
  }

  return fullText;
}