import { app, ipcMain, nativeTheme } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { initialState, SettingsState } from '../../src/store/slices/settingsSlice';

const getSettingsPath = () => path.join(app.getPath('userData'), 'settings.json');

export function registerSettingsHandlers(): void {
  ipcMain.handle('load-settings', () => loadSettings());
  ipcMain.on('save-settings', (_, settings: SettingsState) => {
    try {
      fs.writeFileSync(getSettingsPath(), JSON.stringify(settings, null, 2), 'utf-8');
      nativeTheme.themeSource = settings.theme;
    } catch (error) {
      console.error(error);
    }
  });
}

export function loadSettings(): SettingsState {
  try {
    const settingsPath = getSettingsPath();
    if (fs.existsSync(settingsPath)) return JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
  } catch (error) {
    console.error(error);
  }

  return initialState;
}
