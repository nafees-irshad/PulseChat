import {
  Check,
  ChevronDown,
  Ellipsis,
  Library,
  LoaderCircle,
  Pencil,
  PanelLeft,
  Search,
  Share2,
  Trash2,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import UserMenu from "./userMenu.jsx";

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
      className={`relative flex h-full w-[min(320px,85vw)] shrink-0 flex-col bg-[#f9f9f9] text-left shadow-xl transition-all duration-300 ease-in-out select-none md:w-[260px] md:shadow-none dark:bg-[#171717] ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Top Header: Brand Dropdown + Search Icon + Close Sidebar Toggle */}
      <div className="flex h-13 shrink-0 items-center justify-between px-3 pt-2">
        <Link
          to="/"
          className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[15px] font-semibold tracking-tight text-[#0d0d0d] transition hover:bg-black/5 dark:text-white dark:hover:bg-white/5"
          aria-label="Pulse AI Home"
          title="Pulse AI"
        >
          <span>Pulse AI</span>
          <ChevronDown className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
        </Link>

        <div className="flex items-center gap-0.5">
          {/* Search icon button (toggles search input) */}
          <button
            type="button"
            onClick={onToggleSearch}
            className={`grid h-8 w-8 place-items-center rounded-lg transition ${
              isSearching
                ? "bg-black/10 text-neutral-900 dark:bg-white/15 dark:text-white"
                : "text-neutral-600 hover:bg-black/5 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white"
            }`}
            aria-label="Search chats"
            title="Search chats"
          >
            <Search className="h-[18px] w-[18px]" />
          </button>

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
      </div>

      {/* Inline Search Input (triggered by top search icon) */}
      {isSearching && (
        <div className="px-3 pt-1.5 pb-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
            <input
              type="search"
              placeholder="Search chats..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-8.5 w-full rounded-lg border border-neutral-300/80 bg-white pl-8 pr-7 text-[13.5px] text-neutral-900 outline-none transition focus:border-neutral-500 dark:border-neutral-700 dark:bg-[#212121] dark:text-white"
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
        </div>
      )}

      {/* Main Action Items: New chat, Library */}
      <div className="flex flex-col gap-0.5 px-3 pt-2">
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
            <svg
              className="h-[18px] w-[18px] shrink-0 text-neutral-700 dark:text-neutral-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14.5 4H6.5C5.11929 4 4 5.11929 4 6.5V17.5C4 18.8807 5.11929 20 6.5 20H17.5C18.8807 20 20 18.8807 20 17.5V9.5" />
              <path d="M8.5 15.5L12 15L20.5 6.5C21.3284 5.67157 21.3284 4.32843 20.5 3.5C19.6716 2.67157 18.3284 2.67157 17.5 3.5L9 12L8.5 15.5Z" />
            </svg>
          )}
          <span>New chat</span>
        </button>

        {/* Library */}
        <button
          type="button"
          onClick={() => {}}
          className="flex h-9 w-full items-center justify-between rounded-lg px-2.5 text-left text-[14px] font-normal text-[#0d0d0d] transition hover:bg-black/5 dark:text-[#ececec] dark:hover:bg-white/5"
        >
          <div className="flex items-center gap-3">
            <Library className="h-[18px] w-[18px] shrink-0 text-neutral-700 dark:text-neutral-300" />
            <span>Library</span>
          </div>
          {conversations.length > 0 && (
            <span className="pr-1 text-[12.5px] font-normal text-neutral-400 dark:text-neutral-500">
              {conversations.length}
            </span>
          )}
        </button>
      </div>

      {/* "Recents" Section Header */}
      <div className="px-5 pt-4 pb-1.5">
        <span className="text-[12px] font-medium text-[#8e8ea0] dark:text-neutral-400">
          Recents
        </span>
      </div>

      {/* Conversations List */}
      <div className="conversation-list-scroll min-h-0 flex-1 overflow-y-auto px-3 pb-2">
        {isLoading ? (
          <div className="space-y-1.5 py-1">
            <div className="h-8 w-full animate-pulse rounded-lg bg-black/5 dark:bg-white/5" />
            <div className="h-8 w-5/6 animate-pulse rounded-lg bg-black/5 dark:bg-white/5" />
            <div className="h-8 w-4/6 animate-pulse rounded-lg bg-black/5 dark:bg-white/5" />
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
                  className={`group relative rounded-lg transition-colors ${
                    isActive
                      ? "bg-[#ececec] dark:bg-[#212121]"
                      : "hover:bg-[#f0f0f0] dark:hover:bg-white/[0.06]"
                  }`}
                  data-conversation-menu
                >
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => onSelectConversation(conversation)}
                      title={title}
                      className={`min-w-0 flex-1 rounded-lg px-3 py-2 text-left text-[14px] leading-5 transition-colors duration-100 ${
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
                      className={`mr-1.5 grid h-7 w-7 shrink-0 place-items-center rounded-md text-neutral-500 transition hover:bg-black/10 hover:text-neutral-900 focus-visible:opacity-100 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white ${
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

      {/* Profile at the bottom of the sidebar */}
      <div className="shrink-0 p-2.5 pt-1">
        <UserMenu variant="sidebar" />
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
