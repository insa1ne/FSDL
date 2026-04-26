import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/index.js'; // Path to your 'generated' folder

// 1. Grab your connection string from .env
// For the runtime client, use the Pooler URL (Port 6543)
const connectionString = process.env.DATABASE_URL;

// 2. Setup the Postgres Pool
const pool = new Pool({ connectionString });

// 3. Setup the Prisma Adapter
const adapter = new PrismaPg(pool);

// 4. Initialize and Export the Client
// This single instance will be used throughout your entire app
export const prisma = new PrismaClient({ 
  adapter,
  log: ['query', 'error', 'warn'] // Optional: helps with debugging
});