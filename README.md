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

### 5. Ollama (Spartipp-Generierung)

Ollama wird für die lokale KI-Spartipp-Generierung benötigt.

1. [Ollama herunterladen](https://ollama.com/download) und installieren
2. Modell laden:
```bash
ollama pull llama3.2
```
3. Ollama läuft danach automatisch im Hintergrund auf `http://localhost:11434`

Optional in `.env` konfigurieren:
```env
OLLAMA_HOST="http://localhost:11434"
OLLAMA_MODEL="llama3.2"
```

> Ohne Ollama funktioniert die gesamte App normal — nur die Spartipp-Generierung gibt einen Fehler zurück.

### 6. Run the project

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

## Scripts

| Command               | Description                          |
|-----------------------|--------------------------------------|
| `npm run dev`         | Start frontend and backend           |
| `npm run dev:frontend`| Start frontend only (port 5173)      |
| `npm run dev:backend` | Start backend only (port 3000)       |
| `npm run build`       | Build all packages                   |
| `npm run db:push --workspace=backend`    | Push Prisma schema to DB |
| `npm run db:migrate --workspace=backend` | Run Prisma migrations   |
| `npm run db:studio --workspace=backend`  | Open Prisma Studio      |
| `npm run test --workspace=backend`       | Run backend unit tests  |
| `npm run test:watch --workspace=backend` | Tests im Watch-Modus    |

---

## Tech stack

- **Frontend:** Vite, React, TypeScript, Tailwind
- **Backend:** Express.js, tRPC, Prisma ORM
- **Auth:** Better Auth (session-based, PostgreSQL)
- **Database:** PostgreSQL
- **OCR:** Tesseract (planned)
- **LLM:** Ollama (llama3.2, lokal)
- **Tests:** Vitest

---

## tRPC Prozeduren (Backend)

Alle Prozeduren benötigen `Authorization: Bearer <token>` (außer `health` und `hello`).

| Prozedur | Methode | Beschreibung |
|---|---|---|
| `health` | GET | Health-Check |
| `me` | GET | Eingeloggter User |
| `ausgaben.list` | GET | Alle Ausgaben (optional: `?kategorie=Streaming`) |
| `ausgaben.getById` | GET | Einzelne Ausgabe |
| `ausgaben.create` | POST | Neue Ausgabe anlegen |
| `ausgaben.update` | POST | Ausgabe bearbeiten |
| `ausgaben.delete` | POST | Ausgabe löschen |
| `abonnements.list` | GET | Alle Abos (optional: `?kategorie=`, `?nurAktive=true`) |
| `abonnements.getById` | GET | Einzelnes Abo |
| `abonnements.create` | POST | Neues Abo anlegen |
| `abonnements.update` | POST | Abo bearbeiten / deaktivieren |
| `abonnements.delete` | POST | Abo löschen |
| `monatskosten.berechne` | GET | Gesamtkosten eines Monats |
| `monatskosten.nachKategorie` | GET | Kosten pro Kategorie (Balkendiagramm) |
| `dashboard.uebersicht` | GET | Alle Dashboard-Daten in einem Call |
| `spartipps.generiere` | GET | 3 Spartipps via Ollama |

**Vordefinierte Kategorien:** `Streaming` · `Lebensmittel` · `Versicherung` · `Transport` · `Sonstiges`

---

## Further reading

- [Backend README](packages/backend/README.md) — TA2.1, TA2.2, TA2.3 details
- [Projektantrag](docs/projektantrag_klassebon(7).html)
- [Projektstrukturplan](docs/projektstrukturplan_klassebon(1).html)
