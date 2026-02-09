import { DataType, DynamicVariable, Environment, EnvironmentVariable, VariableValidationResult } from '../types';
import { generateRandomValue } from './random';

/**
 * Extract value from object using dot/bracket notation path
 * @example extractValue({ data: { users: [{ id: 1 }] } }, 'data.users[0].id') → 1
 */
export function extractValue(obj: unknown, path: string): unknown {
  if (!path || obj === null || obj === undefined) return undefined;

  const segments = path
    .replace(/\[(\d+)]/g, '.$1') // Convert [0] to .0
    .split('.')
    .filter(Boolean);

  let current: unknown = obj;

  for (const segment of segments) {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[segment];
  }

  return current;
}

/**
 * Convert extracted value to string for storage in dynamic variables
 */
export function stringifyExtractedValue(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value);
}

/**
 * Build effective variables map merging static and dynamic
 * Dynamic variables override static on conflict
 */
export function buildEffectiveVariables(
  staticVars: EnvironmentVariable[],
  dynamicVars: DynamicVariable[],
  selectedEnvironmentId: string | null,
): Map<string, string> {
  const result = new Map<string, string>();

  // Add static variables first
  staticVars.forEach((v) => {
    if (v.key && v.value) {
      const randomValue = generateRandomValue(v.value as DataType);

      result.set(v.key, String(randomValue ?? v.value));
    }
  });

  // Add applicable dynamic variables (override static on conflict)
  dynamicVars
    .filter((d) => d.environmentId === null || d.environmentId === selectedEnvironmentId)
    .forEach((d) => {
      if (d.currentValue !== null) {
        result.set(d.key, d.currentValue);
      }
    });

  return result;
}

/**
 * Substitute variables in text using effective variables map
 */
export function substituteWithVariables(text: string, variables: Map<string, string>): string {
  return text.replace(/\{\{([^}]+)}}/g, (_, varName) => {
    const value = variables.get(varName.trim());
    return value !== undefined ? value : '';
  });
}

/**
 * Substitutes variables in all parts of an HTTP request.
 * Supports both static environment variables and dynamic variables.
 */
export function substituteRequestVariables(
  url: string,
  headers: string,
  body: string,
  messageType: string,
  environment: Environment | null,
  dynamicVariables?: DynamicVariable[],
): { url: string; headers: string; body: string; messageType: string } {
  const staticVars = environment?.variables || [];
  const dynamicVars = dynamicVariables || [];

  if (staticVars.length === 0 && dynamicVars.length === 0) {
    return { url, headers, body, messageType };
  }

  // Build effective variables map (dynamic overrides static)
  const effectiveVars = buildEffectiveVariables(staticVars, dynamicVars, environment?.id || null);

  return {
    url: substituteWithVariables(url, effectiveVars),
    headers: substituteWithVariables(headers, effectiveVars),
    body: substituteWithVariables(body, effectiveVars),
    messageType: substituteWithVariables(messageType, effectiveVars),
  };
}

/**
 * Generates a unique environment ID.
 */
export function generateEnvironmentId(): string {
  return `env_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Creates an empty environment with default values.
 */
export function createEmptyEnvironment(): Environment {
  return {
    id: generateEnvironmentId(),
    title: '',
    color: '#3B82F6', // Default blue
    variables: [],
  };
}

/**
 * Extract all {{variable}} names from text strings
 */
export function extractReferencedVariables(...texts: (string | null | undefined)[]): string[] {
  const variableNames = new Set<string>();
  const regex = /\{\{([^}]+)}}/g;

  for (const text of texts) {
    if (!text) continue;
    let match;
    while ((match = regex.exec(text)) !== null) {
      variableNames.add(match[1].trim());
    }
  }

  return Array.from(variableNames);
}

/**
 * Check if referenced dynamic variables have values
 */
export function validateDynamicVariables(
  referencedVarNames: string[],
  dynamicVariables: DynamicVariable[],
  selectedEnvironmentId: string | null,
): VariableValidationResult {
  const missingVariables: string[] = [];

  for (const varName of referencedVarNames) {
    // Find matching dynamic variable (scoped to current environment or global)
    const dynamicVar = dynamicVariables.find(
      (dv) => dv.key === varName && (dv.environmentId === null || dv.environmentId === selectedEnvironmentId),
    );

    // Only validate dynamic variables (static env vars are always available or empty)
    if (dynamicVar && dynamicVar.currentValue === null) {
      missingVariables.push(varName);
    }
  }

  return {
    isValid: missingVariables.length === 0,
    missingVariables,
  };
}

/**
 * Validate that all referenced dynamic variables in a request have values
 */
export function validateRequestVariables(
  url: string,
  headers: string,
  body: string,
  messageType: string,
  dynamicVariables: DynamicVariable[],
  selectedEnvironmentId: string | null,
): VariableValidationResult {
  const referencedVarNames = extractReferencedVariables(url, headers, body, messageType);
  return validateDynamicVariables(referencedVarNames, dynamicVariables, selectedEnvironmentId);
}
