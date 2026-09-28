import { Link, useLocation } from "react-router-dom";
import Theme from "./theme.jsx";
import UserMenu from "./userMenu.jsx";

function Logo({ children }) {
  const location = useLocation();
  const isChat = location.pathname.startsWith("/chat");

  if (isChat) {
    return (
      <div className="h-svh w-full overflow-hidden bg-white dark:bg-[#212121]">
        {children}
      </div>
    );
  }

  return (
    <div className="h-svh w-full overflow-hidden bg-white dark:bg-[#141519]">
      <div className="flex h-full min-h-0 w-full flex-col bg-white px-5 py-3 sm:px-8 dark:bg-[#141519]">
        <header className="flex shrink-0 items-center justify-between">
          <Link
            className="flex items-center gap-2 text-[15px] font-semibold text-[#171717] no-underline dark:text-white"
            to="/"
            aria-label="Espresso AI home"
          >
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.7"
            >
              <path d="m15 5 4 4M4 20l4.2-.8L19 8.4a2.1 2.1 0 0 0-3-3L5.2 16.2 4 20Z" />
              <path d="M13.5 6.5 17.5 10.5" />
            </svg>
            <span>Pulse AI</span>
          </Link>

          <div className="flex items-center gap-2">
            <Theme />
            <UserMenu />
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}

export default Logo;
