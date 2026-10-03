import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPEN_ROUTER_KEY,
});

const MODEL = "inclusionai/ling-3.0-flash-sante:free";

export async function streamReply(messages, onChunk) {
  const stream = await client.chat.completions.create({
    model: MODEL,
    messages: messages.map(({ role, content }) => ({ role, content })),
    stream: true,
    reasoning: { enabled: true },
  });

  let fullText = "";

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content;
    if (typeof text === "string" && text.length > 0) {
      fullText += text;
      onChunk(text);
    }
  } 

  return fullText;
}
