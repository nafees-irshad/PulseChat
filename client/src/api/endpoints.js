const API_ENDPOINTS = {
  USERS: {
    REGISTER: "/user/register",
    CONFIRM_OTP: "/user/confirm-otp",
    LOGIN: "/user/login",
    GOOGLE: "/user/google",
    PROFILE: "/user/profile",
    CHANGE_PASSWORD: "/user/password",
    FORGOT_PASSWORD: "/user/forgot-password",
    RESET_PASSWORD: "/user/reset-password",
  },
  CONVERSATION: {
    START_CONVERSATION: "gpt/conversations",
    LIST_CONVERSATIONS: "gpt/conversations",
    RENAME_CONVERSATION: (id) => `gpt/conversations/${id}`,
    DELETE_CONVERSATION: (id) => `gpt/conversations/${id}`,
    GET_MESSAGES: (id) => `gpt/conversations/${id}/messages`,
    LIST_DOCUMENTS: "gpt/documents",
    GET_DOCUMENT: (id) => `gpt/documents/${id}`,
    GET_DOCUMENT_FILE: (id) => `gpt/documents/${id}/file`,
    DELETE_DOCUMENT: (id) => `gpt/documents/${id}`,
    EXTRACT_DOCUMENT: "gpt/documents/extract/",
    EXTRACT_GUEST_DOCUMENT: "gpt/guest/documents/extract",
    SEND_MESSAGE: "gpt/chat",
    SEND_GUEST_MESSAGE: "gpt/guest/chat",
  },
};

export default API_ENDPOINTS;
