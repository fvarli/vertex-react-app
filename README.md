# Vertex React App

Internal MVP panel for Vertex coaching platform.

## Stack

- React + TypeScript + Vite
- React Router
- TanStack Query
- Axios
- React Hook Form + Zod
- Tailwind CSS + shadcn-style UI primitives
- Vitest + Testing Library

## Requirements

- Node.js 18+
- npm 10+

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Default dev URL: `http://127.0.0.1:5173`

## Environment

- `VITE_API_BASE_URL` default: `https://vertex.local/api/v1`

## Local HTTPS Domain (vertex-ui.local)

To open frontend via `https://vertex-ui.local`:

1. Add hosts entry:

```bash
sudo sh -c 'echo "127.0.0.1 vertex-ui.local" >> /etc/hosts'
```

2. Install local CA and cert with mkcert:

```bash
mkcert -install
mkcert vertex-ui.local
```

3. Move generated cert files to expected Nginx paths:

```bash
sudo mkdir -p /etc/nginx/ssl
sudo cp vertex-ui.local.pem /etc/nginx/ssl/vertex-ui.local.pem
sudo cp vertex-ui.local-key.pem /etc/nginx/ssl/vertex-ui.local-key.pem
```

4. Enable Nginx configs from `ops/nginx`:

- `vertex-ui.local.http.conf` (80 -> 443 redirect)
- `vertex-ui.local.https.conf` (TLS + Vite proxy)

5. Reload Nginx.

6. Run frontend dev server:

```bash
npm run dev -- --host 127.0.0.1 --port 5173
```

7. Open:

- `https://vertex-ui.local`

## Scripts

- `npm run dev`
- `npm run build`
- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run test:watch`
- `npm run format`

## CI

GitHub Actions workflow: `.github/workflows/ci.yml`

Checks on push/PR to `main`:
- typecheck
- lint
- test
- build

Recommended branch protection on `main`:
- require all `Frontend CI` checks to pass before merge

## Backend Contract

Backend source of truth:
- sibling repository `vertex-laravel-api` (same parent folder as this frontend repo)

Example local structure:
- `/<your-workspace>/vertex-react-app`
- `/<your-workspace>/vertex-laravel-api`

Frontend flow:
1. Login
2. Fetch workspaces
3. Switch active workspace
4. Access domain pages (students/programs/appointments/calendar)

## User Documentation (TR/EN)

- English guide: `docs/user-guide.en.md`
- Turkish guide: `docs/user-guide.tr.md`
- In-app left menu:
  - Admin: `/admin/documentation`
  - Trainer: `/trainer/documentation`

Each role guide explains workspace flow, domain usage order, and troubleshooting.

## Notes

- App sends `Accept: application/json` and `Authorization: Bearer <token>` automatically.
- App attaches `X-Request-Id` per request.
- 401 responses trigger one refresh-token attempt before logout.

## Auth Troubleshooting

- Demo owner credentials are exact:
  - `owner@vertex.local`
  - `password123`
- `password123.` (with trailing `.`) is a different password and returns `401 Invalid credentials.`
- `POST /refresh-token` returning `401 Unauthenticated` is expected when login did not succeed first.

## Appointments & Calendar

- `AppointmentsPage` now consumes real endpoints:
  - `GET /appointments`
  - `POST /appointments`
  - `PUT /appointments/{id}`
  - `PATCH /appointments/{id}/status`
- `CalendarPage` consumes `GET /calendar` and renders grouped `days[]` payload.
- Conflict validation from backend is surfaced in UI (`422`, `errors.code = time_slot_conflict`).
- Appointment create supports optional `Idempotency-Key` header on backend to prevent duplicate inserts.

## Dashboard

- `DashboardPage` consumes:
  - `GET /dashboard/summary` for KPI cards
  - `GET /appointments` filtered to today range for timeline
- Scope is role-aware through backend:
  - owner admin -> workspace-wide
  - trainer -> own records

Reporting-ready backend endpoints (for next UI modules):
- `GET /reports/appointments`
- `GET /reports/students`
- `GET /reports/programs`

## Programs

- `ProgramsPage` now consumes real endpoints:
  - `GET /students/{student}/programs`
  - `POST /students/{student}/programs`
  - `PUT /programs/{id}`
  - `PATCH /programs/{id}/status`
- Supports week-based program CRUD with ordered item rows.
- Backend validation errors (including active-per-week and duplicate day/order rules) are shown in UI.

## API Error Handling

- Shared helpers live in `src/lib/api-errors.ts`.
- Common behavior:
  - `403` -> redirect user to workspace selection in protected domain screens.
  - `422` -> API validation payload can be parsed through `extractValidationErrors`.
  - fallback message -> `extractApiMessage(error, fallback)`.
- Appointment flow:
  - `time_slot_conflict` and `idempotency_payload_mismatch` are surfaced with dedicated UI messages.

## Role-Aware Routing

- Single login entrypoint: `/login`
- Post-login routing is role-aware:
  - owner admin / platform admin -> `/admin/*`
  - trainer -> `/trainer/*`
- Current split preserves backend policy enforcement; frontend route guards only shape UX.
- Workspace guard rule:
  - if active workspace is missing, user is redirected to `/<area>/workspaces`
