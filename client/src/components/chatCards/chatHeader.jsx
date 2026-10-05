import { PanelLeft } from "lucide-react";
import Theme from "../theme.jsx";
import UserMenu from "../userMenu.jsx";

function ChatHeader({
  title = "New chat",
  isSidebarOpen = true,
  onToggleSidebar,
}) {
  return (
    <header className="flex h-13 shrink-0 items-center justify-between px-4 pt-1 select-none">
      <div className="flex min-w-0 items-center gap-2">
        {!isSidebarOpen && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-neutral-600 transition hover:bg-black/5 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="Show sidebar"
            title="Show sidebar"
          >
            <PanelLeft className="h-[18px] w-[18px]" />
          </button>
        )}
        <h1
          className="m-0 hidden min-w-0 max-w-[min(48vw,560px)] truncate px-2.5 py-1.5 text-[16px] leading-tight font-semibold tracking-normal text-[#0d0d0d] sm:block dark:text-white"
          title={title}
        >
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <Theme />
        <UserMenu />
      </div>
    </header>
  );
}

export default ChatHeader;
