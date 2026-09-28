import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Check, Code, Copy } from "lucide-react";

function CodeBlock({ children, className }) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "";
  const codeText = String(children).replace(/\n$/, "");

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
    <div className="my-4 overflow-hidden rounded-2xl border border-neutral-200/80 bg-[#f4f4f4] text-neutral-800 shadow-xs dark:border-neutral-800 dark:bg-[#1e1e1e] dark:text-[#d4d4d4]">
      <div className="flex items-center justify-between border-b border-neutral-200/60 bg-[#ebebeb] px-4 py-2 text-xs font-mono text-neutral-600 dark:border-neutral-800 dark:bg-[#2d2d2d] dark:text-neutral-400">
        <span className="flex items-center gap-1.5 lowercase">
          <Code className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
          <span>{language || "code"}</span>
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-neutral-600 transition hover:bg-neutral-300/60 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-white"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              <span className="font-sans text-emerald-500">Copied!</span>
            </>
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
      <pre className="!m-0 overflow-x-auto !bg-transparent p-4 font-mono text-[13.5px] leading-6 text-neutral-900 dark:text-[#f8f8f2]">
        <code className="!inline-block !w-full !border-none !bg-transparent !p-0 !font-mono !text-inherit">
          {codeText}
        </code>
      </pre>
    </div>
  );
}

function ChatCard({ message, isPending = false }) {
  const isUserMessage = message.role === "user";
  const content = message.content || "";

  if (isUserMessage) {
    return (
      <article
        className="flex w-full justify-end"
        aria-label="Your message"
      >
        <div className="max-w-[min(80%,580px)] whitespace-pre-wrap break-words rounded-[22px] bg-[#e7f3ff] px-4 py-2.5 text-left text-[14.5px] leading-relaxed text-neutral-900 shadow-xs dark:!bg-[#2f2f2f] dark:!text-[#f4f4f4]">
          {content}
        </div>
      </article>
    );
  }

  return (
    <article
      className="flex w-full justify-start"
      aria-label="Assistant response"
    >
      <div className="w-full max-w-[760px] text-left text-[15px] leading-7 text-neutral-800 sm:text-[15.5px] dark:!text-[#ececec]">
        {isPending && !content ? (
          <div className="flex items-center gap-2.5 py-2 text-neutral-500 dark:text-neutral-400">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            </span>
            <span className="animate-pulse text-[14px] font-medium">Thinking...</span>
          </div>
        ) : (
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ ...props }) => (
                  <h1
                    className="mt-6 mb-3 text-xl font-semibold tracking-tight text-neutral-900 first:mt-0 sm:text-2xl dark:!text-white"
                    {...props}
                  />
                ),
                h2: ({ ...props }) => (
                  <h2
                    className="mt-5 mb-2 text-lg font-semibold tracking-tight text-neutral-900 first:mt-0 sm:text-xl dark:!text-white"
                    {...props}
                  />
                ),
                h3: ({ ...props }) => (
                  <h3
                    className="mt-4 mb-2 text-base font-semibold tracking-tight text-neutral-900 first:mt-0 sm:text-lg dark:!text-white"
                    {...props}
                  />
                ),
                p: ({ ...props }) => (
                  <p
                    className="my-3 leading-7 text-neutral-800 first:mt-0 last:mb-0 dark:!text-[#ececec]"
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
                    className="my-3 space-y-1.5 pl-5 list-disc leading-7 text-neutral-800 marker:text-neutral-400 dark:!text-[#ececec] dark:marker:!text-neutral-500"
                    {...props}
                  />
                ),
                ol: ({ ...props }) => (
                  <ol
                    className="my-3 space-y-1.5 pl-5 list-decimal leading-7 text-neutral-800 marker:text-neutral-400 dark:!text-[#ececec] dark:marker:!text-neutral-500"
                    {...props}
                  />
                ),
                li: ({ ...props }) => <li className="pl-1" {...props} />,
                blockquote: ({ ...props }) => (
                  <blockquote
                    className="my-3 border-l-2 border-neutral-300 py-1 pl-4 italic text-neutral-600 dark:!border-neutral-700 dark:!text-neutral-400"
                    {...props}
                  />
                ),
                hr: ({ ...props }) => (
                  <hr
                    className="my-5 border-t border-neutral-200 dark:!border-neutral-800"
                    {...props}
                  />
                ),
                a: ({ ...props }) => (
                  <a
                    className="text-blue-600 underline underline-offset-2 transition-opacity hover:opacity-80 dark:!text-blue-400"
                    target="_blank"
                    rel="noreferrer"
                    {...props}
                  />
                ),
                code: ({ inline, className, children, ...props }) => {
                  const isMultiLine = String(children).includes("\n");
                  if (!inline && (className || isMultiLine)) {
                    return (
                      <CodeBlock className={className}>
                        {children}
                      </CodeBlock>
                    );
                  }
                  return (
                    <code
                      className="rounded border border-neutral-200/80 !bg-neutral-100 !px-1.5 !py-0.5 font-mono text-[13px] !text-neutral-800 dark:!border-neutral-700/60 dark:!bg-[#282828] dark:!text-[#e5e5e5]"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>
            {isPending && (
              <span className="ml-1 inline-block h-4 w-1.5 animate-pulse bg-neutral-400 align-middle dark:!bg-neutral-300" />
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export default ChatCard;
