import { app, ipcMain } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

const getHistoryPath = () => path.join(app.getPath('userData'), 'history.json');

export function registerHistoryHandlers(): void {
  ipcMain.handle('load-history', async () => {
    const historyPath = getHistoryPath();
    try {
      if (fs.existsSync(historyPath)) {
        const data = fs.readFileSync(historyPath, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
    return [];
  });

  ipcMain.handle('save-history', async (_, entries) => {
    const historyPath = getHistoryPath();
    try {
      fs.writeFileSync(historyPath, JSON.stringify(entries, null, 2), 'utf-8');
      return { success: true };
    } catch (error) {
      console.error('Error saving history:', error);
      return { success: false, error: String(error) };
    }
  });
}
