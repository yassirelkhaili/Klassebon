import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { PrismaClient } from "../generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

/**
 * Prisma 7 client with PostgreSQL adapter (TA2.2).
 * Use this for app data; Better Auth uses the same DB via prismaAdapter.
 */
export const prisma = new PrismaClient({ adapter });

export async function disconnectPrisma() {
  await prisma.$disconnect();
  await pool.end();
}
