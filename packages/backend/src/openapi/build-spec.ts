import { api_prefix } from "@klassebon/shared";

/**
 * OpenAPI 3.0 document for the REST and Better Auth routes (with a tRPC reference).
 * Served at GET /api/openapi.json and browsable at /api/docs.
 *
 * Auth: send the Better Auth session cookie set by /api/auth/sign-in/email
 * (Swagger UI keeps the cookie automatically once you sign in from the docs).
 * Errors share one shape: { error: string }.
 */
export function buildOpenApiSpec(): Record<string, unknown> {
  const port = Number(process.env.PORT) || 3000;
  const defaultServer = `http://localhost:${port}`;
  const serverUrl = (process.env.BETTER_AUTH_URL ?? defaultServer).replace(/\/$/, "");

  return {
    openapi: "3.0.3",
    info: {
      title: "KlasseBon API",
      version: "0.0.1",
      description: [
        "Backend for KlasseBon: Express + Better Auth + tRPC.",
        "",
        "### Authentication",
        "Sign in via POST /api/auth/sign-in/email. The server sets a session cookie",
        "(`better-auth.session_token` by default). Send it back on later requests.",
        "",
        "### Typical workflow",
        "1. Sign up (`/api/auth/sign-up/email`) or sign in (`/api/auth/sign-in/email`).",
        "2. Upload a receipt (`POST /api/receipts/upload`, multipart) and read `{ id, imagePath }`.",
        "3. Run OCR via tRPC (`receipt.processOcr` mutation with `{ receiptId }`).",
        "4. List / fetch / delete receipts via tRPC (`receipt.list`, `receipt.getById`, `receipt.delete`).",
        "",
        "### tRPC reference",
        `Base path: \`${api_prefix}/trpc\`. See the [tRPC HTTP protocol](https://trpc.io/docs/v11/client/links/httpBatchLink).`,
        "Protected procedures need the Better Auth session cookie.",
        "",
        "| Procedure | Type | Auth | Input | Returns |",
        "|-----------|------|------|-------|---------|",
        "| `health` | query | public | - | `{ ok, service, trpc }` |",
        "| `hello` | query | public | `{ name?: string }` | `{ greeting: string }` |",
        "| `me` | query | session | - | `{ user }` |",
        "| `receipt.list` | query | session | - | `Receipt[]` (current user) |",
        "| `receipt.getById` | query | session | `{ id: string }` | `Receipt` |",
        "| `receipt.processOcr` | mutation | session | `{ receiptId: string }` | OCR result + persisted fields |",
        "| `receipt.delete` | mutation | session | `{ id: string }` | `{ success: true }` |",
      ].join("\n"),
    },
    servers: [
      {
        url: serverUrl,
        description: "Resolved from BETTER_AUTH_URL or PORT (defaults to http://localhost:3000).",
      },
    ],
    tags: [
      { name: "Health", description: "Liveness / readiness probes." },
      { name: "Receipts", description: "REST multipart upload for receipt images. OCR runs via tRPC." },
      { name: "Auth", description: "Better Auth: email/password sign-in, session, password reset." },
    ],
    components: {
      securitySchemes: {
        sessionCookie: {
          type: "apiKey",
          in: "cookie",
          name: "better-auth.session_token",
          description:
            "Session cookie set by POST /api/auth/sign-in/email or /api/auth/sign-up/email. " +
            "The exact cookie name can vary per environment; check the Set-Cookie response on sign-in.",
        },
      },
      schemas: {
        HealthResponse: {
          type: "object",
          required: ["ok", "service"],
          description: "Returned by GET /api/health.",
          properties: {
            ok: { type: "boolean", description: "Always true while the process is running.", example: true },
            service: { type: "string", description: "Service identifier.", example: "Backend" },
          },
        },
        ReceiptUploadResponse: {
          type: "object",
          required: ["id", "imagePath", "message"],
          description: "Returned by a successful upload. Use `id` as `receiptId` for `receipt.processOcr`.",
          properties: {
            id: {
              type: "string",
              description: "Database ID (CUID) of the new Receipt row.",
              example: "ckxyz1234abcd",
            },
            imagePath: {
              type: "string",
              description: "Server-side absolute path of the stored image.",
              example: "C:/.../packages/backend/src/uploads/1737318400000-12345.png",
            },
            message: {
              type: "string",
              example: "Receipt uploaded. Call receipt.processOcr via tRPC to run OCR.",
            },
          },
        },
        ErrorBody: {
          type: "object",
          required: ["error"],
          description: "Standard error envelope returned by REST handlers.",
          properties: {
            error: {
              type: "string",
              example: "User not authenticated",
            },
          },
        },
        SignInEmailRequest: {
          type: "object",
          required: ["email", "password"],
          description: "Body for POST /api/auth/sign-in/email. Send as application/json.",
          properties: {
            email: {
              type: "string",
              format: "email",
              minLength: 3,
              maxLength: 254,
              description: "Email of an existing account. Case-insensitive.",
              example: "user@example.com",
            },
            password: {
              type: "string",
              format: "password",
              minLength: 8,
              description: "The account password. Must match the one set at sign-up or via reset.",
              example: "Sup3rSecret!",
            },
            rememberMe: {
              type: "boolean",
              description:
                "If true, Better Auth issues a long-lived persistent cookie that survives browser restart. " +
                "Defaults to false.",
              default: false,
              example: true,
            },
          },
        },
        SignUpEmailRequest: {
          type: "object",
          required: ["email", "password", "name"],
          description: "Body for POST /api/auth/sign-up/email. Creates a new user and usually signs them in.",
          properties: {
            email: {
              type: "string",
              format: "email",
              minLength: 3,
              maxLength: 254,
              description:
                "Email for the new account. Must be unique (the call fails with 422 otherwise). " +
                "Used as the login identifier and as the recipient for password-reset emails.",
              example: "user@example.com",
            },
            password: {
              type: "string",
              format: "password",
              minLength: 8,
              description: "At least 8 characters. Stored hashed by Better Auth.",
              example: "Sup3rSecret!",
            },
            name: {
              type: "string",
              minLength: 1,
              maxLength: 120,
              description: "Display name shown in the UI. Does not need to be unique.",
              example: "Yassir Elkhaili",
            },
            image: {
              type: "string",
              format: "uri",
              description: "Optional public avatar URL (https://...). Omit to leave the avatar empty.",
              example: "https://example.com/avatar.png",
            },
          },
        },
        RequestPasswordResetRequest: {
          type: "object",
          required: ["email"],
          description: "Body for POST /api/auth/request-password-reset.",
          properties: {
            email: {
              type: "string",
              format: "email",
              description:
                "Email of the account that wants to reset its password. " +
                "The endpoint always responds 200 (even for unknown emails) to prevent account enumeration. " +
                "In dev, check Mailpit at http://localhost:8025 or the backend logs for the reset link.",
              example: "user@example.com",
            },
            redirectTo: {
              type: "string",
              format: "uri",
              description:
                "Frontend URL the user should land on to enter a new password. " +
                "Better Auth appends `?token=<reset-token>` when building the email link. " +
                "Typically your frontend's /reset-password page.",
              example: "http://localhost:5173/reset-password",
            },
          },
        },
        ResetPasswordRequest: {
          type: "object",
          required: ["newPassword", "token"],
          description: "Body for POST /api/auth/reset-password. Completes the flow started by request-password-reset.",
          properties: {
            newPassword: {
              type: "string",
              format: "password",
              minLength: 8,
              description: "The new password (min 8 chars). Replaces any existing password on success.",
              example: "EvenStr0nger!",
            },
            token: {
              type: "string",
              description:
                "Single-use token from the reset email/URL (`?token=...`). " +
                "Expires 1 hour after issuance (`resetPasswordTokenExpiresIn` in `lib/auth.ts`). " +
                "Returns 400 if invalid or expired.",
              example: "f8c3bd1e-7a1f-4f0c-9e0a-1234567890ab",
            },
          },
        },
        SessionResponse: {
          type: "object",
          description: "Better Auth session payload. Empty/null when not signed in.",
          properties: {
            session: {
              type: "object",
              properties: {
                id: { type: "string" },
                userId: { type: "string" },
                expiresAt: { type: "string", format: "date-time" },
              },
            },
            user: {
              type: "object",
              properties: {
                id: { type: "string" },
                email: { type: "string", format: "email" },
                name: { type: "string" },
                emailVerified: { type: "boolean" },
                image: { type: "string", format: "uri", nullable: true },
              },
            },
          },
        },
      },
    },
    paths: {
      [`${api_prefix}/health`]: {
        get: {
          tags: ["Health"],
          summary: "Liveness probe",
          description:
            "Returns a small JSON payload as soon as the HTTP server accepts connections. " +
            "Use it for container/orchestrator health checks. No auth required.",
          operationId: "getHealth",
          responses: {
            "200": {
              description: "Service is up.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/HealthResponse" },
                  example: { ok: true, service: "Backend" },
                },
              },
            },
          },
        },
      },
      [`${api_prefix}/receipts/upload`]: {
        post: {
          tags: ["Receipts"],
          summary: "Upload a receipt image (multipart)",
          description: [
            "Stores a receipt image on disk and creates a Receipt row owned by the current user.",
            "",
            "Auth: required (Better Auth session cookie). Unauthenticated requests get 401.",
            "",
            "Form field: `receipt` - a single file part. Max 10 MB.",
            "Accepted MIME types: image/jpeg, image/png, image/gif, image/webp, image/bmp, image/tiff.",
            "",
            "Next step: call the tRPC mutation `receipt.processOcr` with the returned `id` to run OCR.",
          ].join("\n"),
          operationId: "uploadReceipt",
          security: [{ sessionCookie: [] }],
          requestBody: {
            required: true,
            description:
              "Single-part multipart form. Must contain exactly one file part named `receipt`. " +
              "No JSON body or extra fields are read by the handler.",
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  required: ["receipt"],
                  properties: {
                    receipt: {
                      type: "string",
                      format: "binary",
                      description:
                        "The receipt image file. The field name must be exactly `receipt` " +
                        '(multer is configured with `upload.single("receipt")`). ' +
                        "Max size 10 MB (`Utils.maxReceiptSize`). " +
                        "Allowed MIME types: image/jpeg, image/png, image/gif, image/webp, image/bmp, image/tiff. " +
                        "The original filename is replaced server-side with `<timestamp>-<random><ext>` to avoid collisions.",
                    },
                  },
                },
                encoding: {
                  receipt: {
                    contentType: "image/jpeg, image/png, image/gif, image/webp, image/bmp, image/tiff",
                  },
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Receipt stored. Use `id` with tRPC `receipt.processOcr`.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ReceiptUploadResponse" },
                  example: {
                    id: "ckxyz1234abcd",
                    imagePath: "/.../packages/backend/src/uploads/1737318400000-12345.png",
                    message: "Receipt uploaded. Call receipt.processOcr via tRPC to run OCR.",
                  },
                },
              },
            },
            "400": {
              description: "Validation error: no file part named `receipt`, or the file failed validation.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorBody" },
                  example: { error: "No file uploaded" },
                },
              },
            },
            "401": {
              description: "No active session cookie or the session is invalid/expired.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorBody" },
                  example: { error: "User not authenticated" },
                },
              },
            },
            "500": {
              description: "Unexpected server error (e.g. DB write failed).",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorBody" },
                  example: { error: "Failed to create receipt: ..." },
                },
              },
            },
          },
        },
      },
      [`${api_prefix}/auth/sign-in/email`]: {
        post: {
          tags: ["Auth"],
          summary: "Sign in with email + password",
          description:
            "Authenticates an existing account and sets the Better Auth session cookie via Set-Cookie. " +
            "Send that cookie back on later requests (Swagger UI does this automatically).",
          operationId: "signInEmail",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SignInEmailRequest" },
                example: { email: "user@example.com", password: "Sup3rSecret!", rememberMe: true },
              },
            },
          },
          responses: {
            "200": {
              description: "Session established. Response sets a `better-auth.session_token` cookie.",
              headers: {
                "Set-Cookie": {
                  description: "Session cookie. Send back on later requests.",
                  schema: { type: "string", example: "better-auth.session_token=...; Path=/; HttpOnly" },
                },
              },
            },
            "401": {
              description: "Invalid email/password combination.",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorBody" } } },
            },
          },
        },
      },
      [`${api_prefix}/auth/sign-up/email`]: {
        post: {
          tags: ["Auth"],
          summary: "Create a new email + password account",
          description:
            "Creates a user with the given email + password. Better Auth typically also issues a session cookie " +
            "(see Set-Cookie), so the new user is signed in immediately.",
          operationId: "signUpEmail",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SignUpEmailRequest" },
                example: {
                  email: "user@example.com",
                  password: "Sup3rSecret!",
                  name: "Yassir Elkhaili"
                  //image: "https://example.com/avatar.png",
                },
              },
            },
          },
          responses: {
            "200": { description: "Account created (and usually signed in via Set-Cookie)." },
            "422": {
              description: "Validation error: email already used, password too weak, missing required field, etc.",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorBody" } } },
            },
          },
        },
      },
      [`${api_prefix}/auth/sign-out`]: {
        post: {
          tags: ["Auth"],
          summary: "Sign out the current session",
          description: "Invalidates the session for the supplied cookie and clears it via Set-Cookie.",
          operationId: "signOut",
          security: [{ sessionCookie: [] }],
          responses: {
            "200": { description: "Session cleared. The cookie is unset on the response." },
          },
        },
      },
      [`${api_prefix}/auth/session`]: {
        get: {
          tags: ["Auth"],
          summary: "Get the current session",
          description:
            "Returns the active session and user for the cookie holder. " +
            "Returns an empty body / null when there is no valid session, instead of 401.",
          operationId: "getSession",
          security: [{ sessionCookie: [] }],
          responses: {
            "200": {
              description: "Session payload (or empty when not signed in).",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/SessionResponse" },
                  example: {
                    session: { id: "sess_123", userId: "usr_123", expiresAt: "2026-04-26T22:00:00Z" },
                    user: {
                      id: "usr_123",
                      email: "user@example.com",
                      name: "Yassir",
                      emailVerified: false,
                      image: null,
                    },
                  },
                },
              },
            },
          },
        },
      },
      [`${api_prefix}/auth/request-password-reset`]: {
        post: {
          tags: ["Auth"],
          summary: "Request a password-reset email",
          description: [
            "Generates a single-use reset token and either emails it (when SMTP is configured, e.g. Mailpit)",
            "or logs the URL/token to the backend stdout.",
            "",
            "Always returns 200, even for unknown emails, to prevent account enumeration.",
            "",
            "In dev with `docker compose up`, Mailpit is at http://localhost:8025.",
          ].join("\n"),
          operationId: "requestPasswordReset",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RequestPasswordResetRequest" },
                example: {
                  email: "user@example.com",
                  redirectTo: "http://localhost:5173/reset-password",
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Always returned. If the account exists, a reset link is sent or printed to logs.",
            },
          },
        },
      },
      [`${api_prefix}/auth/reset-password`]: {
        post: {
          tags: ["Auth"],
          summary: "Complete a password reset",
          description:
            "Consumes the single-use token from the reset email/URL and updates the account password. " +
            "Tokens expire after 1 hour by default (`resetPasswordTokenExpiresIn` in `lib/auth.ts`).",
          operationId: "resetPassword",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ResetPasswordRequest" },
                example: { newPassword: "EvenStr0nger!", token: "f8c3bd1e-..." },
              },
            },
          },
          responses: {
            "200": { description: "Password updated. The user can sign in with the new password." },
            "400": {
              description: "Token is invalid, already used, or expired.",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorBody" } } },
            },
          },
        },
      },
    },
  };
}
