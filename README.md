# Features

[![Validate & Test](https://github.com/artbymuusty/Features/actions/workflows/validate.yml/badge.svg)](https://github.com/artbymuusty/Features/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/Runtime%20Dependencies-0-success.svg)](package.json)
[![Footprint](https://img.shields.io/badge/Artifact%20Footprint-%3C%20200%20KB-brightgreen.svg)](package.json)

> **Standardized, searchable public feature catalog, lightweight CLI, and Obsidian explorer for modular open-source software capabilities.**

Features turns reusable architectural building blocks—storage engines, biometric vaults, SVG charts, MCP protocol bridges, and precision schedulers—into independently discoverable, tested, and downloadable packages.

---

## Key Highlights

- **Standardized Schema**: Strict JSON Schema validation (`schemas/feature.schema.json`) guaranteeing uniform metadata across categories, tags, dependencies, and maturity ratings.
- **Ultra-Lightweight**: Zero external runtime dependencies. Built on modern Node.js standard libraries (`node:sqlite`, `node:crypto`, `node:http`, `node:events`). Total client footprint is **< 200 KB** (far below the 4–5 MB budget).
- **Fast Local Search**: Ranked in-memory search scoring across ID, name, summary, description, tags, and technologies.
- **On-Demand Downloads**: Instantly extract and copy any feature directly into your project via CLI (`features download <id> --out <dir>`).
- **Obsidian Explorer Panel**: Native sidebar panel for Obsidian allowing 1-click feature insertion into notes or clipboard copy.
- **Local Web UI**: Embedded responsive browser catalog with instant search, category filtering, and dark/light mode (`features serve`).
- **Automated CI**: GitHub Actions validation pipeline checking schema integrity, index freshness, and unit tests.

---

## Catalog Overview

| Feature ID | Category | Maturity | Tech Stack | Summary |
| :--- | :--- | :--- | :--- | :--- |
| **`sqlite-kv-store`** | `storage` | `stable` | JavaScript, Node, SQLite | Resilient, high-throughput key-value store with TTL expiration and JSON document querying |
| **`biometric-keychain`** | `auth` | `stable` | JavaScript, Node, Crypto | Platform-agnostic biometric authentication and encrypted credential storage interface |
| **`sparkline-svg`** | `ui` | `stable` | JavaScript, SVG, CSS | Zero-dependency responsive SVG sparkline chart component with spline curve interpolation |
| **`mcp-stdio-bridge`** | `ai` | `stable` | JavaScript, Node, Stream | Model Context Protocol JSON-RPC 2.0 message framer and stdio transport adapter |
| **`precision-cron`** | `workflow` | `stable` | JavaScript, Node, Async | In-memory precision job scheduler with drift compensation, jitter, and retry backoff |

---

## Quick Start (CLI)

```bash
# Clone and explore
git clone https://github.com/artbymuusty/Features.git
cd Features

# 1. Search the catalog
node bin/features.js search "sqlite"
node bin/features.js search "crypto"

# 2. List all features with filters
node bin/features.js list --category storage
node bin/features.js list --maturity stable

# 3. View detailed metadata
node bin/features.js info sparkline-svg

# 4. Download / extract a feature into your own project
node bin/features.js download sqlite-kv-store --out ./src/storage/kv

# 5. Launch the local web explorer
node bin/features.js serve --port 8766
# Open http://127.0.0.1:8766 in your browser
```

---

## Obsidian Feature Explorer

The included Obsidian plugin enables you to search and insert features directly inside Obsidian:

1. Copy the `obsidian-plugin/` directory to your Obsidian vault's `.obsidian/plugins/features-explorer/` folder.
2. Enable **Features Explorer** in Obsidian Settings -> Community Plugins.
3. Click the ribbon icon or run `Features: Open Catalog Explorer` from the command palette.
4. Click **Insert Note** to add formatted callouts and install snippets directly into your active note.

---

## Contributing

We welcome community contributions! Please review [CONTRIBUTING.md](CONTRIBUTING.md) for details on the feature lifecycle and guidelines.

To scaffold a new feature package in seconds:

```bash
node bin/features.js new my-feature --category workflow --name "My Feature"
node bin/features.js validate
npm test
```

---

## License

[MIT](LICENSE) © [Mustafa Furkan ÖZCAN](https://github.com/artbymuusty)
