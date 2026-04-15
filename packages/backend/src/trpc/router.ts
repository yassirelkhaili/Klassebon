import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./trpc.js";
import { ausgabenRouter } from "./routers/ausgaben.js";
import { abonnementsRouter } from "./routers/abonnements.js";
import { monatskostenRouter } from "./routers/monatskosten.js";

/**
 * Root tRPC router (TA2.1) — extend with your domain procedures.
 */
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
});

export type AppRouter = typeof appRouter;
