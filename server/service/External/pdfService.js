import { extractText, getDocumentProxy } from "unpdf";

const MAX_CHARS = 30000; // keep the prompt small; free-tier AI limits are tight

// Takes a PDF as a Buffer (from fs.readFile or multer) and returns its text.
export async function extractPdfText(buffer) {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { totalPages, text } = await extractText(pdf, { mergePages: true });

  const cleaned = text
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return {
    totalPages,
    text: cleaned.slice(0, MAX_CHARS),
    truncated: cleaned.length > MAX_CHARS,
    // almost no text per page usually means a scanned PDF (images only) that needs OCR
    isLikelyScanned: cleaned.length < totalPages * 50,
  };
}

// Returns a copy of the chat history where the latest user message carries the document.
// Nothing is saved to the DB, so history stays clean; the document is re-sent each request.
export function withDocumentContext(messages, docText) {
  const copy = messages.map((m) => ({ role: m.role, content: m.content }));

  for (let i = copy.length - 1; i >= 0; i--) {
    if (copy[i].role === "user") {
      copy[i].content =
        `Answer using the document below.\n\n<document>\n${docText.slice(0, MAX_CHARS)}\n</document>\n\nQuestion: ${copy[i].content}`;
      break;
    }
  }
  return copy;
}
