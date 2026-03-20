/**
 * Shared types, constants, and validation shapes for frontend + backend.
 * Add zod schemas here when you wire Better Auth / API contracts.
 */

export const API_PREFIX = "/api";

export interface HealthResponse {
  	ok: boolean;
  	service: string;
}

/** Example shared DTO – extend as your app grows */
export interface UserPreview {
  	id: string;
  	email: string;
}
