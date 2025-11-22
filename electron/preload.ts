import { contextBridge, ipcRenderer } from 'electron';

interface ElectronApi {
  connectWss: (payload: any) => void;
  onWssEvent: (cb: (data: any) => void) => Electron.IpcRenderer;
  pingHost: (host: string) => Promise<any>;
  reloadApp: () => void;
  sendHttp: (payload: any) => Promise<any>;
  sendWss: (message: string) => void;
}

contextBridge.exposeInMainWorld('electronAPI', {
  connectWss: (payload: any): void => ipcRenderer.send('wss-connect', payload),
  onWssEvent: (cb: (data: any) => any): Electron.IpcRenderer => ipcRenderer.on('wss-event', (_, data) => cb(data)),
  pingHost: (host: string): Promise<any> => ipcRenderer.invoke('ping-host', host),
  reloadApp: (): void => ipcRenderer.send('reload-app'),
  sendHttp: (payload: any): Promise<any> => ipcRenderer.invoke('http-request', payload),
  sendWss: (message: string): void => ipcRenderer.send('wss-send', message),
} as ElectronApi);

declare global {
  interface Window {
    electronAPI: ElectronApi;
  }
}
