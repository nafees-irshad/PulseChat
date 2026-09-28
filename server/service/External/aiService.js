import * as gemini from "./geminiservice.js"; // match your exact filename
import * as groq from "./groqService.js";

const providers = { gemini, groq };

export const DEFAULT_MODEL = process.env.DEFAULT_MODEL || "gemini";
const FIRST_CHUNK_TIMEOUT_MS = 15000; // give up on a model that sends nothing for 15s

export function getProvider(name = DEFAULT_MODEL) {
  return providers[name] ?? null;
}

// Tries the preferred model first, then the others in order.
// Returns { text, modelUsed }.
export async function streamWithFallback(
  preferred = DEFAULT_MODEL,
  messages,
  onChunk,
) {
  const order = [
    preferred,
    ...Object.keys(providers).filter((name) => name !== preferred),
  ];

  let lastError;

  for (const name of order) {
    let started = false; // has this model already sent text to the client?
    let abandoned = false; // did we give up on it (timeout)?
    let timer;

    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => {
        abandoned = true;
        reject(new Error(`${name} timed out`));
      }, FIRST_CHUNK_TIMEOUT_MS);
    });

    const run = providers[name].streamReply(messages, (chunk) => {
      if (abandoned) return; // ignore late chunks from a model we gave up on
      started = true;
      clearTimeout(timer);
      onChunk(chunk);
    });
    run.catch((e) => console.error(`${name} underlying error:`, e.message)); // avoids an unhandled rejection if the timeout wins

    try {
      const text = await Promise.race([run, timeout]);
      return { text, modelUsed: name };
    } catch (err) {
      console.error(`${name} failed:`, err.message);
      lastError = err;

      // Text already reached the client, so we can't cleanly retry
      if (started) throw err;
      // otherwise loop on to the next model
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError; // every model failed
}
