# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.5.5] - 2026-04-12

### Added
- Showdown blank-template knowledge upgrades now open a write-in modal so the upgraded knowledge can be completed immediately.
- The Showdown knowledge upgrade modal now includes an option to also save the new knowledge as a reusable template.

### Fixed
- Fixed the Showdown knowledge upgrade flow where choosing a blank next level could leave the upgraded entry looking empty with no immediate way to write it.
- Fixed checkbox interaction in the Showdown knowledge upgrade modal so the reusable-template toggle can be selected normally.

## [1.5.2] - 2026-03-29

### Added
- **Comprehensive test suite expansion** - Added 158 tests covering:
  - Schema compatibility and migration (v0, v1, v2 → v3)
  - Utility functions and public API
  - Template validation for knowledge and neurosis templates
  - File system error handling (corrupted JSON, permission errors, atomic writes)
  - IPC handlers for all main process operations
  - Validation constraints (limits on fighting arts, disorders, knowledge entries)

### Changed
- **Performance optimization** - Added markdown collection caching with 5-second TTL to reduce repeated directory scans

### Fixed
- Test infrastructure now properly includes all test files in CI pipeline

## [1.5.1] - 2025-01-01

### Added
- Initial release of KDM Survivors Console
- Survivor management (create, edit, delete)
- Schema migration support for legacy data
- Markdown-based content for fighting arts, disorders, and knowledge
- Knowledge progression tracking
- Neurosis management
- Cross-platform desktop support (macOS, Windows, Linux)
