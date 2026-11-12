import assert from 'node:assert/strict';
import test from 'node:test';
import { PassThrough } from 'node:stream';
import { MCPStdioBridge } from './index.js';

test('MCPStdioBridge: bidirectional communication between two bridged instances', async () => {
  const serverToClient = new PassThrough();
  const clientToServer = new PassThrough();

  const client = new MCPStdioBridge({ inStream: serverToClient, outStream: clientToServer });
  const server = new MCPStdioBridge({ inStream: clientToServer, outStream: serverToClient });

  server.on('request', ({ method, params, respond }) => {
    if (method === 'tools/list') {
      respond({ tools: [{ name: 'calculator', description: 'Evaluate math' }] });
    }
  });

  const res = await client.request('tools/list', {});
  assert.equal(res.tools.length, 1);
  assert.equal(res.tools[0].name, 'calculator');
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
    const parsed = JSON.parse(chunk.toString('utf8'));
    streamIn.write(JSON.stringify({ jsonrpc: '2.0', id: parsed.id, error: { code: -32601, message: 'Method not found' } }) + '\n');
  });

  await assert.rejects(
    async () => client.request('invalid_method', {}),
    /Method not found/
  );
});
