# Frontend Smoke QA

## Goal
Validate end-user critical flows in 10-15 minutes after deployment.

## 1) Auth + Workspace
1. Open `/login`, sign in with demo owner.
2. Verify redirect to workspaces and successful active workspace selection.
Expected:
- No auth loop.
- Domain pages become accessible.

## 2) Recurring Series Flow
1. Navigate to `/admin/appointments`.
2. Open "New Series", submit weekly series payload.
Expected:
- Success notice shown.
- New occurrences appear in appointments list.

## 3) Reminders Queue
1. Navigate to `/admin/reminders`.
2. Confirm reminders are listed.
3. Execute `Open`, `Mark Sent`, `Requeue`, `Cancel` actions on sample reminder.
4. Select multiple rows and run bulk actions.
5. Export CSV from reminders page.
Expected:
- State transitions reflected in table and follow-up views.

## 4) WhatsApp Contract UX
1. From appointments page, open WhatsApp link for an appointment.
2. Mark WhatsApp status accordingly.
Expected:
- Link opens in new tab/window.
- Status badge updates.

## 5) Topbar Controls
1. Test language icon dropdown (`TR/EN`).
2. Test theme icon dropdown (`system/light/dark`).
3. Repeat in mobile drawer view.
Expected:
- Dropdown always appears above page content.
- Selections persist and apply immediately.

## 6) Modern Calendar Tabs
1. Navigate to `/admin/calendar`.
2. Verify `Month` default, switch to `Week`, `Day`, `List`.
3. Use quick actions: Today, This Week, This Month.
4. Click a calendar event and confirm detail panel updates.
Expected:
- Tab switching updates view without page reload.
- Event cards/colors remain readable in light/dark mode.
- List tab remains available as fallback operations view.

## 7) Program Template Accelerator
1. Navigate to `/admin/programs` (or trainer area equivalent).
2. Save an existing weekly program as template.
3. Create a new week via "Create from Template".
4. Copy source week to another week.
Expected:
- Template is listed in selector.
- Generated/copy programs appear in list and keep item rows.

## 8) Student Timeline
1. Navigate to `/admin/students`.
2. Open timeline for a student.
Expected:
- Modal/panel shows merged appointment + program events.
- Empty state appears cleanly for students without history.

## 9) Role Guard + Forbidden UX
1. Login as trainer and manually open an `/admin/*` route.
2. Login as owner admin and manually open a `/trainer/*` route.
Expected:
- User is redirected to `/forbidden`.
- Page explains role/workspace access mismatch.
- Navigation back to dashboard/workspaces works.

## Failure Handling
- Capture route, screenshot, and console error.
- Include backend `request_id` where relevant.
- Block release sign-off until issue is triaged.
