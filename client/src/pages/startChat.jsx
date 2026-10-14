import { useCallback, useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  deleteConversation as deleteConversationRequest,
  extractDocument,
  extractGuestDocument,
  getConversationMessages,
  listConversations,
  renameConversation as renameConversationRequest,
  startGuestMessage,
  startMessage,
} from "../api/conversationApi.js";
import { Code, Lightbulb, PanelLeft, Sparkles, Table } from "lucide-react";
import { Link } from "react-router-dom";
import {
  ChatInput,
  ChatMessages,
  MessageMinimap,
} from "../components/chatCards/index.js";
import ConversationCard from "../components/conversationCard.jsx";
import { useAuth } from "../context/useAuth.js";
import { useConversation } from "../context/useConversation.js";

const SUGGESTION_PROMPTS = [
  {
    icon: Code,
    label: "Python script",
    prompt: "Write a clean Python script to parse and analyze JSON data with error handling",
  },
  {
    icon: Table,
    label: "Comparison table",
    prompt: "Create a detailed financial comparison table for Q1 budgeting with revenue, expenses, and profit",
  },
  {
    icon: Lightbulb,
    label: "Brainstorm ideas",
    prompt: "Brainstorm 5 innovative full-stack project ideas with modern UI/UX",
  },
  {
    icon: Sparkles,
    label: "Explain a concept",
    prompt: "Explain how React reconciles virtual DOM in simple, clear terms",
  },
];

async function fetchConversationList() {
  const result = await listConversations();
  if (Array.isArray(result)) return result;
  return Array.isArray(result?.conversations) ? result.conversations : [];
}

function upsertMessage(messages, messageId, update, initialMessage) {
  const hasMessage = messages.some((message) => message.id === messageId);
  if (hasMessage) {
    return messages.map((message) =>
      message.id === messageId ? update(message) : message,
    );
  }

  return [...messages, update(initialMessage)];
}

function StartChat() {
  const { isAuthenticated } = useAuth();
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
  const [isLoadingConversations, setIsLoadingConversations] =
    useState(isAuthenticated);
  const [loadedConversationId, setLoadedConversationId] = useState(null);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [pendingAssistantId, setPendingAssistantId] = useState(null);
  const [model, setModel] = useState("groq");
  const [error, setError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    () =>
      typeof window === "undefined" ||
      window.matchMedia("(min-width: 768px)").matches,
  );

  const initialPromptHandled = useRef(false);
  const sendPromptRef = useRef(null);
  const chatScrollRef = useRef(null);
  const guestDocumentTextRef = useRef("");
  const locallyCompletedConversationIdRef = useRef(null);
  const isLoadingMessages =
    Boolean(routeConversationId) &&
    loadedConversationId !== routeConversationId;
  const refreshConversations = useCallback(async () => {
    if (!isAuthenticated) return [];

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
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;

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
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !routeConversationId) {
      locallyCompletedConversationIdRef.current = null;
      return;
    }

    if (locallyCompletedConversationIdRef.current === routeConversationId) {
      return;
    }
    locallyCompletedConversationIdRef.current = null;

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
  }, [isAuthenticated, routeConversationId]);

  useEffect(() => {
    if (!routeConversationId) return;
    const selectedConversation = conversations.find(
      (conversation) => String(conversation.id) === routeConversationId,
    );
    if (selectedConversation) selectConversation(selectedConversation);
  }, [routeConversationId, conversations, selectConversation]);

  function handleNewChat() {
    setError("");
    if (window.matchMedia("(max-width: 767px)").matches) {
      setIsSidebarOpen(false);
    }
    setMessages([]);
    guestDocumentTextRef.current = "";
    setLoadedConversationId(null);
    clearConversation();
    navigate("/");
  }

  function handleSelectConversation(conversation) {
    selectConversation(conversation);
    setError("");
    if (window.matchMedia("(max-width: 767px)").matches) {
      setIsSidebarOpen(false);
    }
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
      if (isAuthenticated && routeConversationId && isLoadingConversations) return;

      const existingConversation = conversations.find(
        (item) => String(item.id) === routeConversationId,
      );
      const shouldCreateConversation =
        isAuthenticated && (!routeConversationId || !existingConversation);

      setError("");
      setIsSending(true);
      setIsCreatingConversation(shouldCreateConversation);

      const timestamp = Date.now();
      const userMessageId = `local-user-${timestamp}`;
      const assistantMessageId = `local-assistant-${timestamp}`;
      setPendingAssistantId(assistantMessageId);
      let isDocumentUploaded = false;
      let createdConversationId = null;
      setMessages((current) => [
        ...(isAuthenticated && !routeConversationId ? [] : current),
        {
          id: userMessageId,
          role: "user",
          content: prompt,
          ...(attachedFile?.size > 0
            ? {
                attachment: {
                  name: attachedFile.name,
                  size: attachedFile.size,
                  extension:
                    attachedFile.name.split(".").pop()?.toUpperCase() || "FILE",
                  uploadProgress: 0,
                  uploadStatus: "uploading",
                },
              }
            : {}),
        },
        {
          id: assistantMessageId,
          role: "assistant",
          content: "",
          documentStatus: attachedFile?.size > 0 ? "extracting" : null,
        },
      ]);

      try {
        let conversation = existingConversation || activeConversation;
        if (isAuthenticated && shouldCreateConversation) {
          conversation = await startConversation({ message: prompt });
          setConversations((current) => [
            conversation,
            ...current.filter((item) => item.id !== conversation.id),
          ]);
          selectConversation(conversation);
          createdConversationId = String(conversation.id);
        } else if (
          isAuthenticated &&
          String(conversation?.id) !== routeConversationId
        ) {
          selectConversation(conversation);
        }

        let documentId;
        if (attachedFile?.size > 0) {
          if (!isAuthenticated) guestDocumentTextRef.current = "";
          const onUploadProgress = (uploadProgress) => {
            setMessages((current) =>
              current.map((item) =>
                item.id === userMessageId && item.attachment
                  ? {
                      ...item,
                      attachment: { ...item.attachment, uploadProgress },
                    }
                  : item,
              ),
            );
          };
          if (isAuthenticated) {
            const extractedDocument = await extractDocument(
              attachedFile,
              conversation.id,
              onUploadProgress,
            );
            documentId = extractedDocument.documentId;
            if (!documentId) {
              throw new Error(
                "The document service did not return a document ID.",
              );
            }
          } else {
            const extractedDocument = await extractGuestDocument(
              attachedFile,
              onUploadProgress,
            );
            if (typeof extractedDocument.text !== "string") {
              throw new Error(
                "The document service did not return extracted text.",
              );
            }
            guestDocumentTextRef.current = extractedDocument.text;
          }
          isDocumentUploaded = true;
          setMessages((current) =>
            current.map((item) =>
              item.id === userMessageId && item.attachment
                ? {
                    ...item,
                    attachment: {
                      ...item.attachment,
                      uploadProgress: 100,
                      uploadStatus: "uploaded",
                    },
                  }
                : item,
            ),
          );
          setMessages((current) =>
            current.map((item) =>
              item.id === assistantMessageId
                ? { ...item, documentStatus: null }
                : item,
            ),
          );
        }

        const guestHistory = [
          ...messages
            .filter(
              (item) =>
                (item.role === "user" || item.role === "assistant") &&
                typeof item.content === "string" &&
                item.content.trim(),
            )
            .map(({ role, content }) => ({
              role,
              content: content.slice(-9000),
            })),
          { role: "user", content: prompt },
        ].slice(-10);
        const {
          text: reply,
          model: respondingModel,
          thoughtTimeMs,
        } = await (isAuthenticated
          ? startMessage(
              conversation.id,
              prompt,
              (text) => {
                setMessages((current) =>
                  upsertMessage(
                    current,
                    assistantMessageId,
                    (item) => ({
                      ...item,
                      content: (item.content || "") + text,
                    }),
                    {
                      id: assistantMessageId,
                      role: "assistant",
                      content: "",
                    },
                  ),
                );
              },
              model,
              documentId,
            )
          : startGuestMessage(
              guestHistory,
              model,
              guestDocumentTextRef.current,
              (text) => {
                setMessages((current) =>
                  upsertMessage(
                    current,
                    assistantMessageId,
                    (item) => ({
                      ...item,
                      content: (item.content || "") + text,
                    }),
                    {
                      id: assistantMessageId,
                      role: "assistant",
                      content: "",
                    },
                  ),
                );
              },
            ));

        setMessages((current) =>
          upsertMessage(
            current,
            assistantMessageId,
            (item) => ({
              ...item,
              content: reply || item.content,
              model: respondingModel || model,
              requestedModel: model,
              thoughtTimeMs,
            }),
            {
              id: assistantMessageId,
              role: "assistant",
              content: reply,
              model: respondingModel || model,
              requestedModel: model,
              thoughtTimeMs,
            },
          ),
        );
        if (createdConversationId) {
          locallyCompletedConversationIdRef.current = createdConversationId;
          setLoadedConversationId(createdConversationId);
          navigate(`/chat/${createdConversationId}`, { replace: true });
        } else if (isAuthenticated) {
          await refreshConversations();
        }
      } catch (requestError) {
        setMessages((current) =>
          current
            .filter((item) => item.id !== assistantMessageId)
            .map((item) =>
              item.id === userMessageId &&
              item.attachment &&
              !isDocumentUploaded
                ? {
                    ...item,
                    attachment: {
                      ...item.attachment,
                      uploadStatus: "failed",
                    },
                  }
                : item,
            ),
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
      isAuthenticated,
      isLoadingConversations,
      isSending,
      messages,
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
      className={`relative flex h-svh w-full overflow-hidden ${
        isAuthenticated
          ? "bg-[#f1f1f2] dark:bg-[#101012]"
          : "bg-white dark:bg-[#212121]"
      }`}
    >
      {/* Overlay backdrop — closes sidebar on mobile when tapped */}
      {isAuthenticated && isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* The sidebar overlays the chat on mobile and sits beside it on desktop. */}
      {isAuthenticated && (
        <div
          className={`absolute inset-y-0 left-0 z-30 h-full overflow-visible transition-all duration-300 ease-in-out md:static ${
            isSidebarOpen
              ? "w-[min(320px,85vw)] translate-x-0 md:w-[260px]"
              : "w-0"
          }`}
        >
          <div className="h-full w-[min(320px,85vw)] shrink-0 overflow-visible md:w-[260px]">
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
          </div>
        </div>
      )}

      {/* Conversation fills the remaining space without a framed panel. */}
      <section
        className={`relative flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white dark:bg-[#212121] ${
          isSidebarOpen ? "z-0" : "z-40"
        }`}
      >
        {!isAuthenticated && (
          <header className="absolute inset-x-0 top-0 z-20 flex h-[68px] items-center justify-between gap-2 px-5 sm:px-8">
            <button
              type="button"
              onClick={handleNewChat}
              disabled={isSending}
              className="flex flex-col items-start rounded-md text-left"
              aria-label="Start a new temporary chat"
            >
              <span className="text-[20px] font-semibold tracking-tight text-[#171717] dark:text-white">
                PulseAI
              </span>
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 sm:text-[11px]">
                Temporary chat · Not saved to history
              </span>
            </button>
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
              <Link
                to="/login"
                className="inline-flex h-9 items-center justify-center rounded-full bg-[#111] px-3.5 text-[12px] font-semibold text-white transition hover:bg-[#333] sm:h-11 sm:px-5 sm:text-[14px] dark:bg-white dark:text-[#111] dark:hover:bg-neutral-200"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="inline-flex h-9 items-center justify-center rounded-full border border-neutral-300 px-3.5 text-[12px] font-medium text-[#171717] transition hover:bg-neutral-50 sm:h-11 sm:px-5 sm:text-[14px] dark:border-neutral-600 dark:text-white dark:hover:bg-neutral-800"
              >
                <span className="sm:hidden">Sign up</span>
                <span className="hidden sm:inline">Sign up for free</span>
              </Link>
            </div>
          </header>
        )}

        {/* Floating open sidebar button when sidebar is collapsed */}
        {isAuthenticated && !isSidebarOpen && (
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-3.5 left-3.5 z-30 grid h-8.5 w-8.5 place-items-center rounded-lg border border-neutral-200/70 bg-white/90 text-neutral-600 shadow-2xs backdrop-blur-sm transition hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-700/70 dark:bg-[#212121]/90 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
            aria-label="Open sidebar"
            title="Open sidebar"
          >
            <PanelLeft className="h-[18px] w-[18px]" />
          </button>
        )}

        {messages.length === 0 ? (
          <div
            className={`flex min-h-0 flex-1 flex-col items-center justify-center px-4 pb-10 ${
              isAuthenticated ? "" : "pt-12"
            }`}
          >
            <h1
              className={`text-center text-[28px] tracking-tight text-[#0d0d0d] sm:text-[34px] dark:text-white ${
                isAuthenticated
                  ? "mb-6 font-semibold"
                  : "mb-14 font-normal"
              }`}
            >
              {isAuthenticated ? "What can I help with?" : "Where should we begin?"}
            </h1>
            <div
              className={`w-full ${
                isAuthenticated ? "max-w-[760px]" : "max-w-[960px]"
              }`}
            >
              <ChatInput
                key={routeConversationId || "new"}
                onSend={sendPrompt}
                maxLength={isAuthenticated ? undefined : 9000}
                compact={!isAuthenticated}
                model={model}
                onModelChange={setModel}
                isSending={isSending}
                error={error}
                disabled={Boolean(
                  routeConversationId &&
                    (isLoadingConversations || isLoadingMessages),
                )}
              />

              {isAuthenticated && (
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                  {SUGGESTION_PROMPTS.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => sendPrompt(item.prompt)}
                      className="inline-flex items-center gap-2 rounded-full border border-neutral-200/90 bg-white/80 px-3.5 py-1.5 text-[12.5px] font-medium text-neutral-600 shadow-2xs transition hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-900 dark:border-neutral-800 dark:bg-[#202024] dark:text-neutral-300 dark:hover:border-neutral-700 dark:hover:bg-[#2a2a30] dark:hover:text-white"
                    >
                      <item.icon className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <ChatMessages
              ref={chatScrollRef}
              className={!isAuthenticated ? "pt-20" : ""}
              title={
                activeConversation?.title ||
                conversations.find(
                  (conversation) =>
                    String(conversation.id) === String(routeConversationId),
                )?.title ||
                ""
              }
              messages={messages}
              isLoading={isLoadingMessages}
              isSending={isSending}
              pendingAssistantId={pendingAssistantId}
              onSelectPrompt={sendPrompt}
            />
            <MessageMinimap
              messages={messages}
              scrollContainer={chatScrollRef}
            />

            <ChatInput
              key={routeConversationId || "new"}
              onSend={sendPrompt}
              maxLength={isAuthenticated ? undefined : 9000}
              model={model}
              onModelChange={setModel}
              isSending={isSending}
              error={error}
              disabled={Boolean(
                routeConversationId &&
                  (isLoadingConversations || isLoadingMessages),
              )}
            />
          </>
        )}

        {/* Floating Help Circle at bottom right */}
        {isAuthenticated && <button
          type="button"
          className="absolute right-4 bottom-4 z-10 grid h-7 w-7 place-items-center rounded-full border border-neutral-300/80 bg-white text-[13px] font-medium text-neutral-600 shadow-2xs transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-[#2a2a2a] dark:text-neutral-300 dark:hover:bg-[#333]"
          aria-label="Help"
          title="Help"
        >
          ?
        </button>}
        <Outlet />
      </section>
    </main>
  );
}

export default StartChat;
