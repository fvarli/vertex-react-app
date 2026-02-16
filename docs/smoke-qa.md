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
3. Execute `Open`, `Mark Sent`, `Cancel` actions on sample reminder.
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

## Failure Handling
- Capture route, screenshot, and console error.
- Include backend `request_id` where relevant.
- Block release sign-off until issue is triaged.

