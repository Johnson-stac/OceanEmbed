import { Bot, User } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '../../types';

interface ChatMessageProps {
  message: ChatMessageType;
  onRetry?: () => void;
  isError?: boolean;
}

export function ChatMessage({ message, onRetry, isError }: ChatMessageProps) {
  const isAI = message.role === 'assistant';

  return (
    <div className={`flex w-full ${isAI ? 'justify-start' : 'justify-end'} mb-3.5 animate-in fade-in duration-150`}>
      <div className={`flex max-w-[88%] ${isAI ? 'flex-row' : 'flex-row-reverse'} gap-2.5`}>
        <div
          className={`flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full shadow-sm text-xs font-bold ${
            isAI
              ? 'bg-[#0B3A82] text-white dark:bg-blue-600'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
          }`}
        >
          {isAI ? <Bot size={15} /> : <User size={15} />}
        </div>
        <div
          className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans ${
            isAI
              ? isError
                ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 rounded-tl-none'
                : 'bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-none shadow-xs'
              : 'bg-[#0B3A82] dark:bg-blue-600 text-white rounded-tr-none shadow-xs'
          }`}
        >
          {message.content}
          {isError && onRetry && (
            <div className="mt-2 pt-2 border-t border-rose-200 dark:border-rose-800 flex justify-end">
              <button
                onClick={onRetry}
                className="px-2.5 py-1 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded cursor-pointer transition-colors"
              >
                Retry Request
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
