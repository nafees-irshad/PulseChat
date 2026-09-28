const API_ENDPOINTS = {
  USERS: {
    REGISTER: "/user/register",
    LOGIN: "/user/login",
    PROFILE: "/user/profile"
  },
  CONVERSATION: {
    START_CONVERSATION: "gpt/conversations",
    LIST_CONVERSATIONS: "gpt/conversations",
    GET_MESSAGES: (id) => `gpt/conversations/${id}/messages`,
    SEND_MESSAGE: "gpt/chat",
  },
};

export default API_ENDPOINTS;
