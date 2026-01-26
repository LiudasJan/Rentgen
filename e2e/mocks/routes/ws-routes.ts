import { WebSocketServer, WebSocket } from 'ws';

export function setupWsRoutes(wss: WebSocketServer): void {
  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');

    ws.on('message', (data: Buffer) => {
      const message = data.toString();

      try {
        const parsed = JSON.parse(message);

        // Handle different message types
        switch (parsed.type) {
          case 'ping':
            ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
            break;
          case 'echo':
            ws.send(JSON.stringify({ type: 'echo', data: parsed.data }));
            break;
          case 'broadcast':
            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'broadcast', data: parsed.data }));
              }
            });
            break;
          default:
            ws.send(JSON.stringify({ type: 'response', original: parsed }));
        }
      } catch {
        // Not JSON, echo as plain text
        ws.send(JSON.stringify({ type: 'echo', data: message }));
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Send welcome message
    ws.send(JSON.stringify({ type: 'connected', message: 'Welcome to the WebSocket server' }));
  });
}
