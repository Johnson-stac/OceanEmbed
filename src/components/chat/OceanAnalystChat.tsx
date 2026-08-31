import { useState, useRef, useEffect } from 'react';
import { Bot, RotateCcw, ChevronDown } from 'lucide-react';
import type { ChatMessage as ChatMessageType, ChatContext } from '../../types';
import { getOceanAnalystService } from '../../services/oceanAnalyst';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { QuickQuestions } from './QuickQuestions';

interface OceanAnalystChatProps {
  context: ChatContext | null;
}

export function OceanAnalystChat({ context }: OceanAnalystChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      content
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Pass the last 10 messages for context
      const history = messages.slice(-10);
      const response = await getOceanAnalystService(context, history, content);
      
      const aiMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I couldn't reach the AI analysis service right now. I'll provide a demo analysis instead.\n\n*(Falling back to mock service... please try again)*"
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([]);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[1100] w-14 h-14 bg-white border border-slate-200 rounded-full shadow-lg flex items-center justify-center text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 transition-all hover:scale-105 group"
        aria-label="Open AI Ocean Analyst"
      >
        <Bot size={28} />
        <span className="absolute right-full mr-3 whitespace-nowrap bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          AI Ocean Analyst
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-[1100] w-[90vw] md:w-[400px] h-[80vh] md:h-[600px] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-white">
            <Bot size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              AI Ocean Analyst
              <span className="text-[10px] font-bold bg-cyan-100 text-cyan-800 px-1.5 py-0.5 rounded uppercase tracking-wider">Groq AI • Demo</span>
            </h3>
            <p className="text-xs text-slate-500">Scientific interpretation</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleReset} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-md transition-colors" title="New Conversation">
            <RotateCcw size={16} />
          </button>
          <button onClick={() => setIsOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-md transition-colors" title="Minimize">
            <ChevronDown size={20} />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-grow p-4 overflow-y-auto bg-white flex flex-col">
        {messages.length === 0 ? (
          <div className="flex-grow flex flex-col justify-end pb-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-4">
              <p className="text-sm text-slate-800 mb-2">Hello! I'm the OceanEmbed AI Ocean Analyst.</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                I can explain the surface observations and predicted subsurface temperature profile for the selected location.
              </p>
            </div>
            <QuickQuestions onSelect={handleSendMessage} />
          </div>
        ) : (
          <div className="flex flex-col">
            {messages.map(msg => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isLoading && (
              <div className="flex justify-start mb-4">
                 <div className="flex max-w-[85%] flex-row">
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-cyan-100 text-cyan-600 mr-3">
                      <Bot size={18} />
                    </div>
                    <div className="px-4 py-3 rounded-2xl text-sm bg-slate-50 border border-slate-200 text-slate-500 rounded-tl-none flex items-center gap-2">
                       <span className="animate-pulse">Ocean Analyst is analyzing...</span>
                    </div>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100 flex-shrink-0">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        <div className="text-[10px] text-center text-slate-400 mt-3 font-medium">
          AI-generated interpretation. Predictions are model estimates and should not replace direct observations.
        </div>
      </div>
    </div>
  );
}
