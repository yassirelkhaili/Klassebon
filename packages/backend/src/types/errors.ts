/**
 * @fileoverview Custom HTTP error classes with status codes for API error handling.
 */

/**
 * Base HTTP error class with status code.
 * @extends Error
 */
export class HttpError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
  }
}

/**
 * Authentication error (401) - User not logged in or invalid credentials.
 * @extends HttpError
 */
export class AuthError extends HttpError {
  constructor(message: string) {
    super(message, 401);
  }
}

/**
 * Authorization error (403) - User authenticated but lacks permissions.
 * @extends HttpError
 */
export class ForbiddenError extends HttpError {
  constructor(message: string) {
    super(message, 403);
  }
}

/**
 * Validation error (400) - Invalid or malformed client input.
 * @extends HttpError
 */
export class ValidationError extends HttpError {
  constructor(message: string) {
    super(message, 400);
  }
}

/**
 * Not found error (404) - Requested resource doesn't exist.
 * @extends HttpError
 */
export class NotFoundError extends HttpError {
  constructor(message: string) {
    super(message, 404);
  }
}

/**
 * Internal server error (500) - Unexpected server failure.
 * @extends HttpError
 */
export class InternalServerError extends HttpError {
  constructor(message: string) {
    super(message, 500);
  }
}
