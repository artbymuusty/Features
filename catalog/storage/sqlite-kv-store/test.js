import assert from 'node:assert/strict';
import test from 'node:test';
import { SQLiteKVStore } from './index.js';

test('SQLiteKVStore: basic set, get, has, and delete', () => {
  const store = new SQLiteKVStore(':memory:', { namespace: 'test-app' });

  assert.equal(store.has('user:101'), false);
  store.set('user:101', { name: 'Alice', active: true });
  assert.equal(store.has('user:101'), true);

  const user = store.get('user:101');
  assert.deepEqual(user, { name: 'Alice', active: true });

  store.delete('user:101');
  assert.equal(store.get('user:101'), null);
  assert.equal(store.has('user:101'), false);

  store.close();
});

test('SQLiteKVStore: ttl expiration', async () => {
  const store = new SQLiteKVStore(':memory:');

  store.set('temp_token', 'xyz-999', 50); // 50ms TTL
  assert.equal(store.get('temp_token'), 'xyz-999');

  await new Promise(r => setTimeout(r, 70));
  assert.equal(store.get('temp_token'), null);

  store.close();
});

test('SQLiteKVStore: namespace isolation and keys list', () => {
  const storeA = new SQLiteKVStore(':memory:', { namespace: 'nsA' });
  const storeB = new SQLiteKVStore(':memory:', { namespace: 'nsB' });

  storeA.set('key1', 'valA');
  storeB.set('key1', 'valB');

  assert.equal(storeA.get('key1'), 'valA');
  assert.equal(storeB.get('key1'), 'valB');
  assert.deepEqual(storeA.keys(), ['key1']);

  storeA.close();
  storeB.close();
});
