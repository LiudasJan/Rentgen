/**
 * Object manipulation utility functions for handling nested objects,
 * deep property access, value formatting, and object transformations.
 */

/**
 * Sets a value at a deep path within an object, creating nested objects as needed
 *
 * This function supports both dot notation and array bracket notation for paths.
 * Examples:
 * - 'user.profile.name' sets obj.user.profile.name
 * - 'items[0].id' sets obj.items[0].id
 * - 'config.settings.theme' sets obj.config.settings.theme
 *
 * @param targetObject - The object to modify
 * @param propertyPath - Dot-notation path to the property (e.g., 'user.profile.name' or 'items[0].id')
 * @param newValue - The value to set at the specified path
 */
export function setDeepObjectProperty(targetObject: any, propertyPath: string, newValue: any): void {
  const pathParts = propertyPath.replace(/\[(\d+)\]/g, '.$1').split('.');
  let currentObject = targetObject;

  for (let i = 0; i < pathParts.length - 1; i++) {
    const currentKey = pathParts[i];
    if (!(currentKey in currentObject)) currentObject[currentKey] = {};

    currentObject = currentObject[currentKey];
  }

  currentObject[pathParts[pathParts.length - 1]] = newValue;
}

/**
 * Truncates and formats any value for display purposes with type-safe string representation
 *
 * This utility function safely converts any JavaScript value to a readable string format
 * with the following behaviors:
 * - Null values display as 'null'
 * - Undefined values display as 'undefined'
 * - Strings are wrapped in quotes to distinguish them from other types
 * - Numbers and booleans are converted to their string representation
 * - Objects are JSON stringified with fallback for circular references
 * - Truncates long values with '...' suffix when exceeding maxLength
 *
 * @param value - The value to format and truncate (can be any type)
 * @param maxLength - Maximum length before truncation (defaults to 100 characters)
 * @returns Formatted and potentially truncated string representation
 */
export function truncateValue(value: any, maxLength = 100): string {
  // Handle null and undefined cases explicitly
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';

  let formattedString: string;

  switch (typeof value) {
    case 'string':
      formattedString = `"${value}"`;
      break;
    case 'number':
    case 'boolean':
      formattedString = String(value);
      break;
    case 'object':
      try {
        formattedString = JSON.stringify(value);
      } catch {
        formattedString = '[object]';
      }
      break;
    default:
      formattedString = String(value);
  }

  if (formattedString.length > maxLength) {
    const truncationSuffix = ' ...';
    const availableLength = maxLength - truncationSuffix.length;
    return formattedString.slice(0, Math.max(0, availableLength)) + truncationSuffix;
  }

  return formattedString;
}

/**
 * Formats and beautifies request body content based on Content-Type header
 *
 * This utility function automatically detects the content type from headers
 * and applies appropriate formatting:
 * - For 'application/x-www-form-urlencoded': sorts and normalizes form data
 * - For JSON content: pretty-prints with proper indentation
 * - Gracefully handles malformed JSON without throwing errors
 *
 * @param body - The raw body content to format
 * @param headers - Parsed headers object for Content-Type detection
 * @returns Formatted body content string
 */
export function formatRequestBody(body: string, headers: Record<string, string>): string {
  const contentType = (headers['Content-Type'] || headers['content-type'] || '').toString();

  // Handle form URL-encoded content
  if (/application\/x-www-form-urlencoded/i.test(contentType)) {
    return body
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .sort()
      .join('\n');
  }

  // Handle JSON content (default case)
  try {
    return JSON.stringify(JSON.parse(body), null, 2);
  } catch {
    // Return original content if JSON parsing fails
    return body;
  }
}
