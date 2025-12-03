import { ipcMain } from 'electron';

export function registerThemeHandlers(store: any): void {
  ipcMain.handle('get-theme', async () => {
    return store.get('theme');
  });

  ipcMain.on('set-theme', (_, theme: 'light' | 'dark') => {
    store.set('theme', theme);
  });
}
