import { DynamicVariable, PostmanCollection } from './';
import { HistoryEntry } from './history';
import { SettingsState } from '../store/slices/settingsSlice';
import { Environment } from './environment';

/** Data payload inside a .rentgen export file */
export interface ProjectData {
  collection: PostmanCollection;
  environments: Environment[];
  dynamicVariables: DynamicVariable[];
  history: HistoryEntry[];
  settings: SettingsState;
}

/** Metadata header of a .rentgen export file */
export interface ProjectMeta {
  version: number;
  appVersion: string;
  exportedAt: string;
  checksum: string;
}

/** Complete .rentgen file structure */
export interface ProjectFile {
  meta: ProjectMeta;
  data: ProjectData;
}

/** Integrity verification result */
export type IntegrityStatus = 'verified' | 'modified' | 'missing';

/** Result returned from the import-project IPC handler */
export interface ProjectImportResult {
  canceled?: boolean;
  success?: boolean;
  error?: string;
  data?: ProjectData;
  meta?: ProjectMeta;
  integrityStatus?: IntegrityStatus;
  fileName?: string;
}

/** Result returned from the export-project IPC handler */
export interface ProjectExportResult {
  canceled?: boolean;
  success?: boolean;
  error?: string;
  filePath?: string;
}
