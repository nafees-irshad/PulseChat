import { useRef, useState } from "react";
import { ArrowUp, Lightbulb, Paperclip, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  FiBookOpen,
  FiChevronUp,
  FiCode,
  FiFileText,
  FiMoreHorizontal,
  FiZap,
} from "react-icons/fi";

const suggestions = [
  {
    label: "Brainstorm",
    prompt: "Help me brainstorm ideas for ",
    icon: FiZap,
    color: "text-amber-500",
  },
  {
    label: "Code",
    prompt: "Help me write code for ",
    icon: FiCode,
    color: "text-violet-500",
  },
  {
    label: "Summarize text",
    prompt: "Summarize this text: ",
    icon: FiFileText,
    color: "text-orange-500",
  },
  {
    label: "Get advice",
    prompt: "I would like advice about ",
    icon: FiBookOpen,
    color: "text-sky-500",
  },
];

const moreSuggestions = [
  {
    label: "Write",
    prompt: "Help me write ",
    icon: FiFileText,
    color: "text-orange-500",
  },
  {
    label: "Learn",
    prompt: "Teach me about ",
    icon: FiBookOpen,
    color: "text-sky-500",
  },
  {
    label: "Plan",
    prompt: "Help me make a plan for ",
    icon: FiZap,
    color: "text-amber-500",
  },
];

function HomeCard() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [showMore, setShowMore] = useState(false);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const [attachedFile, setAttachedFile] = useState("");
  const [activeTools, setActiveTools] = useState({
    search: false,
    reason: false,
  });

  function toggleTool(tool) {
    setActiveTools((currentTools) => ({
      ...currentTools,
      [tool]: !currentTools[tool],
    }));
  }

  function chooseSuggestion(prompt) {
    setMessage(prompt);
    inputRef.current?.focus();
  }

  function handleSubmit(event) {
    event.preventDefault();
    const prompt = message.trim();
    if (!prompt) return;
    navigate("/chat", { state: { initialMessage: prompt } });
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col items-center justify-center px-1 py-5">
      <section className="w-full max-w-[720px]" aria-labelledby="home-title">
        <h1
          id="home-title"
          className="mb-7 text-center text-[26px] font-medium leading-tight text-[#171717] sm:text-[32px]"
        >
          What can I help with?
        </h1>

        <form
          className="rounded-[24px] border border-[#ededed] bg-white p-3 shadow-[0_3px_12px_rgba(0,0,0,0.08)]"
          onSubmit={handleSubmit}
        >
          <label className="sr-only" htmlFor="home-prompt">
            Ask Espresso AI
          </label>
          <textarea
            ref={inputRef}
            id="home-prompt"
            className="block min-h-[56px] w-full resize-none bg-transparent px-2 py-1 text-[15px] leading-6 text-[#171717] outline-none placeholder:text-[#999]"
            placeholder="Ask anything"
            rows={2}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />

          <input
            ref={fileInputRef}
            className="sr-only"
            type="file"
            onChange={(event) =>
              setAttachedFile(event.target.files?.[0]?.name || "")
            }
          />

          <div className="flex flex-wrap items-center justify-between gap-2 px-1 pb-1 pt-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[#e5e5e5] px-3 text-[12px] text-[#333] transition hover:bg-[#f7f7f7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78bfa]"
                type="button"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip aria-hidden="true" className="h-3.5 w-3.5" />
                Attach
              </button>
              <button
                className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[12px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78bfa] ${activeTools.search ? "border-[#b9a5ff] bg-[#f6f2ff] text-[#6039a8]" : "border-[#e5e5e5] text-[#333] hover:bg-[#f7f7f7]"}`}
                type="button"
                aria-pressed={activeTools.search}
                onClick={() => toggleTool("search")}
              >
                <Search aria-hidden="true" className="h-3.5 w-3.5" />
                Search
              </button>
              <button
                className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[12px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78bfa] ${activeTools.reason ? "border-[#b9a5ff] bg-[#f6f2ff] text-[#6039a8]" : "border-[#e5e5e5] text-[#333] hover:bg-[#f7f7f7]"}`}
                type="button"
                aria-pressed={activeTools.reason}
                onClick={() => toggleTool("reason")}
              >
                <Lightbulb aria-hidden="true" className="h-3.5 w-3.5" />
                Reason
              </button>
              {attachedFile && (
                <span
                  className="max-w-36 truncate text-[11px] text-[#777]"
                  title={attachedFile}
                >
                  {attachedFile}
                </span>
              )}
            </div>
            <button
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-black text-white transition hover:bg-[#303030] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#d5d5d5]"
              type="submit"
              aria-label="Send message"
              title="Send"
              disabled={!message.trim()}
            >
              <ArrowUp aria-hidden="true" className="h-[18px] w-[18px]" />
            </button>
          </div>
        </form>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {suggestions.map(({ label, prompt, icon: Icon, color }) => (
            <button
              className="inline-flex items-center gap-2 rounded-full border border-[#e8e8e8] bg-white px-3.5 py-2 text-[13px] text-[#333] transition hover:bg-[#f7f7f7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78bfa]"
              key={label}
              type="button"
              onClick={() => chooseSuggestion(prompt)}
            >
              <Icon aria-hidden="true" className={`h-4 w-4 ${color}`} />
              {label}
            </button>
          ))}
          <button
            className="inline-flex items-center gap-2 rounded-full border border-[#e8e8e8] bg-white px-3.5 py-2 text-[13px] text-[#333] transition hover:bg-[#f7f7f7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78bfa]"
            type="button"
            aria-expanded={showMore}
            onClick={() => setShowMore((isShowing) => !isShowing)}
          >
            {showMore ? (
              <FiChevronUp aria-hidden="true" className="h-4 w-4" />
            ) : (
              <FiMoreHorizontal aria-hidden="true" className="h-4 w-4" />
            )}
            {showMore ? "Less" : "More"}
          </button>
          {showMore &&
            moreSuggestions.map(({ label, prompt, icon: Icon, color }) => (
              <button
                className="inline-flex items-center gap-2 rounded-full border border-[#e8e8e8] bg-white px-3.5 py-2 text-[13px] text-[#333] transition hover:bg-[#f7f7f7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78bfa]"
                key={label}
                type="button"
                onClick={() => chooseSuggestion(prompt)}
              >
                <Icon aria-hidden="true" className={`h-4 w-4 ${color}`} />
                {label}
              </button>
            ))}
        </div>
      </section>
    </main>
  );
}

export default HomeCard;
