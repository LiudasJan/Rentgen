import { isObject, tryParseJsonObject } from './object';

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

export function convertFormEntriesToUrlEncoded(formEntries: Array<[string, string]>): string {
  const urlSearchParams = new URLSearchParams();
  for (const [key, value] of formEntries) urlSearchParams.append(key, value);

  return urlSearchParams.toString();
}

export function convertUrlEncodedToFormEntries(encoded: string): Array<[string, string]> {
  const urlSearchParams = new URLSearchParams(encoded);
  return Array.from(urlSearchParams.entries());
}

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

export function getHeaderValue(headers: Record<string, string>, headerName: string): string {
  const matchingKey = Object.keys(headers).find((key) => key.toLowerCase() === headerName.toLowerCase());
  return matchingKey ? String(headers[matchingKey]) : '';
}

export function extractStatusCode(response: any): number {
  const status = (response?.status || '').toString();
  const parsedStatus = parseInt(status.split(' ')[0] || '0', 10);
  return Number.isFinite(parsedStatus) ? parsedStatus : 0;
}

export function parseBodyByContentType(body: string, headers: Record<string, any>): any {
  const contentType = getHeaderValue(headers, 'content-type');

  if (/application\/x-www-form-urlencoded/i.test(contentType))
    return convertFormEntriesToUrlEncoded(parseFormData(String(body)));

  const paredBody = tryParseJsonObject(body);
  if (isObject(paredBody)) return paredBody;

  return null;
}

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

export function extractBodyFromResponse(response: any): Record<string, unknown> {
  try {
    if (typeof response?.body === 'string') return JSON.parse(response.body);
    if (response?.body && typeof response.body === 'object') return response.body;
  } catch {
    return {};
  }
}

export function updateFormEntry(formEntries: Array<[string, string]>, fieldName: string, value: string): void {
  for (let i = 0; i < formEntries.length; i++) {
    if (formEntries[i][0] === fieldName) {
      formEntries[i] = [fieldName, value];
      break;
    }
  }
}
