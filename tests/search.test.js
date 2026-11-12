import assert from 'node:assert/strict';
import test from 'node:test';
import { searchCatalog } from '../src/search.js';
import { buildIndex } from '../src/indexer.js';

test('Search Engine: matches exact IDs and tags with ranking', () => {
  const index = buildIndex();

  const results = searchCatalog('sparkline', {}, index);
  assert.ok(results.length > 0);
  assert.equal(results[0].feature.id, 'sparkline-svg');
  assert.ok(results[0].score >= 50);
});

test('Search Engine: filters by category, technology, and maturity', () => {
  const index = buildIndex();

  const authOnly = searchCatalog('', { category: 'auth' }, index);
  assert.equal(authOnly.length, 1);
  assert.equal(authOnly[0].feature.id, 'biometric-keychain');

  const storageOnly = searchCatalog('', { tech: 'sqlite' }, index);
  assert.equal(storageOnly.length, 1);
  assert.equal(storageOnly[0].feature.id, 'sqlite-kv-store');

  const stableOnly = searchCatalog('', { maturity: 'stable' }, index);
  assert.equal(stableOnly.length, 3);

  const betaOnly = searchCatalog('', { maturity: 'beta' }, index);
  assert.equal(betaOnly.length, 1);

  const expOnly = searchCatalog('', { maturity: 'experimental' }, index);
  assert.equal(expOnly.length, 1);
});

test('Search Engine: empty queries vs punctuation-only and malformed queries', () => {
  const index = buildIndex();

  // Genuinely empty or whitespace query returns all candidate features
  const emptyRes = searchCatalog('', {}, index);
  assert.equal(emptyRes.length, index.total_features);

  const whitespaceRes = searchCatalog('    ', {}, index);
  assert.equal(whitespaceRes.length, index.total_features);

  // Queries containing non-whitespace characters but zero valid tokens return zero results
  const punctuationQueries = ['@#$!', '???', '...', '---', '::', '  *&^%  '];
  for (const q of punctuationQueries) {
    const res = searchCatalog(q, {}, index);
    assert.equal(res.length, 0, `Expected 0 results for punctuation query: '${q}'`);
  }
});
