import { describe, it, expect, afterAll } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { processReceipt, terminateOcrWorker, type OcrResult } from "../src/services/ocr.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.join(__dirname, "fixtures");

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff"]);

function getFixtureImages(): string[] {
  if (!fs.existsSync(FIXTURES_DIR)) return [];
  return fs
    .readdirSync(FIXTURES_DIR)
    .filter((f) => IMAGE_EXTENSIONS.has(path.extname(f).toLowerCase()))
    .map((f) => path.join(FIXTURES_DIR, f));
}

const fixtures = getFixtureImages();
const resultCache = new Map<string, OcrResult>();

async function getResult(imagePath: string): Promise<OcrResult> {
  const cached = resultCache.get(imagePath);
  if (cached) return cached;
  const result = await processReceipt(imagePath);
  resultCache.set(imagePath, result);
  return result;
}

afterAll(async () => {
  await terminateOcrWorker();
});

describe("OCR integration (Tesseract)", () => {
  if (fixtures.length === 0) {
    it.skip("no fixture images found in test/fixtures/, add receipt images to run", () => {});
    return;
  }

  for (const imagePath of fixtures) {
    const fileName = path.basename(imagePath);

    describe(`fixture: ${fileName}`, () => {
      it("returns non-empty OCR text", async () => {
        const result = await getResult(imagePath);
        expect(result.rawText.trim().length).toBeGreaterThan(0);
      }, 60_000);

      it("has a confidence score > 0", async () => {
        const result = await getResult(imagePath);
        expect(result.confidence).toBeGreaterThan(0);
      }, 60_000);
    });
  }
});
