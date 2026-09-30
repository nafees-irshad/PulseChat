import {
  Check,
  Ellipsis,
  Images,
  LoaderCircle,
  Pencil,
  PanelLeft,
  Search,
  Share2,
  Sparkles,
  SquarePen,
  Trash2,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

function ConversationCard({
  isOpen = true,
  onToggleSidebar,
  conversations = [],
  activeConversationId,
  isSearching = false,
  searchValue = "",
  isLoading = false,
  isCreating = false,
  onNewChat,
  onToggleSearch,
  onSearchChange,
  onSelectConversation,
  onRenameConversation,
  onDeleteConversation,
}) {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [renameTarget, setRenameTarget] = useState(null);
  const [renameTitle, setRenameTitle] = useState("");
  const [renameError, setRenameError] = useState("");
  const [isSavingRename, setIsSavingRename] = useState(false);

  useEffect(() => {
    if (openMenuId === null && !renameTarget) return undefined;

    const handlePointerDown = (event) => {
      if (!event.target.closest("[data-conversation-menu]")) {
        setOpenMenuId(null);
      }
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpenMenuId(null);
        setRenameTarget(null);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [openMenuId, renameTarget]);

  const filteredConversations = conversations.filter((conversation) =>
    (conversation.title || "New chat")
      .toLowerCase()
      .includes(searchValue.toLowerCase()),
  );

  async function handleRenameSubmit(event) {
    event.preventDefault();
    const title = renameTitle.trim();
    if (!title || !renameTarget) return;

    setIsSavingRename(true);
    setRenameError("");
    try {
      await onRenameConversation?.(renameTarget, title);
      setRenameTarget(null);
    } catch (error) {
      setRenameError(error.message || "Could not rename this chat.");
    } finally {
      setIsSavingRename(false);
    }
  }

  async function handleDelete(conversation) {
    setOpenMenuId(null);
    if (
      !window.confirm(
        `Delete "${conversation.title || "New chat"}"? This cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      await onDeleteConversation?.(conversation);
    } catch {
      // The chat page reports request errors in its existing alert area.
    }
  }

  return (
    <aside
      className={`relative flex h-full shrink-0 flex-col bg-[#f9f9f9] text-left transition-all duration-300 ease-in-out select-none border-r border-neutral-200/60 dark:border-neutral-800/80 dark:bg-[#171717] md:w-full md:rounded-2xl md:border md:shadow-sm ${
        isOpen
          ? "w-[260px] opacity-100 md:w-full"
          : "w-0 opacity-0 overflow-hidden pointer-events-none border-r-0 md:w-0"
      }`}
    >
      {/* Top Header: Logo + Close Sidebar Toggle Button */}
      <div className="flex h-13 shrink-0 items-center justify-between px-3 pt-2">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-lg p-1.5 transition hover:bg-black/5 dark:hover:bg-white/5"
          aria-label="Home"
          title="Home"
        >
          {/* OpenAI spiral logo */}
          <svg
            className="h-5 w-5 text-[#0d0d0d] dark:text-white"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.6668zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813v6.7227zm1.1448-1.9967l3.0537-1.7616 3.0537 1.7616v3.5232l-3.0537 1.7616-3.0537-1.7616z" />
          </svg>
        </Link>

        {/* Close sidebar button */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="grid h-8 w-8 place-items-center rounded-lg text-neutral-600 transition hover:bg-black/5 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white"
          aria-label="Close sidebar"
          title="Close sidebar"
        >
          <PanelLeft className="h-[18px] w-[18px]" />
        </button>
      </div>

      {/* Main Action Items: New chat, Search chats, Library */}
      <div className="flex flex-col gap-0.5 px-2.5 pt-2">
        {/* New chat */}
        <button
          type="button"
          onClick={onNewChat}
          disabled={isCreating}
          className="flex h-9 w-full items-center gap-3 rounded-lg px-2.5 text-left text-[14px] font-normal text-[#0d0d0d] transition hover:bg-black/5 disabled:opacity-40 dark:text-[#ececec] dark:hover:bg-white/5"
        >
          {isCreating ? (
            <LoaderCircle className="h-[18px] w-[18px] animate-spin text-neutral-700 dark:text-neutral-300" />
          ) : (
            <SquarePen className="h-[18px] w-[18px] text-neutral-700 dark:text-neutral-300" />
          )}
          <span>New chat</span>
        </button>

        {/* Search chats */}
        <button
          type="button"
          onClick={onToggleSearch}
          className={`flex h-9 w-full items-center gap-3 rounded-lg px-2.5 text-left text-[14px] font-normal text-[#0d0d0d] transition hover:bg-black/5 dark:text-[#ececec] dark:hover:bg-white/5 ${
            isSearching ? "bg-black/5 dark:bg-white/5 font-medium" : ""
          }`}
        >
          <Search className="h-[18px] w-[18px] text-neutral-700 dark:text-neutral-300" />
          <span>Search chats</span>
        </button>

        {/* Inline Search Input */}
        {isSearching && (
          <div className="relative my-1">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
            <input
              type="search"
              placeholder="Search chats..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-8.5 w-full rounded-lg border border-neutral-300/80 bg-white pl-8 pr-7 text-[13px] text-neutral-900 outline-none transition focus:border-neutral-500 dark:border-neutral-700 dark:bg-[#242424] dark:text-white"
              autoFocus
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Library (only) */}
        <button
          type="button"
          onClick={onNewChat}
          className="flex h-9 w-full items-center justify-between rounded-lg px-2.5 text-left text-[14px] font-normal text-[#0d0d0d] transition hover:bg-black/5 dark:text-[#ececec] dark:hover:bg-white/5"
        >
          <div className="flex items-center gap-3">
            <Images className="h-[18px] w-[18px] text-neutral-700 dark:text-neutral-300" />
            <span>Library</span>
          </div>
          <span className="pr-1 text-[13px] font-normal text-neutral-500 dark:text-neutral-400">
            {conversations.length || 11}
          </span>
        </button>
      </div>

      {/* "Chats" Section Header */}
      <div className="px-5 pt-5 pb-1.5">
        <span className="text-[12px] font-medium text-[#8e8ea0] dark:text-neutral-400">
          Chats
        </span>
      </div>

      {/* Conversations List */}
      <div className="min-h-0 flex-1 overflow-y-auto px-2.5 pb-2">
        {isLoading ? (
          <div className="space-y-1.5 py-1">
            <div className="h-7 w-full animate-pulse rounded-lg bg-black/5 dark:bg-white/5" />
            <div className="h-7 w-5/6 animate-pulse rounded-lg bg-black/5 dark:bg-white/5" />
            <div className="h-7 w-4/6 animate-pulse rounded-lg bg-black/5 dark:bg-white/5" />
          </div>
        ) : filteredConversations.length ? (
          <ul className="space-y-0.5">
            {filteredConversations.map((conversation) => {
              const isActive =
                String(activeConversationId) === String(conversation.id);
              const title = conversation.title || "New chat";

              const isMenuOpen = openMenuId === conversation.id;

              return (
                <li
                  key={conversation.id}
                  className={`group relative rounded-lg ${
                    isActive
                      ? "bg-black/[0.08] dark:bg-white/[0.1]"
                      : "hover:bg-black/[0.04] dark:hover:bg-white/[0.05]"
                  }`}
                  data-conversation-menu
                >
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => onSelectConversation(conversation)}
                      title={title}
                      className={`min-w-0 flex-1 rounded-lg px-2.5 py-1.5 text-left text-[13.5px] leading-snug transition-colors duration-100 ${
                        isActive
                          ? "font-medium text-[#0d0d0d] dark:text-white"
                          : "text-[#0d0d0d] dark:text-[#ececec]"
                      }`}
                    >
                      <span className="block truncate">{title}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenuId((current) =>
                          current === conversation.id ? null : conversation.id,
                        )
                      }
                      aria-label={`Actions for ${title}`}
                      aria-haspopup="true"
                      aria-expanded={isMenuOpen}
                      className={`mr-1 grid h-7 w-7 shrink-0 place-items-center rounded-md text-neutral-500 transition hover:bg-black/10 hover:text-neutral-900 focus-visible:opacity-100 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white ${
                        isMenuOpen
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
                      }`}
                    >
                      <Ellipsis aria-hidden="true" className="h-4 w-4" />
                    </button>
                  </div>

                  {isMenuOpen && (
                    <div
                      role="group"
                      aria-label={`Actions for ${title}`}
                      className="absolute top-8 right-1 z-40 w-48 overflow-hidden rounded-xl border border-neutral-200 bg-white p-1.5 shadow-xl shadow-black/10 dark:border-neutral-700 dark:bg-[#303030] dark:shadow-black/30"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenMenuId(null)}
                        className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-[13px] text-neutral-800 transition hover:bg-neutral-100 dark:text-neutral-100 dark:hover:bg-white/10"
                      >
                        <Share2 aria-hidden="true" className="h-4 w-4" />
                        Share
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRenameTarget(conversation);
                          setRenameTitle(title);
                          setRenameError("");
                          setOpenMenuId(null);
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-[13px] text-neutral-800 transition hover:bg-neutral-100 dark:text-neutral-100 dark:hover:bg-white/10"
                      >
                        <Pencil aria-hidden="true" className="h-4 w-4" />
                        Rename
                      </button>
                      <div className="my-1 border-t border-neutral-200 dark:border-neutral-700" />
                      <button
                        type="button"
                        onClick={() => handleDelete(conversation)}
                        className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-[13px] text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                      >
                        <Trash2 aria-hidden="true" className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="px-3 py-6 text-left">
            <p className="text-[13px] text-neutral-400 dark:text-neutral-500">
              {searchValue ? "No matching chats" : "No chats yet"}
            </p>
          </div>
        )}
      </div>

      {/* Bottom: Upgrade Plan (as in Figma) */}
      <div className="mt-auto shrink-0 border-t border-neutral-200/80 p-2.5 dark:border-neutral-800">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-black/5 dark:hover:bg-white/5"
        >
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-neutral-200/80 bg-white text-neutral-800 shadow-2xs dark:border-neutral-700 dark:bg-[#222] dark:text-neutral-200">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-[#0d0d0d] dark:text-white">
              Upgrade plan
            </p>
            <p className="truncate text-[11px] text-neutral-500 dark:text-neutral-400">
              More access to the best models
            </p>
          </div>
        </button>
      </div>
      {renameTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isSavingRename) {
              setRenameTarget(null);
            }
          }}
        >
          <form
            onSubmit={handleRenameSubmit}
            aria-labelledby="rename-chat-title"
            className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xl dark:border-neutral-700 dark:bg-[#252525]"
          >
            <h2
              id="rename-chat-title"
              className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white"
            >
              Rename chat
            </h2>
            <label
              htmlFor="rename-chat-input"
              className="mb-1.5 block text-[13px] font-medium text-neutral-700 dark:text-neutral-300"
            >
              Chat name
            </label>
            <input
              id="rename-chat-input"
              autoFocus
              maxLength={255}
              value={renameTitle}
              onChange={(event) => setRenameTitle(event.target.value)}
              className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none focus:border-neutral-500 dark:border-neutral-600 dark:bg-[#1b1b1b] dark:text-white"
            />
            {renameError && (
              <p className="mt-2 text-[12px] text-red-600" role="alert">
                {renameError}
              </p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                disabled={isSavingRename}
                onClick={() => setRenameTarget(null)}
                className="h-9 rounded-lg px-3 text-[13px] font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:opacity-50 dark:text-neutral-300 dark:hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!renameTitle.trim() || isSavingRename}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-neutral-900 px-3 text-[13px] font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                {isSavingRename ? (
                  <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </aside>
  );
}

export default ConversationCard;
