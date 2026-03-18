# Backend — TA2.1 / TA2.2 / TA2.3

## TA2.1 — Node.js & Express mit tRPC

- **tRPC** ist unter **`/api/trpc`** gemountet (`createExpressMiddleware`).
- Router: `src/trpc/router.ts` — `health`, `hello`, `me` (geschützt).
- **AppRouter-Typ** exportieren für den Frontend-Client:

  ```ts
  import type { AppRouter } from "backend/src/trpc/router"; // ggf. Pfad anpassen
  ```

## TA2.2 — PostgreSQL & Prisma

1. `.env` anlegen (siehe `.env.example`), `DATABASE_URL` setzen.
2. Tabellen anlegen:

   ```bash
   npm run db:migrate --workspace=backend
   # oder ohne Migrations-Historie:
   npm run db:push --workspace=backend
   ```

3. **Prisma 7**: Client nutzt `@prisma/adapter-pg` + `pg` (siehe `src/lib/prisma.ts`).
4. **Prisma Studio**: `npm run db:studio --workspace=backend`

## TA2.3 — Better Auth

- **Handler**: `toNodeHandler(auth)` auf **`/api/auth/*`** (vor `express.json`).
- **Konfiguration**: `src/lib/auth.ts` — E-Mail/Passwort aktiviert, Prisma-Adapter PostgreSQL.
- **Env**: `BETTER_AUTH_SECRET` (≥32 Zeichen), `BETTER_AUTH_URL`, optional `FRONTEND_ORIGIN`.
- **Client** (Frontend): `createAuthClient({ baseURL: "http://localhost:3000" })` aus `better-auth/client`.

### Erste Migration / DB

```bash
cd packages/backend
cp .env.example .env
# DATABASE_URL + BETTER_AUTH_SECRET eintragen
npm run db:push
npm run dev
```

- Auth-Endpoints: `http://localhost:3000/api/auth/...`
- tRPC: z. B. `GET .../api/trpc/health`
