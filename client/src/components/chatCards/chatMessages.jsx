import { forwardRef, useEffect, useRef, useState } from "react";
import { ChevronDown, LoaderCircle } from "lucide-react";
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
    className = "",
  },
  scrollRef,
) {
  const messageEndRef = useRef(null);
  const shouldFollowMessagesRef = useRef(true);
  const [isAtBottom, setIsAtBottom] = useState(true);

  useEffect(() => {
    if (shouldFollowMessagesRef.current) {
      messageEndRef.current?.scrollIntoView({ block: "end" });
    }
  }, [messages]);

  return (
    <div className="relative min-h-0 flex-1">
      <div
        ref={scrollRef}
        onScroll={(event) => {
          const element = event.currentTarget;
          const atBottom =
            element.scrollHeight - element.scrollTop - element.clientHeight < 72;
          shouldFollowMessagesRef.current = atBottom;
          setIsAtBottom(atBottom);
        }}
        className={`chat-scroll h-full overflow-y-auto px-4 pt-4 pb-3 sm:px-8 ${className}`}
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
      {messages.length > 0 && !isAtBottom && (
        <button
          type="button"
          onClick={() => {
            shouldFollowMessagesRef.current = true;
            scrollRef.current?.scrollTo({
              top: scrollRef.current.scrollHeight,
              behavior: "smooth",
            });
          }}
          className="absolute bottom-4 left-1/2 z-20 grid h-10 w-10 -translate-x-1/2 place-items-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-md transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-[#2a2a2a] dark:text-neutral-200 dark:hover:bg-[#333]"
          aria-label="Scroll to latest message"
          title="Scroll to latest message"
        >
          <ChevronDown aria-hidden="true" className="h-5 w-5" />
        </button>
      )}
    </div>
  );
});

export default ChatMessages;
