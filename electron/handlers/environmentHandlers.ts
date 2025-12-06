import { app, ipcMain } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { Environment } from '../../src/types';

const getEnvironmentsPath = () => path.join(app.getPath('userData'), 'environments.json');

export function createEmptyEnvironments(): Environment[] {
  return [];
}

export function registerEnvironmentHandlers(): void {
  ipcMain.handle('load-environments', async () => {
    const environmentsPath = getEnvironmentsPath();
    try {
      if (fs.existsSync(environmentsPath)) {
        const data = fs.readFileSync(environmentsPath, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading environments:', error);
    }
    return createEmptyEnvironments();
  });

  ipcMain.handle('save-environments', async (_, environments: Environment[]) => {
    const environmentsPath = getEnvironmentsPath();
    try {
      fs.writeFileSync(environmentsPath, JSON.stringify(environments, null, 2), 'utf-8');
      return { success: true };
    } catch (error) {
      console.error('Error saving environments:', error);
      return { success: false, error: String(error) };
    }
  });
}
