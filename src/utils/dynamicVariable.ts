import { DynamicVariable, ExtractionResult, HttpResponse } from '../types';
import { extractValue, stringifyExtractedValue } from './environment';

/**
 * Extract the value for a dynamic variable from an HTTP response with detailed result.
 * Handles both body (JSON path) and header extraction.
 *
 * @param variable - The dynamic variable configuration
 * @param response - The HTTP response to extract from
 * @returns ExtractionResult with value, success flag, and error message if failed
 */
export function extractDynamicVariableFromResponseWithDetails(
  variable: DynamicVariable,
  response: HttpResponse,
): ExtractionResult {
  try {
    let extractedValue: unknown;

    if (variable.source === 'body') {
      if (!response.body) {
        return { value: null, success: false, error: 'response body is empty' };
      }

      let body: unknown;
      try {
        body = JSON.parse(response.body);
      } catch {
        return { value: null, success: false, error: 'response body is not valid JSON' };
      }

      extractedValue = extractValue(body, variable.selector);

      if (extractedValue === undefined) {
        return { value: null, success: false, error: `selector '${variable.selector}' not found in response` };
      }
    } else if (variable.source === 'header') {
      if (!response.headers) {
        return { value: null, success: false, error: 'response has no headers' };
      }

      // Case-insensitive header lookup
      const headerKey = Object.keys(response.headers).find((k) => k.toLowerCase() === variable.selector.toLowerCase());
      extractedValue = headerKey ? response.headers[headerKey] : undefined;

      if (extractedValue === undefined) {
        return { value: null, success: false, error: `header '${variable.selector}' not found in response` };
      }
    }

    const stringValue = stringifyExtractedValue(extractedValue);
    if (stringValue === null) {
      return { value: null, success: false, error: 'extracted value is null or undefined' };
    }

    return { value: stringValue, success: true };
  } catch (e) {
    return { value: null, success: false, error: String(e) };
  }
}

/**
 * Extract the value for a dynamic variable from an HTTP response.
 * Handles both body (JSON path) and header extraction.
 *
 * @param variable - The dynamic variable configuration
 * @param response - The HTTP response to extract from
 * @returns The extracted value as a string, or null if extraction failed
 * @deprecated Use extractDynamicVariableFromResponseWithDetails for better error reporting
 */
export function extractDynamicVariableFromResponse(variable: DynamicVariable, response: HttpResponse): string | null {
  const result = extractDynamicVariableFromResponseWithDetails(variable, response);
  return result.value;
}

/**
 * Extract values for multiple dynamic variables from a single response.
 * Optimized to parse the response body only once when multiple variables need it.
 *
 * @param variables - Array of dynamic variables to extract
 * @param response - The HTTP response to extract from
 * @returns Map of variable ID to extracted value (only includes successful extractions)
 */
export function extractMultipleDynamicVariablesFromResponse(
  variables: DynamicVariable[],
  response: HttpResponse,
): Map<string, string> {
  const results = new Map<string, string>();

  // Parse body once if any variable needs it
  let parsedBody: unknown = null;
  const bodyVariables = variables.filter((v) => v.source === 'body');
  if (bodyVariables.length > 0 && response.body) {
    try {
      parsedBody = JSON.parse(response.body);
    } catch {
      // Body is not valid JSON, skip body variables
    }
  }

  for (const variable of variables) {
    try {
      let extractedValue: unknown;

      if (variable.source === 'body' && parsedBody !== null) {
        extractedValue = extractValue(parsedBody, variable.selector);
      } else if (variable.source === 'header' && response.headers) {
        const headerKey = Object.keys(response.headers).find(
          (k) => k.toLowerCase() === variable.selector.toLowerCase(),
        );
        extractedValue = headerKey ? response.headers[headerKey] : undefined;
      }

      const stringValue = stringifyExtractedValue(extractedValue);
      if (stringValue !== null) {
        results.set(variable.id, stringValue);
      }
    } catch {
      // Skip failed extractions
    }
  }

  return results;
}
