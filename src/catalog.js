import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateFeatureFile } from './validator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_CATALOG_DIR = path.resolve(__dirname, '../catalog');

/**
 * Recursively find all feature.json files in the catalog
 * @param {string} catalogDir
 * @returns {string[]}
 */
export function findFeatureFiles(catalogDir = DEFAULT_CATALOG_DIR) {
  const results = [];
  if (!fs.existsSync(catalogDir)) {
    return results;
  }

  function scan(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        scan(fullPath);
      } else if (entry.isFile() && entry.name === 'feature.json') {
        results.push(fullPath);
      }
    }
  }

  scan(catalogDir);
  return results.sort();
}

/**
 * Loads and validates all features in the catalog
 * @param {string} catalogDir
 * @returns {{ features: object[], errors: { file: string, errors: string[] }[] }}
 */
export function loadCatalog(catalogDir = DEFAULT_CATALOG_DIR) {
  const files = findFeatureFiles(catalogDir);
  const features = [];
  const errors = [];
  const seenIds = new Map();

  for (const file of files) {
    const val = validateFeatureFile(file);
    if (!val.valid) {
      errors.push({ file, errors: val.errors });
      continue;
    }

    const feature = val.data;
    const featureDir = path.dirname(file);
    const relDir = path.relative(catalogDir, featureDir);

    // Verify duplicate ID
    if (seenIds.has(feature.id)) {
      errors.push({
        file,
        errors: [`Duplicate feature ID '${feature.id}' already declared at ${seenIds.get(feature.id)}`]
      });
      continue;
    }
    seenIds.set(feature.id, file);

    // Compute relative catalog path and file listing
    const dirEntries = fs.readdirSync(featureDir).filter(f => f !== '.DS_Store');
    feature._meta = {
      filePath: file,
      dirPath: featureDir,
      relativeCatalogDir: relDir,
      files: dirEntries
    };

    features.push(feature);
  }

  return { features, errors };
}

/**
 * Get a single feature by ID
 * @param {string} id
 * @param {string} catalogDir
 * @returns {object|null}
 */
export function getFeatureById(id, catalogDir = DEFAULT_CATALOG_DIR) {
  const { features } = loadCatalog(catalogDir);
  return features.find(f => f.id === id) || null;
}
