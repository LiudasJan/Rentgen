import { ipcMain } from 'electron';
import { WebSocket } from 'ws';

let ws: WebSocket | null = null;

export function registerWssHandlers(): void {
  ipcMain.on('wss-connect', (event, { url, headers }) => {
    if (ws) {
      ws.close();
      ws = null;
    }

    ws = new WebSocket(url, { headers });
    ws.on('open', () => {
      event.sender.send('wss-event', { type: 'open', data: url });
    });

    ws.on('message', (data) => {
      event.sender.send('wss-event', { type: 'message', data: data.toString() });
    });

    ws.on('error', (error) => {
      event.sender.send('wss-event', { type: 'error', error: String(error) });
    });

    ws.on('close', () => {
      event.sender.send('wss-event', { type: 'close', data: url });
    });
  });

  ipcMain.on('wss-disconnect', () => {
    if (ws) {
      ws.close();
      ws = null;
    }
  });

  ipcMain.on('wss-send', (_, message) => {
    if (ws) ws.send(message);
  });
}
