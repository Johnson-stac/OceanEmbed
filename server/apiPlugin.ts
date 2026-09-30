import type { Plugin } from 'vite';
import Groq from 'groq-sdk';
import { loadEnv } from 'vite';

function createChatMiddleware(getMode: () => string) {
  return async (req: any, res: any, next: any) => {
    const cleanUrl = req.url?.split('?')[0].replace(/\/$/, '') || '';
    const isAnalystEndpoint = cleanUrl === '/api/ocean-analyst' || cleanUrl === '/api/chat';
    if (isAnalystEndpoint && req.method === 'POST') {
      // Parse JSON body
      let body = '';
      req.on('data', (chunk: any) => {
        body += chunk.toString();
      });

      req.on('end', async () => {
        try {
          const parsedBody = JSON.parse(body || '{}');
          
          // Load env dynamically for Vite (checks .env.local and .env)
          const env = loadEnv(
            getMode(),
            process.cwd(),
            ''
          );
          
          const geminiApiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
          const groqApiKey = env.GROQ_API_KEY || process.env.GROQ_API_KEY;
          const messages = parsedBody.messages || [];

          if (!geminiApiKey && !groqApiKey) {
            res.statusCode = 503;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ 
              error: 'AI Chatbot API key not configured. Add GEMINI_API_KEY or GROQ_API_KEY to your .env.local file.' 
            }));
            return;
          }

          // Provider 1: Gemini if configured
          if (geminiApiKey) {
            try {
              const geminiModel = env.GEMINI_MODEL || process.env.GEMINI_MODEL || 'gemini-1.5-flash';
              // Format messages for Gemini API
              const systemInstruction = messages.find((m: any) => m.role === 'system')?.content || '';
              const contents = messages
                .filter((m: any) => m.role !== 'system')
                .map((m: any) => ({
                  role: m.role === 'assistant' ? 'model' : 'user',
                  parts: [{ text: m.content }]
                }));

              const geminiPayload: any = {
                contents,
                generationConfig: {
                  temperature: 0.2,
                  maxOutputTokens: 1024,
                }
              };

              if (systemInstruction) {
                geminiPayload.systemInstruction = {
                  parts: [{ text: systemInstruction }]
                };
              }

              const geminiRes = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(geminiPayload)
                }
              );

              if (geminiRes.ok) {
                const geminiData: any = await geminiRes.json();
                const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ content: text }));
                  return;
                }
              } else {
                const errData: any = await geminiRes.json().catch(() => ({}));
                console.warn('Gemini API returned error, checking if Groq is available as fallback:', errData);
                if (!groqApiKey) {
                  res.statusCode = geminiRes.status;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ 
                    error: errData.error?.message || 'Gemini API call failed' 
                  }));
                  return;
                }
              }
            } catch (geminiErr: any) {
              console.error('Gemini call error:', geminiErr);
              if (!groqApiKey) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: geminiErr.message || 'Gemini processing failed' }));
                return;
              }
            }
          }

          // Provider 2: Groq (if Gemini wasn't used or failed)
          if (groqApiKey) {
            let model = env.GROQ_MODEL || process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
            if (model === 'llama3-8b-8192' || model === 'llama-3-8b-8192') {
              model = 'openai/gpt-oss-120b';
            }

            const groq = new Groq({ apiKey: groqApiKey });
            const response = await groq.chat.completions.create({
              messages: messages.map((m: any) => ({
                role: m.role,
                content: m.content
              })),
              model: model,
              temperature: 0.1, // Scientific precision
            });

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ 
              content: response.choices[0]?.message?.content || 'No response generated' 
            }));
            return;
          }

        } catch (error: any) {
          console.error('Chatbot API Error:', error);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: error.message || 'Failed to process request' }));
        }
      });
    } else {
      next();
    }
  };
}

export function oceanAnalystPlugin(): Plugin {
  return {
    name: 'ocean-analyst-api',
    configureServer(server) {
      server.middlewares.use(createChatMiddleware(() => server.config.mode));
    },
    configurePreviewServer(server) {
      server.middlewares.use(createChatMiddleware(() => server.config.mode));
    },
  };
}
