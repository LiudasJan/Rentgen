import type { BundleDynamicVariable } from '../../shared/types/bundle';
import type { HttpResponse } from '../http/client';

interface ExtractionResult {
  success: boolean;
  value: string | null;
  error?: string;
}

/**
 * Extract value from object using dot/bracket notation path.
 * Ported from src/utils/environment.ts extractValue()
 */
function extractValue(obj: unknown, path: string): unknown {
  if (!path || obj === null || obj === undefined) return undefined;

  const segments = path
    .replace(/\[(\d+)]/g, '.$1')
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
 * Convert extracted value to string.
 * Ported from src/utils/environment.ts stringifyExtractedValue()
 */
function stringifyExtractedValue(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value);
}

/**
 * Extract a dynamic variable value from an HTTP response.
 * Ported from src/utils/dynamicVariable.ts
 */
export function extractDynamicVariable(
  dvar: BundleDynamicVariable,
  response: HttpResponse,
): ExtractionResult {
  try {
    let extractedValue: unknown;

    if (dvar.source === 'body') {
      if (!response.body) {
        return { success: false, value: null, error: 'response body is empty' };
      }

      let body: unknown;
      try {
        body = JSON.parse(response.body);
      } catch {
        return { success: false, value: null, error: 'response body is not valid JSON' };
      }

      extractedValue = extractValue(body, dvar.selector);

      if (extractedValue === undefined) {
        return { success: false, value: null, error: `selector '${dvar.selector}' not found in response` };
      }
    } else if (dvar.source === 'header') {
      if (!response.headers) {
        return { success: false, value: null, error: 'response has no headers' };
      }

      const headerKey = Object.keys(response.headers).find(
        (k) => k.toLowerCase() === dvar.selector.toLowerCase(),
      );
      extractedValue = headerKey ? response.headers[headerKey] : undefined;

      if (extractedValue === undefined) {
        return { success: false, value: null, error: `header '${dvar.selector}' not found in response` };
      }
    }

    const stringValue = stringifyExtractedValue(extractedValue);
    if (stringValue === null) {
      return { success: false, value: null, error: 'extracted value is null or undefined' };
    }

    return { success: true, value: stringValue };
  } catch (e) {
    return { success: false, value: null, error: String(e) };
  }
}
