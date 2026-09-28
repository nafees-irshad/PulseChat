function ChatEmptyState({ onSelectPrompt }) {
  return (
    <div className="flex h-full items-center justify-center px-4">
      <h2 className="text-center text-[24px] font-medium text-[#222] sm:text-[26px] dark:text-[#ececec]">
        What can I help with?
      </h2>
    </div>
  );
}

export default ChatEmptyState;
