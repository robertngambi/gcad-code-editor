import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));

// Initialize Gemini API client if API key is present
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// Health check and AI status endpoint
app.get('/api/ai/status', (req, res) => {
  res.json({
    online: true,
    hasApiKey: !!process.env.GEMINI_API_KEY,
    model: 'gemini-3.8-flash',
  });
});

// AI Chat & Code Agent endpoint
app.post('/api/ai/chat', async (req, res) => {
  const { prompt, files, activeFile, image, conversationHistory } = req.body;

  if (!prompt && !image) {
    return res.status(400).json({ error: 'Prompt or image is required' });
  }

  // System instruction for the gCAD full-time AI code agent
  const systemInstruction = `You are gCAD Agent, the full-time senior AI coding engine embedded inside the gCAD Code Editor.
You are specialized in:
1. Generating complete, production-ready, beautiful websites and web apps from natural language prompts.
2. Editing and reading the user's project files in the editor.
3. Fixing bugs and syntax/runtime errors pointed out by the user or debugger.
4. Integrating images/logos provided by the user into the HTML/CSS/JS (e.g. into the navbar, hero section, branding, or canvas).
5. Suggesting next steps and new features for the project.

OUTPUT FORMAT:
Always return a structured JSON response with the following schema:
{
  "thoughtProcess": "Brief summary of what you did and your architectural decisions",
  "executingSteps": ["Step 1 description", "Step 2 description", "Step 3 description"],
  "responseMessage": "Direct friendly markdown response to the user explaining the modifications",
  "fileUpdates": [
    {
      "name": "index.html",
      "content": "Full source code for the file",
      "language": "html",
      "action": "update" // "create" or "update" or "delete"
    }
  ],
  "activeFileName": "index.html",
  "suggestedNextSteps": [
    "Add interactive sound effects",
    "Add local storage high scores",
    "Make header sticky with blur effect",
    "Add Dark/Light theme switcher"
  ]
}

IMPORTANT RULES:
- Always produce complete, functional code without placeholders like '// TODO: add more code here'.
- Use modern HTML5, clean CSS (Tailwind CDN or custom CSS), and standard modern JavaScript.
- If the user provided an image/logo, embed it as specified or as a logo/hero image.
- Keep the response clean and strictly valid JSON matching the format above.`;

  // Build context payload
  const projectContext = Array.isArray(files)
    ? files
        .map(
          (f: { name: string; content: string }) =>
            `--- FILE: ${f.name} ---\n${f.content || ''}\n`
        )
        .join('\n')
    : '';

  const activeContext = activeFile ? `Active file currently opened: ${activeFile}\n` : '';

  const userContent = `PROJECT CONTEXT:\n${activeContext}${projectContext}\n\nUSER REQUEST: ${prompt || 'Process the attached image/logo for the project.'}`;

  if (aiClient) {
    try {
      const contentsParts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

      if (image && image.data && image.mimeType) {
        contentsParts.push({
          inlineData: {
            mimeType: image.mimeType,
            data: image.data.replace(/^data:[^;]+;base64,/, ''),
          },
        });
      }

      contentsParts.push({
        text: userContent,
      });

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: { parts: contentsParts },
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        },
      });

      const text = response.text || '{}';
      try {
        const parsed = JSON.parse(text);
        return res.json(parsed);
      } catch (jsonErr) {
        return res.json({
          thoughtProcess: 'Processed code request',
          executingSteps: ['Parsed prompt', 'Synthesized changes'],
          responseMessage: text,
          fileUpdates: [],
          suggestedNextSteps: ['Test in preview', 'Refine design'],
        });
      }
    } catch (apiError: any) {
      console.error('Gemini API Error:', apiError);
      return res.status(500).json({
        error: apiError?.message || 'Gemini API call failed',
        offlineFallbackAvailable: true,
      });
    }
  } else {
    // Return structured offline fallback response
    return res.status(200).json({
      thoughtProcess: 'Offline Intelligent Rule Engine executed',
      executingSteps: [
        'Analyzed local project files',
        'Offline assistant simulated modification',
      ],
      responseMessage: `Offline Assistant: Received your prompt "${prompt}". You are running in offline mode. Configure GEMINI_API_KEY in Settings to unlock live cloud AI generation, or use the built-in offline error scanner and code editor!`,
      fileUpdates: [],
      suggestedNextSteps: [
        'Debug code with Console',
        'Preview in mobile/tablet view',
        'Export build output',
      ],
    });
  }
});

// Configure Vite or Static server
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`gCAD Code Editor dev server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
