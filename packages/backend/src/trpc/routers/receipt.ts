import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../trpc.js";
import { processReceipt } from "../../services/ocr.js";
import type { Category } from "../../generated/prisma/client.js";

function normalizeOcrNumber(value: string): number | null {
  const compact = value.replace(/\s/g, "");
  const lastComma = compact.lastIndexOf(",");
  const lastDot = compact.lastIndexOf(".");
  const decimalSeparator = lastComma > lastDot ? "," : ".";
  const normalized =
    decimalSeparator === "," ? compact.replace(/\./g, "").replace(",", ".") : compact.replace(/,/g, "");
  const amount = Number(normalized);

  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

function extractAmountFromText(rawText: string): number | null {
  const amountPattern = /\b\d{1,4}(?:[.,]\d{3})*[.,]\d{2}\b|\b\d+[.,]\d{2}\b/g;
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const totalKeywords = /(gesamt|summe|total|betrag|zu zahlen|kartenzahlung|eur|euro)/i;

  const candidates = lines.flatMap((line, lineIndex) =>
    [...line.matchAll(amountPattern)]
      .map((match) => normalizeOcrNumber(match[0]))
      .filter((amount): amount is number => amount !== null)
      .map((amount) => ({
        amount,
        score: (totalKeywords.test(line) ? 100 : 0) + lineIndex,
      })),
  );

  if (candidates.length === 0) return null;

  return candidates.sort((a, b) => b.score - a.score || b.amount - a.amount)[0].amount;
}

function extractCategoryFromText(rawText: string): Category {
  const text = rawText.toLowerCase();
  const rules: Array<{ category: Category; keywords: string[] }> = [
    {
      category: "LEBENSMITTEL",
      keywords: ["rewe", "edeka", "aldi", "lidl", "penny", "netto", "kaufland", "supermarkt", "markt"],
    },
    { category: "TRANSPORT", keywords: ["bahn", "db", "bvg", "ticket", "tank", "shell", "aral", "esso"] },
    { category: "STREAMING", keywords: ["netflix", "spotify", "prime", "disney", "youtube"] },
    { category: "GESUNDHEIT", keywords: ["apotheke", "arzt", "dm", "rossmann"] },
    { category: "FREIZEIT", keywords: ["kino", "cinema", "restaurant", "cafe", "bar"] },
  ];

  return rules.find((rule) => rule.keywords.some((keyword) => text.includes(keyword)))?.category ?? "SONSTIGES";
}

export const receiptRouter = router({
  /**
   * Andrej: raw OCR text for your pipeline is `processReceipt(...).rawText` (see `services/ocr.ts`)
   * and the same string is stored on the receipt as `ocrText` after this mutation runs. The tRPC
   * return value also exposes it as `ocrText` for convenience.
   */
  processOcr: protectedProcedure.input(z.object({ receiptId: z.string().min(1) })).mutation(async ({ ctx, input }) => {
    const receipt = await ctx.prisma.receipt.findUnique({
      where: { id: input.receiptId },
    });

    if (!receipt || receipt.userId !== ctx.user.id) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Receipt not found" });
    }

    if (receipt.ocrText) {
      return {
        id: receipt.id,
        ocrText: receipt.ocrText,
        extractedAmount: receipt.extractedAmount ? Number(receipt.extractedAmount) : null,
        extractedCategory: receipt.extractedCategory,
        alreadyProcessed: true,
      };
    }

    const result = await processReceipt(receipt.imagePath);

    const extractedAmount = extractAmountFromText(result.rawText);
    const extractedCategory = extractCategoryFromText(result.rawText);

    const updated = await ctx.prisma.receipt.update({
      where: { id: receipt.id },
      data: {
        ocrText: result.rawText,
        extractedAmount,
        extractedCategory,
      },
    });

    return {
      id: updated.id,
      ocrText: result.rawText,
      extractedAmount,
      extractedCategory,
      confidence: result.confidence,
      alreadyProcessed: false,
    };
  }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const receipts = await ctx.prisma.receipt.findMany({
      where: { userId: ctx.user.id },
      orderBy: { createdAt: "desc" },
    });

    return receipts.map((r) => ({
      id: r.id,
      imagePath: r.imagePath,
      ocrText: r.ocrText,
      extractedAmount: r.extractedAmount ? Number(r.extractedAmount) : null,
      extractedCategory: r.extractedCategory,
      createdAt: r.createdAt,
    }));
  }),

  getById: protectedProcedure.input(z.object({ id: z.string().min(1) })).query(async ({ ctx, input }) => {
    const receipt = await ctx.prisma.receipt.findUnique({
      where: { id: input.id },
    });

    if (!receipt || receipt.userId !== ctx.user.id) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Receipt not found" });
    }

    return {
      id: receipt.id,
      imagePath: receipt.imagePath,
      ocrText: receipt.ocrText,
      extractedAmount: receipt.extractedAmount ? Number(receipt.extractedAmount) : null,
      extractedCategory: receipt.extractedCategory,
      createdAt: receipt.createdAt,
    };
  }),

  delete: protectedProcedure.input(z.object({ id: z.string().min(1) })).mutation(async ({ ctx, input }) => {
    const receipt = await ctx.prisma.receipt.findUnique({
      where: { id: input.id },
    });

    if (!receipt || receipt.userId !== ctx.user.id) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Receipt not found" });
    }

    await ctx.prisma.receipt.delete({ where: { id: receipt.id } });
    return { success: true };
  }),
});
