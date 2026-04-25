import type { DynamicVariable, Environment, EnvironmentVariable } from '../../shared/types/environment';
import type { PostmanItem, PostmanRequest, PostmanHeader } from '../../shared/types/postman';

export interface ResolvedRequest {
  id: string;
  name: string;
  method: string;
  url: string;
  headers: PostmanHeader[];
  body?: string;
}

export class VariableStore {
  private variables: Map<string, string>;
  private dynamicVarsByRequestId: Map<string, DynamicVariable[]>;
  private lastUnresolved: Set<string> = new Set();

  constructor(
    environment: Environment | null,
    dynamicVariables: DynamicVariable[],
    cliOverrides: Record<string, string>,
  ) {
    this.variables = new Map();
    this.dynamicVarsByRequestId = new Map();

    if (environment) {
      for (const v of environment.variables) {
        this.variables.set(v.key, v.value);
      }
    }

    for (const dv of dynamicVariables) {
      if (dv.currentValue !== null) {
        this.variables.set(dv.key, dv.currentValue);
      }
    }

    for (const [key, value] of Object.entries(cliOverrides)) {
      this.variables.set(key, value);
    }

    for (const dv of dynamicVariables) {
      const existing = this.dynamicVarsByRequestId.get(dv.requestId) ?? [];
      existing.push(dv);
      this.dynamicVarsByRequestId.set(dv.requestId, existing);
    }
  }

  /** Replace {{var}} tokens. Missing tokens resolve to empty string (desktop parity)
   *  and are recorded so the reporter can warn under --verbose. */
  substitute(text: string): string {
    return text.replace(/\{\{([^}]+)\}\}/g, (_match, rawKey: string) => {
      const key = rawKey.trim();
      const value = this.variables.get(key);
      if (value === undefined) {
        this.lastUnresolved.add(key);
        return '';
      }
      return value;
    });
  }

  substituteRequest(item: PostmanItem): ResolvedRequest {
    this.lastUnresolved.clear();
    const r: PostmanRequest = item.request;
    return {
      id: item.id,
      name: item.name,
      method: r.method,
      url: this.substitute(r.url),
      headers: r.header.map((h) => ({
        key: h.key,
        value: this.substitute(h.value),
      })),
      body: r.body?.raw !== undefined ? this.substitute(r.body.raw) : undefined,
    };
  }

  getLastUnresolved(): string[] {
    return Array.from(this.lastUnresolved);
  }

  getDynamicVarsForRequest(requestId: string): DynamicVariable[] {
    return this.dynamicVarsByRequestId.get(requestId) ?? [];
  }

  update(key: string, value: string): void {
    this.variables.set(key, value);
  }
}

export function parseVarOverrides(vars: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const entry of vars) {
    const eqIndex = entry.indexOf('=');
    if (eqIndex === -1) {
      console.error(`Invalid --var format: "${entry}"`);
      console.error('Use --var key=value (e.g., --var apiKey=abc123)');
      process.exit(2);
    }
    result[entry.slice(0, eqIndex)] = entry.slice(eqIndex + 1);
  }
  return result;
}

/** Filter dynamic variables to those that apply when running a given folder:
 *  the dvar belongs to this folder (collectionId === folder.id) or is global
 *  (collectionId is null or empty string). */
export function filterDynamicVarsForFolder(
  all: DynamicVariable[],
  folderId: string,
): DynamicVariable[] {
  return all.filter((dv) => {
    const cid = (dv as { collectionId: string | null }).collectionId;
    return cid === folderId || cid === null || cid === '';
  });
}

export type { EnvironmentVariable };
