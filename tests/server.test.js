import assert from 'node:assert/strict';
import test from 'node:test';
import { startServer } from '../src/server.js';

test('Server & REST API: serves features, index, and individual detail', async () => {
  const { server, url } = await startServer(8799);

  try {
    // 1. Fetch index
    const resIndex = await fetch(`${url}/api/index`);
    assert.equal(resIndex.status, 200);
    const indexData = await resIndex.json();
    assert.equal(indexData.total_features, 5);

    // 2. Search API
    const resSearch = await fetch(`${url}/api/features?q=sqlite`);
    assert.equal(resSearch.status, 200);
    const searchResults = await resSearch.json();
    assert.equal(searchResults.length, 1);
    assert.equal(searchResults[0].feature.id, 'sqlite-kv-store');

    // 3. Single feature detail API
    const resDetail = await fetch(`${url}/api/features/sparkline-svg?content=true`);
    assert.equal(resDetail.status, 200);
    const detail = await resDetail.json();
    assert.equal(detail.id, 'sparkline-svg');
    assert.ok(detail._filesContent['index.js']);
  } finally {
    server.close();
  }
});
