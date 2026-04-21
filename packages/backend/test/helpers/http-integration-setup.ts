import type express from "express";

function isAuthFailure(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const o = err as Record<string, unknown>;
  if (o.code === "P1000") return true;
  const msg = typeof o.message === "string" ? o.message : "";
  return msg.includes("Authentication failed") || msg.includes("password authentication failed");
}

// Env + app factory shared by HTTP integration tests.
export async function setupIntegrationApp(): Promise<express.Express> {
  process.env.BETTER_AUTH_URL = "http://127.0.0.1";
  if (!process.env.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET.length < 32) {
    process.env.BETTER_AUTH_SECRET = "test-secret-at-least-32-characters!!";
  }
  const { createApp } = await import("../../src/app.js");
  return createApp();
}

// Pings the DB so we can give a clear error for the common P1000 (wrong Docker credentials).
export async function assertPostgresReachable(): Promise<void> {
  const { prisma } = await import("../../src/lib/prisma.js");
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err) {
    const dockerUrl = "postgresql://klassebon:klassebon@localhost:5432/klassebon?schema=public";
    const authHint = isAuthFailure(err)
      ? [
          "PostgreSQL rejected the username/password in DATABASE_URL (P1000).",
          "If you use `docker compose up` from the repo root, set:",
          `DATABASE_URL="${dockerUrl}"`,
          "in packages/backend/.env (not the USER:PASSWORD placeholder).",
        ].join("\n")
      : [
          "Could not connect to PostgreSQL. Start it (e.g. `docker compose up -d` from repo root).",
          `Then set DATABASE_URL (docker default: ${dockerUrl}).`,
        ].join("\n");

    const detail = err instanceof Error ? err.message : String(err);
    throw new Error([authHint, `Prisma: ${detail}`].join("\n"), { cause: err });
  }
}

// Checks the `receipt` table exists. Better Auth's tables alone are not enough for upload/OCR tests.
export async function assertReceiptTableExists(): Promise<void> {
  const { prisma } = await import("../../src/lib/prisma.js");
  try {
    await prisma.$queryRaw`SELECT 1 FROM receipt LIMIT 1`;
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new Error(
      [
        "The `receipt` table is missing or unreachable.",
        "From packages/backend run: npx prisma db push",
        "(or npx prisma migrate dev if you use migrations).",
        `Prisma: ${detail}`,
      ].join("\n"),
      { cause: err },
    );
  }
}
