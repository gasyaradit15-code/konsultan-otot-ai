import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const ProfileSchema = z.object({
  age: z.number().int().min(10).max(120).nullable().optional(),
  weight: z.number().positive().max(500).nullable().optional(),
  height: z.number().positive().max(300).nullable().optional(),
  goal: z.string().max(300).nullable().optional(),
  gender: z.enum(["male", "female"]).nullable().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();

    const parsed = ProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Input tidak valid', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { age, weight, height, goal, gender } = parsed.data;

    const profile = await prisma.profile.upsert({
      where: { userId },
      update: {
        age: age !== undefined ? age : undefined,
        weight: weight !== undefined ? weight : undefined,
        height: height !== undefined ? height : undefined,
        goal: goal !== undefined ? goal : undefined,
        gender: gender !== undefined ? gender : undefined,
      },
      create: {
        userId,
        age: age || null,
        weight: weight || null,
        height: height || null,
        goal: goal || null,
        gender: gender || null,
      },
    });

    return NextResponse.json({
      message: 'Profil biomekanik berhasil diperbarui',
      profile,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
