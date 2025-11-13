import { convertFormEntriesToUrlEncoded, isObject, parseFormData, tryParseJsonObject } from '.';

/**
 * Parses a raw header string into a structured key-value object
 *
 * This function processes multi-line header strings and converts them into a Record
 * for easy access and manipulation. It handles various header formats including:
 * - Standard HTTP headers (Key: Value format)
 * - cURL cookie flags (-b flag detection)
 * - Headers with multiple colons in values (e.g., URLs, timestamps)
 * - Empty lines and whitespace normalization
 *
 * Special handling:
 * - Lines without colons are treated as Cookie headers
 * - cURL `-b` flags are automatically converted to Cookie headers
 * - Multiple colons in values are preserved (only first colon is used as separator)
 * - Leading/trailing whitespace is trimmed from keys and values
 *
 * @param headers - Raw header string with newline-separated header entries
 * @returns Object mapping header names to their values
 *
 */
export function parseHeaders(headers: string): Record<string, string> {
  if (!headers) return {};

  return Object.fromEntries(
    headers
      .split('\n')
      .filter((headerLine) => headerLine.trim())
      .map((headerLine) => {
        // Handle lines without colons (likely cURL cookie flags or standalone cookies)
        if (!headerLine.includes(':')) {
          if (headerLine.trim().startsWith('-b ')) return ['Cookie', headerLine.replace('-b', '').trim()];

          // Fallback: treat any headerless line as a Cookie
          return ['Cookie', headerLine.trim()];
        }

        const [headerKey, ...valueParts] = headerLine.split(':');
        return [headerKey.trim(), valueParts.join(':').trim()];
      }),
  );
}

/**
 * Retrieves a header value using case-insensitive header name matching
 *
 * This function performs a case-insensitive lookup of header values from a headers object.
 * It's particularly useful when working with HTTP headers where the case might vary
 * (e.g., 'Content-Type', 'content-type', 'CONTENT-TYPE' should all match).
 *
 * The function safely converts any header value to a string, handling various data types
 * that might be stored in the headers object (strings, numbers, booleans, etc.).
 *
 * @param headers - Object containing header key-value pairs (values can be any type)
 * @param headerName - Name of the header to retrieve (case-insensitive)
 * @returns String value of the header, or empty string if header not found
 *
 */
export function getHeaderValue(headers: Record<string, any>, headerName: string): string {
  const matchingKey = Object.keys(headers).find((key) => key.toLowerCase() === headerName.toLowerCase());
  return matchingKey ? String(headers[matchingKey]) : '';
}

/**
 * Extracts the numeric HTTP status code from a response object
 *
 * This function safely extracts HTTP status codes from response objects that may contain
 * status information in various formats. It handles common response formats where the
 * status might be a string like "200 OK", "404 Not Found", or just a number.
 *
 * The function provides robust parsing with fallbacks for edge cases:
 * - Handles null/undefined response objects
 * - Parses status strings that include reason phrases
 * - Returns 0 for invalid or missing status information
 * - Validates that the extracted number is finite
 *
 * @param response - HTTP response object that may contain a status property
 * @returns Numeric HTTP status code (200, 404, 500, etc.) or 0 if parsing fails
 */
export function extractStatusCode(response: any): number {
  const status = (response?.status || '').toString();
  const parsedStatus = parseInt(status.split(' ')[0] || '0', 10);
  return Number.isFinite(parsedStatus) ? parsedStatus : 0;
}

/**
 * Parses and normalizes request body based on Content-Type header
 *
 * This function intelligently processes request bodies based on their Content-Type:
 * - For 'application/x-www-form-urlencoded': parses form data and converts to URL-encoded format
 * - For other types (typically JSON): attempts to parse as JSON object/array
 *
 * The normalization ensures consistent handling of different body formats across the application,
 * particularly useful when working with API requests that may use various content types.
 *
 * @param body - Raw request body string to parse
 * @param headers - Request headers containing Content-Type information
 * @returns Normalized body as URL-encoded string (for forms) or parsed object (for JSON), or null if parsing fails
 */
export function parseBodyByContentType(body: string, headers: Record<string, any>): any {
  const contentType = getHeaderValue(headers, 'content-type');

  if (/application\/x-www-form-urlencoded/i.test(contentType))
    return convertFormEntriesToUrlEncoded(parseFormData(String(body)));

  const paredBody = tryParseJsonObject(body);
  if (isObject(paredBody)) return paredBody;

  return null;
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
export function formatBodyByContentType(body: string, headers: Record<string, string>): string {
  const contentType = getHeaderValue(headers, 'content-type');

  // Handle form URL-encoded content
  if (/application\/x-www-form-urlencoded/i.test(contentType))
    return body
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .sort()
      .join('\n');

  // Handle JSON content (default case)
  try {
    return JSON.stringify(JSON.parse(body), null, 2);
  } catch {
    // Return original content if JSON parsing fails
    return body;
  }
}
