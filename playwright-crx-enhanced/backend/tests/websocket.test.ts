import WebSocket from 'ws';
import { httpServer } from '../src/index';

describe('WebSocket Server', () => {
  let server: any;
  let ws: WebSocket;

  beforeAll((done) => {
    // Start the server on a test port
    server = httpServer.listen(0, () => {
      done();
    });
  });

  afterAll((done) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
    server.close(done);
  });

  afterEach(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  });

  it('should accept WebSocket connections', (done) => {
    const port = server.address().port;
    ws = new WebSocket(`ws://localhost:${port}/ws`);

    ws.on('open', () => {
      expect(ws.readyState).toBe(WebSocket.OPEN);
      done();
    });

    ws.on('error', (error) => {
      done(error);
    });
  });

  it('should handle authentication message', (done) => {
    const port = server.address().port;
    ws = new WebSocket(`ws://localhost:${port}/ws`);

    ws.on('open', () => {
      // Send authentication message
      ws.send(JSON.stringify({
        type: 'auth',
        token: 'test-token'
      }));
    });

    ws.on('message', (data) => {
      const message = JSON.parse(data.toString());
      
      // Should receive error for invalid token
      expect(message.type).toBe('error');
      expect(message.message).toContain('Authentication failed');
      done();
    });

    ws.on('error', (error) => {
      done(error);
    });
  });

  it('should handle test execution message without auth', (done) => {
    const port = server.address().port;
    ws = new WebSocket(`ws://localhost:${port}/ws`);

    ws.on('open', () => {
      // Send test execution message without auth
      ws.send(JSON.stringify({
        type: 'execute',
        scriptId: 'test-script-id'
      }));
    });

    ws.on('message', (data) => {
      const message = JSON.parse(data.toString());
      
      // Should receive error for unauthenticated request
      expect(message.type).toBe('error');
      expect(message.message).toContain('Authentication required');
      done();
    });

    ws.on('error', (error) => {
      done(error);
    });
  });

  it('should handle ping/pong messages', (done) => {
    const port = server.address().port;
    ws = new WebSocket(`ws://localhost:${port}/ws`);

    ws.on('open', () => {
      ws.ping();
    });

    ws.on('pong', () => {
      expect(true).toBe(true); // Connection is alive
      done();
    });

    ws.on('error', (error) => {
      done(error);
    });
  });

  it('should close connection gracefully', (done) => {
    const port = server.address().port;
    ws = new WebSocket(`ws://localhost:${port}/ws`);

    ws.on('open', () => {
      ws.close();
    });

    ws.on('close', (code) => {
      expect(code).toBe(1000); // Normal closure
      done();
    });

    ws.on('error', (error) => {
      done(error);
    });
  });
});