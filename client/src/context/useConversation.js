import { useContext } from "react";
import ConversationContext from "./conversationContextStore.js";

export function useConversation() {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error(
      "useConversation must be used inside a ConversationProvider",
    );
  }
  return context;
}
