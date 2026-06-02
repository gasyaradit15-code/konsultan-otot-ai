import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

const RequestSchema = z.object({
  goal: z.string().min(3).max(150),
  equipment: z.array(z.string()).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Input tidak valid', details: parsed.error.format() },
        { status: 400 }
      );
    }
    
    const { goal, equipment } = parsed.data;

    // Prompt for the AI
    const prompt = `You are an expert fitness coach. Create a workout plan based on the following constraints:
Goal: ${goal}
Equipment available: ${equipment && equipment.length > 0 ? equipment.join(', ') : 'None'}

Return ONLY a valid JSON object with the following structure:
{
  "goal": "string",
  "exercises": [
    {
      "name": "string",
      "sets": number,
      "reps": "string",
      "notes": "string"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL as string,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    let aiPlan;
    try {
      aiPlan = JSON.parse(response.text || '{}');
    } catch {
      console.error('Failed to parse Gemini response:', response.text);
      return NextResponse.json({ error: 'Gagal memproses respon dari AI' }, { status: 500 });
    }

    // TODO: In a real app, retrieve the user from the authenticated session
    // const session = await getServerSession(authOptions);
    // if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    // For MVP demonstration, we just return the plan without saving
    // Once Auth is ready, we will use prisma.workoutPlan.create(...)

    return NextResponse.json(
      { 
        message: 'Plan generated successfully',
        data: aiPlan
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error generating plan:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
