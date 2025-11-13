import { Method } from 'axios';
import { Test, TestStatus } from '../types';
import { extractStatusCode, tryParseJsonObject } from '../utils';

const NOT_FOUND_TEST_NAME = '404 Not Found';
const NOT_FOUND_TEST_EXPECTED = '404 Not Found';

export async function runNotFoundTest(
  method: Method,
  url: string,
  headers: Record<string, string>,
  body: string,
): Promise<Test> {
  let testUrl = url;

  try {
    const parsedUrl = new URL(url);
    // If the URL has query parameters, append NOT_FOUND to the pathname
    parsedUrl.pathname = parsedUrl.pathname.endsWith('/')
      ? `${parsedUrl.pathname}NOT_FOUND`
      : `${parsedUrl.pathname}/NOT_FOUND`;
    testUrl = parsedUrl.toString();
  } catch {
    // Fallback if URL parsing fails
    testUrl = url.endsWith('/') ? `${url}NOT_FOUND` : `${url}/NOT_FOUND`;
  }

  const startTime = performance.now();
  const request = { url: testUrl, method, headers, body: tryParseJsonObject(body) };

  try {
    const response = await window.electronAPI.sendHttp(request);
    const responseTime = performance.now() - startTime;
    const statusCode = extractStatusCode(response);
    const statusText = response.status?.split(' ').slice(1).join(' ') || '';
    const status =
      statusCode === 404 ? TestStatus.Pass : statusCode === 0 ? TestStatus.FailNoResponse : TestStatus.Fail;

    return {
      actual: `${statusCode} ${statusText}`,
      expected: NOT_FOUND_TEST_EXPECTED,
      name: NOT_FOUND_TEST_NAME,
      request,
      response,
      responseTime,
      status,
    };
  } catch (error) {
    const responseTime = performance.now() - startTime;

    return {
      actual: `Unexpected error: ${String(error)}`,
      expected: NOT_FOUND_TEST_EXPECTED,
      name: NOT_FOUND_TEST_NAME,
      request,
      response: null,
      responseTime,
      status: TestStatus.Fail,
    };
  }
}
