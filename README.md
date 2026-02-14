# Vertex React App

Internal MVP panel for Vertex coaching platform.

## Stack

- React + TypeScript + Vite
- React Router
- TanStack Query
- Axios
- React Hook Form + Zod
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

Default app URL: `http://127.0.0.1:5173`

## Environment

- `VITE_API_BASE_URL` default: `http://127.0.0.1:8000/api/v1`

## Scripts

- `npm run dev`
- `npm run build`
- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run test:watch`
- `npm run format`

## Backend Contract

Backend source of truth:
- `/home/fvarli/Desktop/LaravelProjects/vertex-laravel-api`

Frontend flow:
1. Login
2. Fetch workspaces
3. Switch active workspace
4. Access domain pages (students/programs/appointments/calendar)

## Notes

- App sends `Accept: application/json` and `Authorization: Bearer <token>` automatically.
- App attaches `X-Request-Id` per request.
- 401 responses trigger one refresh-token attempt before logout.
