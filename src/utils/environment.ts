import { Environment, EnvironmentVariable } from '../types';

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
 */
export function substituteRequestVariables(
  url: string,
  headers: string,
  body: string,
  environment: Environment | null,
): { url: string; headers: string; body: string } {
  if (!environment || environment.variables.length === 0) {
    return { url, headers, body };
  }

  return {
    url: substituteVariables(url, environment.variables),
    headers: substituteVariables(headers, environment.variables),
    body: substituteVariables(body, environment.variables),
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
