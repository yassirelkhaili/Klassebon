import "dotenv/config";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { prisma } from "./prisma.js";

if (!process.env.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET.length < 32) {
  console.warn(
    "[auth] BETTER_AUTH_SECRET must be set and at least 32 characters (openssl rand -base64 32)"
  );
}

/**
 * Better Auth instance (TA2.3) — PostgreSQL via Prisma adapter.
 * Mount with toNodeHandler(auth) on /api/auth/* before express.json.
 */
export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	emailAndPassword: {
		enabled: true,
	},
	secret: process.env.BETTER_AUTH_SECRET ?? "dev-only-secret-min-32-chars!!",
	baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
	trustedOrigins: [
		process.env.FRONTEND_ORIGIN ?? "http://localhost:5173",
		"http://localhost:3000",
	],
});
