import { useLocation } from "react-router-dom";

function Logo({ children }) {
  const location = useLocation();
  const isChatOrHome =
    location.pathname.startsWith("/chat") ||
    location.pathname === "/" ||
    location.pathname.startsWith("/library");

  if (isChatOrHome) {
    return <div className="h-svh w-full overflow-hidden bg-white dark:bg-black">{children}</div>;
  }

  return (
    <div className="h-svh w-full overflow-hidden bg-white dark:bg-black">
      <div className="flex h-full min-h-0 w-full flex-col bg-white px-5 py-3 sm:px-8 dark:bg-black">
        {children}
      </div>
    </div>
  );
}

export default Logo;
