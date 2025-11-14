export type FieldType =
  | 'email'
  | 'url'
  | 'ftp_url'
  | 'phone'
  | 'number'
  | 'boolean'
  | 'currency'
  | 'date_yyyy_mm_dd'
  | 'string';

interface FieldDetector {
  type: FieldType;
  regex: RegExp;
}

/**
 * Predefined field detection patterns ordered by specificity
 * More specific patterns are checked first to ensure accurate type detection
 */
const fieldDetectors: ReadonlyArray<FieldDetector> = [
  { type: 'email', regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  { type: 'url', regex: /^https?:\/\/[^\s$.?#].[^\s]*$/i },
  { type: 'ftp_url', regex: /^ftp:\/\/[^\s$.?#].[^\s]*$/i },
  { type: 'phone', regex: /^\+?\d{7,20}$/ },
  { type: 'number', regex: /^-?\d+(\.\d+)?$/ },
  { type: 'boolean', regex: /^(true|false)$/i },
  { type: 'currency', regex: /^[A-Z]{3}$/ },
  { type: 'date_yyyy_mm_dd', regex: /^\d{4}-\d{2}-\d{2}$/ },
  { type: 'string', regex: /.+/ },
];

/**
 * Automatically detects the most appropriate field type for a given value
 *
 * This function analyzes the input value and determines its semantic type based on
 * content patterns and JavaScript type. It prioritizes specific patterns over general ones.
 *
 * Detection priority:
 * 1. JavaScript primitives (boolean, number)
 * 2. Pattern-based detection (email, URL, phone, etc.)
 * 3. Fallback to 'string' type
 *
 * @param value - The value to analyze (can be any type)
 * @returns The detected field type for validation and testing purposes
 *
 */
export function detectFieldType(value: unknown): FieldType {
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'string' && value.length > 0)
    for (const detector of fieldDetectors) if (detector.regex.test(value)) return detector.type;

  return 'string';
}

/**
 * Recursively extracts all field paths and their types from a JSON object structure
 *
 * This function traverses nested objects and arrays to create a flat mapping of all
 * field paths to their JavaScript types. It's particularly useful for generating
 * test cases and validation rules for complex data structures.
 *
 * Path notation:
 * - Nested objects: 'user.profile.name'
 * - Array elements: 'items[0].id'
 * - Mixed: 'data.users[0].profile.email'
 *
 * Special handling:
 * - Null values are marked as 'null'
 * - Objects/arrays are marked as 'DO_NOT_TEST' (their children are tested instead)
 * - Primitive values get their JavaScript type
 *
 * @param obj - The object to analyze (can be any JSON-serializable structure)
 * @param prefix - Internal parameter for recursion, represents current path
 * @returns Flat mapping of field paths to their types
 *
 */
export function extractFieldsFromJson(obj: unknown, prefix = ''): Record<string, string> {
  const fields: Record<string, string> = {};

  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    for (const [key, value] of Object.entries(obj)) {
      const path = prefix ? `${prefix}.${key}` : key;

      if (value === null) fields[path] = 'null';
      else if (typeof value === 'object') {
        // Mark this object field as not testable (objects are not tested directly, only their children)
        fields[path] = 'DO_NOT_TEST';
        Object.assign(fields, extractFieldsFromJson(value, path));
      } else fields[path] = typeof value;
    }
  } else if (Array.isArray(obj)) {
    obj.forEach((item, i) => {
      const path = `${prefix}[${i}]`;
      if (typeof item === 'object') {
        fields[path] = 'DO_NOT_TEST';
        Object.assign(fields, extractFieldsFromJson(item, path));
      } else fields[path] = typeof item;
    });
  } else fields[prefix] = typeof obj;

  return fields;
}

/**
 * Parses raw form body content into key-value pairs
 *
 * This function processes form data in the format used by application/x-www-form-urlencoded
 * content type. It handles multi-line input and normalizes whitespace while preserving
 * the structure of form fields.
 *
 * Processing steps:
 * 1. Split by line breaks (handles both \n and \r\n)
 * 2. Trim whitespace from each line
 * 3. Filter out empty lines
 * 4. Parse key=value pairs (handles missing values gracefully)
 *
 * @param rawFormData - Raw form data string with key=value pairs separated by newlines
 * @returns Array of [key, value] tuples representing form fields
 *
 */
export function parseFormData(rawFormData: string): Array<[string, string]> {
  return (rawFormData || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const equalIndex = line.indexOf('=');
      if (equalIndex === -1) return [line, ''];
      return [line.slice(0, equalIndex).trim(), line.slice(equalIndex + 1).trim()];
    });
}

/**
 * Converts form field entries to URL-encoded string format
 *
 * This function takes an array of key-value pairs and converts them into a properly
 * URL-encoded string suitable for application/x-www-form-urlencoded content type.
 * It handles special characters, spaces, and encoding according to web standards.
 *
 * Features:
 * - Proper URL encoding of keys and values
 * - Handles special characters and spaces
 * - Supports multiple values for the same key
 * - Returns ready-to-use form data string
 *
 * @param formEntries - Array of [key, value] tuples representing form fields
 * @returns URL-encoded string ready for HTTP transmission
 *
 */
export function convertFormEntriesToUrlEncoded(formEntries: Array<[string, string]>): string {
  const urlSearchParams = new URLSearchParams();
  for (const [key, value] of formEntries) urlSearchParams.append(key, value);

  return urlSearchParams.toString();
}

/**
 * Converts URL-encoded string to form field entries
 *
 * This function is the inverse of convertFormEntriesToUrlEncoded. It takes a URL-encoded
 * string (application/x-www-form-urlencoded format) and parses it back into an array of
 * key-value pairs for easier manipulation and processing.
 *
 * Features:
 * - Proper URL decoding of keys and values
 * - Handles special characters and encoded spaces
 * - Preserves multiple values for the same key
 * - Compatible with standard URLSearchParams format
 *
 * @param encoded - URL-encoded string (e.g., "key1=value1&key2=value2")
 * @returns Array of [key, value] tuples representing decoded form fields
 *
 */
export function convertUrlEncodedToFormEntries(encoded: string): Array<[string, string]> {
  const urlSearchParams = new URLSearchParams(encoded);
  return Array.from(urlSearchParams.entries());
}
