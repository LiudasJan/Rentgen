import { app, dialog, ipcMain } from 'electron';
import crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import type {
  IntegrityStatus,
  ProjectData,
  ProjectExportResult,
  ProjectFile,
  ProjectImportResult,
} from '../../src/types';

const userDataPath = () => app.getPath('userData');

function readJsonFile(filePath: string): unknown {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function canonicalize(obj: unknown): string {
  return JSON.stringify(obj, (_key, value) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return Object.keys(value)
        .sort()
        .reduce<Record<string, unknown>>((sorted, k) => {
          sorted[k] = value[k];
          return sorted;
        }, {});
    }
    return value;
  });
}

function computeChecksum(data: ProjectData): string {
  const canonical = canonicalize(data);
  return `sha256:${crypto.createHash('sha256').update(canonical, 'utf-8').digest('hex')}`;
}

function verifyChecksum(checksum: string | undefined, data: ProjectData): IntegrityStatus {
  if (!checksum) return 'missing';
  return computeChecksum(data) === checksum ? 'verified' : 'modified';
}

function validateProjectFile(parsed: unknown): parsed is ProjectFile {
  if (!parsed || typeof parsed !== 'object') return false;
  const file = parsed as Record<string, unknown>;
  if (!file.meta || typeof file.meta !== 'object') return false;
  if (!file.data || typeof file.data !== 'object') return false;

  const data = file.data as Record<string, unknown>;
  return (
    'collection' in data &&
    'environments' in data &&
    'dynamicVariables' in data &&
    'history' in data &&
    'settings' in data
  );
}

export function registerProjectHandlers(): void {
  ipcMain.handle('export-project', async (): Promise<ProjectExportResult> => {
    const base = userDataPath();

    const data: ProjectData = {
      collection: (readJsonFile(path.join(base, 'collection.json')) as ProjectData['collection']) ?? {
        info: {
          name: 'Rentgen',
          description: '',
          schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
        },
        item: [],
      },
      environments: (readJsonFile(path.join(base, 'environments.json')) as ProjectData['environments']) ?? [],
      dynamicVariables:
        (readJsonFile(path.join(base, 'dynamic-variables.json')) as ProjectData['dynamicVariables']) ?? [],
      history: (readJsonFile(path.join(base, 'history.json')) as ProjectData['history']) ?? [],
      settings:
        (readJsonFile(path.join(base, 'settings.json')) as ProjectData['settings']) ?? ({} as ProjectData['settings']),
    };

    const checksum = computeChecksum(data);

    const projectFile: ProjectFile = {
      meta: {
        version: 1,
        appVersion: app.getVersion(),
        exportedAt: new Date().toISOString(),
        checksum,
      },
      data,
    };

    const result = await dialog.showSaveDialog({
      title: 'Export Project',
      defaultPath: 'rentgen-project.rentgen',
      filters: [
        { name: 'Rentgen Project', extensions: ['rentgen'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    });

    if (result.canceled || !result.filePath) return { canceled: true };

    try {
      fs.writeFileSync(result.filePath, JSON.stringify(projectFile, null, 2), 'utf-8');
      return { success: true, filePath: result.filePath };
    } catch (error) {
      return { error: String(error) };
    }
  });

  ipcMain.handle('import-project', async (): Promise<ProjectImportResult> => {
    const result = await dialog.showOpenDialog({
      title: 'Import Project',
      filters: [
        { name: 'Rentgen Project', extensions: ['rentgen', 'json'] },
        { name: 'All Files', extensions: ['*'] },
      ],
      properties: ['openFile'],
    });

    if (result.canceled || result.filePaths.length === 0) return { canceled: true };

    try {
      const content = fs.readFileSync(result.filePaths[0], 'utf-8');
      const parsed = JSON.parse(content);

      if (!validateProjectFile(parsed)) {
        return { error: 'Invalid Rentgen project file. Missing required data sections.' };
      }

      const integrityStatus = verifyChecksum(parsed.meta.checksum, parsed.data);

      return {
        success: true,
        data: parsed.data,
        meta: parsed.meta,
        integrityStatus,
        fileName: path.basename(result.filePaths[0]),
      };
    } catch (error) {
      if (error instanceof SyntaxError) return { error: 'Invalid JSON file.' };
      return { error: String(error) };
    }
  });
}
