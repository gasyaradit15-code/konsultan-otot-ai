import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    return NextResponse.json({ 
      ok: true,
      userCount,
      dbUrl: process.env.DATABASE_URL ? "SET" : "NOT SET",
      directUrl: process.env.DIRECT_URL ? "SET" : "NOT SET",
    });
  } catch (error: any) {
    return NextResponse.json({ 
      ok: false,
      error: error?.message || "Unknown error",
      code: error?.code || null,
      dbUrl: process.env.DATABASE_URL ? "SET" : "NOT SET",
      directUrl: process.env.DIRECT_URL ? "SET" : "NOT SET",
    }, { status: 500 });
  }
}
