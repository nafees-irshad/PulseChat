import api from "./index.js";
import API_ENDPOINTS from "./endpoints.js";

export async function listDocuments() {
  const response = await api.get(API_ENDPOINTS.CONVERSATION.LIST_DOCUMENTS);
  return response.data;
}

export async function getDocument(id) {
  const response = await api.get(API_ENDPOINTS.CONVERSATION.GET_DOCUMENT(id));
  return response.data;
}

export async function getDocumentFile(id) {
  try {
    const response = await api.get(
      API_ENDPOINTS.CONVERSATION.GET_DOCUMENT_FILE(id),
      {
        responseType: "blob",
        timeout: 0,
        headers: { Accept: "application/pdf, text/plain, */*" },
      },
    );
    return response.data;
  } catch (error) {
    const responseData = error.response?.data;
    if (responseData instanceof Blob) {
      const responseText = await responseData.text();
      try {
        error.response.data = JSON.parse(responseText);
      } catch {
        error.response.data = { error: responseText || error.message };
      }
    }
    throw error;
  }
}

export async function deleteDocument(id) {
  const response = await api.delete(
    API_ENDPOINTS.CONVERSATION.DELETE_DOCUMENT(id),
  );
  return response.data;
}
