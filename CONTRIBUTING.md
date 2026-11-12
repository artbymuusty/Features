# Contributing to Features

Thank you for contributing to **Features**! We welcome modular, well-tested, self-contained capabilities that developers can discover and adopt in seconds.

---

## 1. Feature Lifecycle & Maturity Levels

Every feature in the catalog has an explicit maturity rating:

- `proposed`: Architecture or specification submitted for review; initial skeleton.
- `experimental`: Early working code; API surface may evolve.
- `beta`: Feature-complete, documented, and tested in practical workflows.
- `stable`: High reliability, complete test coverage, backward compatibility guarantee, zero unhandled errors.
- `deprecated`: Obsolete or superseded by a newer pattern.

---

## 2. Directory Structure Conventions

Features are organized by category:

```
catalog/
└── <category>/
    └── <feature-id>/
        ├── feature.json     # Metadata strictly validating schemas/feature.schema.json
        ├── index.js         # Primary entry point
        ├── test.js          # Unit tests (runnable with node --test test.js)
        └── README.md        # Feature documentation & usage example
```

Allowed categories:
`auth`, `storage`, `ui`, `data`, `ai`, `networking`, `workflow`, `media`, `system`.

---

## 3. Step-by-Step Contributor Workflow

### Step 1: Scaffold a New Feature

Use the built-in CLI command:

```bash
node bin/features.js new my-feature --category workflow --name "My Feature Name"
```

This creates:
- `catalog/workflow/my-feature/feature.json`
- `catalog/workflow/my-feature/index.js`
- `catalog/workflow/my-feature/test.js`
- `catalog/workflow/my-feature/README.md`

### Step 2: Implement Logic & Unit Tests

- Implement your feature in `index.js`.
- Write unit tests using `node:test` in `test.js`.
- Keep dependencies minimal or zero. If external packages are required, list them under `dependencies` in `feature.json`.

### Step 3: Run Validation & Rebuild Index

```bash
# Validate schemas across all catalog features
node bin/features.js validate

# Rebuild index and bundle
npm run index
npm run build:obsidian

# Run entire test suite
npm test
```

### Step 4: Create a Branch and Submit PR

```bash
node bin/features.js branch my-feature
git add catalog/workflow/my-feature catalog-index.json obsidian-plugin/main.js
git commit -m "feat(workflow): add my-feature package"
git push origin feat/my-feature
```

Open a Pull Request against `main`. Our GitHub Actions workflow will automatically run schema validation and execute all test suites.
