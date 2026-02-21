import { contextBridge, ipcRenderer } from 'electron';
import type { TestResults, ExportResult, ImportResult, PostmanCollection } from '../src/types';

interface ElectronApi {
  connectWss: (payload: any) => void;
  disconnectWss: () => void;
  exportPostmanCollection: (collection: PostmanCollection) => Promise<ExportResult>;
  generateCertificate: (results: TestResults) => Promise<ExportResult>;
  getAppVersion: () => Promise<string>;
  importPostmanCollection: () => Promise<ImportResult>;
  readHarFile: () => Promise<{ canceled?: boolean; content?: string; error?: string }>;
  loadCollection: () => Promise<any>;
  loadEnvironments: () => Promise<any>;
  loadDynamicVariables: () => Promise<any>;
  loadHistory: () => Promise<any>;
  onWssEvent: (callback: (data: any) => void) => () => void;
  openExternal: (url: string) => void;
  pingHost: (host: string) => Promise<any>;
  saveCollection: (collection: any) => Promise<{ success: boolean; error?: string }>;
  saveEnvironments: (environments: any) => Promise<{ success: boolean; error?: string }>;
  saveDynamicVariables: (variables: any) => Promise<{ success: boolean; error?: string }>;
  saveHistory: (entries: any) => Promise<{ success: boolean; error?: string }>;
  saveReport: (payload: {
    defaultPath?: string;
    content: string;
    filters?: Electron.FileFilter[];
  }) => Promise<{ canceled: boolean; filePath?: string; error?: string }>;
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
  exportPostmanCollection: (collection: PostmanCollection): Promise<ExportResult> =>
    ipcRenderer.invoke('export-postman-collection', collection),
  generateCertificate: (results: TestResults): Promise<ExportResult> =>
    ipcRenderer.invoke('generate-certificate', results),
  getAppVersion: (): Promise<string> => ipcRenderer.invoke('get-app-version'),
  importPostmanCollection: (): Promise<ImportResult> => ipcRenderer.invoke('import-postman-collection'),
  readHarFile: (): Promise<{ canceled?: boolean; content?: string; error?: string }> =>
    ipcRenderer.invoke('read-har-file'),
  loadCollection: (): Promise<any> => ipcRenderer.invoke('load-collection'),
  loadEnvironments: (): Promise<any> => ipcRenderer.invoke('load-environments'),
  loadDynamicVariables: (): Promise<any> => ipcRenderer.invoke('load-dynamic-variables'),
  loadHistory: (): Promise<any> => ipcRenderer.invoke('load-history'),
  onWssEvent: (callback): (() => void) => {
    const handler = (_: Electron.IpcRendererEvent, data: any) => callback(data);
    ipcRenderer.on('wss-event', handler);
    return () => {
      ipcRenderer.off('wss-event', handler);
    };
  },
  openExternal: (url: string) => ipcRenderer.send('open-external', url),
  pingHost: (host: string): Promise<any> => ipcRenderer.invoke('ping-host', host),
  saveCollection: (collection: any): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke('save-collection', collection),
  saveEnvironments: (environments: any): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke('save-environments', environments),
  saveDynamicVariables: (variables: any): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke('save-dynamic-variables', variables),
  saveHistory: (entries: any): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke('save-history', entries),
  saveReport: (payload: { defaultPath?: string; content: string; filters?: Electron.FileFilter[] }) =>
    ipcRenderer.invoke('save-report', payload),
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
