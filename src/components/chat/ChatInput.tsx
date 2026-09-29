import React, { useState, useRef, useEffect } from 'react';
import { Send, CornerDownLeft } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 relative">
      <div className="flex-grow relative bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#0B3A82]/30 dark:focus-within:ring-blue-500/30 focus-within:border-[#0B3A82] dark:focus-within:border-blue-500 transition-all">
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about SST, SSS, subsurface profile, fisheries..."
          disabled={isLoading}
          className="w-full px-3.5 py-2.5 bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none resize-none max-h-28 disabled:opacity-50 leading-relaxed font-sans"
        />
        <div className="hidden sm:flex items-center justify-end px-2.5 pb-1 text-[10px] text-slate-400 dark:text-slate-500 select-none">
          <span className="flex items-center gap-1 font-mono">
            <CornerDownLeft className="w-2.5 h-2.5" /> Enter to send · Shift+Enter for newline
          </span>
        </div>
      </div>
      <button
        type="submit"
        disabled={!input.trim() || isLoading}
        className="p-3 rounded-xl bg-[#0B3A82] hover:bg-[#082C64] dark:bg-blue-600 dark:hover:bg-blue-500 text-white disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 transition-colors flex-shrink-0 cursor-pointer shadow-sm disabled:cursor-not-allowed"
        title="Send query"
        aria-label="Send message"
      >
        <Send size={16} />
      </button>
    </form>
  );
}
