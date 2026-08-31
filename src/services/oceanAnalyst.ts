import type { ChatContext, ChatMessage } from '../types';
import { buildSystemPrompt } from './oceanInsights';

export interface OceanAnalyst {
  analyze(context: ChatContext | null, history: ChatMessage[], message: string): Promise<string>;
}

export class GroqOceanAnalyst implements OceanAnalyst {
  async analyze(context: ChatContext | null, history: ChatMessage[], message: string): Promise<string> {
    try {
      const systemPrompt = buildSystemPrompt(context);
      
      const messages = [
        { role: 'system', content: systemPrompt },
        ...history.map(msg => ({ role: msg.role, content: msg.content })),
        { role: 'user', content: message }
      ];

      const response = await fetch('/api/ocean-analyst', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        throw new Error('API failed to respond successfully');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      return data.content;
    } catch (error) {
      console.error('GroqOceanAnalyst Error:', error);
      throw error;
    }
  }
}

export class MockOceanAnalyst implements OceanAnalyst {
  async analyze(context: ChatContext | null, _history: ChatMessage[], message: string): Promise<string> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const lowercaseMessage = message.toLowerCase();
    
    if (lowercaseMessage.includes('summarize') || lowercaseMessage.includes('indicate')) {
      if (!context) return 'Please select a location and run a prediction first.';
      return `Based on the prediction, the surface temperature is ${context.surfaceParameters.sst.toFixed(1)}°C, and it decreases to ${context.predictions[context.predictions.length - 1].predicted_temperature.toFixed(1)}°C at depth. This is a typical thermal structure, but remember these are AI model estimates.`;
    }
    
    if (lowercaseMessage.includes('50 m') || lowercaseMessage.includes('50m')) {
      if (!context) return 'Please select a location first.';
      const temp50m = context.predictions.find(p => p.depth === 50)?.predicted_temperature;
      return temp50m 
        ? `The predicted temperature at 50 m is ${temp50m.toFixed(2)} °C.` 
        : 'I do not have a prediction for exactly 50 m in this context.';
    }

    if (lowercaseMessage.includes('surface')) {
       if (!context) return 'Please select a location first.';
       return `The surface observations show a Sea Surface Temperature (SST) of ${context.surfaceParameters.sst.toFixed(2)} °C and Salinity (SSS) of ${context.surfaceParameters.sss.toFixed(2)} PSU. These are observational inputs to the model.`;
    }

    if (lowercaseMessage.includes('warm') || lowercaseMessage.includes('cool')) {
      return `Generally, the warmest water is near the surface, and it cools significantly at depth, often showing a sharp thermocline.`;
    }

    return "I am the Demo Ocean Analyst. In a real environment, I would provide a detailed scientific interpretation of that question based on the prediction data. Since the AI service is currently unavailable, this is a mock response.";
  }
}

// Factory to get the right service
export async function getOceanAnalystService(context: ChatContext | null, history: ChatMessage[], message: string): Promise<string> {
  const groqService = new GroqOceanAnalyst();
  const mockService = new MockOceanAnalyst();
  
  try {
    return await groqService.analyze(context, history, message);
  } catch (error) {
    console.warn("Falling back to MockOceanAnalyst due to error:", error);
    return await mockService.analyze(context, history, message);
  }
}
