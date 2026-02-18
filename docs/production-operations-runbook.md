# Frontend Production Operations Runbook

## 1) Incident entrypoint
- Validate frontend availability:
  - `curl -I https://vertex.ferzendervarli.com`
- Validate backend contract quickly:
  - `curl -i -H "Accept: application/json" https://api.vertex.ferzendervarli.com/api/v1/health`

## 2) Deploy verification
- In GitHub Actions, confirm:
  - `Frontend CI` success
  - `Frontend Deploy` success
  - deploy log includes `npm ci` and `npm run build`

## 3) Production environment protection
- GitHub `production` environment should require reviewers.
- Recommended: at least 1 reviewer for manual deploy triggers.

## 4) SSH key rotation policy
- Rotate `PROD_SSH_KEY` every 90 days.
- Rotation steps:
  1. create new keypair
  2. add public key for `deploy` user on server
  3. update GitHub secret
  4. run `Frontend Deploy` manually
  5. remove old key

## 5) Weekly security maintenance
- `Frontend Security Audit` workflow runs weekly (Monday 07:15 UTC).
- On failure:
  - review `npm audit` output
  - apply dependency updates
  - rerun workflow manually

## 6) Runtime validation after deploy
- Confirm login request target:
  - must be `https://api.vertex.ferzendervarli.com/api/v1/login`
  - must not be local loopback (`127.0.0.1`)
- Confirm role routes work:
  - `/admin/*` and `/trainer/*` split behaves correctly.

## 7) Rollback
- Frontend rollback commands:
  - `cd /var/www/vertex-react-app`
  - `git reset --hard <previous_commit>`
  - `npm ci && npm run build`

## 8) Cache and browser checks
- Perform hard refresh (`Ctrl+Shift+R`) after deploy.
- If stale assets are suspected, invalidate CDN/proxy cache (if used).

## 9) Performance watch
- Track bundle warnings from `vite build` output.
- Treat large chunk warnings as backlog items for code-splitting sprint.

## 10) Post-incident closeout
- Record root cause, impact window, and preventive action.
- Update this runbook/checklists with any new operational lessons.

