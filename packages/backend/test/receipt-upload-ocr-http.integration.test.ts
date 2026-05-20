import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type express from "express";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import supertest from "supertest";
import { api_prefix } from "@klassebon/shared";
import { terminateOcrWorker } from "../src/services/ocr.js";
import {
  assertPostgresReachable,
  assertReceiptTableExists,
  setupIntegrationApp,
} from "./helpers/http-integration-setup.js";
import { createTrpcClientForAgent } from "./helpers/trpc-supertest-fetch.js";

const hasDb = Boolean(process.env.DATABASE_URL);
const TEST_ORIGIN = "http://127.0.0.1";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.join(__dirname, "fixtures");
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff"]);

function firstFixtureImage(): string | null {
  if (!fs.existsSync(FIXTURES_DIR)) return null;
  const name = fs.readdirSync(FIXTURES_DIR).find((f) => IMAGE_EXTENSIONS.has(path.extname(f).toLowerCase()));
  return name ? path.join(FIXTURES_DIR, name) : null;
}

const fixturePath = firstFixtureImage();
const hasFixture = fixturePath !== null;

describe.skipIf(!hasDb || !hasFixture)("HTTP integration: receipt upload and OCR", () => {
  let app: express.Express;
  let cleanupEmail: string | null = null;
  let uploadedImagePath: string | null = null;

  beforeAll(async () => {
    await assertPostgresReachable();
    await assertReceiptTableExists();
    app = await setupIntegrationApp();
  });

  afterAll(async () => {
    if (uploadedImagePath && fs.existsSync(uploadedImagePath)) {
      try {
        fs.unlinkSync(uploadedImagePath);
      } catch {
        /* ignore */
      }
    }
    if (cleanupEmail) {
      try {
        const { prisma } = await import("../src/lib/prisma.js");
        await prisma.user.deleteMany({ where: { email: cleanupEmail } });
      } catch {
        /* ignore if DB is down */
      }
    }
    await terminateOcrWorker();
  });

  it("uploads a receipt image then processOcr returns OCR text", async () => {
    const email = `integration-receipt-${Date.now()}@example.com`;
    cleanupEmail = email;

    const agent = supertest.agent(app);

    const signUp = await agent.post(`${api_prefix}/auth/sign-up/email`).set("Origin", TEST_ORIGIN).send({
      name: "Receipt Integration",
      email,
      password: "test-password-12345",
    });
    expect(signUp.status).toBe(200);

    const upload = await agent
      .post(`${api_prefix}/receipts/upload`)
      .set("Origin", TEST_ORIGIN)
      .attach("receipt", fixturePath!);

    if (upload.status !== 201) {
      throw new Error(
        `Expected upload 201, got ${upload.status}: ${JSON.stringify(upload.body)}. If the DB has no receipt table, run: npx prisma db push (from packages/backend).`,
      );
    }
    expect(upload.body?.id).toBeTruthy();
    uploadedImagePath = upload.body.imagePath as string;

    const trpc = createTrpcClientForAgent(agent, api_prefix);
    const ocr = await trpc.receipt.processOcr.mutate({ receiptId: upload.body.id });

    expect(ocr.alreadyProcessed).toBe(false);
    expect(ocr.ocrText.trim().length).toBeGreaterThan(0);
    expect(ocr.confidence).toBeGreaterThan(0);
  }, 120_000);
});
