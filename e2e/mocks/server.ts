import express, { Express, json, text } from 'express';
import { Server } from 'http';
import { WebSocketServer } from 'ws';
import { setupHttpRoutes } from './routes/http-routes';
import { setupWsRoutes } from './routes/ws-routes';

export interface MockServerOptions {
  port?: number;
  wsPath?: string;
}

export interface MockServerInstance {
  app: Express;
  server: Server;
  wss: WebSocketServer;
  baseUrl: string;
  wsUrl: string;
  close: () => Promise<void>;
}

export async function createMockServer(
  options: MockServerOptions = {}
): Promise<MockServerInstance> {
  const { port = 3456, wsPath = '/ws' } = options;

  const app = express();
  app.use(json());
  app.use(text());

  // Setup routes
  setupHttpRoutes(app);

  const server = app.listen(port);
  const wss = new WebSocketServer({ server, path: wsPath });

  setupWsRoutes(wss);

  const baseUrl = `http://localhost:${port}`;
  const wsUrl = `ws://localhost:${port}${wsPath}`;

  return {
    app,
    server,
    wss,
    baseUrl,
    wsUrl,
    close: async () => {
      return new Promise((resolve) => {
        wss.close();
        server.close(() => resolve());
      });
    },
  };
}
