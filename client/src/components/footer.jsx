import { useLocation } from "react-router-dom";

function Footer() {
  const location = useLocation();
  if (location.pathname.startsWith("/chat")) return null;

  return (
    <footer className="shrink-0 pb-1 text-center text-[11px] text-[#a0a0a0]">
      © {new Date().getFullYear()} Espresso AI
    </footer>
  );
}

export default Footer;
