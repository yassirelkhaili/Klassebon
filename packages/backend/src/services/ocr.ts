import path from "node:path";
import { fileURLToPath } from "node:url";
import { createWorker, type Worker } from "tesseract.js";

const TESSDATA_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "tessdata");

/** Raw OCR output for downstream use (e.g. LLM). */
export interface OcrResult {
  rawText: string;
  confidence: number;
}

let workerInstance: Worker | null = null;

async function getWorker(): Promise<Worker> {
  if (!workerInstance) {
    workerInstance = await createWorker("deu+eng", 1, {
      langPath: TESSDATA_DIR,
      gzip: false,
    });
  }
  return workerInstance;
}

export async function processReceipt(imagePath: string): Promise<OcrResult> {
  const worker = await getWorker();
  const {
    data: { text, confidence },
  } = await worker.recognize(imagePath);

  return {
    rawText: text,
    confidence: confidence ?? 0,
  };
}

export async function getReceiptRawText(imagePath: string): Promise<string> {
  const { rawText } = await processReceipt(imagePath);
  return rawText;
}

export async function terminateOcrWorker(): Promise<void> {
  if (workerInstance) {
    await workerInstance.terminate();
    workerInstance = null;
  }
}
