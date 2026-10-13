import { useEffect, useRef, useState } from "react";
import {
  Headset,
  LogOut,
  Settings,
  Sun,
  UserRound,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getProfile } from "../api/profileApi.js";
import { useAuth } from "../context/useAuth.js";

const THEME_STORAGE_KEY = "pulse-theme";

function getStoredTheme() {
  if (typeof window === "undefined") return "system";
  const stored =
    window.localStorage.getItem(THEME_STORAGE_KEY) ||
    window.localStorage.getItem("espresso-theme");
  if (stored === "light" || stored === "dark") {
    return stored;
  }
  if (stored === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "light";
}

function applyTheme(selectedTheme) {
  let effectiveTheme = selectedTheme;
  if (selectedTheme === "system") {
    effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  document.documentElement.dataset.theme = effectiveTheme;
  window.localStorage.setItem(THEME_STORAGE_KEY, selectedTheme);
  window.localStorage.setItem("espresso-theme", effectiveTheme);
}

function UserMenu() {
  const navigate = useNavigate();
  const { isAuthenticated, clearToken } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState(getStoredTheme);
  const [profile, setProfile] = useState(null);
  const menuContainerRef = useRef(null);

  // Close menu on click outside or Escape
  useEffect(() => {
    if (!isMenuOpen) return undefined;

    const handlePointerDown = (event) => {
      if (
        menuContainerRef.current &&
        !menuContainerRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  // Sync theme changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const handleThemeChange = (event) => {
      if (event.detail === "light" || event.detail === "dark") {
        setTheme(event.detail);
      }
    };
    window.addEventListener("pulse-theme-change", handleThemeChange);
    return () =>
      window.removeEventListener("pulse-theme-change", handleThemeChange);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    let isCurrent = true;

    getProfile()
      .then((userProfile) => {
        if (isCurrent) setProfile(userProfile);
      })
      .catch((error) => {
        console.error("Unable to load user menu profile:", error);
        if (isCurrent) setProfile(null);
      });

    return () => {
      isCurrent = false;
    };
  }, [isAuthenticated]);

  function toggleMenu() {
    const shouldOpen = !isMenuOpen;
    setIsMenuOpen(shouldOpen);
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
      <div className="relative" ref={menuContainerRef}>
        <Link
          to="/login"
          className="flex w-full items-center gap-3 rounded-xl p-2 px-2.5 text-left transition hover:bg-black/5 dark:hover:bg-white/5"
        >
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-neutral-800 text-[13.5px] font-semibold text-white dark:bg-neutral-700">
            <UserRound className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14.5px] font-semibold text-[#0d0d0d] dark:text-white">
              Sign in
            </p>
            <p className="truncate text-[12.5px] text-neutral-500 dark:text-neutral-400">
              Free
            </p>
          </div>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuContainerRef}>
      {/* Profile button at the bottom of the sidebar */}
      <button
        type="button"
        aria-label="Open profile menu"
        aria-expanded={isMenuOpen}
        onClick={toggleMenu}
        className="flex w-full items-center gap-3 rounded-xl p-2 px-2.5 text-left transition hover:bg-black/5 dark:hover:bg-white/5"
      >
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-neutral-900 text-[13.5px] font-semibold text-white shadow-xs dark:bg-neutral-700">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14.5px] font-semibold leading-tight text-[#0d0d0d] dark:text-white">
            {profile?.name || "User"}
          </p>
          <p className="truncate text-[12.5px] text-neutral-500 dark:text-neutral-400">
            Free
          </p>
        </div>
      </button>

      {/* Floating Profile Popup Menu (opens upward) */}
      {isMenuOpen && (
        <div className="absolute bottom-full left-0 z-50 mb-2 w-64 overflow-visible rounded-2xl border border-neutral-200 bg-white p-1.5 text-left shadow-[0_12px_36px_rgba(0,0,0,0.18)] dark:border-neutral-750 dark:bg-[#212121] dark:shadow-black/60">
          {/* User Profile / Email Header */}
          <Link
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13.5px] text-neutral-800 no-underline transition hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-white/5"
            to="/profile"
            onClick={() => setIsMenuOpen(false)}
          >
            <UserRound aria-hidden="true" className="h-4 w-4 shrink-0 text-neutral-500" />
            <span className="truncate font-medium">
              {profile?.email || profile?.name || "Your account"}
            </span>
          </Link>

          <div className="my-1 border-t border-neutral-200 dark:border-neutral-700/70" />

          <Link
            to="/profile/appearance"
            onClick={() => setIsMenuOpen(false)}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13.5px] text-neutral-800 no-underline transition hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-white/5"
          >
            <Sun aria-hidden="true" className="h-4 w-4 text-neutral-500" />
            <span>Appearance</span>
          </Link>

          {/* Settings */}
          <Link
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13.5px] text-neutral-800 no-underline transition hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-white/5"
            to="/profile#settings"
            onClick={() => setIsMenuOpen(false)}
          >
            <Settings aria-hidden="true" className="h-4 w-4 text-neutral-500" />
            <span>Settings</span>
          </Link>

          {/* Help */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(false)}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13.5px] text-neutral-800 transition hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-white/5"
          >
            <Headset aria-hidden="true" className="h-4 w-4 text-neutral-500" />
            <span>Help & Support</span>
          </button>

          <div className="my-1 border-t border-neutral-200 dark:border-neutral-700/70" />

          {/* Log out */}
          <button
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13.5px] text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
            type="button"
            onClick={handleLogout}
          >
            <LogOut aria-hidden="true" className="h-4 w-4" />
            <span>Log out</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
