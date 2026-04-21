import type { BundleDynamicVariable, BundleRequest, BundleHeader } from '../../shared/types/bundle';

export interface ResolvedRequest {
  id: string;
  name: string;
  method: string;
  url: string;
  headers: BundleHeader[];
  body?: string;
  order: number;
}

export class VariableStore {
  private variables: Map<string, string>;
  private dynamicVarsByRequestId: Map<string, BundleDynamicVariable[]>;

  constructor(
    bundleVariables: Record<string, string>,
    dynamicVariables: BundleDynamicVariable[],
    cliOverrides: Record<string, string>,
  ) {
    this.variables = new Map<string, string>();
    this.dynamicVarsByRequestId = new Map<string, BundleDynamicVariable[]>();

    // 1. Start with bundle variables
    for (const [key, value] of Object.entries(bundleVariables)) {
      this.variables.set(key, value);
    }

    // 2. Add dynamic variable initial values (override bundle vars)
    for (const dv of dynamicVariables) {
      if (dv.initialValue !== null) {
        this.variables.set(dv.key, dv.initialValue);
      }
    }

    // 3. Apply CLI overrides (highest priority)
    for (const [key, value] of Object.entries(cliOverrides)) {
      this.variables.set(key, value);
    }

    // 4. Resolve $ENV_VAR syntax in all values
    for (const [key, value] of this.variables) {
      if (value.startsWith('$')) {
        const envKey = value.slice(1);
        this.variables.set(key, process.env[envKey] ?? '');
      }
    }

    // 5. Index dynamic vars by requestId
    for (const dv of dynamicVariables) {
      const existing = this.dynamicVarsByRequestId.get(dv.requestId) ?? [];
      existing.push(dv);
      this.dynamicVarsByRequestId.set(dv.requestId, existing);
    }
  }

  /** Replace all {{var}} placeholders in a string */
  substitute(text: string): string {
    return text.replace(/\{\{([^}]+)\}\}/g, (_match, key: string) => {
      return this.variables.get(key.trim()) ?? '';
    });
  }

  /** Substitute all fields of a request */
  substituteRequest(request: BundleRequest): ResolvedRequest {
    return {
      ...request,
      url: this.substitute(request.url),
      headers: request.headers.map((h) => ({
        key: h.key,
        value: this.substitute(h.value),
      })),
      body: request.body ? this.substitute(request.body) : undefined,
    };
  }

  /** Get dynamic variables linked to a specific request */
  getDynamicVarsForRequest(requestId: string): BundleDynamicVariable[] {
    return this.dynamicVarsByRequestId.get(requestId) ?? [];
  }

  /** Update a dynamic variable value in-memory */
  updateDynamicValue(key: string, value: string): void {
    this.variables.set(key, value);
  }

  /** Reset all dynamic variables to their initial values */
  reset(dynamicVariables: BundleDynamicVariable[]): void {
    for (const dv of dynamicVariables) {
      if (dv.initialValue !== null) {
        this.variables.set(dv.key, dv.initialValue);
      } else {
        this.variables.delete(dv.key);
      }
    }
  }
}

/** Parse --var flags into a key-value map */
export function parseVarOverrides(vars: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const entry of vars) {
    const eqIndex = entry.indexOf('=');
    if (eqIndex === -1) {
      console.error(`Error: Invalid variable format: "${entry}"`);
      console.error('  Use --var key=value (e.g., --var apiKey=abc123)');
      process.exit(2);
    }
    const key = entry.slice(0, eqIndex);
    const value = entry.slice(eqIndex + 1);
    result[key] = value;
  }
  return result;
}
