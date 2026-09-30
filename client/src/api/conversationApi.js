import api from "./index";
import API_ENDPOINTS from "./endpoints";

// Create a new conversation
export async function startConversation(data) {
  const response = await api.post(
    API_ENDPOINTS.CONVERSATION.START_CONVERSATION,
    data,
  );

  return response.data;
}

// Get all conversations for sidebar
export async function listConversations() {
  const response = await api.get(API_ENDPOINTS.CONVERSATION.LIST_CONVERSATIONS);

  return response.data;
}

// Get messages of one conversation
export async function getConversationMessages(id) {
  const response = await api.get(API_ENDPOINTS.CONVERSATION.GET_MESSAGES(id));

  return response.data;
}

export async function renameConversation(id, title) {
  const response = await api.patch(
    API_ENDPOINTS.CONVERSATION.RENAME_CONVERSATION(id),
    { title },
  );

  return response.data;
}

export async function deleteConversation(id) {
  await api.delete(API_ENDPOINTS.CONVERSATION.DELETE_CONVERSATION(id));
}

export async function extractDocument(file, conversationId) {
  const formData = new FormData();
  formData.append("file", file);
  if (conversationId) {
    formData.append("conversationId", String(conversationId));
  }

  const response = await api.post(
    API_ENDPOINTS.CONVERSATION.EXTRACT_DOCUMENT,
    formData,
    { timeout: 0, headers: { "Content-Type": "multipart/form-data" } },
  );

  return response.data;
}

function processEventBlock(block, onText, onError) {
  const data = block
    .split(/\r?\n/)
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trim())
    .join("\n");

  if (!data) return;

  try {
    const event = JSON.parse(data);
    if (event.error) onError(event.error);
    if (event.text) onText?.(event.text);
  } catch {
    onError("The server returned an invalid message event.");
  }
}

function parseEventStream(responseText, onError) {
  let fullText = "";
  let modelUsed = null;
  const events = responseText.split(/\r?\n\r?\n/);

  for (const block of events) {
    const data = block
      .split(/\r?\n/)
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trim())
      .join("\n");
    if (!data) continue;

    try {
      const event = JSON.parse(data);
      if (event.error) onError(event.error);
      if (event.text) fullText += event.text;
      if (event.done && event.model) modelUsed = event.model;
    } catch {
      onError("The server returned an invalid message event.");
    }
  }

  return { text: fullText, model: modelUsed };
}

// Send a message and read the server-sent event response.
export async function startMessage(
  conversationId,
  message,
  onText,
  model = "groq",
  documentId,
) {
  let pendingText = "";
  let receivedLength = 0;
  let streamError = "";

  const response = await api.post(
    API_ENDPOINTS.CONVERSATION.SEND_MESSAGE,
    { conversationId, message, model, ...(documentId ? { documentId } : {}) },
    {
      responseType: "text",
      timeout: 0,
      onDownloadProgress: (progress) => {
        const responseText = progress.event?.target?.responseText;
        if (typeof responseText !== "string") return;

        pendingText += responseText.slice(receivedLength);
        receivedLength = responseText.length;
        const blocks = pendingText.split(/\r?\n\r?\n/);
        pendingText = blocks.pop() || "";
        blocks.forEach((block) =>
          processEventBlock(block, onText, (error) => (streamError = error)),
        );
      },
    },
  );

  const result = parseEventStream(response.data, (error) => {
    streamError = error;
  });
  if (streamError) throw new Error(streamError);
  return result;
}
