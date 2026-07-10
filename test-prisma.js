const { PrismaClient } = require('./src/generated/prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const Database = require('better-sqlite3');
const path = require('path');

try {
  console.log("Resolving path...");
  const dbPath = path.resolve(process.cwd(), 'dev.db');
  console.log("DB Path:", dbPath);
  
  console.log("Creating better-sqlite3 instance...");
  const db = new Database(dbPath);
  
  console.log("Creating adapter...");
  const adapter = new PrismaBetterSqlite3(db);
  
  console.log("Initializing PrismaClient...");
  const prisma = new PrismaClient({ adapter });
  
  console.log("Querying database...");
  prisma.user.findMany().then(users => {
    console.log("Success! Users count:", users.length);
    process.exit(0);
  }).catch(err => {
    console.error("Prisma query error:", err);
    process.exit(1);
  });
} catch (e) {
  console.error("Initialization error:", e);
  process.exit(1);
}
