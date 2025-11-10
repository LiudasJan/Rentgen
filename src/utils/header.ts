/**
 * HTTP header parsing utilities for processing raw header strings and extracting header values.
 * Provides robust parsing for various header formats including cURL command integration.
 */

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
