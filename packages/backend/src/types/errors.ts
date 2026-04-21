export class HttpError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
  }
}

// 401: not authenticated.
export class AuthError extends HttpError {
  constructor(message: string) {
    super(message, 401);
  }
}

// 403: authenticated but not authorised.
export class ForbiddenError extends HttpError {
  constructor(message: string) {
    super(message, 403);
  }
}

// 400: invalid client input.
export class ValidationError extends HttpError {
  constructor(message: string) {
    super(message, 400);
  }
}

// 404: resource not found.
export class NotFoundError extends HttpError {
  constructor(message: string) {
    super(message, 404);
  }
}

// 500: unexpected server error.
export class InternalServerError extends HttpError {
  constructor(message: string) {
    super(message, 500);
  }
}
