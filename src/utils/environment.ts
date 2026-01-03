import { DynamicVariable, Environment, EnvironmentVariable } from '../types';

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
      result.set(v.key, v.value);
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
  return text.replace(/\{\{([^}]+)}}/g, (match, varName) => {
    const value = variables.get(varName.trim());
    return value !== undefined ? value : '';
  });
}

/**
 * Substitutes {{variable_name}} placeholders in a string with values from the environment.
 * If a variable is not found, the placeholder is replaced with an empty string.
 */
export function substituteVariables(text: string, variables: EnvironmentVariable[]): string {
  if (!text || variables.length === 0) return text;

  // Create a map for O(1) lookups
  const variableMap = new Map<string, string>();
  for (const { key, value } of variables) {
    if (key) variableMap.set(key, value);
  }

  // Replace all {{variable_name}} occurrences
  return text.replace(/\{\{([^}]+)}}/g, (match, variableName) => {
    const trimmedName = variableName.trim();
    return variableMap.get(trimmedName) ?? '';
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
