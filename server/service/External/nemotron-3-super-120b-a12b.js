import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.REQUESTY_API_KEY,
  baseURL: "https://router.requesty.ai/v1",
  timeout: 120_000,
});

const MODEL = "nvidia/nemotron-3-super-120b-a12b";

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

  if (!fullText) {
    throw new Error("Nemotron returned no assistant message content");
  }

  return fullText;
}