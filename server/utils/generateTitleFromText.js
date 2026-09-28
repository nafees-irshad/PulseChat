// Capitalizes the first letter of every word: "node js interview" -> "Node Js Interview"
// Only the first letter is changed, so words like "API" or "NodeJS" stay as typed.
export function toTitleCase(text) {
  return text.replace(/(^|\s)\S/g, (match) => match.toUpperCase());
}

// Simple, fast, no API cost — just trims the first message down to a short title.
export function generateTitleFromText(text, maxWords = 6) {
  if (!text || typeof text !== "string") return "New Chat";

  const cleaned = text.trim().replace(/\s+/g, " ");
  const words = cleaned.split(" ");

  if (words.length <= maxWords) {
    return toTitleCase(cleaned);
  }

  return toTitleCase(words.slice(0, maxWords).join(" ")) + "...";
}

// Smarter version — asks Gemini to summarize the message into a short title.
export async function generateAITitle(ai, message) {
  try {
    const interaction = await ai.interactions.create({
      model: "gemini-3.8-flash",
      store: false,
      input: [
        {
          type: "user_input",
          content: [
            {
              type: "text",
              text: `Summarize this message into a short chat title (max 6 words, no punctuation at the end, no quotes):\n\n"${message}"`,
            },
          ],
        },
      ],
    });

    const title = interaction.output_text?.trim();
    return title ? toTitleCase(title) : generateTitleFromText(message);
  } catch (err) {
    console.error("generateAITitle error, falling back to simple title:", err);
    return generateTitleFromText(message);
  }
}
