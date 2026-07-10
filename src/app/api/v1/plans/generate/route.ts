import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

const RequestSchema = z.object({
  goal: z.string().min(3).max(150),
  equipment: z.array(z.string()).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Server-side received payload:", body);
    
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Input tidak valid', details: parsed.error.format() },
        { status: 400 }
      );
    }
    
    const { goal, equipment } = parsed.data;

    // Check user session
    const session = await getServerSession(authOptions);
    let profile = null;

    if (session?.user) {
      const userId = (session.user as any).id;
      profile = await prisma.profile.findUnique({
        where: { userId },
      });
    }

    // Build personalization context
    let personalizationContext = '';
    if (profile) {
      const { age, weight, height, goal: profileGoal, gender } = profile as any;
      personalizationContext = `
User Biomechanics & Physical Characteristics:
- Gender: ${gender === 'male' ? 'Male (Pria)' : gender === 'female' ? 'Female (Wanita)' : 'Not specified'}
- Age: ${age ? age + ' years old' : 'Not specified'}
- Weight: ${weight ? weight + ' kg' : 'Not specified'}
- Height: ${height ? height + ' cm' : 'Not specified'}
- Profile Specific Goal/Context: ${profileGoal || 'Not specified'}

Use this information to hyper-personalize the workout. Specifically:
1. Adjust the exercise selection, sets, reps, and volume to match the user's age and experience level.
2. If the user is Female (Wanita), prioritize exercises that focus on glutes, legs, and upper body toning. Avoid overly bulking-focused language; use empowering, motivational tone.
3. If the user is Male (Pria), emphasize strength, hypertrophy, and muscle mass building.
4. Provide tailored biomechanics advice in the "notes" field based on their physical attributes (e.g., squat/deadlift tips for tall or short individuals, joint-friendly tips if age > 40, safety recommendations for heavier bodyweight/machine exercises based on weight).
5. If they have a Profile Specific Goal, incorporate it alongside their primary generation goal.`;
    }

    // Prompt for the AI
    const prompt = `You are an expert fitness coach at Andisa Gym. Create a hardcore and hyper-personalized workout plan based on the following constraints:
Goal: ${goal}
Equipment available: ${equipment && equipment.length > 0 ? equipment.join(', ') : 'None'}
${personalizationContext}

Return ONLY a valid JSON object in Indonesian language (specifically for names of exercises and notes, write in highly motivational, hardcore Indonesian style like "COACH TIPS: Jaga punggung tegak saat meledakkan set ini!"). The JSON structure must be:
{
  "goal": "string",
  "exercises": [
    {
      "name": "string",
      "sets": number,
      "reps": "string",
      "notes": "string",
      "category": "chest" | "back" | "legs" | "shoulders" | "core"
    }
  ]
}
Important: Make sure to select the correct category value matching the exercise target (e.g. chest, back, legs, shoulders, or core). Shrugs should be categorized as shoulders or back, etc.`;

    let aiPlan;
    let fallbackUsed = false;
    let warningMessage = '';

    try {
      const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL as string,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      });

      try {
        aiPlan = JSON.parse(response.text || '{}');
      } catch {
        console.error('Failed to parse Gemini response:', response.text);
        throw new Error('JSON parsing failed');
      }
    } catch (apiError: any) {
      console.warn('Gemini API failed or quota exceeded, falling back to local coach templates:', apiError);
      
      // Mark fallback as used and construct message
      fallbackUsed = true;
      const isQuota = apiError?.message?.includes('429') || apiError?.message?.includes('quota') || JSON.stringify(apiError).includes('RESOURCE_EXHAUSTED');
      warningMessage = isQuota 
        ? 'Kuota API Harian Terlampaui. Menyajikan program latihan cerdas alternatif dari Coach Andisa.'
        : 'Koneksi AI Terganggu. Menyajikan program latihan cerdas alternatif dari Coach Andisa.';

      // Generate local highly personalized plan matching goals and equipment
      const hasDumbbells = equipment?.some((e: string) => e.toLowerCase().includes('dumbbell')) ?? false;
      const hasBarbell = equipment?.some((e: string) => e.toLowerCase().includes('barbell')) ?? false;
      const hasCables = equipment?.some((e: string) => e.toLowerCase().includes('cable')) ?? false;
      const hasMachines = equipment?.some((e: string) => e.toLowerCase().includes('machine')) ?? false;
      
      let exercises = [];
      const upperGoal = goal.toUpperCase();
      
      if (upperGoal.includes('DADA') || upperGoal.includes('CHEST') || upperGoal.includes('BENCH')) {
        exercises = [
          {
            name: hasBarbell ? 'Hardcore Bench Press' : (hasDumbbells ? 'Dumbbell Chest Press' : 'Brutal Push Up'),
            sets: 4,
            reps: '8-12',
            notes: 'COACH TIPS: Jaga punggung tetap menempel pada bench, rasakan kontraksi penuh pada dada saat mendorong beban ke atas!',
            category: 'chest'
          },
          {
            name: hasDumbbells ? 'Incline Dumbbell Fly' : 'Decline Push Up',
            sets: 3,
            reps: '12',
            notes: 'COACH TIPS: Rentangkan tangan secara terkontrol untuk meregangkan serat otot dada bagian atas.',
            category: 'chest'
          },
          {
            name: hasCables ? 'Cable Crossover' : 'Dips (Bodyweight)',
            sets: 3,
            reps: '15',
            notes: 'COACH TIPS: Fokus pada squeezing/meremas otot dada di titik puncak gerakan.',
            category: 'chest'
          }
        ];
      } else if (upperGoal.includes('PUNGGUNG') || upperGoal.includes('BACK') || upperGoal.includes('DEADLIFT') || upperGoal.includes('SAYAP')) {
        exercises = [
          {
            name: hasBarbell ? 'Deadlift Tempur' : 'Pull Up (Bodyweight)',
            sets: 4,
            reps: '5-8',
            notes: 'COACH TIPS: Kunci otot core, pastikan tulang belakang netral demi keamanan sendi pinggang!',
            category: 'back'
          },
          {
            name: hasBarbell ? 'Barbell Bent Over Row' : (hasDumbbells ? 'One-Arm Dumbbell Row' : 'Inverted Bodyweight Row'),
            sets: 3,
            reps: '10',
            notes: 'COACH TIPS: Tarik beban menggunakan otot lat, bukan hanya kekuatan lengan.',
            category: 'back'
          },
          {
            name: hasCables ? 'Lat Pulldown' : 'Hyper-extension',
            sets: 3,
            reps: '12',
            notes: 'COACH TIPS: Rasakan kontraksi penuh pada punggung tengah dan bawah.',
            category: 'back'
          }
        ];
      } else if (upperGoal.includes('KAKI') || upperGoal.includes('LEG') || upperGoal.includes('SQUAT') || upperGoal.includes('PAHA')) {
        exercises = [
          {
            name: hasBarbell ? 'Back Squat Brutal' : (hasDumbbells ? 'Dumbbell Goblet Squat' : 'Bulgarian Split Squat'),
            sets: 4,
            reps: '10',
            notes: 'COACH TIPS: Turun hingga paha sejajar lantai (parallel), dorong melalui tumit kaki!',
            category: 'legs'
          },
          {
            name: hasDumbbells ? 'Dumbbell Romanian Deadlift' : 'Bodyweight Lunges',
            sets: 3,
            reps: '12',
            notes: 'COACH TIPS: Rasakan regangan luar biasa pada hamstring dan glutes Anda.',
            category: 'legs'
          },
          {
            name: hasMachines ? 'Leg Press' : 'Calf Raises',
            sets: 3,
            reps: '15',
            notes: 'COACH TIPS: Latih betis hingga burn maksimal, tahan 1 detik di puncak kontraksi.',
            category: 'legs'
          }
        ];
      } else {
        exercises = [
          {
            name: hasDumbbells ? 'Dumbbell Thrusters' : 'Burpees Siksaan',
            sets: 4,
            reps: '12',
            notes: 'COACH TIPS: Latihan fungsional eksplosif untuk memicu metabolisme tubuh secara maksimal!',
            category: 'core'
          },
          {
            name: hasBarbell ? 'Barbell Overhead Press' : (hasDumbbells ? 'Dumbbell Shoulder Press' : 'Pike Push Up'),
            sets: 3,
            reps: '10',
            notes: 'COACH TIPS: Tekan beban ke atas kepala dengan stabil tanpa mengayunkan pinggang.',
            category: 'shoulders'
          },
          {
            name: 'Pull Up / Push Up Superset',
            sets: 3,
            reps: 'Failure',
            notes: 'COACH TIPS: Hancurkan batas kemampuan fisikmu dengan repetisi maksimum tanpa istirahat.',
            category: 'core'
          }
        ];
      }

      // Profile adjustment in fallback mode
      if (profile) {
        if (profile.age && profile.age > 40) {
          exercises = exercises.map(ex => ({
            ...ex,
            sets: Math.max(2, ex.sets - 1),
            notes: `${ex.notes} (ADJUSTMENT USIA: Volume set disesuaikan karena usia > 40 tahun untuk pemulihan optimal).`
          }));
        }
        if (profile.weight && profile.weight > 90) {
          exercises = exercises.map(ex => ({
            ...ex,
            notes: `${ex.notes} (ADJUSTMENT BIOMEKANIK: Fokus kontrol gerak karena bobot badan di atas 90 kg untuk melindungi sendi lutut).`
          }));
        }
      }

      aiPlan = {
        goal: goal,
        exercises: exercises
      };
    }

    let isSaved = false;

    if (session?.user) {
      const userId = (session.user as any).id;
      try {
        await prisma.workoutPlan.create({
          data: {
            userId,
            goal: aiPlan.goal || goal,
            exercises: {
              create: (aiPlan.exercises || []).map((ex: any) => ({
                name: ex.name || 'Unnamed Exercise',
                sets: Number(ex.sets) || 3,
                reps: String(ex.reps || '10'),
                notes: ex.notes || null,
                category: ex.category || null,
              })),
            },
          },
        });
        isSaved = true;
      } catch (dbError) {
        console.error('Database saving failed:', dbError);
      }
    }

    return NextResponse.json(
      { 
        message: isSaved 
          ? 'Plan generated and saved to profile' 
          : 'Plan generated successfully (Guest Mode)',
        data: aiPlan,
        saved: isSaved,
        fallback: fallbackUsed,
        warning: warningMessage || undefined
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Critical generation failure:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
