import { useCallback, useLayoutEffect, useRef, useState } from "react";
import {
  ArrowUp,
  AudioWaveform,
  LoaderCircle,
  Mic,
  Plus,
  SlidersHorizontal,
} from "lucide-react";

function ChatInput({
  onSend,
  isSending = false,
  error = "",
  placeholder = "Ask anything",
  disabled = false,
}) {
  const [draft, setDraft] = useState("");
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

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
    onSend?.(trimmed);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  const hasDraft = Boolean(draft.trim());

  return (
    <div className="w-full px-4 pb-3 sm:px-6">
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
          multiple
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

            <button
              type="button"
              className="inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[13px] font-medium text-neutral-600 transition hover:bg-black/5 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white"
              title="Tools"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Tools</span>
            </button>
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
        © {new Date().getFullYear()} Pulse AI. Pulse AI can make mistakes. Check important info.
      </footer>
    </div>
  );
}

export default ChatInput;
