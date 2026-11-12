# SQLite Key-Value Store

Resilient, high-throughput key-value store with TTL expiration and JSON document querying.

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
