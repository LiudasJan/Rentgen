import parseCurl from 'parse-curl';

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
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string | null;
}

export function extractCurl(curl: string): ParsedCurlResult {
  const trimmedCurl = curl.replace(/\\\n/g, ' ').trim();
  const parsedCurl = parseCurl(trimmedCurl);

  // Body fallback - handle --data* flags even if parse-curl doesn't catch them
  if (!parsedCurl.body) {
    const match =
      trimmedCurl.match(/--data-raw\s+(['"])([\s\S]*?)\1/) ||
      trimmedCurl.match(/--data\s+(['"])([\s\S]*?)\1/) ||
      trimmedCurl.match(/--data-binary\s+(['"])([\s\S]*?)\1/);
    if (match) parsedCurl.body = match[2];
  }

  // Method logic: if there's a body or --data* flag -> POST
  let method = parsedCurl.method ? String(parsedCurl.method).toUpperCase() : '';
  if (!method || (method === 'GET' && parsedCurl.body))
    method = /--data-raw|--data\b|--data-binary|(?:\s|^)-d\b/.test(trimmedCurl) ? 'POST' : 'GET';

  // Headers normalization: always use "Cookie", never "Set-Cookie"
  const headers: Record<string, string> = {};
  if (parsedCurl.header) {
    for (const [k, v] of Object.entries(parsedCurl.header as Record<string, any>)) {
      const key = String(k);
      const value = String(v ?? '');
      if (key.toLowerCase() === 'set-cookie') {
        headers['Cookie'] = value;
      } else {
        headers[key] = value;
      }
    }
  }

  // Extract -b/--cookie flag (if present), it takes precedence over everything - like Postman
  const cookieFlag =
    trimmedCurl.match(/(?:^|\s)(?:-b|--cookie)\s+(['"])([\s\S]*?)\1/) ||
    trimmedCurl.match(/(?:^|\s)(?:-b|--cookie)\s+([^\s'"][^\s]*)/);
  if (cookieFlag) {
    const rawValue = String(cookieFlag[2] ?? cookieFlag[1] ?? '');
    const value = rawValue
      .replace(/^Cookie:\s*/i, '')
      .replace(/^Set-Cookie:\s*/i, '')
      .trim();
    if (value) headers['Cookie'] = value;
  }

  return {
    body: parsedCurl.body || null,
    method,
    headers,
    url: parsedCurl.url || '',
  };
}
