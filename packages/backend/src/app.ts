import express, { type Express } from "express";
import swaggerUi from "swagger-ui-express";
import * as trpcExpress from "@trpc/server/adapters/express";
import { toNodeHandler } from "better-auth/node";
import { api_prefix } from "@klassebon/shared";
import { auth } from "./lib/auth.js";
import { buildOpenApiSpec } from "./openapi/build-spec.js";
import { Utils } from "./utils/index.js";
import { createContext } from "./trpc/context.js";
import { appRouter } from "./trpc/router.js";
import { createReceiptUploadMulter, handleReceiptUploadRequest } from "./http/receiptUpload.js";

function mountBetterAuthBeforeJson(expressApp: Express): void {
  // Must run before express.json() so Better Auth can parse its own request bodies.
  expressApp.all(`${api_prefix}/auth/*`, toNodeHandler(auth));
}

function useJsonBodyParser(expressApp: Express): void {
  expressApp.use(express.json());
}

function mountOpenApiAndDocs(expressApp: Express, openApiDocument: ReturnType<typeof buildOpenApiSpec>): void {
  expressApp.get(`${api_prefix}/openapi.json`, (_req, res) => {
    res.json(openApiDocument);
  });
  expressApp.use(`${api_prefix}/docs`, swaggerUi.serve, swaggerUi.setup(openApiDocument));
}

function mountHealthCheck(expressApp: Express): void {
  expressApp.get(`${api_prefix}/health`, Utils.returnHealthResponse);
}

function mountReceiptUploadRoute(expressApp: Express): void {
  const upload = createReceiptUploadMulter();
  expressApp.post(`${api_prefix}/receipts/upload`, upload.single("receipt"), handleReceiptUploadRequest);
}

function mountTrpc(expressApp: Express): void {
  expressApp.use(
    `${api_prefix}/trpc`,
    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext,
    }),
  );
}

// Builds the Express app without listen(); used from index and tests.
export function createApp(): Express {
  const expressInstance = express();
  const openApiDocument = buildOpenApiSpec();

  mountBetterAuthBeforeJson(expressInstance);
  useJsonBodyParser(expressInstance);
  mountOpenApiAndDocs(expressInstance, openApiDocument);
  mountHealthCheck(expressInstance);
  mountReceiptUploadRoute(expressInstance);
  mountTrpc(expressInstance);

  return expressInstance;
}
