import "dotenv/config";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { isSmtpConfigured, sendPasswordResetEmail } from "../services/mailService.js";
import { prisma } from "./prisma.js";

if (!process.env.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET.length < 32) {
  console.warn("[auth] BETTER_AUTH_SECRET must be set and at least 32 characters (openssl rand -base64 32)");
}

// Password reset: POST …/auth/request-password-reset, then …/auth/reset-password (Better Auth).
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url, token }, _request) => {
      if (isSmtpConfigured()) {
        try {
          await sendPasswordResetEmail({ to: user.email, url, token });
          const inbox = process.env.MAILPIT_WEB_URL?.trim() || "http://localhost:8025";
          console.log(`[auth] Password reset email sent (Mailpit UI: ${inbox})`);
          return;
        } catch (err) {
          console.warn("[auth] SMTP send failed; printing reset details below", err);
        }
      }

      console.log("[auth] Password reset request");
      console.log(`  To:    ${user.email}`);
      console.log(`  URL:   ${url}`);
      console.log(`  Token: ${token}`);
    },
    resetPasswordTokenExpiresIn: 3600,
  },
  secret: process.env.BETTER_AUTH_SECRET ?? "dev-only-secret-min-32-chars!!",
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  trustedOrigins: [
    process.env.FRONTEND_ORIGIN ?? "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1",
    "http://127.0.0.1:3000",
  ],
});
