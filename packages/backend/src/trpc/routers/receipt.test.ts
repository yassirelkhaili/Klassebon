import { describe, it, expect, vi } from "vitest";
import { TRPCError } from "@trpc/server";
import { receiptRouter } from "./receipt.js";
import { router } from "../trpc.js";

vi.mock("../../services/ocr.js", () => ({
  processReceipt: vi.fn().mockResolvedValue({
    rawText: "REWE\nMilch 1,99\nGesamt 1,99",
    confidence: 85,
  }),
}));

function makeMockPrisma() {
  return {
    receipt: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };
}

function makeCtx(overrides: { userId?: string; prisma?: ReturnType<typeof makeMockPrisma> } = {}) {
  const prisma = overrides.prisma ?? makeMockPrisma();
  return {
    prisma,
    session: { user: { id: overrides.userId ?? "user-1" } },
    user: { id: overrides.userId ?? "user-1" },
    req: {} as any,
    res: {} as any,
  };
}

const caller = (ctx: ReturnType<typeof makeCtx>) => {
  const testRouter = router({ receipt: receiptRouter });
  return testRouter.createCaller(ctx as any);
};

describe("receipt.list", () => {
  it("returns mapped receipts for current user", async () => {
    const mockPrisma = makeMockPrisma();
    const now = new Date();
    mockPrisma.receipt.findMany.mockResolvedValue([
      {
        id: "r1",
        userId: "user-1",
        imagePath: "/uploads/test.jpg",
        ocrText: "some text",
        extractedAmount: 12.5,
        extractedCategory: "LEBENSMITTEL",
        createdAt: now,
      },
    ]);

    const ctx = makeCtx({ prisma: mockPrisma });
    const result = await caller(ctx).receipt.list();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: "r1",
      imagePath: "/uploads/test.jpg",
      ocrText: "some text",
      extractedAmount: 12.5,
      extractedCategory: "LEBENSMITTEL",
      createdAt: now,
    });

    expect(mockPrisma.receipt.findMany).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      orderBy: { createdAt: "desc" },
    });
  });

  it("returns empty array when no receipts", async () => {
    const mockPrisma = makeMockPrisma();
    mockPrisma.receipt.findMany.mockResolvedValue([]);

    const ctx = makeCtx({ prisma: mockPrisma });
    const result = await caller(ctx).receipt.list();

    expect(result).toEqual([]);
  });
});

describe("receipt.getById", () => {
  it("returns receipt when owned by current user", async () => {
    const mockPrisma = makeMockPrisma();
    const now = new Date();
    mockPrisma.receipt.findUnique.mockResolvedValue({
      id: "r1",
      userId: "user-1",
      imagePath: "/uploads/test.jpg",
      ocrText: "text",
      extractedAmount: 5.0,
      extractedCategory: "FREIZEIT",
      createdAt: now,
    });

    const ctx = makeCtx({ prisma: mockPrisma });
    const result = await caller(ctx).receipt.getById({ id: "r1" });

    expect(result.id).toBe("r1");
    expect(result.extractedCategory).toBe("FREIZEIT");
  });

  it("throws NOT_FOUND for non-existent receipt", async () => {
    const mockPrisma = makeMockPrisma();
    mockPrisma.receipt.findUnique.mockResolvedValue(null);

    const ctx = makeCtx({ prisma: mockPrisma });

    await expect(caller(ctx).receipt.getById({ id: "nope" })).rejects.toThrow(TRPCError);
  });

  it("throws NOT_FOUND when receipt belongs to another user", async () => {
    const mockPrisma = makeMockPrisma();
    mockPrisma.receipt.findUnique.mockResolvedValue({
      id: "r1",
      userId: "other-user",
      imagePath: "/uploads/test.jpg",
      ocrText: null,
      extractedAmount: null,
      extractedCategory: null,
      createdAt: new Date(),
    });

    const ctx = makeCtx({ userId: "user-1", prisma: mockPrisma });

    await expect(caller(ctx).receipt.getById({ id: "r1" })).rejects.toThrow(TRPCError);
  });
});

describe("receipt.processOcr", () => {
  it("runs OCR and returns results", async () => {
    const mockPrisma = makeMockPrisma();
    mockPrisma.receipt.findUnique.mockResolvedValue({
      id: "r1",
      userId: "user-1",
      imagePath: "/uploads/test.jpg",
      ocrText: null,
      extractedAmount: null,
      extractedCategory: null,
      createdAt: new Date(),
    });
    mockPrisma.receipt.update.mockResolvedValue({
      id: "r1",
      ocrText: "REWE\nMilch 1,99\nGesamt 1,99",
      extractedAmount: null,
      extractedCategory: null,
    });

    const ctx = makeCtx({ prisma: mockPrisma });
    const result = await caller(ctx).receipt.processOcr({ receiptId: "r1" });

    expect(result.alreadyProcessed).toBe(false);
    expect(result.extractedAmount).toBeNull();
    expect(result.extractedCategory).toBeNull();
    expect(result.ocrText).toContain("REWE");
  });

  it("returns cached result if already processed", async () => {
    const mockPrisma = makeMockPrisma();
    mockPrisma.receipt.findUnique.mockResolvedValue({
      id: "r1",
      userId: "user-1",
      imagePath: "/uploads/test.jpg",
      ocrText: "cached text",
      extractedAmount: 9.99,
      extractedCategory: "STREAMING",
      createdAt: new Date(),
    });

    const ctx = makeCtx({ prisma: mockPrisma });
    const result = await caller(ctx).receipt.processOcr({ receiptId: "r1" });

    expect(result.alreadyProcessed).toBe(true);
    expect(result.ocrText).toBe("cached text");
    expect(mockPrisma.receipt.update).not.toHaveBeenCalled();
  });

  it("throws NOT_FOUND for missing receipt", async () => {
    const mockPrisma = makeMockPrisma();
    mockPrisma.receipt.findUnique.mockResolvedValue(null);

    const ctx = makeCtx({ prisma: mockPrisma });

    await expect(caller(ctx).receipt.processOcr({ receiptId: "nope" })).rejects.toThrow(TRPCError);
  });
});

describe("receipt.delete", () => {
  it("deletes receipt owned by current user", async () => {
    const mockPrisma = makeMockPrisma();
    mockPrisma.receipt.findUnique.mockResolvedValue({
      id: "r1",
      userId: "user-1",
      imagePath: "/uploads/test.jpg",
    });
    mockPrisma.receipt.delete.mockResolvedValue({});

    const ctx = makeCtx({ prisma: mockPrisma });
    const result = await caller(ctx).receipt.delete({ id: "r1" });

    expect(result).toEqual({ success: true });
    expect(mockPrisma.receipt.delete).toHaveBeenCalledWith({ where: { id: "r1" } });
  });

  it("throws NOT_FOUND when deleting another user's receipt", async () => {
    const mockPrisma = makeMockPrisma();
    mockPrisma.receipt.findUnique.mockResolvedValue({
      id: "r1",
      userId: "other-user",
      imagePath: "/uploads/test.jpg",
    });

    const ctx = makeCtx({ userId: "user-1", prisma: mockPrisma });

    await expect(caller(ctx).receipt.delete({ id: "r1" })).rejects.toThrow(TRPCError);
    expect(mockPrisma.receipt.delete).not.toHaveBeenCalled();
  });
});
