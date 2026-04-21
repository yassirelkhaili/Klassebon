/**
 * @fileoverview Shared constants, schemas, and utilities for frontend + backend.
 * Add Zod schemas here when wiring Better Auth and API contracts.
 */

export const api_prefix = "/api";

/** GET /api/health JSON body (matches backend `HealthResponse`). */
export interface HealthResponse {
  ok: boolean;
  service: string;
}
