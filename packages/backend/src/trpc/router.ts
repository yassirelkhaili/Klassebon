import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./trpc.js";
import { ausgabenRouter } from "./routers/ausgaben.js";
import { abonnementsRouter } from "./routers/abonnements.js";
import { monatskostenRouter } from "./routers/monatskosten.js";
import { spartippsRouter } from "./routers/spartipps.js";
import { dashboardRouter } from "./routers/dashboard.js";
import { receiptRouter } from "./routers/receipt.js";

export const appRouter = router({
	health: publicProcedure.query(() => ({
		ok: true as const,
		service: "backend",
		trpc: true as const,
	})),

	/** Example protected route — returns current user from Better Auth session */
	me: protectedProcedure.query(({ ctx }) => ({
		user: ctx.user,
	})),

	/** Example public route with input validation */
	hello: publicProcedure.input(z.object({ name: z.string().optional() })).query(({ input }) => ({
		greeting: `Hello, ${input.name ?? "world"}!`,
	})),

	ausgaben: ausgabenRouter,
	abonnements: abonnementsRouter,
	monatskosten: monatskostenRouter,
	spartipps: spartippsRouter,
	dashboard: dashboardRouter,
  me: protectedProcedure.query(({ ctx }) => ({
    user: ctx.user,
  })),

  hello: publicProcedure.input(z.object({ name: z.string().optional() })).query(({ input }) => ({
    greeting: `Hello, ${input.name ?? "world"}!`,
  })),

  receipt: receiptRouter,
});

export type AppRouter = typeof appRouter;
