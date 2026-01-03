import { app, ipcMain } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { DynamicVariable, Environment } from '../../src/types';

const getEnvironmentsPath = () => path.join(app.getPath('userData'), 'environments.json');
const getDynamicVariablesPath = () => path.join(app.getPath('userData'), 'dynamic-variables.json');

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

  // Dynamic variables handlers
  ipcMain.handle('load-dynamic-variables', async () => {
    const filePath = getDynamicVariablesPath();
    try {
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading dynamic variables:', error);
    }
    return [];
  });

  ipcMain.handle('save-dynamic-variables', async (_, variables: DynamicVariable[]) => {
    const filePath = getDynamicVariablesPath();
    try {
      fs.writeFileSync(filePath, JSON.stringify(variables, null, 2), 'utf-8');
      return { success: true };
    } catch (error) {
      console.error('Error saving dynamic variables:', error);
      return { success: false, error: String(error) };
    }
  });
}
