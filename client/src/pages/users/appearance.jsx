import { useEffect, useState } from "react";
import { Check, Moon, Sun } from "lucide-react";

const THEME_STORAGE_KEY = "pulse-theme";

function getInitialTheme() {
  const theme =
    window.localStorage.getItem(THEME_STORAGE_KEY) ||
    window.localStorage.getItem("espresso-theme");
  if (theme === "dark" || theme === "light") return theme;

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

const themes = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
];

function AppearancePage() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    window.localStorage.setItem("espresso-theme", theme);
    window.dispatchEvent(
      new CustomEvent("pulse-theme-change", { detail: theme }),
    );
  }, [theme]);

  function handleThemeChange(nextTheme) {
    setTheme(nextTheme);
  }

  return (
    <main className="min-h-0 flex-1 overflow-y-auto px-4 py-8 sm:px-8">
      <div className="mx-auto w-full max-w-[760px] text-left">
        <header className="mb-8">
          <h1 className="text-[26px] font-semibold text-[#171717]">
            Appearance
          </h1>
          <p className="mt-1 text-[14px] text-[#777]">
            Choose how PulseChat looks on this device.
          </p>
        </header>

        <section
          className="border-t border-[#e8e8e8] py-6"
          aria-labelledby="appearance-theme-heading"
        >
          <h2
            className="mb-5 text-[17px] font-semibold text-[#222]"
            id="appearance-theme-heading"
          >
            Theme
          </h2>
          <div className="grid max-w-[560px] grid-cols-1 gap-4 sm:grid-cols-2">
            {themes.map(({ value, label, Icon }) => {
              const isSelected = theme === value;
              return (
                <button
                  key={value}
                  aria-pressed={isSelected}
                  className={`relative flex min-h-32 flex-col items-center justify-center gap-2 rounded-2xl border p-5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                    isSelected
                      ? "border-violet-500 bg-violet-50/70 text-neutral-950 dark:border-violet-400 dark:bg-violet-400/10 dark:text-white"
                      : "border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-[#212121] dark:text-neutral-200 dark:hover:border-neutral-600 dark:hover:bg-white/5"
                  }`}
                  type="button"
                  onClick={() => handleThemeChange(value)}
                >
                  {isSelected && (
                    <Check
                      aria-hidden="true"
                      className="absolute right-4 top-4 h-4 w-4 text-violet-600 dark:text-violet-300"
                    />
                  )}
                  <Icon aria-hidden="true" className="h-6 w-6" />
                  <span className="text-base font-medium">{label}</span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

export default AppearancePage;
