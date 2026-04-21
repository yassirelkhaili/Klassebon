import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./trpc.js";
import { receiptRouter } from "./routers/receipt.js";

export const appRouter = router({
  health: publicProcedure.query(() => ({
    ok: true as const,
    service: "backend",
    trpc: true as const,
  })),

  me: protectedProcedure.query(({ ctx }) => ({
    user: ctx.user,
  })),

  hello: publicProcedure.input(z.object({ name: z.string().optional() })).query(({ input }) => ({
    greeting: `Hello, ${input.name ?? "world"}!`,
  })),

  receipt: receiptRouter,
});

export type AppRouter = typeof appRouter;
