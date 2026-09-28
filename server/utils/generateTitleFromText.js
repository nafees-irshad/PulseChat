// Simple, fast, no API cost — just trims the first message down to a short title.
// Good enough for most cases and doesn't burn a Gemini call just to make a title.
export function generateTitleFromText(text, maxWords = 6) {
  if (!text || typeof text !== 'string') return 'New Chat';

  const cleaned = text.trim().replace(/\s+/g, ' ');
  const words = cleaned.split(' ');

  if (words.length <= maxWords) {
    return cleaned;
  }

  return words.slice(0, maxWords).join(' ') + '...';
}

// Smarter version — asks Gemini to summarize the message into a short title.
// Costs an extra API call, so only use this if you want ChatGPT-style smart titles.
// Requires geminiService's `ai` client — import it separately where used.
export async function generateAITitle(ai, message) {
  try {
    const interaction = await ai.interactions.create({
      model: 'gemini-3.8-flash',
      store: false,
      input: [
        {
          type: 'user_input',
          content: [
            {
              type: 'text',
              text: `Summarize this message into a short chat title (max 6 words, no punctuation at the end, no quotes):\n\n"${message}"`,
            },
          ],
        },
      ],
    });

    const title = interaction.output_text?.trim();
    return title || generateTitleFromText(message);
  } catch (err) {
    console.error('generateAITitle error, falling back to simple title:', err);
    return generateTitleFromText(message); // fallback if the API call fails
  }
}