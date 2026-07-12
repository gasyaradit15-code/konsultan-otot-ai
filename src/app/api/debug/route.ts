import { NextResponse } from "next/server";
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

export async function GET() {
  const dbUrl = process.env.DATABASE_URL;
  const dbUrlPreview = dbUrl ? dbUrl.substring(0, 50) + '...' : 'NOT SET';
  
  try {
    // Test connection directly without Prisma
    const pool = new Pool({ connectionString: dbUrl });
    const result = await pool.query('SELECT COUNT(*) FROM "User"');
    await pool.end();
    return NextResponse.json({ 
      ok: true,
      userCount: result.rows[0].count,
      dbUrlPreview,
    });
  } catch (error: any) {
    return NextResponse.json({ 
      ok: false,
      error: error?.message || "Unknown error",
      dbUrlPreview,
    }, { status: 500 });
  }
}
