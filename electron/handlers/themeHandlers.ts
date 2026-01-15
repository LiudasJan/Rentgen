import { app, ipcMain } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

const getThemePath = () => path.join(app.getPath('userData'), 'theme.json');

export function registerThemeHandlers(): void {
  ipcMain.handle('get-theme', () => {
    try {
      const themePath = getThemePath();
      if (fs.existsSync(themePath)) return fs.readFileSync(themePath, 'utf-8');
    } catch (error) {
      console.error(error);
    }

    return 'light';
  });
  ipcMain.on('set-theme', (_, theme: 'light' | 'dark') => {
    try {
      fs.writeFileSync(getThemePath(), theme, 'utf-8');
    } catch (error) {
      console.error(error);
    }
  });
}
