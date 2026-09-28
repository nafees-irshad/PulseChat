import db from "../../models/index.js";

const { Conversation, Message } = db;

export async function createConversation(userId, title = null) {
  return Conversation.create({ userId, title });
}

export async function saveMessage(conversationId, userId, role, content) {
  return Message.create({ conversationId, userId, role, content });
}

// Fetch history in chronological order (oldest -> newest) for sending to LLM
export async function getMessages(conversationId, limit = 20) {
  const messages = await Message.findAll({
    where: { conversationId },
    order: [["createdAt", "DESC"]],
    limit,
  });
  return messages.reverse();
}

export async function getUserConversations(userId) {
  return Conversation.findAll({
    where: { userId },
    order: [["updatedAt", "DESC"]],
  });
}
