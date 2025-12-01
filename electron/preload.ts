import { contextBridge, ipcRenderer } from 'electron';

interface ElectronApi {
  connectWss: (payload: any) => void;
  disconnectWss: () => void;
  loadCollection: () => Promise<any>;
  onWssEvent: (callback: (data: any) => void) => Electron.IpcRenderer;
  pingHost: (host: string) => Promise<any>;
  saveCollection: (collection: any) => Promise<{ success: boolean; error?: string }>;
  sendHttp: (payload: any) => Promise<any>;
  sendWss: (message: string) => void;
}

interface ThemeAPI {
  setTheme: (theme: 'light' | 'dark') => void;
  getTheme: () => Promise<'light' | 'dark'>;
}

contextBridge.exposeInMainWorld('electronAPI', {
  connectWss: (payload: any): void => ipcRenderer.send('wss-connect', payload),
  disconnectWss: (): void => ipcRenderer.send('wss-disconnect'),
  loadCollection: (): Promise<any> => ipcRenderer.invoke('load-collection'),
  onWssEvent: (callback): Electron.IpcRenderer => ipcRenderer.on('wss-event', (_, data) => callback(data)),
  pingHost: (host: string): Promise<any> => ipcRenderer.invoke('ping-host', host),
  saveCollection: (collection: any): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke('save-collection', collection),
  sendHttp: (payload: any): Promise<any> => ipcRenderer.invoke('http-request', payload),
  sendWss: (message: string): void => ipcRenderer.send('wss-send', message),
} as ElectronApi);

contextBridge.exposeInMainWorld('themeAPI', {
  getTheme: () => ipcRenderer.invoke('get-theme'),
  setTheme: (theme) => ipcRenderer.send('set-theme', theme),
} as ThemeAPI);

declare global {
  interface Window {
    electronAPI: ElectronApi;
    themeAPI: ThemeAPI;
  }
}
