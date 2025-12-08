import { Method } from 'axios';
import { initialNumberBounds, MAX_STRING_LENGTH } from '../constants/datasets';
import {
  DataType,
  DynamicValue,
  HttpRequest,
  HttpResponse,
  RequestParameters,
  TestOptions,
  TestResult,
} from '../types';
import { isObject, setDeepObjectProperty, stringifyValue, tryParseJsonObject } from './object';
import { encodeMessage } from './proto';
import { generateRandomValue } from './random';
import { detectDataType, extractPropertiesFromJson } from './validation';

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
    bodyParameters,
    headers,
    messageType,
    method,
    parameterName,
    parameterType,
    protoFile,
    queryParameters,
    testData,
    url,
  } = options;

  let parsedBody: Record<string, unknown> | string | Uint8Array | null = null;
  let formEntries: Array<[string, string]> = [];

  if (isUrlEncodedContentType(parseHeaders(headers))) formEntries = parseFormData(body);
  else parsedBody = tryParseJsonObject(body);

  if (formEntries.length > 0) {
    // Update the parameter being tested
    if (parameterType === 'body' && parameterName && testData)
      updateFormEntry(formEntries, parameterName, stringifyValue(testData.value));

    // Apply random values to random parameter types
    for (const [key, { type }] of Object.entries(bodyParameters)) {
      // Skip the parameter being tested
      if (parameterType === 'body' && parameterName === key) continue;

      const randomValue = generateRandomValue(type);
      if (randomValue !== null) updateFormEntry(formEntries, key, String(randomValue));
    }

    parsedBody = convertFormEntriesToUrlEncoded(formEntries);
  } else if (isObject(parsedBody)) {
    // Update the parameter being tested
    if (parameterType === 'body' && parameterName && testData)
      setDeepObjectProperty(parsedBody, parameterName, testData.value);

    // Apply random values to random parameter types
    for (const [key, { type }] of Object.entries(bodyParameters)) {
      // Skip the parameter being tested
      if (parameterType === 'body' && parameterName === key) continue;

      const randomValue = generateRandomValue(type);
      if (randomValue !== null) setDeepObjectProperty(parsedBody, key, randomValue);
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

  // Update the parameter being tested
  if (parameterType === 'query' && parameterName && testData)
    modifiedUrl.searchParams.set(parameterName, stringifyValue(testData.value));

  // Apply random values to random query parameter types
  for (const [key, { type }] of Object.entries(queryParameters)) {
    // Skip the parameter being tested
    if (parameterType === 'query' && parameterName === key) continue;

    const randomValue = generateRandomValue(type);
    if (randomValue !== null) modifiedUrl.searchParams.set(key, String(randomValue));
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

export function extractBodyParameters(body: unknown, headers: Record<string, string>): RequestParameters {
  const parameters: RequestParameters = {};

  if (isUrlEncodedContentType(headers)) {
    const formEntries = convertUrlEncodedToFormEntries(body as string);
    for (const [key, value] of formEntries) parameters[key] = getInitialParameterValue(detectDataType(value), value);
  } else if (isObject(body)) {
    const extractedProperties = extractPropertiesFromJson(body);
    for (const [key, value] of Object.entries(extractedProperties)) {
      if (value === 'DO_NOT_TEST') parameters[key] = getInitialParameterValue('do-not-test', '', false);
      else {
        // Navigate to the actual value in the parsed body
        const paths = key.replace(/\[(\d+)\]/g, '.$1').split('.');
        let propertyValue: any = body;

        for (const path of paths) {
          if (propertyValue == null) break;
          propertyValue = propertyValue[path];
        }

        parameters[key] = getInitialParameterValue(detectDataType(propertyValue, true), propertyValue);
      }
    }
  }

  return parameters;
}

export function extractBodyFromResponse(response: HttpResponse): Record<string, unknown> | string {
  try {
    if (typeof response?.body === 'string') return JSON.parse(response.body);
    if (response?.body && typeof response.body === 'object') return response.body;
    ``;
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

export function getBodyParameterValue(body: unknown, parameterName: string, headers: Record<string, string>): any {
  if (isUrlEncodedContentType(headers)) {
    const formEntries = convertUrlEncodedToFormEntries(body as string);
    return formEntries.find(([key]) => key === parameterName)?.[1];
  }

  const paths = parameterName.replace(/\[(\d+)\]/g, '.$1').split('.');
  let value: any = body;

  for (const path of paths) {
    if (value == null) return undefined;
    value = value[path];
  }

  return value;
}

export function getInitialParameterValue(type: DataType, value = '', mandatory = true): DynamicValue {
  const dynamicValue: DynamicValue = { mandatory, type, value };

  switch (type) {
    case 'enum':
      return { ...dynamicValue, value };
    case 'number':
      return { ...dynamicValue, value: initialNumberBounds };
    case 'string':
      return { ...dynamicValue, value: MAX_STRING_LENGTH };
    default:
      return dynamicValue;
  }
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

export function updateFormEntry(entries: Array<[string, string]>, key: string, value: string): void {
  for (const entry of entries) {
    if (entry[0] === key) {
      entry[1] = value;
      break;
    }
  }
}
