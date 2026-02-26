import { app, ipcMain } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { initialState, SettingsState } from '../../src/store/slices/settingsSlice';

const getSettingsPath = () => path.join(app.getPath('userData'), 'settings.json');

export function registerSettingsHandlers(): void {
  ipcMain.handle('load-settings', () => {
    try {
      const settingsPath = getSettingsPath();
      if (fs.existsSync(settingsPath)) return JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
    } catch (error) {
      console.error(error);
    }

    return initialState;
  });
  ipcMain.on('save-settings', (_, settings: SettingsState) => {
    try {
      fs.writeFileSync(getSettingsPath(), JSON.stringify(settings, null, 2), 'utf-8');
    } catch (error) {
      console.error(error);
    }
  });
}
