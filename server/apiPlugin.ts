import type { Plugin } from 'vite';
import Groq from 'groq-sdk';
import { loadEnv } from 'vite';

export function oceanAnalystPlugin(): Plugin {
  return {
    name: 'ocean-analyst-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/ocean-analyst' && req.method === 'POST') {
          // Parse JSON body manually
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });

          req.on('end', async () => {
            try {
              const parsedBody = JSON.parse(body);
              
              // Load env dynamically for Vite
              const env = loadEnv(
                server.config.mode,
                process.cwd(),
                ''
              );
              
              const apiKey = env.GROQ_API_KEY;
              const model = env.GROQ_MODEL || 'llama3-8b-8192';

              if (!apiKey) {
                res.statusCode = 503;
                res.end(JSON.stringify({ error: 'Groq API key not configured' }));
                return;
              }

              const groq = new Groq({ apiKey });

              const messages = parsedBody.messages || [];

              const response = await groq.chat.completions.create({
                messages: messages,
                model: model,
                temperature: 0.1, // Keep it scientific
              });

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ 
                content: response.choices[0]?.message?.content || 'No response generated' 
              }));

            } catch (error) {
              console.error('Groq API Error:', error);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Failed to process request' }));
            }
          });
        } else {
          next();
        }
      });
    },
  };
}
