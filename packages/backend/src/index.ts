import "dotenv/config";
import express from "express";
import { toNodeHandler } from "better-auth/node";
import { api_prefix } from "@klassebon/shared";
import type { HealthResponse } from "@klassebon/shared";
import * as trpcExpress from "@trpc/server/adapters/express";

import { createApp } from "./app.js";
import { auth } from "./lib/auth.js";
import { appRouter } from "./trpc/router.js";
import { createContext } from "./trpc/context.js";

const isDev = process.env.NODE_ENV !== "production";
const api_port = Number(process.env.PORT) || 3000;

// TA2.3 Better Auth — must be before express.json (body parsed by handler)
/*createApp()
  .listen(api_port, () => {
    if (isDev) {
      console.log(`Backend listening on http://localhost:${api_port}`);
      console.log(`  OpenAPI:  ${api_prefix}/openapi.json`);
      console.log(`  Swagger:  ${api_prefix}/docs`);
      console.log(`  Auth:     ${api_prefix}/auth`);
      console.log(`  tRPC:     ${api_prefix}/trpc`);
      console.log(`  Receipts: ${api_prefix}/receipts/upload`);
    } else {
      console.log(`Server started on port ${api_port}`);
    }
  })
  .on("error", (err) => {
    console.error("Server failed to start:", err.message);
    process.exit(1);
  });*/
const app = createApp();

app.all(`${api_prefix}/auth/*`, toNodeHandler(auth));

app.use(express.json());

// REST health (existing)
app.get(`${api_prefix}/health`, (_req, res) => {
  const body: HealthResponse = { ok: true, service: "backend" };
  res.json(body);
});

// TA2.1 tRPC on /api/trpc
app.use(
  `${api_prefix}/trpc`,
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);
app.listen(api_port, () => {
  if (isDev) {
    console.log(`Backend listening on http://localhost:${api_port}`);
    console.log(`  OpenAPI:  ${api_prefix}/openapi.json`);
    console.log(`  Swagger:  ${api_prefix}/docs`);
    console.log(`  Auth:     ${api_prefix}/auth`);
    console.log(`  tRPC:     ${api_prefix}/trpc`);
    console.log(`  Receipts: ${api_prefix}/receipts/upload`);
  } else {
    console.log(`Server started on port ${api_port}`);
  }
}).on("error", (err) => {
  console.error("Server failed to start:", err.message);
  process.exit(1);
});/*

app.listen(PORT, () => {
	console.log(`Backend listening on http://localhost:${PORT}`);
	console.log(`  Better Auth: http://localhost:${PORT}${API_PREFIX}/auth`);
	console.log(`  tRPC:        http://localhost:${PORT}${API_PREFIX}/trpc`);
});*/

