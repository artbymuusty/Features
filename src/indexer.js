import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCatalog } from './catalog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_INDEX_PATH = path.resolve(__dirname, '../catalog-index.json');

/**
 * Tokenizes text for the inverted index
 * @param {string} text
 * @returns {string[]}
 */
export function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length >= 2);
}

/**
 * Compiles catalog-index.json from all valid features in the catalog
 * @param {string} catalogDir
 * @param {string} outPath
 * @returns {object}
 */
export function buildIndex(catalogDir, outPath = DEFAULT_INDEX_PATH) {
  const { features, errors } = loadCatalog(catalogDir);
  if (errors.length > 0) {
    const errorDetails = errors
      .map(e => `${path.basename(e.file)}:\n  - ${e.errors.join('\n  - ')}`)
      .join('\n');
    throw new Error(`Cannot build catalog index due to validation errors:\n${errorDetails}`);
  }

  const categoriesMap = new Map();
  const technologiesMap = new Map();
  const tagsMap = new Map();
  const maturitiesMap = new Map();
  const invertedIndex = {};

  function addInvertedToken(token, featureId) {
    if (!invertedIndex[token]) {
      invertedIndex[token] = [];
    }
    if (!invertedIndex[token].includes(featureId)) {
      invertedIndex[token].push(featureId);
    }
  }

  const serializedFeatures = features.map(f => {
    // Categories count
    categoriesMap.set(f.category, (categoriesMap.get(f.category) || 0) + 1);

    // Maturities count
    maturitiesMap.set(f.maturity, (maturitiesMap.get(f.maturity) || 0) + 1);

    // Tech count & index
    for (const tech of f.technologies || []) {
      technologiesMap.set(tech, (technologiesMap.get(tech) || 0) + 1);
      for (const t of tokenize(tech)) addInvertedToken(t, f.id);
    }

    // Tags count & index
    for (const tag of f.tags || []) {
      tagsMap.set(tag, (tagsMap.get(tag) || 0) + 1);
      for (const t of tokenize(tag)) addInvertedToken(t, f.id);
    }

    // Category index
    for (const t of tokenize(f.category)) addInvertedToken(t, f.id);

    // ID, Name, Summary index
    for (const t of tokenize(f.id)) addInvertedToken(t, f.id);
    for (const t of tokenize(f.name)) addInvertedToken(t, f.id);
    for (const t of tokenize(f.summary)) addInvertedToken(t, f.id);

    return {
      id: f.id,
      name: f.name,
      version: f.version,
      summary: f.summary,
      description: f.description || '',
      category: f.category,
      tags: f.tags,
      technologies: f.technologies,
      maturity: f.maturity,
      dependencies: f.dependencies || {},
      license: f.license,
      author: f.author,
      entrypoint: f.entrypoint || '',
      files: f._meta?.files || [],
      relativeCatalogDir: f._meta?.relativeCatalogDir || f.id
    };
  });

  const indexPayload = {
    schema_version: '1.0.0',
    generated_at: new Date().toISOString(),
    total_features: serializedFeatures.length,
    stats: {
      categories: Object.fromEntries(categoriesMap),
      technologies: Object.fromEntries(technologiesMap),
      tags: Object.fromEntries(tagsMap),
      maturities: Object.fromEntries(maturitiesMap)
    },
    features: serializedFeatures,
    inverted_index: invertedIndex
  };

  fs.writeFileSync(outPath, JSON.stringify(indexPayload, null, 2), 'utf8');
  return indexPayload;
}

/**
 * Reads existing catalog-index.json from disk, or builds it if missing
 * @param {string} indexPath
 * @returns {object}
 */
export function getOrBuildIndex(indexPath = DEFAULT_INDEX_PATH) {
  if (fs.existsSync(indexPath)) {
    try {
      const raw = fs.readFileSync(indexPath, 'utf8');
      return JSON.parse(raw);
    } catch {
      // Rebuild if corrupted
    }
  }
  return buildIndex(undefined, indexPath);
}
