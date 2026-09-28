import {
  getProvider,
  streamWithFallback,
} from "../service/External/aiService.js";
import {
  createConversation,
  saveMessage,
  getMessages,
  getUserConversations,
} from "../service/Data-Layer/chatHistory.js";

import { generateTitleFromText } from "../utils/generateTitleFromText.js";

// POST /api/conversations
export async function startConversation(req, res) {
  try {
    const userId = req.user.id; // set by your auth middleware
    const { title, message } = req.body;

    // If no title given, derive one from the first message (if provided),
    // otherwise fall back to a generic default.
    const finalTitle =
      title || (message ? generateTitleFromText(message) : "New Chat");

    const conversation = await createConversation(userId, finalTitle);
    res.status(201).json(conversation);
  } catch (err) {
    console.error("startConversation error:", err);
    res.status(500).json({ error: "Failed to create conversation" });
  }
}

// GET /api/conversations
export async function listConversations(req, res) {
  try {
    const userId = req.user.id;
    const conversations = await getUserConversations(userId);
    res.json(conversations);
  } catch (err) {
    console.error("listConversations error:", err);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
}

// GET /api/conversations/:id/messages
export async function getConversationMessages(req, res) {
  try {
    const conversationId = req.params.id;
    const messages = await getMessages(conversationId, 50);
    res.json(messages);
  } catch (err) {
    console.error("getConversationMessages error:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
}

// POST /api/chat  (SSE streaming endpoint)
export async function sendMessage(req, res) {
  const userId = req.user.id;
  const { conversationId, message, model } = req.body;

  if (!conversationId || !message) {
    return res
      .status(400)
      .json({ error: "conversationId and message are required" });
  }

  // Pick the AI provider ("gemini" by default, or "groq")
  const provider = getProvider(model);
  if (!provider) {
    return res.status(400).json({ error: `Unsupported model: ${model}` });
  }

  try {
    // 1. Save the user's message
    await saveMessage(conversationId, userId, "user", message);

    // 2. Fetch conversation history for context
    const dbMessages = await getMessages(conversationId, 20);

    // 3. Set up SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    // 4. Stream the selected model's reply, forwarding each chunk to the client
    const { text: fullReply, modelUsed } = await streamWithFallback(
      model,
      dbMessages,
      (chunkText) => {
        res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
      },
    );
    // 5. Save the complete assistant reply once streaming is done
    await saveMessage(conversationId, userId, "assistant", fullReply);

    // 6. Signal completion and close the stream
    res.write(`data: ${JSON.stringify({ done: true, model: modelUsed })}\n\n`);
    res.end();
  } catch (err) {
    console.error("sendMessage error:", err);
    // If headers already sent (stream started), send an SSE error event instead of JSON
    if (res.headersSent) {
      res.write(
        `data: ${JSON.stringify({ error: "Something went wrong" })}\n\n`,
      );
      res.end();
    } else {
      res.status(500).json({ error: "Failed to process message" });
    }
  }
}
