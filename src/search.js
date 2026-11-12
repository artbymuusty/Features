import { getOrBuildIndex, tokenize } from './indexer.js';

/**
 * Perform a ranked search across the catalog
 * @param {string} query Search text
 * @param {object} filters Optional filters: { category, tech, tag, maturity }
 * @param {object} index Optional pre-loaded catalog index
 * @returns {Array<{ feature: object, score: number, matches: string[] }>}
 */
export function searchCatalog(query = '', filters = {}, index = null) {
  const catalogIndex = index || getOrBuildIndex();
  const tokens = tokenize(query);

  let candidateFeatures = catalogIndex.features;

  // 1. Apply strict filters if specified
  if (filters.category) {
    const targetCat = filters.category.toLowerCase();
    candidateFeatures = candidateFeatures.filter(f => f.category.toLowerCase() === targetCat);
  }
  if (filters.tech || filters.technology) {
    const targetTech = (filters.tech || filters.technology).toLowerCase();
    candidateFeatures = candidateFeatures.filter(f =>
      (f.technologies || []).some(t => t.toLowerCase() === targetTech)
    );
  }
  if (filters.tag) {
    const targetTag = filters.tag.toLowerCase();
    candidateFeatures = candidateFeatures.filter(f =>
      (f.tags || []).some(t => t.toLowerCase() === targetTag)
    );
  }
  if (filters.maturity) {
    const targetMat = filters.maturity.toLowerCase();
    candidateFeatures = candidateFeatures.filter(f => f.maturity.toLowerCase() === targetMat);
  }

  // 2. If no query string, return all filtered features sorted by name
  if (tokens.length === 0) {
    return candidateFeatures
      .map(feature => ({ feature, score: 1, matches: [] }))
      .sort((a, b) => a.feature.name.localeCompare(b.feature.name));
  }

  // 3. Compute score for each candidate feature
  const results = [];
  const normalizedQuery = query.toLowerCase().trim();

  for (const feature of candidateFeatures) {
    let score = 0;
    const matches = [];

    const fid = feature.id.toLowerCase();
    const fname = feature.name.toLowerCase();
    const fsum = feature.summary.toLowerCase();
    const fdesc = (feature.description || '').toLowerCase();
    const ftags = (feature.tags || []).map(t => t.toLowerCase());
    const ftech = (feature.technologies || []).map(t => t.toLowerCase());
    const fcat = feature.category.toLowerCase();

    // Exact ID match is highest priority
    if (fid === normalizedQuery) {
      score += 100;
      matches.push('exact-id');
    } else if (fid.includes(normalizedQuery)) {
      score += 50;
      matches.push('id');
    }

    // Exact name match
    if (fname === normalizedQuery) {
      score += 80;
      matches.push('exact-name');
    } else if (fname.includes(normalizedQuery)) {
      score += 40;
      matches.push('name');
    }

    // Category match
    if (fcat === normalizedQuery) {
      score += 35;
      matches.push('category');
    }

    // Tag matches
    for (const tag of ftags) {
      if (tag === normalizedQuery) {
        score += 30;
        matches.push(`tag:${tag}`);
      } else if (tag.includes(normalizedQuery)) {
        score += 15;
        matches.push(`tag:${tag}`);
      }
    }

    // Tech matches
    for (const tech of ftech) {
      if (tech === normalizedQuery) {
        score += 30;
        matches.push(`tech:${tech}`);
      } else if (tech.includes(normalizedQuery)) {
        score += 15;
        matches.push(`tech:${tech}`);
      }
    }

    // Multi-token scoring
    for (const token of tokens) {
      if (fid.includes(token)) {
        score += 15;
      }
      if (fname.includes(token)) {
        score += 12;
      }
      if (fsum.includes(token)) {
        score += 8;
        if (!matches.includes('summary')) matches.push('summary');
      }
      if (fdesc.includes(token)) {
        score += 3;
        if (!matches.includes('description')) matches.push('description');
      }
      if (ftags.some(t => t.includes(token))) {
        score += 10;
      }
      if (ftech.some(t => t.includes(token))) {
        score += 10;
      }
    }

    if (score > 0) {
      results.push({
        feature,
        score,
        matches: [...new Set(matches)]
      });
    }
  }

  // Sort descending by score, then ascending by name
  return results.sort((a, b) => b.score - a.score || a.feature.name.localeCompare(b.feature.name));
}
