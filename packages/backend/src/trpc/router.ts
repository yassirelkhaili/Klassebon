import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./trpc.js";
import { receiptRouter } from "./routers/receipt.js";
import { ausgabenRouter } from "./routers/ausgaben.js";
import { abonnementsRouter } from "./routers/abonnements.js";
import { monatskostenRouter } from "./routers/monatskosten.js";
import { spartippsRouter } from "./routers/spartipps.js";
import { dashboardRouter } from "./routers/dashboard.js";

export const appRouter = router({
  health: publicProcedure.query(() => ({
    ok: true as const,
    service: "backend",
    trpc: true as const,
  })),

  me: protectedProcedure.query(({ ctx }) => ({
    user: ctx.user,
  })),

  hello: publicProcedure
    .input(z.object({ name: z.string().optional() }))
    .query(({ input }) => ({
      greeting: `Hello, ${input.name ?? "world"}!`,
    })),

  receipt: receiptRouter,
  ausgaben: ausgabenRouter,
  abonnements: abonnementsRouter,
  monatskosten: monatskostenRouter,
  spartipps: spartippsRouter,
  dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;
