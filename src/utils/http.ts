import { Method } from 'axios';
import { FieldType, HttpRequest, HttpResponse, TestOptions, TestResult } from '../types';
import { isObject, setDeepObjectProperty, stringifyValue, tryParseJsonObject } from './object';
import { encodeMessage } from './proto';
import { getRandomizedValueByFieldType } from './random';
import { detectFieldType, extractFieldsFromJson } from './validation';

export function convertFormEntriesToUrlEncoded(formEntries: Array<[string, string]>): string {
  const urlSearchParams = new URLSearchParams();
  for (const [key, value] of formEntries) urlSearchParams.append(key, value);

  return urlSearchParams.toString();
}

export function convertUrlEncodedToFormEntries(encoded: string): Array<[string, string]> {
  const urlSearchParams = new URLSearchParams(encoded);
  return Array.from(urlSearchParams.entries());
}

export function createHttpRequest(
  body: Record<string, unknown> | string | Uint8Array | null,
  headers: Record<string, string>,
  method: Method | string,
  url: string,
): HttpRequest {
  const request: HttpRequest = { url, method, headers };
  if (body && !['GET', 'HEAD'].includes(method.toUpperCase())) request.body = body;

  return request;
}

export function createTestHttpRequest(options: TestOptions): HttpRequest {
  const {
    body,
    fieldName,
    headers,
    bodyMappings,
    queryMappings,
    mappingType,
    messageType,
    method,
    protoFile,
    testData,
    url,
  } = options;

  let parsedBody: Record<string, unknown> | string | Uint8Array | null = null;
  let formEntries: Array<[string, string]> = [];

  if (isUrlEncodedContentType(parseHeaders(headers))) formEntries = parseFormData(body);
  else parsedBody = tryParseJsonObject(body);

  if (formEntries.length > 0) {
    // Update the field being tested
    if (mappingType === 'body' && fieldName && testData)
      updateFormEntry(formEntries, fieldName, stringifyValue(testData.value));

    // Apply random values to random field types
    for (const [key, type] of Object.entries(bodyMappings)) {
      // Skip the field being tested
      if (mappingType === 'body' && fieldName === key) continue;

      const randomizedValue = getRandomizedValueByFieldType(type);
      if (randomizedValue !== null) updateFormEntry(formEntries, key, randomizedValue);
    }

    parsedBody = convertFormEntriesToUrlEncoded(formEntries);
  } else if (isObject(parsedBody)) {
    // Update the field being tested
    if (mappingType === 'body' && fieldName && testData) setDeepObjectProperty(parsedBody, fieldName, testData.value);

    // Apply random values to random field types
    for (const [key, type] of Object.entries(bodyMappings)) {
      // Skip the field being tested
      if (mappingType === 'body' && fieldName === key) continue;

      const randomizedValue = getRandomizedValueByFieldType(type);
      if (randomizedValue !== null) setDeepObjectProperty(parsedBody, key, randomizedValue);
    }

    if (protoFile && messageType) {
      try {
        parsedBody = encodeMessage(messageType, parsedBody);
      } catch {
        // Ignore encoding errors and use the modified body as-is
      }
    }
  }

  const modifiedUrl = new URL(url);

  // Update the field being tested
  if (mappingType === 'query' && fieldName && testData)
    modifiedUrl.searchParams.set(fieldName, stringifyValue(testData.value));

  // Apply random values to random query parameter types
  for (const [key, type] of Object.entries(queryMappings)) {
    // Skip the field being tested
    if (mappingType === 'query' && fieldName === key) continue;

    const randomizedValue = getRandomizedValueByFieldType(type);
    if (randomizedValue !== null) modifiedUrl.searchParams.set(key, randomizedValue);
  }

  return createHttpRequest(parsedBody, parseHeaders(headers), method, modifiedUrl.toString());
}

export async function executeTimedRequest(
  request: HttpRequest,
  onSuccess: (response: HttpResponse, responseTime: number) => TestResult,
  onError: (error: unknown) => TestResult,
): Promise<TestResult> {
  try {
    const requestStartTime = performance.now();
    const response = await window.electronAPI.sendHttp(request);
    const responseTime = performance.now() - requestStartTime;

    return onSuccess(response, responseTime);
  } catch (error) {
    return onError(error);
  }
}

export function extractBodyFieldMappings(body: unknown, headers: Record<string, string>): Record<string, FieldType> {
  const mappings: Record<string, FieldType> = {};

  if (isUrlEncodedContentType(headers)) {
    const formEntries = convertUrlEncodedToFormEntries(body as string);
    for (const [key, value] of formEntries) mappings[key] = detectFieldType(value);
  } else if (isObject(body)) {
    const extractedFields = extractFieldsFromJson(body);
    for (const [key, value] of Object.entries(extractedFields)) {
      if (value === 'DO_NOT_TEST') mappings[key] = 'do-not-test';
      else {
        // Navigate to the actual value in the parsed body
        const pathParts = key.replace(/\[(\d+)\]/g, '.$1').split('.');
        let fieldValue: any = body;

        for (const path of pathParts) {
          if (fieldValue == null) break;
          fieldValue = fieldValue[path];
        }

        mappings[key] = detectFieldType(fieldValue, true);
      }
    }
  }

  return mappings;
}

export function extractBodyFromResponse(response: HttpResponse): Record<string, unknown> | string {
  try {
    if (typeof response?.body === 'string') return JSON.parse(response.body);
    if (response?.body && typeof response.body === 'object') return response.body;
  } catch {
    return response.body;
  }
}

export function extractStatusCode(response: HttpResponse): number {
  const status = (response?.status || '').toString();
  const parsedStatus = parseInt(status.split(' ')[0] || '0', 10);
  return Number.isFinite(parsedStatus) ? parsedStatus : 0;
}

export function formatBody(body: string, headers: Record<string, string>): string {
  // Handle form URL-encoded content
  if (isUrlEncodedContentType(headers))
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

export function getHeaderValue(headers: Record<string, string>, headerName: string): string {
  const matchingKey = Object.keys(headers).find((key) => key.toLowerCase() === headerName.toLowerCase());
  return matchingKey ? String(headers[matchingKey]) : '';
}

export function getFieldValueFromBody(body: unknown, fieldName: string, headers: Record<string, string>): any {
  if (isUrlEncodedContentType(headers)) {
    const formEntries = convertUrlEncodedToFormEntries(body as string);
    return formEntries.find(([key]) => key === fieldName)?.[1];
  }

  const pathParts = fieldName.replace(/\[(\d+)\]/g, '.$1').split('.');
  let fieldValue: any = body;

  for (const path of pathParts) {
    if (fieldValue == null) return undefined;
    fieldValue = fieldValue[path];
  }

  return fieldValue;
}

export function isUrlEncodedContentType(headers: Record<string, string>): boolean {
  return isUrlEncodedContentTypeString(getHeaderValue(headers, 'content-type'));
}

export function isUrlEncodedContentTypeString(value: string): boolean {
  return /application\/x-www-form-urlencoded/i.test(value);
}

export function parseBody(
  body: string,
  headers: Record<string, string>,
  messageType: string,
  protoFile: File | null,
): any {
  if (isUrlEncodedContentType(headers)) return convertFormEntriesToUrlEncoded(parseFormData(body));

  const paredBody = tryParseJsonObject(body);
  if (isObject(paredBody) && protoFile && messageType) {
    try {
      return encodeMessage(messageType, paredBody);
    } catch {
      return paredBody;
    }
  }

  return paredBody;
}

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

export function updateFormEntry(formEntries: Array<[string, string]>, fieldName: string, value: string): void {
  for (const formEntry of formEntries) {
    if (formEntry[0] === fieldName) {
      formEntry[1] = value;
      break;
    }
  }
}
