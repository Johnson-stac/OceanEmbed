import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// ---------------------------------------------------------------------------
// Health-check endpoint (useful for load-balancers & Docker HEALTHCHECK)
// ---------------------------------------------------------------------------
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ---------------------------------------------------------------------------
// Ocean Analyst & Chat API (Supports Gemini & Groq via secure server routes)
// ---------------------------------------------------------------------------
const handleChatRequest = async (req: express.Request, res: express.Response) => {
  try {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const groqApiKey = process.env.GROQ_API_KEY;
    const messages = req.body.messages || [];

    if (!geminiApiKey && !groqApiKey) {
      res.status(503).json({ 
        error: 'AI Chatbot API key not configured. Set GEMINI_API_KEY or GROQ_API_KEY in .env.local or environment variables.' 
      });
      return;
    }

    // Provider 1: Gemini if configured
    if (geminiApiKey) {
      try {
        const geminiModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
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
          const geminiData = await geminiRes.json();
          const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            res.json({ content: text });
            return;
          }
        }
      } catch (geminiErr: any) {
        console.error('Express Gemini Error:', geminiErr);
        if (!groqApiKey) {
          res.status(500).json({ error: geminiErr.message || 'Gemini processing failed' });
          return;
        }
      }
    }

    // Provider 2: Groq
    if (groqApiKey) {
      let model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
      if (model === 'llama3-8b-8192' || model === 'llama-3-8b-8192') {
        model = 'openai/gpt-oss-120b';
      }

      const groq = new Groq({ apiKey: groqApiKey });
      const response = await groq.chat.completions.create({
        messages: messages.map((m: any) => ({
          role: m.role,
          content: m.content
        })),
        model,
        temperature: 0.1, // Keep it scientific
      });

      res.json({
        content: response.choices[0]?.message?.content || 'No response generated',
      });
      return;
    }

  } catch (error: any) {
    console.error('Chat API Error:', error);
    res.status(500).json({ error: error.message || 'Failed to process request' });
  }
};

app.post('/api/ocean-analyst', handleChatRequest);
app.post('/api/chat', handleChatRequest);


// ---------------------------------------------------------------------------
// Future: Model inference endpoint placeholder
// When your trained model is ready, add its loading & inference logic here.
// ---------------------------------------------------------------------------
// app.post('/api/predict', async (req, res) => {
//   // Load model weights, run inference, return results
// });

// ---------------------------------------------------------------------------
// Serve the Vite-built static frontend
// ---------------------------------------------------------------------------
const distPath = path.resolve(__dirname, '..', 'dist');
app.use(express.static(distPath));

// SPA fallback — all non-API routes serve index.html (Express v5 syntax)
app.get('{*path}', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════╗
║        🌊 OceanEmbed Server Running          ║
╠══════════════════════════════════════════════╣
║  Local:   http://localhost:${PORT}              ║
║  Mode:    Production                         ║
║  Health:  http://localhost:${PORT}/api/health    ║
╚══════════════════════════════════════════════╝
  `);
});

export default app;
