# Changelog

All notable changes to this project are documented in this file.

## v0.4.0 - 2026-02-16

### Added
- Programs page accelerator UI:
  - create week from template
  - copy source week to target week
  - save existing program as template
- Student timeline modal in Students page (`GET /students/{id}/timeline`).
- Dashboard KPI cards for `today_no_show` and attendance rate.

### Changed
- Programs/students frontend API layer expanded for template/timeline endpoints.
- i18n resources updated for new accelerator and timeline strings (TR/EN).
- QA/release docs updated for new operation-critical flows.

### Fixed
- Programs page test now mocks `program-templates` query contract.

## v0.3.0 - 2026-02-16

### Added
- Reminders module (`/admin/reminders`, `/trainer/reminders`) with queue actions.
- Recurring series create flow in appointments page.
- Role-aware navigation entries for reminders.

### Changed
- Topbar language/theme controls moved to icon-first dropdown panels.
- WhatsApp UX aligned to appointment/reminder scope only.
- User guides and README updated for hybrid reminder flow.

### Fixed
- Topbar dropdown layering issue via z-index/stacking adjustments.
- Theme toggle test adapted to new icon-dropdown interaction model.

### Known Limitations
- No automatic WhatsApp provider send in this release.
- Frontend build reports a non-blocking chunk-size warning.
