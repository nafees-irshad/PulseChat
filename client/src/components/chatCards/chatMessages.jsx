import { forwardRef, useEffect, useRef } from "react";
import { LoaderCircle } from "lucide-react";
import ChatCard from "./chatCard.jsx";
import ChatEmptyState from "./chatEmptyState.jsx";

const ChatMessages = forwardRef(function ChatMessages(
  {
    title = "",
    messages = [],
    isLoading = false,
    isSending = false,
    pendingAssistantId = null,
    onSelectPrompt,
  },
  scrollRef,
) {
  const messageEndRef = useRef(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  return (
    <div
      ref={scrollRef}
      className="chat-scroll min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-3 sm:px-8"
    >
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
        <div className="mx-auto flex w-full max-w-[760px] flex-col gap-6">
          {title && (
            <div className="pt-2 pb-1">
              <h1 className="text-[20px] font-bold tracking-tight text-[#0d0d0d] dark:text-white">
                {title}
              </h1>
            </div>
          )}
          {messages.map((message) => (
            <div key={message.id} data-message-id={message.id}>
              <ChatCard
                message={message}
                isPending={isSending && message.id === pendingAssistantId}
              />
            </div>
          ))}
          <div ref={messageEndRef} />
        </div>
      )}
    </div>
  );
});

export default ChatMessages;
