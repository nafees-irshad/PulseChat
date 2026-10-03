import { useState } from "react";
import {
  Archive,
  Headset,
  LogOut,
  Settings,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getProfile } from "../api/profileApi.js";
import { useAuth } from "../context/useAuth.js";

function UserMenu({ variant = "icon" }) {
  const navigate = useNavigate();
  const { isAuthenticated, clearToken } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  async function toggleMenu() {
    const shouldOpen = !isMenuOpen;
    setIsMenuOpen(shouldOpen);
    if (!shouldOpen || profile || isLoadingProfile || !isAuthenticated) return;

    setIsLoadingProfile(true);
    try {
      setProfile(await getProfile());
    } catch {
      setProfile(null);
    } finally {
      setIsLoadingProfile(false);
    }
  }

  function handleLogout() {
    clearToken();
    setProfile(null);
    setIsMenuOpen(false);
    navigate("/login");
  }

  // Initials helper
  const initials = (profile?.name || "U")
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (!isAuthenticated) {
    return (
      <nav className="flex items-center gap-2" aria-label="Account">
        <Link
          className="rounded-full bg-black px-4 py-1.5 text-[12px] font-medium text-white no-underline transition hover:bg-[#292929] dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          to="/login"
        >
          Log in
        </Link>
        <Link
          className="rounded-full border border-[#e5e5e5] px-4 py-1.5 text-[12px] font-medium text-[#171717] no-underline transition hover:bg-[#f7f7f7] dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
          to="/signup"
        >
          Sign up
        </Link>
      </nav>
    );
  }

  return (
    <div className="relative">
      {variant === "sidebar" ? (
        /* Full-width profile row for sidebar footer */
        <button
          type="button"
          aria-label="Open profile menu"
          aria-expanded={isMenuOpen}
          onClick={toggleMenu}
          className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-black/5 dark:hover:bg-white/5"
        >
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#303030] text-[12px] font-semibold text-white dark:bg-neutral-700">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-[#0d0d0d] dark:text-white">
              {isLoadingProfile ? "Loading…" : profile?.name || "My Account"}
            </p>
            <p className="truncate text-[11px] text-neutral-500 dark:text-neutral-400">
              {profile?.email || "Free plan"}
            </p>
          </div>
        </button>
      ) : (
        /* Small icon button for chat header */
        <button
          className="grid h-9 w-9 place-items-center rounded-full bg-[#f0f0f0] text-[#333] transition hover:bg-[#e6e6e6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#999] dark:bg-[#2a2a2a] dark:text-[#ececec] dark:hover:bg-[#333]"
          type="button"
          aria-label="Open profile menu"
          aria-expanded={isMenuOpen}
          onClick={toggleMenu}
        >
          <UserRound aria-hidden="true" className="h-[18px] w-[18px]" />
        </button>
      )}

      {isMenuOpen && (
        <div
          className={`absolute z-50 w-[280px] max-w-[calc(100vw-24px)] overflow-hidden rounded-2xl border border-[#e5e5e5] bg-white p-1.5 text-left shadow-[0_12px_36px_rgba(0,0,0,0.16)] dark:border-[#2b2d33] dark:bg-[#191a1f] ${
            variant === "sidebar" ? "bottom-full left-0 mb-2" : "right-0 top-11"
          }`}
        >
          <Link
            className="flex h-10 items-center gap-2.5 rounded-lg px-2.5 text-[13px] text-[#777] no-underline hover:bg-[#f5f5f5] dark:text-[#aaa] dark:hover:bg-[#24262c]"
            to="/profile"
            onClick={() => setIsMenuOpen(false)}
          >
            <UserRound aria-hidden="true" className="h-4 w-4 shrink-0" />
            <span className="truncate">
              {isLoadingProfile
                ? "Loading profile..."
                : profile?.email || profile?.name || "Your account"}
            </span>
          </Link>
          <div className="my-1 border-t border-[#ededed] dark:border-[#2b2d33]" />
          <button
            className="flex h-10 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-[14px] text-[#333] dark:text-[#ddd]"
            type="button"
            disabled
          >
            <Sparkles aria-hidden="true" className="h-4 w-4" />
            Upgrade Plan
          </button>
          <Link
            className="flex h-10 items-center gap-2.5 rounded-lg px-2.5 text-[14px] text-[#333] no-underline hover:bg-[#f5f5f5] dark:text-[#ddd] dark:hover:bg-[#24262c]"
            to="/profile#settings"
            onClick={() => setIsMenuOpen(false)}
          >
            <Settings aria-hidden="true" className="h-4 w-4" />
            Settings
          </Link>
          <button
            className="flex h-10 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-[14px] text-[#333] dark:text-[#ddd]"
            type="button"
            disabled
          >
            <Archive aria-hidden="true" className="h-4 w-4" />
            Archived Chats
          </button>
          <button
            className="flex h-10 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-[14px] text-[#333] dark:text-[#ddd]"
            type="button"
            disabled
          >
            <Headset aria-hidden="true" className="h-4 w-4" />
            Customer Service Center
          </button>
          <div className="my-1 border-t border-[#ededed] dark:border-[#2b2d33]" />
          <button
            className="flex h-10 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-[14px] text-[#333] transition hover:bg-[#f5f5f5] dark:text-[#ddd] dark:hover:bg-[#24262c]"
            type="button"
            onClick={handleLogout}
          >
            <LogOut aria-hidden="true" className="h-4 w-4" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
