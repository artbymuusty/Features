import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadCatalog } from './catalog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

/**
 * Scaffolds a new feature directory with schema-compliant files
 * @param {string} id
 * @param {object} options
 * @returns {string} Directory path created
 */
export function scaffoldFeature(id, options = {}) {
  const category = options.category || 'workflow';
  const name = options.name || id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const targetDir = path.resolve(REPO_ROOT, `catalog/${category}/${id}`);

  if (fs.existsSync(targetDir)) {
    throw new Error(`Target directory '${targetDir}' already exists.`);
  }

  fs.mkdirSync(targetDir, { recursive: true });

  const now = new Date().toISOString();
  const featureMeta = {
    $schema: "../../schemas/feature.schema.json",
    id,
    name,
    version: "0.1.0",
    summary: `Modular implementation of ${name.toLowerCase()} capability`,
    description: `## Overview\n\nThe \`${id}\` feature provides self-contained, tested functionality for ${name.toLowerCase()}.\n\n### Usage\n\n\`\`\`javascript\nimport { createInstance } from './index.js';\nconst instance = createInstance();\n\`\`\`\n`,
    category,
    tags: [category, id.split('-')[0]],
    technologies: ["javascript", "node"],
    maturity: "proposed",
    dependencies: {},
    license: "MIT",
    author: {
      name: options.authorName || "Contributor",
      github: options.authorGithub || "contributor"
    },
    entrypoint: "index.js",
    created_at: now,
    updated_at: now
  };

  fs.writeFileSync(path.join(targetDir, 'feature.json'), JSON.stringify(featureMeta, null, 2), 'utf8');

  fs.writeFileSync(path.join(targetDir, 'README.md'), `# ${name}\n\n${featureMeta.summary}\n\n## Quick Start\n\nSee \`index.js\` and \`test.js\`.\n`, 'utf8');

  fs.writeFileSync(path.join(targetDir, 'index.js'), `/**\n * ${name} - Core Implementation\n */\nexport function createInstance(options = {}) {\n  return {\n    id: '${id}',\n    ready: true,\n    ...options\n  };\n}\n`, 'utf8');

  fs.writeFileSync(path.join(targetDir, 'test.js'), `import assert from 'node:assert/strict';\nimport test from 'node:test';\nimport { createInstance } from './index.js';\n\ntest('${id} initializes correctly', () => {\n  const inst = createInstance();\n  assert.equal(inst.id, '${id}');\n  assert.equal(inst.ready, true);\n});\n`, 'utf8');

  return targetDir;
}

/**
 * Creates a git feature branch
 * @param {string} id
 * @returns {string} Branch name
 */
export function createGitBranch(id) {
  const branchName = `feat/${id}`;
  try {
    execSync(`git checkout -b ${branchName}`, { cwd: REPO_ROOT, stdio: 'pipe' });
    return branchName;
  } catch (err) {
    throw new Error(`Failed to create git branch '${branchName}': ${err.message}`);
  }
}

/**
 * Validates the entire catalog
 * @returns {{ valid: boolean, featuresCount: number, errors: Array }}
 */
export function validateCatalog() {
  const { features, errors } = loadCatalog();
  return {
    valid: errors.length === 0,
    featuresCount: features.length,
    errors
  };
}
