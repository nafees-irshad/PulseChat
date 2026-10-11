import { useCallback, useEffect, useRef, useState } from "react";

/**
 * MessageMinimap
 *
 * A thin right-side navigator: small tick dashes always visible on the right.
 * ONLY hovering directly over the dashes (or the popup) opens the popup.
 *
 * Props:
 *   messages        – array of { id, role, content } objects
 *   scrollContainer – ref to the scrollable chat div
 */
function MessageMinimap({ messages, scrollContainer }) {
  const [isHovered, setIsHovered] = useState(false);
  const [highlightedId, setHighlightedId] = useState(null);
  const hideTimer = useRef(null);

  // Track which message is currently closest to the top of the viewport
  useEffect(() => {
    const container = scrollContainer?.current;
    if (!container || messages.length === 0) return;

    function onScroll() {
      const containerTop = container.getBoundingClientRect().top;
      let closestId = null;
      let closestDist = Infinity;

      messages.forEach((msg) => {
        const el = container.querySelector(`[data-message-id="${msg.id}"]`);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const dist = Math.abs(rect.top - containerTop);
        if (dist < closestDist) {
          closestDist = dist;
          closestId = msg.id;
        }
      });

      setHighlightedId(closestId);
    }

    container.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => container.removeEventListener("scroll", onScroll);
  }, [messages, scrollContainer]);

  const scrollToMessage = useCallback(
    (messageId) => {
      const container = scrollContainer?.current;
      if (!container) return;
      const el = container.querySelector(`[data-message-id="${messageId}"]`);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setHighlightedId(messageId);
    },
    [scrollContainer],
  );

  // Show popup only when hovering the strip OR the popup itself
  const handleStripEnter = () => {
    clearTimeout(hideTimer.current);
    setIsHovered(true);
  };

  const handleStripLeave = () => {
    // Short delay so mouse can travel into the popup without it closing
    hideTimer.current = setTimeout(() => setIsHovered(false), 120);
  };

  const handlePopupEnter = () => {
    clearTimeout(hideTimer.current);
  };

  const handlePopupLeave = () => {
    hideTimer.current = setTimeout(() => setIsHovered(false), 120);
  };

  if (!messages || messages.length < 2) return null;

  return (
    <div
      className="message-minimap-root"
      aria-label="Message navigator"
    >
      {/* ── Popup panel — shown on strip hover ── */}
      <div
        className={`message-minimap-popup${isHovered ? " visible" : ""}`}
        role="listbox"
        aria-label="Jump to message"
        onMouseEnter={handlePopupEnter}
        onMouseLeave={handlePopupLeave}
      >
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          const preview = (msg.content || "")
            .replace(/[#*`_~>]/g, "")
            .trim()
            .slice(0, 44);
          const isActive = highlightedId === msg.id;

          return (
            <button
              key={msg.id}
              role="option"
              aria-selected={isActive}
              type="button"
              className={`minimap-item${isActive ? " active" : ""}${isUser ? " user" : " assistant"}`}
              onClick={() => scrollToMessage(msg.id)}
              title={msg.content?.slice(0, 140)}
            >
              <span className="minimap-item-label">
                {preview || (isUser ? "Your message" : "Response")}
                {(msg.content || "").length > 44 && "…"}
              </span>
              <span className={`minimap-item-dash${isActive ? " active" : ""}`} />
            </button>
          );
        })}
      </div>

      {/* ── Tick strip — hover here to open popup ── */}
      <div
        className="minimap-strip"
        onMouseEnter={handleStripEnter}
        onMouseLeave={handleStripLeave}
        aria-hidden="true"
      >
        {messages.map((msg) => {
          const isActive = highlightedId === msg.id;
          return (
            <button
              key={msg.id}
              type="button"
              tabIndex={-1}
              className={`minimap-tick${isActive ? " active" : ""}${msg.role === "user" ? " user" : ""}`}
              onClick={() => scrollToMessage(msg.id)}
            />
          );
        })}
      </div>
    </div>
  );
}

export default MessageMinimap;

