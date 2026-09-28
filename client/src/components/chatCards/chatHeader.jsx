import { ChevronDown, Clock, PanelLeft, Share2, Sparkles } from "lucide-react";
import Theme from "../theme.jsx";
import UserMenu from "../userMenu.jsx";

function ChatHeader({
  hasMessages = false,
  onShare,
  isSidebarOpen = true,
  onToggleSidebar,
}) {
  return (
    <header className="flex h-13 shrink-0 items-center justify-between px-4 pt-1 select-none">
      {/* Left: Open sidebar (if collapsed) + Pulse AI logo selector */}
      <div className="flex items-center gap-2">
        {!isSidebarOpen && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="grid h-8 w-8 place-items-center rounded-lg text-neutral-600 transition hover:bg-black/5 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="Open sidebar"
            title="Open sidebar"
          >
            <PanelLeft className="h-[18px] w-[18px]" />
          </button>
        )}

        {/* Pulse AI Model Selector (replaces ChatGPT) */}
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[17px] font-semibold text-[#0d0d0d] transition hover:bg-black/5 dark:text-white dark:hover:bg-white/5"
          aria-label="Model selector"
        >
          {/* Pulse AI Logo Mark */}
          <svg
            aria-hidden="true"
            className="h-4 w-4 shrink-0 text-[#0d0d0d] dark:text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          >
            <path d="m15 5 4 4M4 20l4.2-.8L19 8.4a2.1 2.1 0 0 0-3-3L5.2 16.2 4 20Z" />
            <path d="M13.5 6.5 17.5 10.5" />
          </svg>
          <span>Pulse AI</span>
          <ChevronDown className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
        </button>
      </div>

      {/* Center: Get Plus */}
      <div className="flex items-center">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full bg-[#f4f0ff] px-3.5 py-1 text-[13px] font-medium text-[#6e46e6] transition hover:bg-[#eae2ff] dark:bg-[#2c224a] dark:text-[#b49aff] dark:hover:bg-[#392c5e]"
        >
          <Sparkles className="h-3.5 w-3.5 fill-current" />
          <span>Get Plus</span>
        </button>
      </div>

      {/* Right: Temporary chat + Share + Theme + Profile */}
      <div className="flex items-center gap-2">
        {hasMessages && (
          <button
            type="button"
            onClick={onShare}
            className="flex h-8 items-center gap-1.5 rounded-full border border-neutral-200/80 bg-white px-3 text-[13px] font-medium text-neutral-700 shadow-2xs transition hover:bg-neutral-50 dark:border-neutral-700/70 dark:bg-[#2a2a2a] dark:text-neutral-200 dark:hover:bg-[#323232]"
            aria-label="Share conversation"
            title="Share"
          >
            <Share2 aria-hidden="true" className="h-3.5 w-3.5" />
            <span className="max-sm:hidden">Share</span>
          </button>
        )}

        <button
          type="button"
          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-neutral-200/80 bg-white px-3 text-[13px] font-medium text-neutral-700 shadow-2xs transition hover:bg-neutral-50 dark:border-neutral-700/70 dark:bg-[#2a2a2a] dark:text-neutral-200 dark:hover:bg-[#323232]"
          title="Temporary chat"
        >
          <Clock aria-hidden="true" className="h-3.5 w-3.5 text-neutral-500" />
          <span className="max-sm:hidden">Temporary</span>
        </button>

        <Theme />
        <UserMenu />
      </div>
    </header>
  );
}

export default ChatHeader;
