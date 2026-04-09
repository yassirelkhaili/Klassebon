import { describe, it, expect } from "vitest";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, protectedProcedure } from "./trpc.js";

const testRouter = router({
  publicRoute: publicProcedure.query(() => "public ok"),
  protectedRoute: protectedProcedure.query(({ ctx }) => ({
    userId: ctx.user.id,
  })),
});

function makeAuthedCtx(userId = "user-1") {
  return {
    session: { user: { id: userId } },
    user: { id: userId },
    prisma: {} as any,
    req: {} as any,
    res: {} as any,
  };
}

function makeUnauthCtx() {
  return {
    session: null,
    user: null,
    prisma: {} as any,
    req: {} as any,
    res: {} as any,
  };
}

// ─── publicProcedure ─────────────────────────────────────

describe("publicProcedure", () => {
  it("works without a session", async () => {
    const caller = testRouter.createCaller(makeUnauthCtx() as any);
    const result = await caller.publicRoute();
    expect(result).toBe("public ok");
  });

  it("works with a session", async () => {
    const caller = testRouter.createCaller(makeAuthedCtx() as any);
    const result = await caller.publicRoute();
    expect(result).toBe("public ok");
  });
});

// ─── protectedProcedure (TA2.4) ──────────────────────────

describe("protectedProcedure (TA2.4)", () => {
  it("allows authenticated users", async () => {
    const caller = testRouter.createCaller(makeAuthedCtx("abc-123") as any);
    const result = await caller.protectedRoute();
    expect(result).toEqual({ userId: "abc-123" });
  });

  it("throws UNAUTHORIZED when session is null", async () => {
    const caller = testRouter.createCaller(makeUnauthCtx() as any);

    await expect(caller.protectedRoute()).rejects.toThrow(TRPCError);
    await expect(caller.protectedRoute()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("throws UNAUTHORIZED when session has no user", async () => {
    const ctx = {
      session: { user: null },
      user: null,
      prisma: {} as any,
      req: {} as any,
      res: {} as any,
    };
    const caller = testRouter.createCaller(ctx as any);

    await expect(caller.protectedRoute()).rejects.toThrow(TRPCError);
  });
});
