# Precision Cron Scheduler

In-memory precision job scheduler with drift compensation, jitter, and retry backoff.

## Usage

```javascript
import { PrecisionCronScheduler } from './index.js';

const scheduler = new PrecisionCronScheduler();

scheduler.register('sync-cache', async () => {
  await doPeriodicSync();
}, {
  intervalMs: 60000,
  jitterMs: 5000,
  maxRetries: 3
});

scheduler.start();
```

## Running Tests

```bash
node --test test.js
```
