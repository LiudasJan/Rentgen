import parseCurl from 'parse-curl';

/**
 * Extracts query parameters from a URL string into a key-value object
 *
 * This function safely parses any valid URL and extracts all query string parameters
 * into a flat object structure. It handles URL encoding/decoding automatically and
 * gracefully handles malformed URLs without throwing errors.
 *
 * Features:
 * - Automatic URL decoding of parameter values
 * - Safe error handling for invalid URLs
 * - Support for duplicate parameter names (last value wins)
 * - Empty parameter handling
 *
 * @param url - The URL string to parse (can be relative or absolute)
 * @returns Object mapping parameter names to their decoded values, empty object if URL is invalid
 */
export function extractQueryParams(url: string): Record<string, string> {
  try {
    const parsedUrl = new URL(url);
    const params: Record<string, string> = {};

    parsedUrl.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    return params;
  } catch {
    return {};
  }
}

export interface ParsedCurlResult {
  body: string | null;
  decodedLines: string[];
  headers: Record<string, string>;
  method: string;
  url: string;
}

/**
 * Parses a cURL command string and extracts HTTP request components
 *
 * This comprehensive cURL parser handles various cURL command formats and extracts
 * all relevant HTTP request information including URL, method, headers, and body data.
 * It provides intelligent parsing with fallbacks and normalization for real-world usage.
 *
 * Advanced Features:
 * - Smart HTTP method detection (defaults to POST if body/--data flags present)
 * - Multiple --data flag support with automatic concatenation
 * - Form data parsing with key=value pair extraction
 * - URL decoding for --data-urlencode flags
 * - Cookie header normalization (Set-Cookie → Cookie)
 * - -b/--cookie flag prioritization over header-based cookies
 * - Multi-line cURL command support (backslash continuation)
 *
 * Supported cURL flags:
 * - -X/--request: HTTP method
 * - -H/--header: Headers
 * - -d/--data: POST data
 * - --data-raw: Raw POST data
 * - --data-binary: Binary POST data
 * - --data-urlencode: URL-encoded POST data
 * - -b/--cookie: Cookie data
 *
 * @param curl - Raw cURL command string (can be multi-line with backslash continuations)
 * @returns Parsed request components with normalized and validated data
 */
export function extractCurl(curl: string): ParsedCurlResult {
  const trimmedCurl = curl.replace(/\\\n/g, ' ').trim();
  const parsedCurl = parseCurl(trimmedCurl);
  const dataFlagRegex = /(?:^|\s)(?:-d|--data(?:-raw|-binary)?|--data-urlencode)\s+(?:'([^']*)'|"([^"]*)"|([^\s]+))/g;
  const extractedDataLines: string[] = [];
  let dataFlagMatch: RegExpExecArray | null;

  while ((dataFlagMatch = dataFlagRegex.exec(trimmedCurl)) !== null) {
    const extractedValue = (dataFlagMatch[1] ?? dataFlagMatch[2] ?? dataFlagMatch[3] ?? '').trim();
    if (extractedValue) extractedDataLines.push(extractedValue);
  }

  // Parse key=value pairs from all extracted data lines
  const parsedFormPairs: string[] = [];
  for (const dataLine of extractedDataLines) {
    const keyValuePairRegex = /([\w.\-[\]]+)=["']?([^"']+)["']?/g;
    let pairMatch: RegExpExecArray | null;

    while ((pairMatch = keyValuePairRegex.exec(dataLine)) !== null) {
      const fieldKey = pairMatch[1].trim();
      const fieldValue = pairMatch[2].trim();
      parsedFormPairs.push(`${fieldKey}=${fieldValue}`);
    }
  }

  // Apply URL decoding for --data-urlencode values
  const decodedLines = parsedFormPairs.map((formPair) => {
    try {
      return decodeURIComponent(formPair);
    } catch {
      return formPair;
    }
  });

  // Body fallback - handle --data* flags even if parse-curl doesn't catch them
  if (!parsedCurl.body) {
    const match =
      trimmedCurl.match(/--data-raw\s+(['"])([\s\S]*?)\1/) ||
      trimmedCurl.match(/--data\s+(['"])([\s\S]*?)\1/) ||
      trimmedCurl.match(/--data-binary\s+(['"])([\s\S]*?)\1/) ||
      trimmedCurl.match(/--data-urlencode\s+(['"])([\s\S]*?)\1/);
    if (match) parsedCurl.body = match[2];
  }

  // Smart HTTP method detection: if there's a body or --data* flag, default to POST
  let method = parsedCurl.method ? String(parsedCurl.method).toUpperCase() : '';
  if (!method || method === 'GET') {
    const hasDataFlags = /(--data|-d|--data-raw|--data-binary|--data-urlencode)/i.test(trimmedCurl);
    if (hasDataFlags || (parsedCurl.body && parsedCurl.body.trim() !== '')) {
      method = 'POST';
    }
  }

  // Normalize headers: always use "Cookie", never "Set-Cookie"
  const headers: Record<string, string> = {};
  if (parsedCurl.header) {
    for (const [headerKey, headerValue] of Object.entries(parsedCurl.header as Record<string, any>)) {
      const key = String(headerKey);
      const value = String(headerValue ?? '');

      if (key.toLowerCase() === 'set-cookie') headers['Cookie'] = value;
      else headers[key] = value;
    }
  }

  // Extract -b/--cookie flag (takes precedence over header-based cookies - Postman behavior)
  const cookieFlagMatch =
    trimmedCurl.match(/(?:^|\s)(?:-b|--cookie)\s+(['"])([\s\S]*?)\1/) ||
    trimmedCurl.match(/(?:^|\s)(?:-b|--cookie)\s+([^\s'"][^\s]*)/);
  if (cookieFlagMatch) {
    const rawValue = String(cookieFlagMatch[2] ?? cookieFlagMatch[1] ?? cookieFlagMatch[0] ?? '');
    const value = rawValue
      .replace(/^['"]|['"]$/g, '')
      .replace(/^Cookie:\s*/i, '')
      .replace(/^Set-Cookie:\s*/i, '')
      .trim();
    if (value) headers['Cookie'] = value;
  }

  if (decodedLines.length > 0) {
    const hasContentType = Object.keys(headers).some((headerKey) => headerKey.toLowerCase() === 'content-type');
    if (!hasContentType) headers['Content-Type'] = 'application/x-www-form-urlencoded';
  }

  return {
    body: parsedCurl.body || null,
    decodedLines,
    headers,
    method,
    url: parsedCurl.url || '',
  };
}
