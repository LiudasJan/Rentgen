import * as fs from 'fs';
import * as path from 'path';
import { computeChecksum } from '../../shared/checksum';
import type {
  IntegrityStatus,
  ProjectData,
  ProjectFile,
  ProjectMeta,
} from '../../shared/types/project';

export interface LoadedProject {
  file: ProjectFile;
  integrity: IntegrityStatus;
  filePath: string;
}

/** Load, parse, and validate a .rentgen project file. Verifies the checksum
 *  if present. Never prompts and never writes. Exits the process (code 2) on
 *  non-recoverable errors (missing file, bad JSON, wrong shape). */
export function loadProject(filePath: string): LoadedProject {
  const resolved = path.resolve(filePath);

  if (!fs.existsSync(resolved)) {
    console.error(`Cannot read project file: ${resolved}`);
    process.exit(2);
  }

  let raw: string;
  try {
    raw = fs.readFileSync(resolved, 'utf-8');
  } catch (err) {
    console.error(`Cannot read project file: ${resolved}`);
    console.error(`  ${err instanceof Error ? err.message : String(err)}`);
    process.exit(2);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error(`Project file is not valid JSON: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(2);
  }

  if (!isProjectFile(parsed)) {
    console.error('Not a Rentgen project export.');
    process.exit(2);
  }

  const integrity: IntegrityStatus = parsed.meta.checksum
    ? computeChecksum(parsed.data) === parsed.meta.checksum ? 'verified' : 'modified'
    : 'missing';

  return { file: parsed, integrity, filePath: resolved };
}

function isProjectFile(value: unknown): value is ProjectFile {
  if (!value || typeof value !== 'object') return false;
  const file = value as Record<string, unknown>;
  if (!isProjectMeta(file.meta)) return false;
  if (!isProjectData(file.data)) return false;
  return true;
}

function isProjectMeta(value: unknown): value is ProjectMeta {
  if (!value || typeof value !== 'object') return false;
  const m = value as Record<string, unknown>;
  if (typeof m.version !== 'number') return false;
  if (typeof m.appVersion !== 'string') return false;
  if (typeof m.exportedAt !== 'string') return false;
  if (m.checksum !== undefined && typeof m.checksum !== 'string') return false;
  return true;
}

function isProjectData(value: unknown): value is ProjectData {
  if (!value || typeof value !== 'object') return false;
  const d = value as Record<string, unknown>;
  if (!d.collection || typeof d.collection !== 'object') return false;
  if (!Array.isArray(d.environments)) return false;
  if (!Array.isArray(d.dynamicVariables)) return false;
  return 'history' in d && 'settings' in d;
}
