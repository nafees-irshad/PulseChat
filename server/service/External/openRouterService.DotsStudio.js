import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || process.env.OPEN_ROUTER_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

const MODEL = "dots-studio/dots-3-note-preview:free";

export async function streamReply(messages, onChunk) {
  const stream = await client.chat.completions.create({
    model: MODEL, 
    messages: messages.map(({ role, content }) => ({ role, content })),
    stream: true,
    temperature: 1,
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
