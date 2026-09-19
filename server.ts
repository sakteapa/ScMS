import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy / safe initialization of GoogleGenAI
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
  });
});

// AI Command Endpoint
app.post('/api/ai/command', async (req: Request, res: Response) => {
  const { prompt, currentStudents = [] } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({
      error: 'Prompt string is required',
    });
  }

  const ai = getGenAI();

  if (!ai) {
    // Return flag indicating local fallback parser should be used or provide fallback
    return res.json({
      usedGemini: false,
      note: 'Processed via smart offline language parser',
    });
  }

  try {
    const systemInstruction = `You are an AI School & Student Records Command Parser. 
The user provides natural language instructions in Mizo (e.g. 'Student thar Zothanpudaia Roll 12 dah lut rawh', 'Roll 5 attendance Present dah rawh', 'Roll 3 paih rawh', 'Zirlai engzat nge awm?'), English, or mixed.

Existing students list snapshot:
${JSON.stringify(currentStudents.slice(0, 30))}

Tasks:
1. Determine the action:
   - ADD_STUDENT: add new student (extract name, rollNumber, class, section, attendance, marks, phone, remarks)
   - UPDATE_STUDENT: update existing student info or marks
   - DELETE_STUDENT: remove a student by rollNumber
   - MARK_ATTENDANCE: mark attendance as "Present", "Absent", or "Late" for rollNumber
   - FILTER_STUDENTS: filter table by class or attendance
   - ANSWER_QUERY: answer user's question about the students/attendance/records
   - UNKNOWN: cannot understand

2. Generate a polite, natural response 'message' in the same language the user prompted (Mizo if prompted in Mizo, English if prompted in English).
3. Return strict JSON following the schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            action: {
              type: Type.STRING,
              description: 'ADD_STUDENT | UPDATE_STUDENT | DELETE_STUDENT | MARK_ATTENDANCE | FILTER_STUDENTS | ANSWER_QUERY | UNKNOWN',
            },
            success: { type: Type.BOOLEAN },
            message: { type: Type.STRING, description: 'Explanation or confirmation message' },
            data: {
              type: Type.OBJECT,
              properties: {
                student: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    rollNumber: { type: Type.INTEGER },
                    class: { type: Type.STRING },
                    section: { type: Type.STRING },
                    attendance: { type: Type.STRING },
                    marks: { type: Type.INTEGER },
                    guardianPhone: { type: Type.STRING },
                    remarks: { type: Type.STRING },
                  },
                },
                rollNumber: { type: Type.INTEGER },
                attendance: { type: Type.STRING },
                marks: { type: Type.INTEGER },
                filter: {
                  type: Type.OBJECT,
                  properties: {
                    class: { type: Type.STRING },
                    attendance: { type: Type.STRING },
                  },
                },
                answer: { type: Type.STRING },
              },
            },
          },
          required: ['action', 'success', 'message'],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    return res.json({
      usedGemini: true,
      result: parsed,
    });
  } catch (error) {
    console.error('Gemini error, falling back to local processor:', error);
    return res.json({
      usedGemini: false,
      error: 'Gemini request encountered an issue; falling back to local processor',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Student Manager server running at http://localhost:${PORT}`);
  });
}

startServer();
