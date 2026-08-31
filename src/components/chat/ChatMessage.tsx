import { Bot, User } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '../../types';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isAI = message.role === 'assistant';

  return (
    <div className={`flex w-full ${isAI ? 'justify-start' : 'justify-end'} mb-4`}>
      <div className={`flex max-w-[85%] ${isAI ? 'flex-row' : 'flex-row-reverse'}`}>
        <div className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full ${isAI ? 'bg-cyan-100 text-cyan-600 mr-3' : 'bg-slate-100 text-slate-600 ml-3'}`}>
          {isAI ? <Bot size={18} /> : <User size={18} />}
        </div>
        <div 
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
            isAI 
              ? 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none' 
              : 'bg-cyan-600 text-white rounded-tr-none'
          }`}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}
