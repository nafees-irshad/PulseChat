import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import {
  BrainCircuit,
  Check,
  ChevronRight,
  Copy,
  File,
  FileText,
  LoaderCircle,
} from "lucide-react";
import hljs from "highlight.js/lib/common";
import "katex/dist/katex.min.css";

const modelNames = {
  groq: "Groq",
  gemini: "Gemini",
  glm: "Dots Studio",
  gemma: "Gemma 4",
  apodex: "Apodex 1.1 Mini",
  nemotron: "Nemotron 3 Super 120B",
};

const LANGUAGE_LABELS = {
  python: "Python",
  py: "Python",
  javascript: "JavaScript",
  js: "JavaScript",
  typescript: "TypeScript",
  ts: "TypeScript",
  jsx: "React JSX",
  tsx: "React TSX",
  html: "HTML",
  css: "CSS",
  scss: "SCSS",
  json: "JSON",
  sql: "SQL",
  bash: "Bash",
  sh: "Shell",
  shell: "Shell",
  zsh: "Zsh",
  markdown: "Markdown",
  md: "Markdown",
  c: "C",
  cpp: "C++",
  csharp: "C#",
  cs: "C#",
  java: "Java",
  kotlin: "Kotlin",
  go: "Go",
  golang: "Go",
  rust: "Rust",
  rs: "Rust",
  ruby: "Ruby",
  rb: "Ruby",
  php: "PHP",
  yaml: "YAML",
  yml: "YAML",
  xml: "XML",
  dockerfile: "Dockerfile",
  docker: "Docker",
};

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function remarkBreakTags() {
  return (tree) => {
    function replaceBreakTags(node) {
      if (!Array.isArray(node.children)) return;

      node.children = node.children.flatMap((child) => {
        if (child.type === "html" && /^<br\s*\/?>$/i.test(child.value.trim())) {
          return [{ type: "break" }];
        }
        replaceBreakTags(child);
        return [child];
      });
    }

    replaceBreakTags(tree);
  };
}

function remarkTerminateMathComments() {
  return (tree) => {
    function terminateComments(node) {
      if (!Array.isArray(node.children)) return;

      for (const child of node.children) {
        if (child.type === "math" || child.type === "inlineMath") {
          const lastLineStart = child.value.lastIndexOf("\n") + 1;
          const lastLine = child.value.slice(lastLineStart);
          let hasUnterminatedComment = false;

          for (
            let commentIndex = lastLine.indexOf("%");
            commentIndex !== -1;
            commentIndex = lastLine.indexOf("%", commentIndex + 1)
          ) {
            let backslashCount = 0;
            for (
              let index = commentIndex - 1;
              index >= 0 && lastLine[index] === "\\";
              index -= 1
            ) {
              backslashCount += 1;
            }

            if (backslashCount % 2 === 0) {
              hasUnterminatedComment = true;
              break;
            }
          }

          if (hasUnterminatedComment) child.value += "\n";
        }

        terminateComments(child);
      }
    }

    terminateComments(tree);
  };
}

function normalizeMathDelimiters(text) {
  return text
    .replace(/\\\[([\s\S]*?)\\\]/g, (_, formula) => `$$${formula}$$`)
    .replace(/\\\(([\s\S]*?)\\\)/g, (_, formula) => `$${formula}$`)
    .replace(
      /\[\s*((?=[^\]]*\\(?:text|frac|sqrt|sum|prod|int|times|cdot|mathrm|mathbf)\b)[^\]]+?)\s*\]/g,
      (_, formula) => `$$${formula}$$`,
    );
}

function formatThoughtTime(milliseconds) {
  if (milliseconds < 1000) return "less than a second";

  const seconds = Math.round(milliseconds / 1000);
  return `${seconds} ${seconds === 1 ? "second" : "seconds"}`;
}

function CodeBlock({ children, className }) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const rawLang = match ? match[1].toLowerCase() : "";
  const codeText = String(children).replace(/\n$/, "");

  const displayLang =
    LANGUAGE_LABELS[rawLang] ||
    (rawLang ? rawLang.charAt(0).toUpperCase() + rawLang.slice(1) : "Code");

  const highlightedHtml = useMemo(() => {
    if (rawLang && hljs.getLanguage(rawLang)) {
      try {
        return hljs.highlight(codeText, {
          language: rawLang,
          ignoreIllegals: true,
        }).value;
      } catch {
        // Fallback below
      }
    }
    try {
      return hljs.highlightAuto(codeText).value;
    } catch {
      return escapeHtml(codeText);
    }
  }, [codeText, rawLang]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="code-block-container my-4 overflow-hidden rounded-[20px] bg-[#e9e9eb] dark:bg-[#2f2f2f]">
      <div className="code-block-header flex items-center justify-between px-5 pt-3.5 pb-2 text-[13px]">
        <span className="flex items-center gap-2">
          <span className="font-mono text-[13px] font-bold text-[#0d0d0d] dark:text-white">
            &lt;/&gt;
          </span>
          <span className="font-sans text-[13px] font-semibold text-[#0d0d0d] uppercase dark:text-white">
            {displayLang}
          </span>
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="grid h-8 w-8 place-items-center rounded-lg text-neutral-700 transition hover:bg-black/5 hover:text-black dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white"
          title={copied ? "Copied!" : "Copy code"}
          aria-label={copied ? "Copied" : "Copy code"}
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
      <pre className="code-block-pre code-scroll !m-0 overflow-x-auto px-5 pt-1 pb-4.5 font-mono text-[13.5px] leading-6 text-[#0d0d0d] dark:text-[#f4f4f4]">
        <code
          className="hljs !inline-block !w-full !border-none !bg-transparent !p-0 !font-mono !text-inherit"
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        />
      </pre>
    </div>
  );
}

function ChatCard({ message, isPending = false }) {
  const [responseCopied, setResponseCopied] = useState(false);
  const [thinkingSeconds, setThinkingSeconds] = useState(0);
  const isUserMessage = message.role === "user";
  const content = message.content || "";

  useEffect(() => {
    if (!isPending || content || message.documentStatus) return undefined;

    const startAt = Date.now();
    const intervalId = window.setInterval(() => {
      setThinkingSeconds(Math.floor((Date.now() - startAt) / 1000));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [content, isPending, message.documentStatus]);

  const handleCopyResponse = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setResponseCopied(true);
      setTimeout(() => setResponseCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  if (isUserMessage) {
    const attachmentExtension = message.attachment?.extension || "FILE";
    const isPdfAttachment = attachmentExtension === "PDF";
    const attachmentSize = Number(message.attachment?.size);
    const formattedAttachmentSize = Number.isFinite(attachmentSize)
      ? attachmentSize >= 1024 * 1024
        ? `${(attachmentSize / (1024 * 1024)).toFixed(2)} MB`
        : `${(attachmentSize / 1024).toFixed(2)} KB`
      : "";

    return (
      <article className="flex w-full flex-col items-end" aria-label="Your message">
        {message.attachment && (
          <div className="mb-3 flex w-[min(100%,360px)] items-center gap-3 rounded-[22px] border border-neutral-200 bg-white px-4 py-3.5 text-left shadow-sm dark:border-neutral-700 dark:bg-[#2a2a2d]">
            <span
              className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${
                isPdfAttachment
                  ? "bg-[#f24e3e] text-white"
                  : "bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-200"
              }`}
            >
              {isPdfAttachment ? (
                <FileText aria-hidden="true" className="h-6 w-6" />
              ) : (
                <File aria-hidden="true" className="h-6 w-6" />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span
                className="block truncate text-[14px] font-semibold text-neutral-900 dark:text-neutral-100"
                title={message.attachment.name}
              >
                {message.attachment.name}
              </span>
              <span
                className={`mt-0.5 block text-[12px] ${
                  message.attachment.uploadStatus === "failed"
                    ? "text-red-600 dark:text-red-400"
                    : "text-neutral-500 dark:text-neutral-400"
                }`}
                aria-live="polite"
              >
                {message.attachment.uploadStatus === "failed"
                  ? "Upload failed"
                  : message.attachment.uploadStatus === "uploading"
                    ? `Uploading ${message.attachment.uploadProgress}%`
                    : `${attachmentExtension}${formattedAttachmentSize ? ` · ${formattedAttachmentSize}` : ""}`}
              </span>
              {message.attachment.uploadStatus === "uploading" && (
                <span
                  className="mt-2 block h-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-600"
                  role="progressbar"
                  aria-label={`Uploading ${message.attachment.name}`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={message.attachment.uploadProgress}
                >
                  <span
                    className="block h-full rounded-full bg-blue-500 transition-[width] duration-150"
                    style={{
                      width: `${message.attachment.uploadProgress}%`,
                    }}
                  />
                </span>
              )}
            </span>
          </div>
        )}
        {content && (
          <div className="max-w-[min(85%,640px)] rounded-[22px] rounded-br-[6px] bg-[#f0f4f9] px-4.5 py-3 text-left text-[15px] leading-relaxed text-neutral-900 shadow-2xs dark:!bg-[#28282c] dark:!text-[#f4f4f4]">
            <p className="whitespace-pre-wrap break-words">{content}</p>
          </div>
        )}
        {content && (
          <button
            type="button"
            onClick={handleCopyResponse}
            className="mt-1.5 inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
            title={responseCopied ? "Copied!" : "Copy message"}
            aria-label={responseCopied ? "Message copied" : "Copy message"}
          >
            {responseCopied ? (
              <Check className="h-4 w-4 text-emerald-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        )}
      </article>
    );
  }

  return (
    <article
      className="flex w-full justify-start"
      aria-label="Assistant response"
    >
      <div className="w-full max-w-[760px] text-left text-[15.5px] leading-[1.7] text-neutral-800 dark:!text-[#ececec]">
        {isPending && !content ? (
          message.documentStatus ? (
            <div
              className="flex items-start gap-2.5 py-2 text-neutral-500 dark:text-neutral-400"
              role="status"
              aria-live="polite"
            >
              <LoaderCircle
                aria-hidden="true"
                className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-violet-500"
              />
              <div>
                <p className="text-[14px] font-medium text-neutral-700 dark:text-neutral-200">
                  Extracting text
                </p>
              </div>
            </div>
          ) : (
            <div
              className="flex items-center gap-2.5 py-2 text-[14px] font-medium text-neutral-700 dark:text-neutral-200"
              role="status"
              aria-live="polite"
            >
              <BrainCircuit
                aria-hidden="true"
                className="h-5 w-5 text-[#536dfe]"
              />
              <span className="animate-pulse">
                Thinking for {thinkingSeconds}s
              </span>
            </div>
          )
        ) : (
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            {!isPending && Number.isFinite(message.thoughtTimeMs) && (
              <div
                className="mb-2 inline-flex items-center gap-2 text-[14px] font-medium text-neutral-700 dark:text-neutral-200"
                aria-label={`Thought for ${formatThoughtTime(message.thoughtTimeMs)}`}
              >
                <BrainCircuit
                  aria-hidden="true"
                  className="h-5 w-5 text-[#536dfe]"
                />
                <span>
                  Thought for {formatThoughtTime(message.thoughtTimeMs)}
                </span>
                <ChevronRight
                  aria-hidden="true"
                  className="h-4 w-4 text-neutral-700 dark:text-neutral-300"
                />
              </div>
            )}
            <ReactMarkdown
              remarkPlugins={[
                remarkGfm,
                remarkMath,
                remarkTerminateMathComments,
                remarkBreakTags,
              ]}
              rehypePlugins={[rehypeKatex]}
              components={{
                h1: ({ ...props }) => (
                  <h1
                    className="mt-7 mb-3 text-[24px] font-bold leading-tight tracking-[-0.02em] text-neutral-900 first:mt-0 dark:!text-white"
                    {...props}
                  />
                ),
                h2: ({ ...props }) => (
                  <h2
                    className="mt-6 mb-2.5 border-b border-neutral-200 pb-1.5 text-[19px] font-bold leading-snug tracking-[-0.015em] text-neutral-900 first:mt-0 dark:!text-white dark:border-neutral-700"
                    {...props}
                  />
                ),
                h3: ({ ...props }) => (
                  <h3
                    className="mt-4 mb-2 text-[16px] font-bold leading-snug tracking-[-0.01em] text-neutral-800 first:mt-0 dark:!text-[#e5e5e5]"
                    {...props}
                  />
                ),
                p: ({ ...props }) => (
                  <p
                    className="my-2.5 text-[15.5px] leading-[1.7] text-neutral-800 first:mt-0 last:mb-0 dark:!text-[#ececec]"
                    {...props}
                  />
                ),
                strong: ({ ...props }) => (
                  <strong
                    className="font-semibold text-neutral-900 dark:!text-white"
                    {...props}
                  />
                ),
                ul: ({ ...props }) => (
                  <ul
                    className="my-2.5 space-y-1 pl-6 list-disc text-[15.5px] leading-[1.7] text-neutral-800 marker:text-neutral-400 dark:!text-[#ececec] dark:marker:!text-neutral-500"
                    {...props}
                  />
                ),
                ol: ({ ...props }) => (
                  <ol
                    className="my-2.5 space-y-1 pl-6 list-decimal text-[15.5px] leading-[1.7] text-neutral-800 marker:text-neutral-400 dark:!text-[#ececec] dark:marker:!text-neutral-500"
                    {...props}
                  />
                ),
                li: ({ ...props }) => <li className="pl-1" {...props} />,
                table: ({ children, ...props }) => (
                  <div className="my-5 w-full max-w-full overflow-hidden rounded-xl border border-neutral-300 bg-white shadow-xs dark:border-neutral-700 dark:bg-[#18191f]">
                    <div className="table-scroll w-full overflow-x-auto">
                      <table
                        className="w-full min-w-full border-collapse text-left text-[14px]"
                        {...props}
                      >
                        {children}
                      </table>
                    </div>
                  </div>
                ),
                thead: ({ children, ...props }) => (
                  <thead
                    className="border-b border-neutral-300 bg-neutral-50/90 text-neutral-800 dark:border-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-200"
                    {...props}
                  >
                    {children}
                  </thead>
                ),
                th: ({ children, ...props }) => (
                  <th
                    className="px-4 py-3 text-left text-[12px] font-semibold tracking-wider text-neutral-600 uppercase dark:text-neutral-300 first:pl-5 last:pr-5 select-none"
                    {...props}
                  >
                    {children}
                  </th>
                ),
                tbody: ({ children, ...props }) => (
                  <tbody
                    className="divide-y divide-neutral-300 dark:divide-neutral-700"
                    {...props}
                  >
                    {children}
                  </tbody>
                ),
                tr: ({ children, ...props }) => (
                  <tr
                    className="transition-colors duration-150 hover:bg-neutral-50/80 odd:bg-transparent even:bg-neutral-50/35 dark:hover:bg-neutral-800/40 dark:even:bg-neutral-900/30"
                    {...props}
                  >
                    {children}
                  </tr>
                ),
                td: ({ children, ...props }) => (
                  <td
                    className="px-4 py-3 text-[13.5px] leading-relaxed text-neutral-700 dark:text-neutral-300 align-middle first:pl-5 last:pr-5 tabular-nums"
                    {...props}
                  >
                    {children}
                  </td>
                ),
                blockquote: ({ ...props }) => (
                  <blockquote
                    className="my-3 rounded-r-lg border-l-4 border-indigo-400 bg-neutral-50/60 py-2 pr-3 pl-4 text-neutral-700 italic dark:border-indigo-500 dark:bg-neutral-800/40 dark:text-neutral-300"
                    {...props}
                  />
                ),
                hr: ({ ...props }) => (
                  <hr
                    className="my-5 border-t border-neutral-200/80 dark:!border-neutral-800"
                    {...props}
                  />
                ),
                a: ({ ...props }) => (
                  <a
                    className="font-medium text-blue-600 underline underline-offset-3 transition hover:text-blue-700 hover:opacity-90 dark:!text-blue-400 dark:hover:!text-blue-300"
                    target="_blank"
                    rel="noreferrer"
                    {...props}
                  />
                ),
                code: ({ inline, className, children, ...props }) => {
                  const isMultiLine = String(children).includes("\n");
                  if (!inline && (className || isMultiLine)) {
                    return (
                      <CodeBlock className={className}>{children}</CodeBlock>
                    );
                  }
                  return (
                    <code
                      className="inline-block rounded-md border border-neutral-300/80 bg-neutral-150/70 px-1.5 py-0.5 font-mono text-[12.5px] font-semibold text-neutral-900 shadow-2xs dark:border-neutral-700/70 dark:bg-[#28282e] dark:text-[#f4f4f4]"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
              }}
            >
              {normalizeMathDelimiters(
                content.replace(/&lt;br\s*\/?&gt;/gi, "<br>"),
              )}
            </ReactMarkdown>
            {isPending && (
              <span className="ml-1 inline-block h-4 w-1.5 animate-pulse bg-neutral-400 align-middle dark:!bg-neutral-300" />
            )}
            <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-[12px] text-neutral-500 select-none dark:text-neutral-400">
              {message.model ? (
                <p className="leading-5">
                  {message.requestedModel &&
                  message.requestedModel !== message.model ? (
                    <>
                      {modelNames[message.requestedModel] ||
                        message.requestedModel}{" "}
                      unavailable — answered by{" "}
                      {modelNames[message.model] || message.model} instead
                    </>
                  ) : (
                    <>Answered by {modelNames[message.model] || message.model}</>
                  )}
                </p>
              ) : (
                <span />
              )}
              {content && (
                <button
                  type="button"
                  onClick={handleCopyResponse}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[12px] text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
                  title="Copy response"
                >
                  {responseCopied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="font-medium text-emerald-500">
                        Copied
                      </span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

export default ChatCard;
