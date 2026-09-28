import { useCallback, useMemo, useState } from "react";
import { startConversation as createConversationRequest } from "../api/conversationApi.js";
import ConversationContext from "./conversationContextStore.js";

export function ConversationProvider({ children }) {
  const [activeConversation, setActiveConversation] = useState(null);
  const [isStartingConversation, setIsStartingConversation] = useState(false);
  const [conversationError, setConversationError] = useState("");

  const startConversation = useCallback(async (data = {}) => {
    setIsStartingConversation(true);
    setConversationError("");

    try {
      const conversation = await createConversationRequest(data);
      if (!conversation?.id) {
        throw new Error("The server did not return a conversation ID.");
      }

      setActiveConversation(conversation);
      return conversation;
    } catch (error) {
      setConversationError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Unable to start a conversation.",
      );
      throw error;
    } finally {
      setIsStartingConversation(false);
    }
  }, []);

  const selectConversation = useCallback((conversation) => {
    setConversationError("");
    setActiveConversation(conversation || null);
  }, []);

  const clearConversation = useCallback(() => {
    setActiveConversation(null);
    setConversationError("");
  }, []);

  const value = useMemo(
    () => ({
      activeConversation,
      conversationId: activeConversation?.id ?? null,
      conversationTitle: activeConversation?.title ?? "",
      isStartingConversation,
      conversationError,
      startConversation,
      selectConversation,
      clearConversation,
    }),
    [
      activeConversation,
      isStartingConversation,
      conversationError,
      startConversation,
      selectConversation,
      clearConversation,
    ],
  );

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
}
