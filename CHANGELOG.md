# Changelog

All notable changes to this project are documented in this file.

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

