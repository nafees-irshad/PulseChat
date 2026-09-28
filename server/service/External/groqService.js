import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b"; // check console.groq.com/docs/models if this stops working

function formatHistoryForGroq(messages) {
  return messages.map((m) => ({ role: m.role, content: m.content }));
}

export async function streamReply(messages, onChunk) {
  const stream = await groq.chat.completions.create({
    model: MODEL,
    messages: formatHistoryForGroq(messages),
    stream: true,
  });

  let fullText = "";

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content;
    if (text) {
      fullText += text;
      onChunk(text);
    }
  }

  return fullText;
}
