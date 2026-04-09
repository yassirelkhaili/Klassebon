# KlasseBon

Webbasierte Ausgabenverwaltung mit OCR & KI-Spartipps — React/TypeScript, tRPC/Express.js, Better-Auth, Tesseract, Ollama, Prisma, PostgreSQL.

---

## Prerequisites

- **Node.js** ≥ 18
- **Docker** (for PostgreSQL)
- **npm** (comes with Node.js)

---

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/yassirelkhaili/Klassebon.git
cd klassebon
npm install
```

### 2. Start PostgreSQL

```bash
docker compose up -d
```

PostgreSQL runs on `localhost:5432` (user: `klassebon`, password: `klassebon`, db: `klassebon`).

### 3. Backend environment

```bash
cd packages/backend
cp .env.example .env
```

Edit `.env` and configure:

```env
# Use Docker credentials
DATABASE_URL="postgresql://klassebon:klassebon@localhost:5432/klassebon?schema=public"

# Generate with: openssl rand -base64 32 (must be ≥32 characters)
BETTER_AUTH_SECRET="your-secret-at-least-32-characters-long"

BETTER_AUTH_URL="http://localhost:3000"
FRONTEND_ORIGIN="http://localhost:5173"
PORT=3000
```

### 4. Database schema

```bash
npm run db:push --workspace=backend
```

### 5. Run the project

**Option A — Both frontend and backend together:**

```bash
npm run dev
```

**Option B — Separate terminals:**

Terminal 1 (backend):

```bash
npm run dev:backend
```

Terminal 2 (frontend):

```bash
npm run dev:frontend
```

---

## URLs

| Service  | URL                       | Description                |
|----------|---------------------------|----------------------------|
| Frontend | http://localhost:5173     | Vite dev server            |
| Backend  | http://localhost:3000     | Express API                |
| Health   | http://localhost:3000/api/health | REST health check   |
| Auth     | http://localhost:3000/api/auth/* | Better Auth endpoints |
| tRPC     | http://localhost:3000/api/trpc   | tRPC procedures      |

The frontend proxies `/api` to the backend, so you can call `/api/...` from the frontend origin.

---

## Project structure

```
klassebon/
├── packages/
│   ├── backend/        # Express, tRPC, Better Auth, Prisma
│   ├── frontend/       # Vite + React + TypeScript
│   └── shared/         # Shared types and constants
├── docker-compose.yml  # PostgreSQL
├── package.json
└── README.md
```

---

## Tech stack

- **Frontend:** Vite, React, TypeScript, Tailwind
- **Backend:** Express.js, tRPC, Prisma ORM
- **Auth:** Better Auth (session-based, PostgreSQL)
- **Database:** PostgreSQL
- **OCR:** Tesseract (planned)
- **LLM:** Ollama (planned)

---
