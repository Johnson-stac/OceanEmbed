import type { ChatContext, ChatMessage } from '../types';
import { buildSystemPrompt } from './oceanInsights';

export interface OceanAnalyst {
  analyze(context: ChatContext | null, history: ChatMessage[], message: string): Promise<string>;
}

export class LiveOceanAnalyst implements OceanAnalyst {
  async analyze(context: ChatContext | null, history: ChatMessage[], message: string): Promise<string> {
    const systemPrompt = buildSystemPrompt(context);
    
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map(msg => ({ role: msg.role, content: msg.content })),
      { role: 'user', content: message }
    ];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        throw new Error(data.error || `Server responded with status ${response.status}`);
      }
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      return data.content || 'No response received from the analysis engine.';
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Analysis request timed out. Please verify your network connection and try again.');
      }
      console.error('LiveOceanAnalyst Error:', error);
      throw error;
    }
  }
}

// Service caller
export async function getOceanAnalystService(
  context: ChatContext | null,
  history: ChatMessage[],
  message: string
): Promise<string> {
  const service = new LiveOceanAnalyst();
  return await service.analyze(context, history, message);
}

