import "dotenv/config";
import * as trpcExpress from "@trpc/server/adapters/express";
import express from "express";
import { toNodeHandler } from "better-auth/node";
import type { HealthResponse } from "@klassebon/shared";
import { API_PREFIX } from "@klassebon/shared";
import { auth } from "./lib/auth.js";
import { createContext } from "./trpc/context.js";
import { appRouter } from "./trpc/router.js";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// TA2.3 Better Auth — must be before express.json (body parsed by handler)
app.all(`${API_PREFIX}/auth/*`, toNodeHandler(auth));

app.use(express.json());

// REST health (existing)
app.get(`${API_PREFIX}/health`, (_req, res) => {
  const body: HealthResponse = { ok: true, service: "backend" };
  res.json(body);
});

// TA2.1 tRPC on /api/trpc
app.use(
  `${API_PREFIX}/trpc`,
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
  console.log(`  Better Auth: http://localhost:${PORT}${API_PREFIX}/auth`);
  console.log(`  tRPC:        http://localhost:${PORT}${API_PREFIX}/trpc`);
});
