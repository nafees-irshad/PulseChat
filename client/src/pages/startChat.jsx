import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  deleteConversation as deleteConversationRequest,
  extractDocument,
  getConversationMessages,
  listConversations,
  renameConversation as renameConversationRequest,
  startMessage,
} from "../api/conversationApi.js";
import {
  ChatHeader,
  ChatInput,
  ChatMessages,
} from "../components/chatCards/index.js";
import ConversationCard from "../components/conversationCard.jsx";
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
  const [searchValue, setSearchValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [loadedConversationId, setLoadedConversationId] = useState(null);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [pendingAssistantId, setPendingAssistantId] = useState(null);
  const [model, setModel] = useState("groq");
  const [error, setError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const skipHistoryForId = useRef(null);
  const initialPromptHandled = useRef(false);
  const sendPromptRef = useRef(null);
  const isLoadingMessages =
    Boolean(routeConversationId) &&
    loadedConversationId !== routeConversationId;

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
    if (!routeConversationId) {
      setMessages([]);
      setLoadedConversationId(null);
      return;
    }

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

  function handleNewChat() {
    setError("");
    setMessages([]);
    setLoadedConversationId(null);
    clearConversation();
    navigate("/");
  }

  function handleSelectConversation(conversation) {
    selectConversation(conversation);
    setError("");
    navigate(`/chat/${conversation.id}`);
  }

  async function handleRenameConversation(conversation, title) {
    setError("");
    try {
      const updatedConversation = await renameConversationRequest(
        conversation.id,
        title,
      );
      setConversations((current) => [
        updatedConversation,
        ...current.filter(
          (item) => String(item.id) !== String(updatedConversation.id),
        ),
      ]);
      if (String(activeConversation?.id) === String(updatedConversation.id)) {
        selectConversation({ ...activeConversation, ...updatedConversation });
      }
    } catch (requestError) {
      const message =
        requestError.response?.data?.error || "Could not rename this chat.";
      setError(message);
      throw new Error(message, { cause: requestError });
    }
  }

  async function handleDeleteConversation(conversation) {
    setError("");
    try {
      await deleteConversationRequest(conversation.id);
      setConversations((current) =>
        current.filter((item) => String(item.id) !== String(conversation.id)),
      );

      if (String(routeConversationId) === String(conversation.id)) {
        setMessages([]);
        setLoadedConversationId(null);
        clearConversation();
        navigate("/", { replace: true });
      }
    } catch (requestError) {
      const message =
        requestError.response?.data?.error || "Could not delete this chat.";
      setError(message);
      throw new Error(message, { cause: requestError });
    }
  }

  const sendPrompt = useCallback(
    async (rawPrompt, attachedFile = null) => {
      const prompt = rawPrompt.trim();
      if (!prompt || isSending) return;

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

        let documentId;
        if (attachedFile?.size > 0) {
          const extractedDocument = await extractDocument(
            attachedFile,
            conversation.id,
          );
          documentId = extractedDocument.documentId;
          if (!documentId) {
            throw new Error(
              "The document service did not return a document ID.",
            );
          }
        }

        const { text: reply, model: respondingModel } = await startMessage(
          conversation.id,
          prompt,
          (text) => {
            setMessages((current) =>
              current.map((item) =>
                item.id === assistantMessageId
                  ? { ...item, content: item.content + text }
                  : item,
              ),
            );
          },
          model,
          documentId,
        );

        setMessages((current) =>
          current.map((item) =>
            item.id === assistantMessageId
              ? {
                  ...item,
                  content: reply || item.content,
                  model: respondingModel || model,
                  requestedModel: model,
                }
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
      model,
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

  return (
    <main
      className={`flex h-svh w-full overflow-hidden bg-white dark:bg-[#212121] md:grid md:grid-rows-[minmax(0,1fr)] md:p-3 md:bg-[#f5f5f5] md:dark:bg-[#111] ${
        isSidebarOpen
          ? "md:grid-cols-[260px_minmax(0,1fr)] md:gap-3"
          : "md:grid-cols-[0_minmax(0,1fr)] md:gap-0"
      }`}
    >
      <ConversationCard
        isOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
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
        onRenameConversation={handleRenameConversation}
        onDeleteConversation={handleDeleteConversation}
      />

      <section className="workspace-panel relative flex h-full min-h-0 min-w-0 flex-1 flex-col bg-white dark:bg-[#212121] md:overflow-hidden md:rounded-2xl md:border md:border-neutral-200/70 md:shadow-sm dark:md:border-neutral-800">
        <ChatHeader
          title={
            activeConversation?.title ||
            conversations.find(
              (conversation) =>
                String(conversation.id) === String(routeConversationId),
            )?.title ||
            "New chat"
          }
          hasMessages={messages.length > 0}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />

        {messages.length === 0 ? (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 pb-10">
            <h1 className="mb-7 text-center text-[28px] font-medium tracking-tight text-[#0d0d0d] sm:text-[34px] dark:text-white">
              What can I help with ?
            </h1>
            <div className="w-full max-w-[680px]">
              <ChatInput
                key={routeConversationId || "new"}
                onSend={sendPrompt}
                model={model}
                onModelChange={setModel}
                isSending={isSending}
                error={error}
              />
            </div>
          </div>
        ) : (
          <>
            <ChatMessages
              messages={messages}
              isLoading={isLoadingMessages}
              isSending={isSending}
              pendingAssistantId={pendingAssistantId}
              onSelectPrompt={sendPrompt}
            />

            <ChatInput
              key={routeConversationId || "new"}
              onSend={sendPrompt}
              model={model}
              onModelChange={setModel}
              isSending={isSending}
              error={error}
            />
          </>
        )}

        {/* Floating Help Circle at bottom right (from Figma) */}
        <button
          type="button"
          className="absolute right-4 bottom-4 z-10 grid h-7 w-7 place-items-center rounded-full border border-neutral-300/80 bg-white text-[13px] font-medium text-neutral-600 shadow-2xs transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-[#2a2a2a] dark:text-neutral-300 dark:hover:bg-[#333]"
          aria-label="Help"
          title="Help"
        >
          ?
        </button>
      </section>
    </main>
  );
}

export default StartChat;
