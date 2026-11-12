import { EventEmitter } from 'node:events';

/**
 * MCP Stdio JSON-RPC 2.0 Message Framer and Transport Bridge
 * Supports both line-delimited JSON and Content-Length header framing.
 */
export class MCPStdioBridge extends EventEmitter {
  constructor(options = {}) {
    super();
    this.inStream = options.inStream || null;
    this.outStream = options.outStream || null;
    this.framing = options.framing || 'lines'; // 'lines' or 'content-length'
    this.defaultTimeout = options.timeout || 5000;
    this.buffer = '';
    this.pendingRequests = new Map();
    this.nextId = 1;

    if (this.inStream) {
      this._bindInputStream();
    }
  }

  _bindInputStream() {
    this.inStream.on('data', chunk => {
      this.feed(chunk.toString('utf8'));
    });
  }

  /**
   * Feed raw text chunks into framing buffer
   */
  feed(chunk) {
    this.buffer += chunk;
    this._processBuffer();
  }

  _processBuffer() {
    let keepParsing = true;

    while (keepParsing && this.buffer.length > 0) {
      const trimmedStart = this.buffer.trimStart();
      if (!trimmedStart) {
        this.buffer = '';
        break;
      }

      // Check for Content-Length header framing
      if (/^content-length:/i.test(trimmedStart)) {
        const headerMatch = trimmedStart.match(/^content-length:\s*(\d+)/i);
        if (!headerMatch) {
          keepParsing = false;
          break;
        }

        const length = parseInt(headerMatch[1], 10);
        let headerLen = -1;
        const doubleCrLf = trimmedStart.indexOf('\r\n\r\n');
        if (doubleCrLf !== -1) {
          headerLen = doubleCrLf + 4;
        } else {
          const doubleLf = trimmedStart.indexOf('\n\n');
          if (doubleLf !== -1) {
            headerLen = doubleLf + 2;
          }
        }

        if (headerLen === -1) {
          keepParsing = false;
          break; // Incomplete header
        }

        const totalNeeded = headerLen + length;
        if (trimmedStart.length < totalNeeded) {
          keepParsing = false;
          break; // Incomplete payload body
        }

        const bodyStr = trimmedStart.slice(headerLen, totalNeeded);
        this.buffer = trimmedStart.slice(totalNeeded);

        try {
          const msg = JSON.parse(bodyStr);
          this._handleMessage(msg);
        } catch (err) {
          this.emit('error', new Error(`Invalid JSON-RPC content frame: ${err.message}`));
        }
      } else {
        // Line-delimited framing
        const newlineIndex = this.buffer.indexOf('\n');
        if (newlineIndex === -1) {
          keepParsing = false;
          break;
        }

        const line = this.buffer.slice(0, newlineIndex).trim();
        this.buffer = this.buffer.slice(newlineIndex + 1);

        if (line) {
          try {
            const msg = JSON.parse(line);
            this._handleMessage(msg);
          } catch (err) {
            this.emit('error', new Error(`Invalid JSON-RPC frame: ${err.message}`));
          }
        }
      }
    }
  }

  _handleMessage(msg) {
    if (!msg || typeof msg !== 'object') return;

    // Response to a request we sent
    if (msg.id !== undefined && (msg.result !== undefined || msg.error !== undefined)) {
      const pending = this.pendingRequests.get(msg.id);
      if (pending) {
        clearTimeout(pending.timer);
        this.pendingRequests.delete(msg.id);
        if (msg.error) {
          pending.reject(new Error(msg.error.message || `JSON-RPC error ${msg.error.code}`));
        } else {
          pending.resolve(msg.result);
        }
      }
      return;
    }

    // Incoming Request
    if (msg.method && msg.id !== undefined) {
      this.emit('request', {
        id: msg.id,
        method: msg.method,
        params: msg.params,
        respond: (result) => this.respond(msg.id, result),
        error: (code, message) => this.respondError(msg.id, code, message)
      });
      return;
    }

    // Incoming Notification
    if (msg.method && msg.id === undefined) {
      this.emit('notification', {
        method: msg.method,
        params: msg.params
      });
      return;
    }
  }

  /**
   * Send JSON-RPC Request and wait for response
   */
  async request(method, params = {}, timeout = this.defaultTimeout) {
    const id = this.nextId++;
    const payload = {
      jsonrpc: '2.0',
      id,
      method,
      params
    };

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`MCP request '${method}' (id: ${id}) timed out after ${timeout}ms`));
      }, timeout);

      this.pendingRequests.set(id, { resolve, reject, timer });
      this._write(payload);
    });
  }

  /**
   * Send notification (no response expected)
   */
  notify(method, params = {}) {
    const payload = {
      jsonrpc: '2.0',
      method,
      params
    };
    this._write(payload);
  }

  /**
   * Respond to incoming request with result
   */
  respond(id, result) {
    const payload = {
      jsonrpc: '2.0',
      id,
      result
    };
    this._write(payload);
  }

  /**
   * Respond to incoming request with error
   */
  respondError(id, code, message) {
    const payload = {
      jsonrpc: '2.0',
      id,
      error: { code, message }
    };
    this._write(payload);
  }

  _write(obj) {
    const payload = JSON.stringify(obj);
    let formatted;
    if (this.framing === 'content-length') {
      const byteLen = Buffer.byteLength(payload, 'utf8');
      formatted = `Content-Length: ${byteLen}\r\n\r\n${payload}`;
    } else {
      formatted = payload + '\n';
    }

    if (this.outStream && typeof this.outStream.write === 'function') {
      this.outStream.write(formatted);
    }
    this.emit('raw_write', formatted);
  }
}
