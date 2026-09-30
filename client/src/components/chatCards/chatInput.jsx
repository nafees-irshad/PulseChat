import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  ArrowUp,
  AudioWaveform,
  Check,
  ChevronDown,
  FileText,
  LoaderCircle,
  Mic,
  Plus,
  SlidersHorizontal,
  X,
} from "lucide-react";

const models = [
  { id: "groq", name: "GPT-oss-120b", provider: "Groq" },
  { id: "gemini", name: "Gemini 3.8 Flash", provider: "Google Gemini" },
  { id: "glm", name: "Dots 3 Note Preview", provider: "OpenRouter" },
  { id: "laguna", name: "Laguna S 2.1 Free", provider: "OpenRouter" },
];

function ChatInput({
  onSend,
  model = "groq",
  onModelChange,
  isSending = false,
  error = "",
  placeholder = "Ask anything",
  disabled = false,
}) {
  const [draft, setDraft] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const modelMenuRef = useRef(null);
  const modelButtonRef = useRef(null);

  useEffect(() => {
    if (!isModelMenuOpen) return undefined;

    const closeOnOutsideClick = (event) => {
      if (!modelMenuRef.current?.contains(event.target)) {
        setIsModelMenuOpen(false);
      }
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setIsModelMenuOpen(false);
        modelButtonRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isModelMenuOpen]);

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "1px";
    const sh = textarea.scrollHeight;
    textarea.style.height = `${Math.min(Math.max(sh, 40), 200)}px`;
    textarea.style.overflowY = sh > 200 ? "auto" : "hidden";
  }, []);

  useLayoutEffect(() => {
    adjustTextareaHeight();
  }, [draft, adjustTextareaHeight]);

  const handleSubmit = (event) => {
    event?.preventDefault?.();
    const trimmed = draft.trim();
    if (!trimmed || isSending || disabled) return;
    setDraft("");
    onSend?.(trimmed, selectedFile);
    setSelectedFile(null);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  const hasDraft = Boolean(draft.trim());
  const selectedModel =
    models.find((option) => option.id === model) || models[0];

  return (
    <div className="w-full shrink-0 px-4 pb-3 sm:px-6">
      {error && (
        <p
          className="mx-auto mb-2 max-w-[680px] text-center text-[13px] text-red-600 dark:text-red-400"
          role="alert"
        >
          {error}
        </p>
      )}

      {/* Main Prompt Card (matching Figma) */}
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex w-full max-w-[680px] flex-col rounded-[26px] border border-neutral-200/90 bg-[#f4f4f4] px-4 pt-3.5 pb-2.5 shadow-2xs transition-all duration-150 focus-within:border-neutral-300 dark:border-neutral-700/80 dark:bg-[#2f2f2f] dark:focus-within:border-neutral-600"
      >
        <label className="sr-only" htmlFor="chat-prompt-textarea">
          Ask Pulse AI
        </label>

        {selectedFile && (
          <div className="mb-2 flex max-w-full items-center gap-2 self-start rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-[12px] text-neutral-700 dark:border-neutral-700 dark:bg-[#252525] dark:text-neutral-200">
            <FileText
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-neutral-500"
            />
            <span className="max-w-[240px] truncate" title={selectedFile.name}>
              {selectedFile.name}
            </span>
            <button
              type="button"
              onClick={() => setSelectedFile(null)}
              className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-neutral-500 hover:bg-black/5 hover:text-neutral-900 dark:hover:bg-white/10 dark:hover:text-white"
              aria-label={`Remove ${selectedFile.name}`}
              title="Remove file"
            >
              <X aria-hidden="true" className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          id="chat-prompt-textarea"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isSending || disabled}
          rows={1}
          className="min-h-[40px] w-full resize-none bg-transparent px-1 text-[15px] leading-relaxed text-[#0d0d0d] outline-none placeholder:text-neutral-500 dark:text-[#ececec] dark:placeholder:text-neutral-400"
        />

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          className="sr-only"
          accept="application/pdf,.pdf"
          onChange={(event) => {
            setSelectedFile(event.target.files?.[0] || null);
            event.target.value = "";
          }}
          aria-label="Attach files"
        />

        {/* Controls row at the bottom of the card */}
        <div className="flex items-center justify-between pt-1">
          {/* Left controls: + (Attach) and Tools */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="grid h-8 w-8 place-items-center rounded-full text-neutral-600 transition hover:bg-black/5 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white"
              title="Attach files"
              aria-label="Attach files"
            >
              <Plus className="h-[18px] w-[18px]" />
            </button>

            <div className="relative" ref={modelMenuRef}>
              <button
                ref={modelButtonRef}
                type="button"
                onClick={() => setIsModelMenuOpen((open) => !open)}
                aria-label={`Select model, currently ${selectedModel.name}`}
                aria-expanded={isModelMenuOpen}
                aria-controls="chat-model-menu"
                className="inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[13px] font-medium text-neutral-600 transition hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-400 dark:text-neutral-300 dark:hover:bg-white/10 dark:focus-visible:outline-neutral-500"
              >
                <SlidersHorizontal
                  aria-hidden="true"
                  className="h-3.5 w-3.5 shrink-0"
                />
                <span>
                  {selectedModel.name} ({selectedModel.provider})
                </span>
                <ChevronDown
                  aria-hidden="true"
                  className={`h-3.5 w-3.5 text-neutral-400 transition-transform ${isModelMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isModelMenuOpen && (
                <div
                  id="chat-model-menu"
                  role="group"
                  aria-label="Choose an AI model"
                  className="absolute bottom-full left-0 z-30 mb-2 w-64 overflow-hidden rounded-xl border border-neutral-200 bg-white p-1.5 shadow-xl shadow-black/10 dark:border-neutral-700 dark:bg-[#252525] dark:shadow-black/30"
                >
                  <p className="px-2.5 pt-1.5 pb-2 text-[11px] font-semibold tracking-wide text-neutral-400 uppercase dark:text-neutral-500">
                    Choose a model
                  </p>
                  {models.map((option) => {
                    const isSelected = option.id === model;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => {
                          onModelChange?.(option.id);
                          setIsModelMenuOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left transition ${
                          isSelected
                            ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-700/70 dark:text-white"
                            : "text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-white/5"
                        }`}
                      >
                        <span className="flex min-w-0 flex-col">
                          <span className="text-[13px] font-medium">
                            {option.name}
                          </span>
                          <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                            {option.provider}
                          </span>
                        </span>
                        {isSelected && (
                          <Check
                            aria-hidden="true"
                            className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right controls: Mic and Audio / Send button */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="grid h-8 w-8 place-items-center rounded-full text-neutral-600 transition hover:bg-black/5 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white"
              title="Use voice input"
              aria-label="Use voice input"
            >
              <Mic className="h-[18px] w-[18px]" />
            </button>

            {hasDraft || isSending ? (
              <button
                type="submit"
                disabled={!hasDraft || isSending || disabled}
                aria-label="Send message"
                title="Send message"
                className="grid h-8 w-8 place-items-center rounded-full bg-black text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:opacity-40 dark:bg-white dark:text-black dark:disabled:bg-neutral-600"
              >
                {isSending ? (
                  <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ArrowUp className="h-4 w-4" />
                )}
              </button>
            ) : (
              <button
                type="button"
                className="grid h-8 w-8 place-items-center rounded-full bg-black text-white transition hover:opacity-90 dark:bg-white dark:text-black"
                title="Voice mode"
                aria-label="Voice mode"
              >
                <AudioWaveform className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Footer below chat input box (as requested) */}
      <footer className="mt-2.5 text-center text-[12px] text-neutral-400 select-none dark:text-neutral-500">
        © {new Date().getFullYear()} Pulse AI. Pulse AI can make mistakes. Check
        important info.
      </footer>
    </div>
  );
}

export default ChatInput;
