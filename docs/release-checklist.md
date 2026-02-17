# Frontend Release Checklist

## Pre-merge
- [ ] `git status` clean (expected files only).
- [ ] `npm run typecheck` passes.
- [ ] `npm run lint` passes.
- [ ] `npm run test -- --run` passes.
- [ ] `npm run build` passes.
- [ ] README, in-app docs texts, and user guide updates included when UX/API contract changes.

## Pre-deploy
- [ ] `VITE_API_BASE_URL` points to target backend environment.
- [ ] HTTPS domain/proxy config validated (`vertex-ui.local` for local).
- [ ] Browser cache strategy reviewed (new build hash rollout).
- [ ] GitHub Actions production secrets are configured (`PROD_HOST`, `PROD_USER`, `PROD_SSH_KEY`, optional `PROD_SSH_PORT`).

## Deploy
- [ ] Merge PR to `main` and confirm `Frontend CI` is green.
- [ ] Confirm `Frontend Deploy` workflow started automatically (or run manually).
- [ ] Confirm deploy job completed (`npm ci`, `npm run build`, smoke check).

## Post-deploy verification
- [ ] Login and workspace switch.
- [ ] Role-safe redirects from `/` and generic routes resolve to correct area.
- [ ] Dashboard shows attendance KPIs (`today_no_show`, `attendance_rate`).
- [ ] Programs page template accelerator works (save template, create from template, copy week).
- [ ] Student timeline opens and shows events.
- [ ] Appointments series create flow visible and operational.
- [ ] Reminders list/actions (open, mark-sent, requeue, cancel) visible and operational.
- [ ] Reminders bulk actions and CSV export work.
- [ ] Topbar language/theme icon dropdowns work on desktop + mobile.
- [ ] No blocking console/runtime errors.
- [ ] Login request URL points to `https://api.vertex.ferzendervarli.com/api/v1/login` (not local loopback).

## Rollback
- [ ] Re-point to previous frontend artifact.
- [ ] Invalidate cache if required.
- [ ] Re-run smoke checks.
