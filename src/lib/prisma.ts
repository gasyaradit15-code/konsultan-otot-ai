import { PrismaClient } from '@prisma/client';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';

if (typeof window === 'undefined') {
  neonConfig.webSocketConstructor = ws;
}

// Force dynamic evaluation to bypass Next.js build cache issues
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool as any);

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter } as any);

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
