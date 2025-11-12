import { contextBridge, ipcRenderer } from 'electron';

interface ElectronApi {
  sendHttp: (payload: any) => Promise<any>;
  connectWss: (payload: any) => void;
  sendWss: (message: string) => void;
  onWssEvent: (cb: (data: any) => void) => Electron.IpcRenderer;
  pingHost: (host: string) => Promise<any>;
}

contextBridge.exposeInMainWorld('electronAPI', {
  sendHttp: (payload: any): Promise<any> => ipcRenderer.invoke('http-request', payload),
  connectWss: (payload: any): void => ipcRenderer.send('wss-connect', payload),
  sendWss: (message: string): void => ipcRenderer.send('wss-send', message),
  onWssEvent: (cb: (data: any) => any): Electron.IpcRenderer => ipcRenderer.on('wss-event', (_, data) => cb(data)),
  pingHost: (host: string): Promise<any> => ipcRenderer.invoke('ping-host', host),
} as ElectronApi);

declare global {
  interface Window {
    electronAPI: ElectronApi;
  }
}
