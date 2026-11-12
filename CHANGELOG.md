# Changelog

All notable changes to the **Features** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 2026-11-12

### Added

#### Core Catalog & Metadata Architecture
- Strict JSON Schema specification (`schemas/feature.schema.json`) validating metadata integrity, kebab-case identifiers, semver versions, summaries, categories, tags, technologies, and maturity ratings.
- Automated catalog validator (`src/validator.js`) enforcing schema compliance with zero external dependencies.
- Catalog compiler (`src/indexer.js`) producing `catalog-index.json` with aggregate taxonomy statistics and an inverted token index.
- Search and filtering engine (`src/search.js`) providing multi-token ranked search with exact/fuzzy scoring, faceted filters (category, tech, maturity), and zero-result handling for punctuation-only inputs.
- Safe package downloader (`src/downloader.js`) implementing atomic staging (`.staging-<id>-<ts>-<rand>`), overwrite protection, and automated rollback on failure.

#### Command-Line Interface (`features`)
- `features search <query>`: Ranked search across name, summary, tags, and technologies.
- `features list`: Catalog listing with `--category`, `--tech`, `--tag`, and `--maturity` filters.
- `features info <feature-id>`: Comprehensive metadata, file manifest, and package documentation viewer.
- `features download <feature-id> --out <dest-dir>`: On-demand feature package extraction into project directories.
- `features index`: Rebuilds `catalog-index.json` from disk.
- `features validate`: Validates all features in `catalog/` against schema.
- `features new <feature-id> --category <cat>`: Scaffolds a new schema-compliant feature package with test skeleton.
- `features branch <feature-id>`: Safely creates a git contributor branch using argument-based execution.
- `features serve [--port 8766]`: Starts local embedded HTTP server binding to `127.0.0.1`.

#### Seed Feature Packages (`catalog/`)
- **`sparkline-svg`** (`ui` | `stable`): Zero-dependency responsive SVG sparkline component with spline curve interpolation and area fills.
- **`mcp-stdio-bridge`** (`ai` | `stable`): Model Context Protocol JSON-RPC 2.0 message framer supporting both line-delimited and `Content-Length:` header framing with fragmented stream chunk reassembly.
- **`precision-cron`** (`workflow` | `stable`): In-memory job scheduler with absolute timing baseline drift compensation, exponential backoff retries, and randomized jitter.
- **`biometric-keychain`** (`auth` | `beta`): In-memory AES-256-GCM encrypted credential vault with mandatory master passphrase and biometric authorization callback hooks.
- **`sqlite-kv-store`** (`storage` | `experimental`): Transactional key-value store with TTL expiration backed by native `node:sqlite` (Node.js ≥ 22.5.0).

#### Obsidian Feature Explorer Plugin (`obsidian-plugin/`)
- Native sidebar leaf view (`manifest.json`, `styles.css`, `main.js`) with embedded offline catalog index.
- 1-click note snippet insertion, CLI download command copying, and feature inspection modal.
- Automated bundle build script (`obsidian-plugin/build.js`) with syntax verification and unload leaf detaching.

#### Local Web Explorer (`web/`)
- Embedded responsive single-page application served via `features serve` on loopback.
- Instant search, category chip navigation, dark/light theme toggle, and detail inspection modals.
- Proper SPA routing with HTTP 404 handling for missing static assets.

#### CI & Contributor Workflows
- GitHub Actions workflow (`.github/workflows/validate.yml`) validating schemas, index freshness, core tests, package tests, and bundle syntax.
- Contributor guidelines and feature lifecycle documentation (`CONTRIBUTING.md`).
