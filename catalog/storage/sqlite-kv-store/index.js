import { DatabaseSync } from 'node:sqlite';

/**
 * SQLite backed Key-Value Store with TTL and Namespacing
 */
export class SQLiteKVStore {
  /**
   * @param {string} [filename=':memory:']
   * @param {object} [options={}]
   */
  constructor(filename = ':memory:', options = {}) {
    this.namespace = options.namespace || 'default';
    this.db = new DatabaseSync(filename);
    this._initSchema();
  }

  _initSchema() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS kv_entries (
        namespace TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        expires_at INTEGER,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        PRIMARY KEY (namespace, key)
      );
      CREATE INDEX IF NOT EXISTS idx_kv_expires ON kv_entries (expires_at);
    `);
  }

  /**
   * Put a key-value pair with optional TTL in milliseconds
   */
  set(key, value, ttlMs = null) {
    const now = Date.now();
    const expiresAt = ttlMs ? now + ttlMs : null;
    const serialized = JSON.stringify(value);

    const stmt = this.db.prepare(`
      INSERT INTO kv_entries (namespace, key, value, expires_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(namespace, key) DO UPDATE SET
        value = excluded.value,
        expires_at = excluded.expires_at,
        updated_at = excluded.updated_at
    `);

    stmt.run(this.namespace, key, serialized, expiresAt, now, now);
    return true;
  }

  /**
   * Get value by key, returns null if expired or missing
   */
  get(key) {
    const now = Date.now();
    const stmt = this.db.prepare(`
      SELECT value, expires_at FROM kv_entries
      WHERE namespace = ? AND key = ?
    `);

    const row = stmt.get(this.namespace, key);
    if (!row) return null;

    if (row.expires_at && row.expires_at <= now) {
      this.delete(key);
      return null;
    }

    try {
      return JSON.parse(row.value);
    } catch {
      return row.value;
    }
  }

  /**
   * Delete entry
   */
  delete(key) {
    const stmt = this.db.prepare(`
      DELETE FROM kv_entries WHERE namespace = ? AND key = ?
    `);
    stmt.run(this.namespace, key);
    return true;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Clear all entries in the namespace
   */
  clear() {
    const stmt = this.db.prepare(`DELETE FROM kv_entries WHERE namespace = ?`);
    stmt.run(this.namespace);
    return true;
  }

  /**
   * Purge all expired entries across all namespaces
   */
  purgeExpired() {
    const now = Date.now();
    const stmt = this.db.prepare(`DELETE FROM kv_entries WHERE expires_at IS NOT NULL AND expires_at <= ?`);
    stmt.run(now);
  }

  /**
   * List all valid keys in namespace
   */
  keys() {
    this.purgeExpired();
    const stmt = this.db.prepare(`SELECT key FROM kv_entries WHERE namespace = ? ORDER BY key ASC`);
    const rows = stmt.all(this.namespace);
    return rows.map(r => r.key);
  }

  close() {
    this.db.close();
  }
}
