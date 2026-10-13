import { useLocation } from "react-router-dom";

function Logo({ children }) {
  const location = useLocation();
  const isChatOrHome =
    location.pathname.startsWith("/chat") || location.pathname === "/";

  if (isChatOrHome) {
    return <div className="h-svh w-full overflow-hidden bg-white dark:bg-[#212121]">{children}</div>;
  }

  return (
    <div className="h-svh w-full overflow-hidden bg-white dark:bg-[#141519]">
      <div className="flex h-full min-h-0 w-full flex-col bg-white px-5 py-3 sm:px-8 dark:bg-[#141519]">
        {children}
      </div>
    </div>
  );
}

export default Logo;
