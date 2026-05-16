import type { DynamicVariable } from '../../shared/types/environment';
import type { HttpResponse } from '../http/client';

export interface ExtractionOutcome {
  success: boolean;
  value: string | null;
  error?: string;
}

function extractValue(obj: unknown, selector: string): unknown {
  if (!selector || obj === null || obj === undefined) return undefined;

  const segments = selector
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

function stringifyExtractedValue(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value);
}

export function extractDynamicVariable(
  dvar: DynamicVariable,
  response: HttpResponse,
): ExtractionOutcome {
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
