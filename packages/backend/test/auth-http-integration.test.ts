import "dotenv/config";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type express from "express";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import supertest from "supertest";
import { api_prefix } from "@klassebon/shared";
import { assertPostgresReachable, setupIntegrationApp } from "./helpers/http-integration-setup.js";
import { createTrpcClientForAgent } from "./helpers/trpc-supertest-fetch.js";

const hasDb = Boolean(process.env.DATABASE_URL);
const TEST_ORIGIN = "http://127.0.0.1";

const minimalPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

// No DB access on this path (no session cookie).
describe.skipIf(!hasDb)("HTTP integration: authentication (unauthenticated)", () => {
  let app: express.Express;

  beforeAll(async () => {
    app = await setupIntegrationApp();
  });

  it("rejects receipt upload without a session", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kb-auth-"));
    const tmp = path.join(dir, "tiny.png");
    fs.writeFileSync(tmp, minimalPng);
    try {
      const res = await supertest(app)
        .post(`${api_prefix}/receipts/upload`)
        .set("Origin", TEST_ORIGIN)
        .attach("receipt", tmp);
      expect(res.status).toBe(401);
    } finally {
      fs.unlinkSync(tmp);
      fs.rmdirSync(dir);
    }
  });
});

describe.skipIf(!hasDb)("HTTP integration: authentication (sign-up and tRPC)", () => {
  let app: express.Express;
  let cleanupEmail: string | null = null;

  beforeAll(async () => {
    await assertPostgresReachable();
    app = await setupIntegrationApp();
  });

  afterAll(async () => {
    if (!cleanupEmail) return;
    try {
      const { prisma } = await import("../src/lib/prisma.js");
      await prisma.user.deleteMany({ where: { email: cleanupEmail } });
    } catch {
      /* ignore if DB is down */
    }
  });

  it("sign-up establishes a session and tRPC me returns the user", async () => {
    const email = `integration-auth-${Date.now()}@example.com`;
    cleanupEmail = email;

    const agent = supertest.agent(app);

    const signUp = await agent.post(`${api_prefix}/auth/sign-up/email`).set("Origin", TEST_ORIGIN).send({
      name: "Integration User",
      email,
      password: "test-password-12345",
    });

    expect(signUp.status).toBe(200);

    const session = await agent.get(`${api_prefix}/auth/get-session`).set("Origin", TEST_ORIGIN);

    expect(session.status).toBe(200);
    expect(session.body?.user?.email).toBe(email);

    const trpc = createTrpcClientForAgent(agent, api_prefix);
    const me = await trpc.me.query();
    expect(me.user?.email).toBe(email);
  });
});
