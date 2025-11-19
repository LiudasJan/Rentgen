import parseCurl from 'parse-curl';
import { HttpRequest, ParsedCurlResult } from '../types';
import { convertUrlEncodedToFormEntries, isUrlEncodedContentType, isUrlEncodedContentTypeString } from './http';

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
  let method = (parsedCurl.method || '').toString().toUpperCase();
  if (
    (!method || method === 'GET') &&
    /--data(?:-raw|-binary|-urlencode)?|-d/i.test(trimmedCurl) &&
    parsedCurl.body?.trim()
  )
    method = 'POST';

  // Normalize headers: always use "Cookie", never "Set-Cookie"
  const headers: Record<string, string> = {};
  if (parsedCurl.header) {
    for (const [headerKey, headerValue] of Object.entries(parsedCurl.header as Record<string, string>)) {
      const key = String(headerKey);
      const value = String(headerValue ?? '');

      if (
        !isUrlEncodedContentTypeString(trimmedCurl) &&
        value.toLocaleLowerCase() === 'application/x-www-form-urlencoded'
      )
        continue;

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

  return {
    body: parsedCurl.body || null,
    decodedLines,
    headers,
    method,
    url: parsedCurl.url || '',
  };
}

export function generateCurl(request: HttpRequest): string {
  const { body, headers, method, url } = request;
  let curl = `curl -X ${method || 'GET'} '${url}'`;

  if (headers)
    for (const [headerName, headerValue] of Object.entries(headers))
      curl += ` \\\n  -H '${headerName}: ${headerValue}'`;

  if (body && body !== 'null' && body !== '{}') {
    if (isUrlEncodedContentType(headers)) {
      const formEntries = convertUrlEncodedToFormEntries(body as string);
      for (const [key, value] of formEntries)
        curl += ` \\\n  --data-urlencode '${key.replace(/'/g, "'\\''")}=${value.replace(/'/g, "'\\''")}'`;
    } else {
      let serializedBody: string;

      if (typeof body === 'string') serializedBody = body;
      else serializedBody = JSON.stringify(body);

      curl += ` \\\n  --data '${serializedBody.replace(/'/g, "'\\''")}'`;
    }
  }

  return curl;
}
