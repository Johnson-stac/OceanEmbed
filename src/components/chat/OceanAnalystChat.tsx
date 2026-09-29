import { useState, useRef, useEffect } from 'react';
import { Bot, RotateCcw, ChevronDown, Sparkles, AlertCircle } from 'lucide-react';
import type { ChatMessage as ChatMessageType, ChatContext } from '../../types';
import { getOceanAnalystService } from '../../services/oceanAnalyst';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { QuickQuestions } from './QuickQuestions';

interface OceanAnalystChatProps {
  context: ChatContext | null;
}

interface ExtendedChatMessage extends ChatMessageType {
  isError?: boolean;
}

export function OceanAnalystChat({ context }: OceanAnalystChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ExtendedChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUserMessage, setLastUserMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    setLastUserMessage(content);
    const userMessage: ExtendedChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Pass recent messages for context continuity
      const history = messages.filter((m) => !m.isError).slice(-8);
      const response = await getOceanAnalystService(context, history, content);

      const aiMessage: ExtendedChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMessage: ExtendedChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Analysis Engine Notice: ${
          error.message || 'Unable to connect to AI analysis backend. Please check server configuration and try again.'
        }`,
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastUserMessage) {
      // Remove last error message and retry
      setMessages((prev) => prev.filter((m) => !m.isError));
      handleSendMessage(lastUserMessage);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setLastUserMessage(null);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[1100] w-13 h-13 sm:w-14 sm:h-14 bg-[#0B3A82] dark:bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all group border-2 border-white/40 cursor-pointer"
        aria-label="Open AI Ocean Analyst"
        title="Open AI Ocean Analyst"
      >
        <Bot size={26} className="group-hover:rotate-6 transition-transform" />
        <span className="absolute right-full mr-3 whitespace-nowrap bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg border border-slate-700">
          AI Ocean Analyst
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[1100] w-[calc(100vw-32px)] sm:w-[420px] h-[82vh] max-h-[640px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-2xl flex flex-col overflow-hidden font-sans rounded-none transition-colors">
      {/* Header */}
      <div className="bg-[#0B3A82] dark:bg-[#071630] text-white p-3.5 sm:p-4 flex items-center justify-between flex-shrink-0 border-b border-[#082C64] dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-none bg-white text-[#0B3A82] dark:bg-blue-600 dark:text-white flex items-center justify-center font-bold shadow-xs">
            <Bot size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold tracking-tight uppercase">
                AI Ocean Analyst
              </h3>
              <span className="text-[9px] font-black bg-blue-300/30 text-blue-100 px-1.5 py-0.5 rounded-none uppercase tracking-wider">
                Autonomous
              </span>
            </div>
            <p className="text-[11px] text-blue-200 dark:text-blue-300 font-mono">
              {context?.location
                ? `${context.location.lat.toFixed(1)}°N, ${context.location.lng.toFixed(1)}°E`
                : 'Scientific Context Ready'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleReset}
            className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-none transition-colors cursor-pointer"
            title="Clear Chat Conversation"
            aria-label="Clear chat"
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-none transition-colors cursor-pointer"
            title="Minimize Assistant"
            aria-label="Minimize chat"
          >
            <ChevronDown size={20} />
          </button>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-grow p-3.5 sm:p-4 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/60 flex flex-col justify-between">
        {messages.length === 0 ? (
          <div className="flex-grow flex flex-col justify-end pb-2">
            <div className="bg-white dark:bg-slate-800/80 p-4 border border-slate-200 dark:border-slate-700 shadow-xs mb-3 text-slate-700 dark:text-slate-200">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0B3A82] dark:text-blue-400 mb-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Oceanographic Domain Intelligence</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-2">
                I can interpret surface satellite telemetry (SST, SSS, SLA, currents), explain the reconstructed subsurface temperature profiles (0m to 1000m), locate thermocline gradients, and assess marine habitat suitability.
              </p>
              {context ? (
                <div className="text-[11px] font-mono bg-[#F0F5FC] dark:bg-slate-900/80 p-2 border border-blue-200 dark:border-blue-900/50 text-[#0B3A82] dark:text-blue-300">
                  Target: {context.location.lat.toFixed(2)}°N, {context.location.lng.toFixed(2)}°E · SST: {context.surfaceParameters.sst.toFixed(1)}°C
                </div>
              ) : (
                <div className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                  Select a station or coordinate point on the map to bind real-time context.
                </div>
              )}
            </div>

            <QuickQuestions onSelect={handleSendMessage} />
          </div>
        ) : (
          <div className="flex flex-col">
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                isError={msg.isError}
                onRetry={msg.isError ? handleRetry : undefined}
              />
            ))}

            {/* Scientific Typing Indicator */}
            {isLoading && (
              <div className="flex justify-start mb-3.5 animate-in fade-in duration-100">
                <div className="flex max-w-[85%] flex-row gap-2.5">
                  <div className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-[#0B3A82] dark:bg-blue-600 text-white shadow-xs">
                    <Bot size={15} />
                  </div>
                  <div className="px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs rounded-xl rounded-tl-none flex items-center gap-2 shadow-xs">
                    <span className="font-medium">Analyzing telemetry</span>
                    <span className="flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0B3A82] dark:bg-blue-400 animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0B3A82] dark:bg-blue-400 animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0B3A82] dark:bg-blue-400 animate-bounce"></span>
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        <div className="text-[10px] text-center text-slate-400 dark:text-slate-500 mt-2 font-mono flex items-center justify-center gap-1.5">
          <AlertCircle className="w-3 h-3 text-slate-400" />
          <span>Subsurface temperatures are deep learning reconstructions</span>
        </div>
      </div>
    </div>
  );
}
