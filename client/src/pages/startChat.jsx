import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowUp, LoaderCircle } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  getConversationMessages,
  listConversations,
  startMessage,
} from "../api/conversationApi.js";
import ChatCard from "../components/chatCard.jsx";
import ConversationCard from "../components/conversationCard.jsx";
import Theme from "../components/theme.jsx";
import UserMenu from "../components/userMenu.jsx";
import { useConversation } from "../context/useConversation.js";

async function fetchConversationList() {
  const result = await listConversations();
  if (Array.isArray(result)) return result;
  return Array.isArray(result?.conversations) ? result.conversations : [];
}

function StartChat() {
  const { conversationId: routeConversationId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    activeConversation,
    startConversation,
    selectConversation,
    clearConversation,
  } = useConversation();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [loadedConversationId, setLoadedConversationId] = useState(null);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [pendingAssistantId, setPendingAssistantId] = useState(null);
  const [error, setError] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const textareaRef = useRef(null);
  const skipHistoryForId = useRef(null);
  const initialPromptHandled = useRef(false);
  const sendPromptRef = useRef(null);
  const messageEndRef = useRef(null);
  const isLoadingMessages =
    Boolean(routeConversationId) &&
    loadedConversationId !== routeConversationId;

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    // Set to 1px first so scrollHeight reflects full content, not rows attribute
    textarea.style.height = "1px";
    const sh = textarea.scrollHeight;
    setIsExpanded(sh > 48 || (textarea.value || "").includes("\n"));
    textarea.style.height = `${Math.min(Math.max(sh, 24), 200)}px`;
    textarea.style.overflowY = sh > 200 ? "auto" : "hidden";
  }, []);

  useLayoutEffect(() => {
    adjustTextareaHeight();
  }, [draft, adjustTextareaHeight]);

  const refreshConversations = useCallback(async () => {
    try {
      const list = await fetchConversationList();
      setConversations(list);
      return list;
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          "Could not load your conversations.",
      );
      return [];
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  useEffect(() => {
    let isActive = true;
    fetchConversationList()
      .then((list) => {
        if (isActive) setConversations(list);
      })
      .catch((requestError) => {
        if (isActive) {
          setError(
            requestError.response?.data?.error ||
              "Could not load your conversations.",
          );
        }
      })
      .finally(() => {
        if (isActive) setIsLoadingConversations(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!routeConversationId) return;

    if (skipHistoryForId.current === routeConversationId) {
      skipHistoryForId.current = null;
      return;
    }

    let isActive = true;

    getConversationMessages(routeConversationId)
      .then((result) => {
        if (isActive) setMessages(Array.isArray(result) ? result : []);
      })
      .catch((requestError) => {
        if (isActive) {
          setError(
            requestError.response?.data?.error ||
              "Could not load messages for this conversation.",
          );
        }
      })
      .finally(() => {
        if (isActive) setLoadedConversationId(routeConversationId);
      });

    return () => {
      isActive = false;
    };
  }, [routeConversationId]);

  useEffect(() => {
    if (!routeConversationId) return;
    const selectedConversation = conversations.find(
      (conversation) => String(conversation.id) === routeConversationId,
    );
    if (selectedConversation) selectConversation(selectedConversation);
  }, [routeConversationId, conversations, selectConversation]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  async function handleNewChat() {
    setError("");
    setMessages([]);
    setDraft("");
    setLoadedConversationId(null);
    clearConversation();
    navigate("/chat");
  }

  function handleSelectConversation(conversation) {
    selectConversation(conversation);
    setError("");
    navigate(`/chat/${conversation.id}`);
  }

  const sendPrompt = useCallback(
    async (rawPrompt) => {
      const prompt = rawPrompt.trim();
      if (!prompt || isSending) return;

      setDraft("");
      setError("");
      setIsSending(true);
      setIsCreatingConversation(!routeConversationId);

      const timestamp = Date.now();
      const userMessageId = `local-user-${timestamp}`;
      const assistantMessageId = `local-assistant-${timestamp}`;
      setPendingAssistantId(assistantMessageId);
      setMessages((current) => [
        ...current,
        { id: userMessageId, role: "user", content: prompt },
        { id: assistantMessageId, role: "assistant", content: "" },
      ]);

      try {
        let conversation = activeConversation;
        if (!routeConversationId) {
          conversation = await startConversation({ message: prompt });
          setConversations((current) => [
            conversation,
            ...current.filter((item) => item.id !== conversation.id),
          ]);
          selectConversation(conversation);
          setLoadedConversationId(String(conversation.id));
          skipHistoryForId.current = String(conversation.id);
          navigate(`/chat/${conversation.id}`, { replace: true });
        } else if (
          !conversation ||
          String(conversation.id) !== routeConversationId
        ) {
          conversation = conversations.find(
            (item) => String(item.id) === routeConversationId,
          ) || { id: routeConversationId, title: "Conversation" };
          selectConversation(conversation);
        }

        const reply = await startMessage(conversation.id, prompt, (text) => {
          setMessages((current) =>
            current.map((item) =>
              item.id === assistantMessageId
                ? { ...item, content: item.content + text }
                : item,
            ),
          );
        });

        setMessages((current) =>
          current.map((item) =>
            item.id === assistantMessageId
              ? { ...item, content: reply || item.content }
              : item,
          ),
        );
        await refreshConversations();
      } catch (requestError) {
        setMessages((current) =>
          current.filter((item) => item.id !== assistantMessageId),
        );
        setError(
          requestError.response?.data?.error ||
            requestError.message ||
            "Could not send your message.",
        );
      } finally {
        setIsSending(false);
        setIsCreatingConversation(false);
        setPendingAssistantId(null);
      }
    },
    [
      activeConversation,
      conversations,
      isSending,
      navigate,
      refreshConversations,
      routeConversationId,
      selectConversation,
      startConversation,
    ],
  );

  useEffect(() => {
    sendPromptRef.current = sendPrompt;
  }, [sendPrompt]);

  useEffect(() => {
    const initialMessage = location.state?.initialMessage;
    if (!initialMessage || initialPromptHandled.current) return;

    initialPromptHandled.current = true;
    navigate(location.pathname, { replace: true, state: null });
    sendPromptRef.current?.(initialMessage);
  }, [location.key, location.pathname, location.state, navigate]);

  function handleSubmit(event) {
    event?.preventDefault?.();
    void sendPrompt(draft);
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendPrompt(draft);
    }
  }

  const title =
    activeConversation?.title ||
    conversations.find(
      (conversation) => String(conversation.id) === routeConversationId,
    )?.title ||
    "New chat";

  return (
    <main className="flex h-svh w-full overflow-hidden bg-white dark:bg-[#212121]">
      <ConversationCard
        conversations={conversations}
        activeConversationId={routeConversationId}
        isSearching={isSearching}
        searchValue={searchValue}
        isLoading={isLoadingConversations}
        isCreating={isCreatingConversation}
        onNewChat={handleNewChat}
        onToggleSearch={() => {
          setIsSearching((current) => !current);
          setSearchValue("");
        }}
        onSearchChange={setSearchValue}
        onSelectConversation={handleSelectConversation}
      />

      <section className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-white dark:bg-[#212121]">
        {/* Floating top right: Theme & Profile only (no navbar row) */}
        <div className="absolute top-3 right-4 z-20 flex items-center gap-2">
          <Theme />
          <UserMenu />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-12 pb-3 sm:px-8">
          {isLoadingMessages ? (
            <div className="flex h-full items-center justify-center text-[13px] text-[#888]">
              <LoaderCircle
                aria-hidden="true"
                className="mr-2 h-4 w-4 animate-spin"
              />
              Loading conversation...
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <h2 className="text-center text-[24px] font-medium text-[#222]">
                What can I help with?
              </h2>
            </div>
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

        <div className="shrink-0 px-4 pb-4 sm:px-8">
          {error && (
            <p
              className="mx-auto mb-2 max-w-[620px] text-[13px] text-red-600"
              role="alert"
            >
              {error}
            </p>
          )}
          <form
            className={`mx-auto w-full max-w-[640px] border border-neutral-200/90 bg-[#f4f4f4] px-4 shadow-sm transition-all duration-150 dark:border-neutral-700/80 dark:bg-[#2f2f2f] ${
              isExpanded
                ? "flex flex-col rounded-[24px] pt-3 pb-2.5"
                : "flex items-center gap-2 rounded-full py-[10px]"
            }`}
            onSubmit={handleSubmit}
          >
            <label className="sr-only" htmlFor="chat-message">
              Message
            </label>
            <textarea
              ref={textareaRef}
              id="chat-message"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              className="min-w-0 w-full resize-none overflow-hidden bg-transparent text-[14.5px] leading-relaxed text-[#222] outline-none placeholder:text-neutral-500 dark:text-[#ececec] dark:placeholder:text-neutral-400"
              placeholder="Message Espresso AI"
              disabled={isSending}
            />
            {isExpanded ? (
              <div className="flex items-center justify-end pt-1.5">
                <button
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-black text-white transition hover:opacity-90 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:opacity-40 dark:bg-white dark:text-black dark:disabled:bg-neutral-600"
                  type="submit"
                  aria-label="Send message"
                  title="Send message"
                  disabled={!draft.trim() || isSending}
                >
                  {isSending ? (
                    <LoaderCircle aria-hidden="true" className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ArrowUp aria-hidden="true" className="h-4 w-4" />
                  )}
                </button>
              </div>
            ) : (
              <button
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-black text-white transition hover:opacity-90 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:opacity-40 dark:bg-white dark:text-black dark:disabled:bg-neutral-600"
                type="submit"
                aria-label="Send message"
                title="Send message"
                disabled={!draft.trim() || isSending}
              >
                {isSending ? (
                  <LoaderCircle aria-hidden="true" className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ArrowUp aria-hidden="true" className="h-4 w-4" />
                )}
              </button>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}

export default StartChat;
