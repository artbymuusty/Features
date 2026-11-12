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
  assert.equal(stableOnly.length, 5);
});
