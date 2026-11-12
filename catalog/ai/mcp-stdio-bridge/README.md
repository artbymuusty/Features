# MCP Stdio Bridge

Model Context Protocol JSON-RPC 2.0 message framer and stdio transport adapter.

## Usage

```javascript
import { MCPStdioBridge } from './index.js';

const bridge = new MCPStdioBridge({
  inStream: process.stdin,
  outStream: process.stdout
});

bridge.on('request', ({ method, params, respond, error }) => {
  if (method === 'ping') {
    return respond({ status: 'pong' });
  }
  error(-32601, 'Method not found');
});
```

## Running Tests

```bash
node --test test.js
```
