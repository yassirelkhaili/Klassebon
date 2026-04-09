import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../trpc.js";
import { processReceipt } from "../../services/ocr.js";

export const receiptRouter = router({
  /**
   * Trigger OCR on a previously uploaded receipt image.
   * The `receiptId` is returned by the REST upload endpoint (POST /api/receipts/upload).
   */
  processOcr: protectedProcedure
    .input(z.object({ receiptId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
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

      const updated = await ctx.prisma.receipt.update({
        where: { id: receipt.id },
        data: {
          ocrText: result.rawText,
          extractedAmount: result.extractedAmount,
          extractedCategory: result.extractedCategory,
        },
      });

      return {
        id: updated.id,
        ocrText: result.rawText,
        extractedAmount: result.extractedAmount,
        extractedCategory: result.extractedCategory,
        confidence: result.confidence,
        alreadyProcessed: false,
      };
    }),

  /** List all receipts for the current user. */
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

  /** Get a single receipt by ID. */
  getById: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
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

  /** Delete a receipt. */
  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
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
