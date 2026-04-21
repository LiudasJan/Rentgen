import * as fs from 'fs';
import * as path from 'path';
import type {
  RentgenBundle,
  BundleRequest,
  BundleDynamicVariable,
} from '../../shared/types/bundle';

export function loadBundle(filePath: string): RentgenBundle {
  const resolved = path.resolve(filePath);

  if (!fs.existsSync(resolved)) {
    console.error(`Error: Bundle file not found: ${resolved}`);
    console.error('');
    console.error('  Make sure the file exists and the path is correct.');
    console.error('  Export a bundle from Rentgen Desktop: Folder → Export CI Bundle');
    process.exit(2);
  }

  let raw: string;
  try {
    raw = fs.readFileSync(resolved, 'utf-8');
  } catch (err) {
    console.error(`Error: Could not read bundle file: ${resolved}`);
    console.error(`  ${err instanceof Error ? err.message : String(err)}`);
    process.exit(2);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error(`Error: Invalid JSON in bundle file: ${resolved}`);
    console.error(`  ${err instanceof Error ? err.message : String(err)}`);
    console.error('');
    console.error('  The bundle file may be corrupted or from an incompatible version.');
    process.exit(2);
  }

  const errors = validateBundle(parsed);
  if (errors.length > 0) {
    console.error(`Error: Invalid bundle file: ${resolved}`);
    console.error('');
    for (const e of errors) {
      console.error(`  Missing required field: ${e}`);
    }
    console.error('');
    console.error('  The bundle file may be corrupted or from an incompatible version.');
    process.exit(2);
  }

  return parsed as RentgenBundle;
}

function validateBundle(data: unknown): string[] {
  const errors: string[] = [];

  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return ['Bundle must be a JSON object'];
  }

  const bundle = data as Record<string, unknown>;

  if (typeof bundle.version !== 'string') {
    errors.push('"version" must be a string');
  }

  if (!Array.isArray(bundle.requests)) {
    errors.push('"requests" must be an array');
  } else {
    for (let i = 0; i < bundle.requests.length; i++) {
      const req = bundle.requests[i] as Record<string, unknown>;
      if (typeof req !== 'object' || req === null) {
        errors.push(`requests[${i}] must be an object`);
        continue;
      }
      if (typeof req.id !== 'string') errors.push(`requests[${i}].id must be a string`);
      if (typeof req.method !== 'string') errors.push(`requests[${i}].method must be a string`);
      if (typeof req.url !== 'string') errors.push(`requests[${i}].url must be a string`);
    }
  }

  if (typeof bundle.variables !== 'object' || bundle.variables === null || Array.isArray(bundle.variables)) {
    errors.push('"variables" must be an object');
  }

  if (!Array.isArray(bundle.dynamicVariables)) {
    errors.push('"dynamicVariables" must be an array');
  } else {
    for (let i = 0; i < bundle.dynamicVariables.length; i++) {
      const dv = bundle.dynamicVariables[i] as Record<string, unknown>;
      if (typeof dv !== 'object' || dv === null) {
        errors.push(`dynamicVariables[${i}] must be an object`);
        continue;
      }
      if (typeof dv.id !== 'string') errors.push(`dynamicVariables[${i}].id must be a string`);
      if (typeof dv.key !== 'string') errors.push(`dynamicVariables[${i}].key must be a string`);
      if (typeof dv.selector !== 'string') errors.push(`dynamicVariables[${i}].selector must be a string`);
      if (dv.source !== 'body' && dv.source !== 'header') errors.push(`dynamicVariables[${i}].source must be "body" or "header"`);
      if (typeof dv.requestId !== 'string') errors.push(`dynamicVariables[${i}].requestId must be a string`);
    }
  }

  return errors;
}
