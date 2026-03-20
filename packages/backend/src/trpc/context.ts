import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.js";
import { prisma } from "../lib/prisma.js";

export async function createContext({ req, res }: CreateExpressContextOptions) {
	const session = await auth.api.getSession({
		headers: fromNodeHeaders(req.headers),
	});

	return {
		req,
		res,
		prisma,
		session,
		user: session?.user ?? null,
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
