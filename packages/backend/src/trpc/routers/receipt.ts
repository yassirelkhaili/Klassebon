import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../trpc.js";
import { processReceipt } from "../../services/ocr.js";
import type { Category } from "../../generated/prisma/client.js";

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

    const extractedAmount: number | null = null;
    const extractedCategory: Category | null = null;

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
