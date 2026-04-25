import crypto from 'crypto';
import type { IntegrityStatus, ProjectData } from './types/project';

/** Deterministic JSON stringify: non-array objects have their keys sorted alphabetically.
 *  Arrays keep their order. */
export function canonicalize(obj: unknown): string {
  return JSON.stringify(obj, (_key, value) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return Object.keys(value)
        .sort()
        .reduce<Record<string, unknown>>((sorted, k) => {
          sorted[k] = (value as Record<string, unknown>)[k];
          return sorted;
        }, {});
    }
    return value;
  });
}

/** SHA-256 of the canonicalized data, prefixed with "sha256:". */
export function computeChecksum(data: ProjectData): string {
  const canonical = canonicalize(data);
  return `sha256:${crypto.createHash('sha256').update(canonical, 'utf-8').digest('hex')}`;
}

export function verifyChecksum(checksum: string | undefined, data: ProjectData): IntegrityStatus {
  if (!checksum) return 'missing';
  return computeChecksum(data) === checksum ? 'verified' : 'modified';
}
