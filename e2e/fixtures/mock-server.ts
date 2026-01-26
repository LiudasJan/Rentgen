import { test as base } from './electron-app';
import express, { Express, Request, Response, json, text, urlencoded } from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { setupHttpRoutes } from '../mocks/routes/http-routes';

type MockServerFixtures = {
  mockServer: {
    baseUrl: string;
    wsUrl: string;
    setResponse: (path: string, response: object, status?: number) => void;
    setHandler: (path: string, handler: (req: Request, res: Response) => void) => void;
    getReceivedRequests: (path: string) => Array<{ method: string; body: unknown; headers: Record<string, string> }>;
    clearRequests: () => void;
  };
};

export const test = base.extend<MockServerFixtures>({
  // eslint-disable-next-line no-empty-pattern
  mockServer: async ({} , use) => {
    const app: Express = express();
    const routes: Map<string, { response: object; status: number }> = new Map();
    const handlers: Map<string, (req: Request, res: Response) => void> = new Map();
    const receivedRequests: Map<string, Array<{ method: string; body: unknown; headers: Record<string, string> }>> = new Map();

    app.use(json());
    app.use(text());
    app.use(urlencoded({ extended: true }));

    // Request logging middleware
    app.use((req, res, next) => {
      const requests = receivedRequests.get(req.path) || [];
      requests.push({
        method: req.method,
        body: req.body,
        headers: req.headers as Record<string, string>,
      });
      receivedRequests.set(req.path, requests);
      next();
    });

    // Set up predefined HTTP routes (Pokemon, users, errors, etc.)
    setupHttpRoutes(app);

    const server = app.listen(3456);
    const wss = new WebSocketServer({ server, path: '/ws' });

    wss.on('connection', (ws: WebSocket) => {
      ws.on('message', (data: Buffer) => {
        ws.send(JSON.stringify({ echo: data.toString() }));
      });
    });

    await use({
      baseUrl: 'http://localhost:3456',
      wsUrl: 'ws://localhost:3456/ws',
      setResponse: (path: string, response: object, status = 200) => {
        routes.set(path, { response, status });
      },
      setHandler: (path: string, handler: (req: Request, res: Response) => void) => {
        handlers.set(path, handler);
      },
      getReceivedRequests: (path: string) => {
        return receivedRequests.get(path) || [];
      },
      clearRequests: () => {
        receivedRequests.clear();
      },
    });

    wss.close();
    server.close();
  },
});

export { expect } from '@playwright/test';
