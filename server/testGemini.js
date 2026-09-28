import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const key = process.env.GEMINI_API_KEY;
console.log(
  "Key loaded:",
  key ? `${key.slice(0, 6)}... (length ${key.length})` : "MISSING",
);

const ai = new GoogleGenAI({ apiKey: key });
const start = Date.now();

try {
  const res = await ai.interactions.create({
    model: "gemini-3.8-flash",
    store: false,
    input: [
      {
        type: "user_input",
        content: [{ type: "text", text: "Say hi in one word" }],
      },
    ],
  });
  console.log("OK in", Date.now() - start, "ms:", res.output_text);
} catch (err) {
  console.error(
    "FAILED after",
    Date.now() - start,
    "ms:",
    err.message,
    err.cause?.code ?? "",
  );
}
