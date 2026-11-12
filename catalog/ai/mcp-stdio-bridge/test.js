import assert from 'node:assert/strict';
import test from 'node:test';
import { PassThrough } from 'node:stream';
import { MCPStdioBridge } from './index.js';

test('MCPStdioBridge: bidirectional line-delimited communication', async () => {
  const serverToClient = new PassThrough();
  const clientToServer = new PassThrough();

  const client = new MCPStdioBridge({ inStream: serverToClient, outStream: clientToServer, framing: 'lines' });
  const server = new MCPStdioBridge({ inStream: clientToServer, outStream: serverToClient, framing: 'lines' });

  server.on('request', ({ method, params, respond }) => {
    if (method === 'tools/list') {
      respond({ tools: [{ name: 'calculator', description: 'Evaluate math' }] });
    }
  });

  const res = await client.request('tools/list', {});
  assert.equal(res.tools.length, 1);
  assert.equal(res.tools[0].name, 'calculator');
});

test('MCPStdioBridge: Content-Length header framing communication', async () => {
  const serverToClient = new PassThrough();
  const clientToServer = new PassThrough();

  const client = new MCPStdioBridge({ inStream: serverToClient, outStream: clientToServer, framing: 'content-length' });
  const server = new MCPStdioBridge({ inStream: clientToServer, outStream: serverToClient, framing: 'content-length' });

  server.on('request', ({ method, params, respond }) => {
    if (method === 'ping') {
      respond({ status: 'pong' });
    }
  });

  const res = await client.request('ping', {});
  assert.equal(res.status, 'pong');
});

test('MCPStdioBridge: fragmented chunk feed with Content-Length', async () => {
  const bridge = new MCPStdioBridge();
  const receivedMessages = [];

  bridge.on('notification', (msg) => {
    receivedMessages.push(msg);
  });

  const payload = JSON.stringify({ jsonrpc: '2.0', method: 'notify/status', params: { code: 200 } });
  const framed = `Content-Length: ${Buffer.byteLength(payload, 'utf8')}\r\n\r\n${payload}`;

  // Deliver packet in 5 small byte chunks
  const chunkSize = 10;
  for (let i = 0; i < framed.length; i += chunkSize) {
    bridge.feed(framed.slice(i, i + chunkSize));
  }

  assert.equal(receivedMessages.length, 1);
  assert.equal(receivedMessages[0].method, 'notify/status');
  assert.equal(receivedMessages[0].params.code, 200);
});

test('MCPStdioBridge: notification dispatching without response', async () => {
  const stream = new PassThrough();
  const receiver = new MCPStdioBridge({ inStream: stream });

  const notificationReceived = new Promise(resolve => {
    receiver.on('notification', ({ method, params }) => {
      resolve({ method, params });
    });
  });

  stream.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized', params: { ready: true } }) + '\n');

  const received = await notificationReceived;
  assert.equal(received.method, 'notifications/initialized');
  assert.equal(received.params.ready, true);
});

test('MCPStdioBridge: handles error responses gracefully', async () => {
  const streamIn = new PassThrough();
  const streamOut = new PassThrough();
  const client = new MCPStdioBridge({ inStream: streamIn, outStream: streamOut });

  streamOut.on('data', chunk => {
    const raw = chunk.toString('utf8');
    const parsed = JSON.parse(raw);
    streamIn.write(JSON.stringify({ jsonrpc: '2.0', id: parsed.id, error: { code: -32601, message: 'Method not found' } }) + '\n');
  });

  await assert.rejects(
    async () => client.request('invalid_method', {}),
    /Method not found/
  );
});
