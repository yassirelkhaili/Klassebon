import "dotenv/config";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { prisma } from "./prisma.js";

if (!process.env.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET.length < 32) {
  console.warn(
    "[auth] BETTER_AUTH_SECRET must be set and at least 32 characters (openssl rand -base64 32)",
  );
}

/**
 * Better Auth instance — PostgreSQL via Prisma adapter.
 * Password-reset flow:
 *   POST /api/auth/request-password-reset  { email, redirectTo }
 *   POST /api/auth/reset-password          { newPassword, token }
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    /**
     * TA2.6 — Called when a user requests a password reset.
     * In production, replace console.log with a real email transport
     * (e.g. nodemailer, Resend, SendGrid).
     */
    sendResetPassword: async ({ user, url, token }, _request) => {
      console.log("─── PASSWORD RESET REQUEST (TA2.6) ───");
      console.log(`  To:    ${user.email}`);
      console.log(`  URL:   ${url}`);
      console.log(`  Token: ${token}`);
      console.log("───────────────────────────────────────");
      // TODO: Replace with actual email transport in production:
      // await sendEmail({ to: user.email, subject: "Passwort zurücksetzen", html: `<a href="${url}">Passwort zurücksetzen</a>` });
    },
    resetPasswordTokenExpiresIn: 3600,
  },
  secret: process.env.BETTER_AUTH_SECRET ?? "dev-only-secret-min-32-chars!!",
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  trustedOrigins: [process.env.FRONTEND_ORIGIN ?? "http://localhost:5173", "http://localhost:3000"],
});
