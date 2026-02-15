# Vertex Coach Web User Guide (EN)

## Who uses this panel?
- Owner Admin: manages the full workspace (students, programs, appointments, calendar).
- Trainer: manages only trainer-scoped records in the active workspace.

## Login and workspace flow
1. Sign in from `/login`.
2. Choose active workspace from `Workspaces`.
3. Continue to domain pages (Students, Programs, Appointments, Calendar).

If no active workspace is selected, protected domain pages redirect to `*/workspaces`.

## Owner Admin quick flow
1. Check `Dashboard` KPIs and today's timeline first.
2. Open `Students` and create/update student records.
3. Assign or review weekly `Programs` per student.
4. Create or update `Appointments` with conflict-aware validation.
5. Track day/week view from `Calendar`.
6. Use student WhatsApp shortcut links directly from students table actions.

## Trainer quick flow
1. Select active workspace.
2. Check `Dashboard` KPI/timeline for the day.
3. Manage only your own students and statuses.
4. Create weekly student programs.
5. Run appointment booking and follow-up from calendar.

## Status and constraints
- Student status: `active` or `passive`.
- Program status: `draft`, `active`, `archived`.
- Appointment status: `planned`, `done`, `cancelled`, `no_show`.
- Backend blocks overlapping trainer/student time slots.
- Appointment create can use `Idempotency-Key` header to avoid duplicate submissions.

## Troubleshooting
- `401 Invalid credentials`: verify email/password exactly.
- `401 Unauthenticated` on refresh token: token/session is missing or expired.
- `403` on domain pages: active workspace not selected or role/workspace access missing.
- API contract source of truth: sibling backend repo `vertex-laravel-api`.
