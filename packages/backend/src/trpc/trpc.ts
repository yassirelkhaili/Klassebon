import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./context.js";

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

/** Require a valid session */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
	if (!ctx.session?.user) {
		throw new TRPCError({ code: "UNAUTHORIZED", message: "Not signed in" });
	}
	return next({
		ctx: {
		...ctx,
		session: ctx.session,
		user: ctx.session.user,
		},
	});
});
