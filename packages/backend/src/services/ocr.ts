import path from "node:path";
import { fileURLToPath } from "node:url";
import { createWorker, type Worker } from "tesseract.js";
import type { Category } from "../generated/prisma/client.js";

/** Directory with `deu.traineddata` and `eng.traineddata` (see `tessdata/README.md`). */
const TESSDATA_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "tessdata",
);

export interface OcrResult {
  rawText: string;
  extractedAmount: number | null;
  extractedCategory: Category | null;
  confidence: number;
}

const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  LEBENSMITTEL: [
    "rewe",
    "aldi",
    "lidl",
    "edeka",
    "penny",
    "netto",
    "kaufland",
    "lebensmittel",
    "supermarkt",
    "bäckerei",
    "metzgerei",
    "obst",
    "gemüse",
  ],
  STREAMING: [
    "netflix",
    "spotify",
    "disney",
    "amazon prime",
    "apple tv",
    "youtube premium",
    "dazn",
    "crunchyroll",
  ],
  VERSICHERUNG: [
    "versicherung",
    "allianz",
    "axa",
    "huk",
    "ergo",
    "debeka",
    "krankenversicherung",
    "haftpflicht",
  ],
  TRANSPORT: [
    "tankstelle",
    "shell",
    "aral",
    "total",
    "db ",
    "deutsche bahn",
    "bvg",
    "mvv",
    "uber",
    "taxi",
    "benzin",
    "diesel",
    "tanken",
  ],
  WOHNUNG: [
    "miete",
    "strom",
    "gas",
    "wasser",
    "nebenkosten",
    "stadtwerke",
    "hausverwaltung",
    "warmmiete",
  ],
  GESUNDHEIT: [
    "apotheke",
    "arzt",
    "krankenhaus",
    "physiotherapie",
    "zahnarzt",
    "optiker",
    "medikament",
  ],
  FREIZEIT: [
    "kino",
    "restaurant",
    "bar",
    "café",
    "fitnessstudio",
    "gym",
    "sport",
    "konzert",
    "museum",
    "theater",
  ],
  BILDUNG: [
    "buch",
    "buchhandlung",
    "thalia",
    "kurs",
    "seminar",
    "schule",
    "universität",
    "weiterbildung",
    "udemy",
  ],
  SONSTIGES: [],
};

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

export function extractAmount(text: string): number | null {
  const patterns = [
    /(?:gesamt|total|summe|betrag|zu\s*zahlen|endbetrag)[:\s]*(\d+[.,]\d{2})/i,
    /(?:eur|€)\s*(\d+[.,]\d{2})/i,
    /(\d+[.,]\d{2})\s*(?:eur|€)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      return parseFloat(match[1].replace(",", "."));
    }
  }

  const allAmounts = [...text.matchAll(/(\d+[.,]\d{2})/g)]
    .map((m) => parseFloat(m[1].replace(",", ".")))
    .filter((n) => n > 0);

  if (allAmounts.length > 0) {
    return Math.max(...allAmounts);
  }

  return null;
}

export function extractCategory(text: string): Category | null {
  const lower = text.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.length === 0) continue;
    if (keywords.some((kw) => lower.includes(kw))) {
      return category as Category;
    }
  }

  return "SONSTIGES";
}

export async function processReceipt(imagePath: string): Promise<OcrResult> {
  const worker = await getWorker();
  const {
    data: { text, confidence },
  } = await worker.recognize(imagePath);

  const extractedAmount = extractAmount(text);
  const extractedCategory = extractCategory(text);

  // TODO [Ollama-Integration / TA3.4]:
  // Pass `text`, `extractedAmount`, and `extractedCategory` to the Ollama LLM
  // for smarter categorisation and amount extraction. Example call shape:
  //
  //   const ollamaResult = await ollamaService.analyseReceipt({
  //     ocrText: text,
  //     suggestedAmount: extractedAmount,
  //     suggestedCategory: extractedCategory,
  //   });
  //
  // The next developer should implement `ollamaService` in src/services/ollama.ts
  // and refine the returned amount/category with the LLM response.

  return {
    rawText: text,
    extractedAmount,
    extractedCategory,
    confidence: confidence ?? 0,
  };
}

export async function terminateOcrWorker(): Promise<void> {
  if (workerInstance) {
    await workerInstance.terminate();
    workerInstance = null;
  }
}
