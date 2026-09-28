import {
  LoaderCircle,
  MessageSquare,
  Search,
  SquarePen,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

function ConversationCard({
  conversations,
  activeConversationId,
  isSearching,
  searchValue,
  isLoading,
  isCreating,
  onNewChat,
  onToggleSearch,
  onSearchChange,
  onSelectConversation,
}) {
  const filteredConversations = conversations.filter((conversation) =>
    (conversation.title || "New Chat")
      .toLowerCase()
      .includes(searchValue.toLowerCase()),
  );

  return (
    <aside className="flex h-full min-h-0 w-[260px] shrink-0 flex-col border-r border-[#e5e5e5] bg-white text-left transition-all duration-200 select-none max-sm:w-[64px] dark:border-[#262626] dark:bg-[#212121]">
      {/* Top Sidebar Header with Espresso AI Logo */}
      <div className="flex h-14 shrink-0 items-center justify-between px-3.5 pt-2">
        <Link
          to="/"
          className="flex items-center gap-2.5 text-[15px] font-semibold text-[#171717] no-underline transition hover:opacity-80 max-sm:justify-center dark:text-white"
          aria-label="Espresso AI home"
        >
          <svg
            aria-hidden="true"
            className="h-4 w-4 shrink-0 text-[#171717] dark:text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          >
            <path d="m15 5 4 4M4 20l4.2-.8L19 8.4a2.1 2.1 0 0 0-3-3L5.2 16.2 4 20Z" />
            <path d="M13.5 6.5 17.5 10.5" />
          </svg>
          <span className="truncate tracking-tight max-sm:hidden">
            PulseChat
          </span>
        </Link>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-1 px-2.5 pb-2">
        <button
          className="group flex h-10 w-full items-center gap-2.5 rounded-xl px-3 text-left text-[13.5px] font-medium text-neutral-800 transition-colors duration-150 hover:bg-[#f2f2f2] disabled:opacity-50 max-sm:justify-center max-sm:px-0 dark:text-[#ececec] dark:hover:bg-[#2b2b2b]"
          type="button"
          onClick={onNewChat}
          disabled={isCreating}
          aria-label="New chat"
          title="New chat"
        >
          {isCreating ? (
            <LoaderCircle
              aria-hidden="true"
              className="h-4 w-4 shrink-0 animate-spin text-neutral-500 dark:text-neutral-400"
            />
          ) : (
            <SquarePen
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-neutral-600 transition-transform duration-150 group-hover:scale-105 dark:text-neutral-300"
            />
          )}
          <span className="truncate max-sm:hidden">
            {isCreating ? "Starting..." : "New chat"}
          </span>
        </button>

        <button
          className={`flex h-10 w-full items-center gap-2.5 rounded-xl px-3 text-left text-[13.5px] font-medium transition-colors duration-150 max-sm:justify-center max-sm:px-0 ${
            isSearching
              ? "bg-[#f0f0f0] text-neutral-900 dark:bg-[#2b2b2b] dark:text-white"
              : "text-neutral-600 hover:bg-[#f2f2f2] hover:text-neutral-900 dark:text-[#a3a3a3] dark:hover:bg-[#2b2b2b] dark:hover:text-white"
          }`}
          type="button"
          onClick={onToggleSearch}
          aria-label={isSearching ? "Close chat search" : "Search chats"}
          title="Search chats"
        >
          {isSearching ? (
            <X
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-neutral-600 dark:text-neutral-300"
            />
          ) : (
            <Search
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-neutral-600 dark:text-neutral-300"
            />
          )}
          <span className="truncate max-sm:hidden">Search chats</span>
        </button>

        {isSearching && (
          <div className="relative mt-1 max-sm:hidden">
            <Search
              aria-hidden="true"
              className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400 dark:text-neutral-500"
            />
            <input
              className="h-9 w-full rounded-xl border border-neutral-300 bg-[#f4f4f4] pl-8.5 pr-3 text-[13px] text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-500 focus:bg-white focus:ring-1 focus:ring-neutral-400 dark:border-neutral-700/80 dark:bg-[#2b2b2b] dark:text-[#ececec] dark:placeholder:text-neutral-500 dark:focus:border-neutral-500 dark:focus:ring-neutral-500"
              type="search"
              placeholder="Search chats..."
              aria-label="Search chats"
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              autoFocus
            />
          </div>
        )}
      </div>

      {/* Recents list section */}
      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2 max-sm:hidden">
        <h2 className="px-3 pt-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 select-none dark:text-[#8e8e8e]">
          {searchValue ? "Search Results" : "Recents"}
        </h2>

        {isLoading ? (
          <div className="space-y-1 px-1 py-1">
            <div className="h-9 w-full animate-pulse rounded-xl bg-neutral-100 dark:bg-[#2b2b2b]" />
            <div className="h-9 w-full animate-pulse rounded-xl bg-neutral-100/70 dark:bg-[#2b2b2b]/70" />
            <div className="h-9 w-3/4 animate-pulse rounded-xl bg-neutral-100/50 dark:bg-[#2b2b2b]/50" />
          </div>
        ) : filteredConversations.length ? (
          <ul className="space-y-0.5">
            {filteredConversations.map((conversation) => {
              const isActive =
                String(activeConversationId) === String(conversation.id);
              const title = conversation.title || "New Chat";

              return (
                <li key={conversation.id}>
                  <button
                    className={`group flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[13.5px] leading-5 transition-colors duration-150 ${
                      isActive
                        ? "bg-[#f0f0f0] font-medium text-neutral-900 shadow-xs dark:bg-[#2b2b2b] dark:text-white"
                        : "text-neutral-600 hover:bg-[#f5f5f5] hover:text-neutral-900 dark:text-[#b4b4b4] dark:hover:bg-[#282828] dark:hover:text-white"
                    }`}
                    type="button"
                    onClick={() => onSelectConversation(conversation)}
                    title={title}
                  >
                    <span className="truncate">{title}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="px-3 py-6 text-center">
            <p className="text-[12.5px] text-neutral-400 dark:text-neutral-500">
              {searchValue ? "No matching chats" : "No chats yet"}
            </p>
          </div>
        )}
      </div>

      {/* Mobile-only compact chat list */}
      <div className="hidden min-h-0 flex-1 overflow-y-auto p-1.5 max-sm:block">
        <ul className="space-y-1.5">
          {filteredConversations.map((conversation) => {
            const isActive =
              String(activeConversationId) === String(conversation.id);
            return (
              <li key={conversation.id}>
                <button
                  className={`grid h-10 w-full place-items-center rounded-xl transition ${
                    isActive
                      ? "bg-[#f0f0f0] text-neutral-900 dark:bg-[#2b2b2b] dark:text-white"
                      : "text-neutral-500 hover:bg-[#f5f5f5] dark:text-neutral-400 dark:hover:bg-[#282828]"
                  }`}
                  type="button"
                  onClick={() => onSelectConversation(conversation)}
                  title={conversation.title || "New Chat"}
                >
                  <MessageSquare className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}

export default ConversationCard;
