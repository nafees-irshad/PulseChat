import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  ArrowUp,
  Check,
  ChevronDown,
  FileText,
  LoaderCircle,
  Mic,
  Plus,
  X,
} from "lucide-react";

const models = [
  { id: "groq", name: "GPT-oss-120b", provider: "Groq" },
  { id: "glm", name: "Dots 3 Note Preview", provider: "OpenRouter" },
  { id: "apodex", name: "Apodex 1.1 Mini", provider: "OpenRouter" },
  { id: "nemotron", name: "Nemotron 3 Super 120B", provider: "Requesty" },
];

function ChatInput({
  onSend,
  model = "groq",
  onModelChange,
  isSending = false,
  error = "",
  placeholder = "Ask PulseAI",
  maxLength,
  compact = false,
  disabled = false,
}) {
  const [draft, setDraft] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const modelMenuRef = useRef(null);
  const modelButtonRef = useRef(null);
  const displayedError = fileError || error;

  const handleFileSelection = (file) => {
    setFileError("");
    setSelectedFile(null);
    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase();
    const expectedMimeType = {
      pdf: "application/pdf",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      txt: "text/plain",
    }[extension];
    const isCompatibleTextMimeType =
      extension === "txt" &&
      ["", "text/plain", "application/octet-stream"].includes(file.type);

    if (
      !expectedMimeType ||
      (file.type &&
        file.type !== expectedMimeType &&
        !isCompatibleTextMimeType)
    ) {
      setFileError("Choose a valid PDF, DOCX, or TXT file.");
      return;
    }
    if (file.size === 0) {
      setFileError(
        "The selected file is empty. Choose a valid PDF, DOCX, or TXT file.",
      );
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setFileError("Files must be 10 MB or smaller.");
      return;
    }

    setSelectedFile(file);
  };

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

    textarea.style.height = "auto";
    const sh = textarea.scrollHeight;
    const newHeight = Math.min(Math.max(sh, 26), 220);
    textarea.style.height = `${newHeight}px`;
    textarea.style.overflowY = sh > 220 ? "auto" : "hidden";
  }, []);

  useLayoutEffect(() => {
    adjustTextareaHeight();
  }, [draft, selectedFile, adjustTextareaHeight]);

  const handleSubmit = (event) => {
    event?.preventDefault?.();
    const trimmed = draft.trim();
    if (!trimmed || isSending || disabled) return;
    setDraft("");
    onSend?.(trimmed, selectedFile);
    setSelectedFile(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = "26px";
      textareaRef.current.style.overflowY = "hidden";
    }
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
      {displayedError && (
        <p
          className="mx-auto mb-2 max-w-[760px] text-center text-[13px] text-red-600 dark:text-red-400"
          role="alert"
        >
          {displayedError}
        </p>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        className="sr-only"
        accept="application/pdf,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx,text/plain,.txt"
        onChange={(event) => {
          handleFileSelection(event.target.files?.[0] || null);
          event.target.value = "";
        }}
        aria-label="Attach files"
      />

      {/* Main Prompt Card - Unified shape */}
      <form
        onSubmit={handleSubmit}
        className={`mx-auto flex w-full ${
          compact
            ? "relative min-h-[112px] max-w-[840px] flex-col rounded-[26px] px-5 pt-4 pb-2.5 shadow-lg"
            : "max-w-[760px] flex-col rounded-[26px] px-4 pt-3.5 pb-2.5 shadow-xs"
        } border border-neutral-300/80 bg-[#f4f4f4] transition-colors duration-150 focus-within:border-neutral-400 focus-within:shadow-md dark:border-neutral-700/60 dark:bg-[#202123] dark:focus-within:border-neutral-500`}
      >
        <label className="sr-only" htmlFor="chat-prompt-textarea">
          Ask PulseAI
        </label>

        {/* Selected file attachment badge */}
        {selectedFile && (
          <div
            className="mb-2 flex max-w-full items-center gap-2 self-start rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-[12px] text-neutral-700 dark:border-neutral-700 dark:bg-[#252525] dark:text-neutral-200"
          >
            <FileText
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-neutral-500"
            />
            <span className="max-w-[240px] truncate" title={selectedFile.name}>
              {selectedFile.name}
            </span>
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                setFileError("");
              }}
              className="grid h-5 w-5 cursor-pointer shrink-0 place-items-center rounded-full text-neutral-500 hover:bg-black/5 hover:text-neutral-900 dark:hover:bg-white/10 dark:hover:text-white"
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
          onChange={(event) => {
            setDraft(event.target.value);
            adjustTextareaHeight();
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={isSending || disabled}
          rows={1}
          className={`w-full resize-none bg-transparent text-[#0d0d0d] leading-relaxed outline-none placeholder:text-neutral-400 dark:text-[#ececec] dark:placeholder:text-neutral-500 ${
            compact
              ? "min-h-[32px] px-0 py-1 text-[16px]"
              : "min-h-[26px] px-1 text-[15px]"
          }`}
        />

        {/* Bottom row toolbar */}
        <div
          className={`flex items-center justify-between ${
            compact
              ? "mt-auto w-full pt-2"
              : "mt-2 pt-0.5"
          }`}
        >
          {/* Left: + (Attach) button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="grid h-8 w-8 cursor-pointer place-items-center rounded-full text-neutral-600 transition hover:bg-black/5 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white"
            title="Attach files"
            aria-label="Attach files"
          >
            <Plus className="h-5 w-5" />
          </button>

          {/* Right controls: Model selector + Mic + Send button */}
          <div className="flex shrink-0 items-center gap-1.5">
            {/* Model selector dropdown */}
            <div className="relative" ref={modelMenuRef}>
              <button
                ref={modelButtonRef}
                type="button"
                onClick={() => setIsModelMenuOpen((open) => !open)}
                aria-label={`Select model, currently ${selectedModel.name}`}
                aria-expanded={isModelMenuOpen}
                aria-controls="chat-model-menu"
                className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-full px-2.5 text-[13px] font-normal text-neutral-600 transition hover:bg-black/5 hover:text-neutral-900 focus-visible:outline-2 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-neutral-200"
              >
                <span className="max-w-[120px] truncate">
                  {selectedModel.name}
                </span>
                <ChevronDown
                  aria-hidden="true"
                  className={`h-3.5 w-3.5 opacity-70 transition-transform ${isModelMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isModelMenuOpen && (
                <div
                  id="chat-model-menu"
                  role="group"
                  aria-label="Choose an AI model"
                  className="absolute bottom-full right-0 z-30 mb-2 w-64 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-1.5 shadow-xl shadow-black/10 dark:border-neutral-700 dark:bg-[#252525] dark:shadow-black/40"
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
                        className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-2.5 py-2 text-left transition ${
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

            {/* Mic icon */}
            <button
              type="button"
              className="grid h-8 w-8 cursor-pointer place-items-center rounded-full text-neutral-500 transition hover:bg-black/5 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-neutral-200"
              title="Use voice input"
              aria-label="Use voice input"
            >
              <Mic className="h-[18px] w-[18px]" />
            </button>

            {/* Send button */}
            <button
              type="submit"
              disabled={!hasDraft || isSending || disabled}
              aria-label="Send message"
              title="Send message"
              className={`grid h-8 w-8 place-items-center rounded-full transition-all ${
                hasDraft && !isSending && !disabled
                  ? "cursor-pointer bg-neutral-900 text-white hover:opacity-90 dark:bg-white dark:text-black"
                  : "cursor-not-allowed bg-neutral-200 text-neutral-400 dark:bg-[#383838] dark:text-neutral-500"
              }`}
            >
              {isSending ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUp className="h-4 w-4 stroke-[2.5]" />
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Footer below chat input box */}
      {!compact && (
        <footer className="mt-2.5 text-center text-[12px] text-neutral-400 select-none dark:text-neutral-500">
          PulseAI can make mistakes. Check important info.
        </footer>
      )}
    </div>
  );
}

export default ChatInput;
