const API_ENDPOINTS = {
  USERS: {
    REGISTER: "/user/register",
    CONFIRM_OTP: "/user/confirm-otp",
    LOGIN: "/user/login",
    GOOGLE: "/user/google",
    PROFILE: "/user/profile",
  },
  CONVERSATION: {
    START_CONVERSATION: "gpt/conversations",
    LIST_CONVERSATIONS: "gpt/conversations",
    RENAME_CONVERSATION: (id) => `gpt/conversations/${id}`,
    DELETE_CONVERSATION: (id) => `gpt/conversations/${id}`,
    GET_MESSAGES: (id) => `gpt/conversations/${id}/messages`,
    EXTRACT_DOCUMENT: "gpt/documents/extract/",
    SEND_MESSAGE: "gpt/chat",
  },
};

export default API_ENDPOINTS;
