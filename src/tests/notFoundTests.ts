import { Method } from 'axios';
import { Test, TestStatus } from '../types';
import { extractStatusCode } from '../utils';

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

  try {
    const response = await window.electronAPI.sendHttp({
      url: testUrl,
      method,
      headers,
      body,
    });
    const responseTime = performance.now() - startTime;
    const statusCode = extractStatusCode(response);
    const statusText = response.status?.split(' ').slice(1).join(' ') || '';
    const status =
      statusCode === 404 ? TestStatus.Pass : statusCode === 0 ? TestStatus.FailNoResponse : TestStatus.Fail;

    return {
      expected: '404 Not Found',
      actual: `${statusCode} ${statusText}`,
      name: '404 Not Found',
      request: { url: testUrl, method, headers, body },
      response,
      responseTime,
      status,
    };
  } catch (error) {
    const responseTime = performance.now() - startTime;

    return {
      actual: 'Request failed',
      expected: '404 Not Found',
      name: '404 Not Found',
      request: { url: testUrl, method, headers, body },
      response: { error: String(error) },
      responseTime,
      status: TestStatus.Fail,
    };
  }
}
