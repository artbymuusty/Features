# SQLite Key-Value Store

Resilient key-value store with TTL expiration backed by native Node.js SQLite (`node:sqlite`).

> **Runtime Requirement:** Node.js >= 22.5.0 (Node 22 built-in `node:sqlite`).

## Usage

```javascript
import { SQLiteKVStore } from './index.js';

const store = new SQLiteKVStore('./data.db', { namespace: 'sessions' });

// Store with 1 hour TTL
store.set('session:abcd', { userId: 42, role: 'admin' }, 3600 * 1000);

// Retrieve
const session = store.get('session:abcd');
console.log(session.role); // 'admin'

store.close();
```

## Running Tests

```bash
node --test test.js
```
