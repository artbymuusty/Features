# MCP Stdio Bridge

Model Context Protocol JSON-RPC 2.0 message framer and stdio transport adapter supporting both line-delimited and `Content-Length:` header framing.

## Usage

```javascript
import { MCPStdioBridge } from './index.js';

// Line-delimited or Content-Length framing
const bridge = new MCPStdioBridge({
  inStream: process.stdin,
  outStream: process.stdout,
  framing: 'content-length' // or 'lines'
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
