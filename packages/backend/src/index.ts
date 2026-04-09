/**
 * @fileoverview Express application entry point. Configures middleware,
 *               authentication, tRPC router, and receipt upload endpoints.
 * @module backend
 * @requires express
 * @requires better-auth
 * @requires @trpc/server
 * @author Yassir Elkhaili
 * @see {@link https://trpc.io|tRPC Documentation}
 * @see {@link https://better-auth.com/docs/integrations/express|Better Auth Express Integration}
 */

// Initializes environment variables - Must be first
import "dotenv/config";

import express from "express";
import multer from "multer";
import * as trpcExpress from "@trpc/server/adapters/express";

import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";

import { api_prefix } from "@klassebon/shared";

import { Utils } from "./utils/index.js";
import { createContext } from "./trpc/context.js";
import { appRouter } from "./trpc/router.js";

const express_instance = express();
const api_port = Number(process.env.PORT) || 3000;
const isDev = process.env.NODE_ENV !== "production";

/**
 * Multer middleware for receipt image uploads.
 * Parses multipart/form-data, saves files to the uploads directory with
 * a unique filename, enforces a 10 MB size limit, and rejects non-image files.
 * Note: Express does not parse multipart/form-data out of the box.
 */
const upload = multer({
  storage: multer.diskStorage({
    destination: Utils.getUploadsDirectory(),
    filename: Utils.generateUniqueReceiptName,
  }),
  fileFilter: Utils.rejectNonImageFiles,
  limits: {
    fileSize: Utils.maxReceiptSize,
  },
});

// Mounts the Better Auth library on every route under /api/auth/*.
express_instance.all(`${api_prefix}/auth/*`, toNodeHandler(auth));

// Enables parsing of application/json request bodies for all subsequent routes.
express_instance.use(express.json());

// Returns the health status of the Backend under /health
express_instance.get(`${api_prefix}/health`, Utils.returnHealthResponse);

// Handles receipt image upload (REST since tRPC does not support multipart)
express_instance.post(`${api_prefix}/receipts/upload`, upload.single("receipt"), Utils.handleReceiptUpload);

// Handles all /api/trpc/* requests
express_instance.use(
  `${api_prefix}/trpc`,
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

express_instance
  .listen(api_port, () => {
    if (isDev) {
      console.log(`Backend listening on http://localhost:${api_port}`);
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
  });
