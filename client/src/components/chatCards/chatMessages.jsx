import { useEffect, useRef } from "react";
import { LoaderCircle } from "lucide-react";
import ChatCard from "./chatCard.jsx";
import ChatEmptyState from "./chatEmptyState.jsx";

function ChatMessages({
  messages = [],
  isLoading = false,
  isSending = false,
  pendingAssistantId = null,
  onSelectPrompt,
}) {
  const messageEndRef = useRef(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  return (
    <div className="chat-scroll min-h-0 flex-1 overflow-y-auto px-4 pt-12 pb-3 sm:px-8">
      {isLoading ? (
        <div className="flex h-full items-center justify-center text-[13px] text-[#888] dark:text-neutral-400">
          <LoaderCircle
            aria-hidden="true"
            className="mr-2 h-4 w-4 animate-spin"
          />
          Loading conversation...
        </div>
      ) : messages.length === 0 ? (
        <ChatEmptyState onSelectPrompt={onSelectPrompt} />
      ) : (
        <div className="mx-auto flex w-full max-w-[700px] flex-col gap-5">
          {messages.map((message) => (
            <ChatCard
              key={message.id}
              message={message}
              isPending={isSending && message.id === pendingAssistantId}
            />
          ))}
          <div ref={messageEndRef} />
        </div>
      )}
    </div>
  );
}

export default ChatMessages;
