# Vertex Coach Web User Guide (EN)

## Who uses this panel?
- Owner Admin: manages the full workspace (students, programs, appointments, calendar).
- Trainer: manages only trainer-scoped records in the active workspace.

## Login and workspace flow
1. Sign in from `/login`.
2. Choose active workspace from `Workspaces`.
3. Continue to domain pages (Students, Programs, Appointments, Calendar).
4. Open role-specific docs from left menu:
   - `/admin/documentation`
   - `/trainer/documentation`

If no active workspace is selected, protected domain pages redirect to `*/workspaces`.
If area-role mismatch happens, UI redirects to `/forbidden`.

## Owner Admin quick flow
1. Check `Dashboard` KPIs and today's timeline first.
2. Open `Students` and create/update student records.
3. Assign or review weekly `Programs` per student.
4. Use program accelerator:
   - save reusable templates from existing weeks
   - create new week from template
   - copy source week to target week
5. Create or update `Appointments` with conflict-aware validation.
6. Use recurring series creation from `Appointments` for repeated sessions.
7. Manage reminder queue from `Reminders` and mark sent/cancelled actions.
8. Use `Calendar` tabs (Month/Week/Day/List) to track planning in different scopes.
9. WhatsApp flow is appointment/reminder based; student-level WhatsApp shortcut endpoint is not used.

## Trainer quick flow
1. Select active workspace.
2. Check `Dashboard` KPI/timeline for the day.
3. Manage only your own students and statuses.
4. Create weekly student programs.
5. Run appointment booking (single or recurring).
6. Use student timeline in `Students` page for quick history context.
7. Use `Reminders` for daily follow-up queue.
8. Follow schedule from `Calendar`.
9. Manual confirmation is required after opening WhatsApp (hybrid model).

## Status and constraints
- Student status: `active` or `passive`.
- Program status: `draft`, `active`, `archived`.
- Appointment status: `planned`, `done`, `cancelled`, `no_show`.
- Status transitions are guarded by backend rules (invalid transitions return `422`).
- Backend blocks overlapping trainer/student time slots.
- Appointment create can use `Idempotency-Key` header to avoid duplicate submissions.

## Troubleshooting
- `401 Invalid credentials`: verify email/password exactly.
- `401 Unauthenticated` on refresh token: token/session is missing or expired.
- `403` on API/domain actions: role/workspace access is missing. UI redirects to `/forbidden`.
- API contract source of truth: sibling backend repo `vertex-laravel-api`.
