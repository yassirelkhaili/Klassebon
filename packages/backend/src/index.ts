import "dotenv/config";
import { api_prefix } from "@klassebon/shared";
import { createApp } from "./app.js";

const isDev = process.env.NODE_ENV !== "production";
const api_port = Number(process.env.PORT) || 3000;

createApp()
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
  });
