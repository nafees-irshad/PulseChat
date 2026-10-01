import {
  DEFAULT_MODEL,
  getProvider,
  streamWithFallback,
} from "../service/External/aiService.js";
import {
  createConversation,
  saveMessage,
  getMessages,
  getUserConversations,
  renameUserConversation,
  deleteUserConversation,
} from "../service/Data-Layer/chatHistory.js";
import { getDocumentById } from "../service/Data-Layer/documentHistory.js";

import { generateTitleFromText } from "../utils/generateTitleFromText.js";

const MODEL_NAMES = {
  gemini: "Gemini Flash",
  groq: "GPT-oss",
  glm: "Dots_Studio",
  gemma: "Gemma 4",
  laguna: "Laguna S 2.1",
  inclusionAI: "inclusionAI",
};
import { withDocumentContext } from "../service/External/pdfService.js";

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

export async function renameConversation(req, res) {
  const title =
    typeof req.body?.title === "string" ? req.body.title.trim() : "";
  if (!title) {
    return res.status(400).json({ error: "A title is required" });
  }
  if (title.length > 255) {
    return res
      .status(400)
      .json({ error: "Title must be 255 characters or fewer" });
  }

  try {
    const conversation = await renameUserConversation(
      req.user.id,
      req.params.id,
      title,
    );
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    return res.json(conversation);
  } catch (err) {
    console.error("renameConversation error:", err);
    return res.status(500).json({ error: "Failed to rename conversation" });
  }
}

export async function deleteConversation(req, res) {
  try {
    const deleted = await deleteUserConversation(req.user.id, req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    return res.status(204).end();
  } catch (err) {
    console.error("deleteConversation error:", err);
    return res.status(500).json({ error: "Failed to delete conversation" });
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
  const { conversationId, message, model, documentId } = req.body;

  if (!conversationId || !message) {
    return res
      .status(400)
      .json({ error: "conversationId and message are required" });
  }

  const requestedModel = model || DEFAULT_MODEL;
  if (!getProvider(requestedModel)) {
    return res
      .status(400)
      .json({ error: `Unsupported model: ${requestedModel}` });
  }

  try {
    // 1. Save the user's message (just the question, not the document)
    await saveMessage(conversationId, userId, "user", message);

    // 2. Fetch conversation history for context
    const dbMessages = await getMessages(conversationId, 20);

    // 3. If a documentId was sent, look up its stored text and attach it to the latest question
    let contextMessages = dbMessages;
    if (documentId) {
      const document = await getDocumentById(userId, documentId);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      contextMessages = withDocumentContext(dbMessages, document.text);
    }

    // 4. Set up SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    // 5. Stream the reply from the selected provider, with fallback
    const { text: fullReply, modelUsed } = await streamWithFallback(
      requestedModel,
      contextMessages,
      (chunkText) => {
        res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
      },
    );

    // 6. Save the complete assistant reply
    await saveMessage(
      conversationId,
      userId,
      "assistant",
      fullReply,
      MODEL_NAMES[modelUsed] || modelUsed,
      MODEL_NAMES[requestedModel] || requestedModel,
    );

    res.write(`data: ${JSON.stringify({ done: true, model: modelUsed })}\n\n`);
    res.end();
  } catch (err) {
    console.error("sendMessage error:", err);
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
