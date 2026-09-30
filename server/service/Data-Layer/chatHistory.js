import db from "../../models/index.js";

const { Conversation, Message } = db;

export async function createConversation(userId, title = null) {
  return Conversation.create({ userId, title });
}

export async function saveMessage(
  conversationId,
  userId,
  role,
  content,
  model = null,
  requestedModel = null,
) {
  return Message.create({
    conversationId,
    userId,
    role,
    content,
    model,
    requestedModel,
  });
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

export async function renameUserConversation(userId, conversationId, title) {
  const conversation = await Conversation.findOne({
    where: { id: conversationId, userId },
  });
  if (!conversation) return null;

  conversation.title = title;
  await conversation.save();
  return conversation;
}

export async function deleteUserConversation(userId, conversationId) {
  const deletedCount = await Conversation.destroy({
    where: { id: conversationId, userId },
  });
  return deletedCount > 0;
}
