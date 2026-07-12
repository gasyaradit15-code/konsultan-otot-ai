import { NextResponse } from "next/server";
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import prisma from '@/lib/prisma';

neonConfig.webSocketConstructor = ws;

export async function GET() {
  const dbUrl = process.env.DATABASE_URL;
  const dbUrlPreview = dbUrl ? dbUrl.substring(0, 50) + '...' : 'NOT SET';
  
  let neonResult: any = null;
  let prismaResult: any = null;
  
  try {
    const pool = new Pool({ connectionString: dbUrl });
    const result = await pool.query('SELECT COUNT(*) FROM "User"');
    await pool.end();
    neonResult = { ok: true, count: result.rows[0].count };
  } catch (error: any) {
    neonResult = { ok: false, error: error?.message };
  }
  
  try {
    const count = await prisma.user.count();
    prismaResult = { ok: true, count };
  } catch (error: any) {
    prismaResult = { ok: false, error: error?.message };
  }
  
  return NextResponse.json({ dbUrlPreview, neonResult, prismaResult });
}
